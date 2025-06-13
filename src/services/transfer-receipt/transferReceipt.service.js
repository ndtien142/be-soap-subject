'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class TransferReceiptService {
    static async createTransferReceipt({
        transferDate,
        createBy,
        transferFrom,
        transferTo,
        userCode,
        items,
        notes,
    }) {
        const transaction = await database.sequelize.transaction();

        // Validate user
        const user = await database.Account.findOne({
            where: { user_code: userCode },
            transaction,
        });
        if (!user) throw new BadRequestError('User not found');

        // Validate rooms
        const fromRoom = await database.Room.findOne({
            where: { room_id: transferFrom },
            transaction,
        });
        const toRoom = await database.Room.findOne({
            where: { room_id: transferTo },
            transaction,
        });
        if (!fromRoom || !toRoom) throw new BadRequestError('Room not found');

        if (fromRoom.room_id === toRoom.room_id) {
            throw new BadRequestError(
                'Transfer source and destination rooms cannot be the same',
            );
        }
        if (fromRoom.is_active === false || toRoom.is_active === false) {
            throw new BadRequestError('One of the rooms is not active');
        }

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new BadRequestError('No equipment items provided');
        }

        // Check equipment existence and location
        const equipmentList = await database.Equipment.findAll({
            where: { serial_number: items.map((i) => i.serialNumber) },
            transaction,
        });
        if (equipmentList.length !== items.length) {
            throw new BadRequestError('Some equipment not found');
        }
        for (const eq of equipmentList) {
            if (eq.room_id !== transferFrom) {
                throw new BadRequestError(
                    `Equipment ${eq.serial_number} is not in the source room`,
                );
            }
            // Prevent duplicate transfer requests
            if (eq.status === 'pending_transfer' || eq.status === 'reserved') {
                throw new BadRequestError(
                    `Equipment ${eq.serial_number} is already pending transfer or reserved`,
                );
            }
        }

        // Create transfer receipt
        const transferReceipt = await database.TransferReceipt.create(
            {
                transfer_date: transferDate,
                transfer_from: transferFrom,
                transfer_to: transferTo,
                user_code: userCode,
                created_by: createBy,
                status: 'requested',
                notes,
            },
            { transaction },
        );

        // Create transfer receipt details and set equipment status to pending_transfer
        for (const item of items) {
            await database.TransferReceiptDetail.create(
                {
                    transfer_receipt_id: transferReceipt.id,
                    serial_number: item.serialNumber,
                    notes: item.notes || null,
                },
                { transaction },
            );
            await database.Equipment.update(
                { status: 'pending_transfer' },
                { where: { serial_number: item.serialNumber }, transaction },
            );
        }

        await transaction.commit();

        return {
            code: 200,
            message: 'Transfer receipt created successfully',
            data: {
                id: transferReceipt.id,
                transferDate: transferReceipt.transfer_date,
                transferFrom: transferReceipt.transfer_from,
                transferTo: transferReceipt.transfer_to,
                userCode: transferReceipt.user_code,
                status: transferReceipt.status,
                notes: transferReceipt.notes,
                items: items.map((i) => ({
                    serialNumber: i.serialNumber,
                    notes: i.notes,
                })),
            },
        };
    }

    static async approveTransferReceipt(id, approverCode) {
        const transferReceipt = await database.TransferReceipt.findByPk(id);
        if (!transferReceipt)
            throw new BadRequestError('Transfer receipt not found');
        if (transferReceipt.status !== 'requested') {
            throw new BadRequestError(
                'Only requested receipts can be approved',
            );
        }
        transferReceipt.status = 'approved';
        transferReceipt.approve_by = approverCode;
        await transferReceipt.save();

        // Set equipment status to 'in_use' or another appropriate status
        const details = await database.TransferReceiptDetail.findAll({
            where: { transfer_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { status: 'in_use' },
                { where: { serial_number: detail.serial_number } },
            );
        }

        return {
            code: 200,
            message: 'Transfer receipt approved',
            data: { id: transferReceipt.id, status: transferReceipt.status },
        };
    }

    static async rejectTransferReceipt(id, approverCode, reason) {
        const transferReceipt = await database.TransferReceipt.findByPk(id);
        if (!transferReceipt)
            throw new BadRequestError('Transfer receipt not found');
        if (transferReceipt.status !== 'requested') {
            throw new BadRequestError(
                'Only requested receipts can be rejected',
            );
        }
        transferReceipt.status = 'rejected';
        transferReceipt.approve_by = approverCode;
        transferReceipt.notes = reason || transferReceipt.notes;
        await transferReceipt.save();

        // Set equipment status back to 'available'
        const details = await database.TransferReceiptDetail.findAll({
            where: { transfer_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { status: 'available' },
                { where: { serial_number: detail.serial_number } },
            );
        }

        return {
            code: 200,
            message: 'Transfer receipt rejected',
            data: {
                id: transferReceipt.id,
                status: transferReceipt.status,
                notes: transferReceipt.notes,
            },
        };
    }

    static async markAsTransferred(id) {
        const transferReceipt = await database.TransferReceipt.findByPk(id);
        if (!transferReceipt)
            throw new BadRequestError('Transfer receipt not found');
        if (transferReceipt.status !== 'approved') {
            throw new BadRequestError(
                'Only approved receipts can be marked as transferred',
            );
        }
        transferReceipt.status = 'transferred';
        await transferReceipt.save();

        // Update room_id for all transferred equipment and set status to available
        const details = await database.TransferReceiptDetail.findAll({
            where: { transfer_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { room_id: transferReceipt.transfer_to, status: 'available' },
                { where: { serial_number: detail.serial_number } },
            );
        }

        return {
            code: 200,
            message: 'Transfer receipt marked as transferred',
            data: { id: transferReceipt.id, status: transferReceipt.status },
        };
    }

    static async getAllTransferReceipts({ page = 1, limit = 20 }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await database.TransferReceipt.findAndCountAll({
            limit: parseInt(limit),
            offset,
            order: [['create_time', 'DESC']],
        });
        const dataTransfer = await Promise.all(
            result.rows.map(async (receipt) => {
                const roomFrom = await database.Room.findByPk(
                    receipt.transfer_from,
                );
                const roomTo = await database.Room.findByPk(
                    receipt.transfer_to,
                );
                if (!roomFrom || !roomTo) {
                    throw new BadRequestError('One of the rooms not found');
                }

                receipt.transfer_date = receipt.transfer_date
                    ? new Date(receipt.transfer_date)
                          .toISOString()
                          .split('T')[0]
                    : null;
                receipt.create_time = receipt.create_time
                    ? new Date(receipt.create_time).toISOString().split('T')[0]
                    : null;
                receipt.update_time = receipt.update_time
                    ? new Date(receipt.update_time).toISOString().split('T')[0]
                    : null;

                const foundResponsible = await database.Account.findOne({
                    where: { user_code: receipt.user_code },
                });
                const foundApprover = await database.Account.findOne({
                    where: { user_code: receipt.approve_by },
                });
                const foundCreator = await database.Account.findOne({
                    where: { user_code: receipt.created_by },
                });

                return {
                    id: receipt.id,
                    transferFrom: {
                        id: roomFrom.room_id,
                        name: roomFrom.room_name,
                    },
                    transferTo: {
                        id: roomTo.room_id,
                        name: roomTo.room_name,
                    },
                    transferDate: receipt.transfer_date,
                    responsibleBy: {
                        userCode: receipt.user_code,
                        username: foundResponsible
                            ? foundResponsible.username
                            : null,
                    },
                    approveBy: {
                        userCode: receipt.approve_by,
                        username: foundApprover ? foundApprover.username : null,
                    },
                    createdBy: {
                        userCode: receipt.created_by,
                        username: foundCreator ? foundCreator.username : null,
                    },
                    status: receipt.status,
                    notes: receipt.notes,
                    createdAt: receipt.create_time,
                    updatedAt: receipt.update_time,
                };
            }),
        );

        return {
            code: 200,
            message: 'Get all transfer receipts successfully',
            metadata: dataTransfer,
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    static async getTransferReceiptDetails(id) {
        const transferReceipt = await database.TransferReceipt.findOne({
            where: { id },
            include: [
                {
                    model: database.Equipment,
                    as: 'equipment',
                    include: [
                        {
                            model: database.EquipmentImages,
                            as: 'images',
                            attributes: ['image_url'],
                        },
                        {
                            model: database.GroupEquipment,
                            as: 'group_equipment',
                            include: [
                                {
                                    model: database.EquipmentType,
                                    as: 'equipment_type',
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        if (!transferReceipt)
            throw new BadRequestError('Transfer receipt not found');

        // Get room info
        const roomFrom = await database.Room.findByPk(
            transferReceipt.transfer_from,
        );
        const roomTo = await database.Room.findByPk(
            transferReceipt.transfer_to,
        );
        if (!roomFrom || !roomTo) {
            throw new BadRequestError('One of the rooms not found');
        }

        // Format dates
        const transferDate = transferReceipt.transfer_date
            ? new Date(transferReceipt.transfer_date)
                  .toISOString()
                  .split('T')[0]
            : null;
        const createdAt = transferReceipt.create_time
            ? new Date(transferReceipt.create_time).toISOString().split('T')[0]
            : null;
        const updatedAt = transferReceipt.update_time
            ? new Date(transferReceipt.update_time).toISOString().split('T')[0]
            : null;

        // Get user info
        const foundResponsible = await database.Account.findOne({
            where: { user_code: transferReceipt.user_code },
        });
        const foundApprover = await database.Account.findOne({
            where: { user_code: transferReceipt.approve_by },
        });
        const foundCreator = await database.Account.findOne({
            where: { user_code: transferReceipt.created_by },
        });

        console.log(
            'Transfer Receipt Details:',
            transferReceipt,
            roomFrom,
            roomTo,
            foundResponsible,
            foundApprover,
            foundCreator,
        );

        console.log(
            'Transfer Receipt Details Items:',
            transferReceipt.equipment,
        );

        const items = transferReceipt.equipment.map((eq) => ({
            serialNumber: eq.serial_number,
            dateOfFirstUse: eq.date_of_first_use,
            description: eq.equipment_description,
            notes: eq.TransferReceiptDetail.notes || null,
            images: eq.images.map((img) => img.image_url),
            type: {
                id: eq.group_equipment.equipment_type.id,
                name: eq.group_equipment.equipment_type.equipment_type_name,
            },
        }));

        return {
            code: 200,
            message: 'Get transfer receipt details successfully',
            metadata: {
                id: transferReceipt.id,
                transferFrom: {
                    id: roomFrom.room_id,
                    name: roomFrom.room_name,
                },
                transferTo: {
                    id: roomTo.room_id,
                    name: roomTo.room_name,
                },
                transferDate,
                responsibleBy: {
                    userCode: transferReceipt.user_code,
                    username: foundResponsible
                        ? foundResponsible.username
                        : null,
                },
                approveBy: {
                    userCode: transferReceipt.approve_by,
                    username: foundApprover ? foundApprover.username : null,
                },
                createdBy: {
                    userCode: transferReceipt.created_by,
                    username: foundCreator ? foundCreator.username : null,
                },
                status: transferReceipt.status,
                notes: transferReceipt.notes,
                createdAt,
                updatedAt,
                items,
            },
        };
    }

    /**
     * Get all equipment in a specific room with status 'in_use'.
     * @param {string} roomId
     * @returns {Promise<Array>}
     */
    static async getAllEquipmentInRoom(roomId) {
        const equipments = await database.Equipment.findAll({
            where: {
                room_id: roomId,
                status: 'in_use',
            },
            include: [
                {
                    model: database.EquipmentImages,
                    as: 'images',
                    attributes: ['image_url'],
                },
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                    include: [
                        {
                            model: database.EquipmentType,
                            as: 'equipment_type',
                        },
                    ],
                },
            ],
        });

        return {
            code: 200,
            message: 'Get all equipment in room successfully',
            metadata: equipments.map((eq) => ({
                serialNumber: eq.serial_number,
                name: eq.group_equipment.group_equipment_name,
                type: {
                    id: eq.group_equipment.equipment_type.id,
                    name: eq.group_equipment.equipment_type.equipment_type_name,
                },
                description: eq.equipment_description,
                status: eq.status,
                images: eq.images.map((img) => img.image_url),
            })),
        };
    }
}

module.exports = TransferReceiptService;
