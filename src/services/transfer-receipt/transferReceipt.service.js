'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class TransferReceiptService {
    static async createTransferReceipt({
        transferDate,
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
            include: [
                {
                    model: database.Account,
                    as: 'account',
                },
            ],
            order: [['create_time', 'DESC']],
        });
        return {
            code: 200,
            message: 'Get all transfer receipts successfully',
            metadata: result.rows,
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
                    model: database.Account,
                    as: 'account',
                },
                {
                    model: database.TransferReceiptDetail,
                    as: 'TransferReceiptDetails',
                    include: [
                        {
                            model: database.Equipment,
                            as: 'equipment',
                        },
                    ],
                },
            ],
        });
        if (!transferReceipt)
            throw new BadRequestError('Transfer receipt not found');
        return {
            code: 200,
            message: 'Get transfer receipt details successfully',
            data: transferReceipt,
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
        });
        return {
            code: 200,
            message: 'Get all equipment in room successfully',
            metadata: equipments,
        };
    }
}

module.exports = TransferReceiptService;
