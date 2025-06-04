'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');
const { Op } = require('sequelize');

class BorrowReceiptService {
    static async createBorrowReceipt({
        user,
        returnDate,
        note,
        roomId,
        groups, // array of { groupEquipmentCode, quantity, note }
    }) {
        const transaction = await database.sequelize.transaction();

        // Validate user
        const foundUser = await database.Account.findOne({
            where: { user_code: user.userCode },
            transaction,
        });
        if (!user) throw new BadRequestError('User not found');

        // Validate room
        const foundRoom = await database.Room.findOne({
            where: { room_id: roomId },
            transaction,
        });
        if (!foundRoom) throw new BadRequestError('Room not found');

        // Create borrow receipt
        const borrowReceipt = await database.BorrowReceipt.create(
            {
                return_date: returnDate || null,
                user_code: foundUser.user_code,
                status: 'requested',
                note,
                room_id: roomId,
            },
            { transaction },
        );

        // Create BorrowRequestItem for each group
        for (const group of groups) {
            const { groupEquipmentCode, quantity, note: groupNote } = group;
            if (!groupEquipmentCode || !quantity || quantity <= 0) {
                throw new BadRequestError(
                    'Each group must have groupEquipmentCode and quantity > 0',
                );
            }
            await database.BorrowRequestItem.create(
                {
                    borrow_id: borrowReceipt.id,
                    equipment_code: groupEquipmentCode,
                    quantity,
                    note: groupNote,
                },
                { transaction },
            );
        }

        await transaction.commit();

        return {
            id: borrowReceipt.id,
            userCode: borrowReceipt.user_code,
            createdTime: borrowReceipt.create_time,
            borrowDate: borrowReceipt.borrow_date,
            returnDate: borrowReceipt.return_date,
            status: borrowReceipt.status,
            note: borrowReceipt.note,
            roomId: borrowReceipt.room_id,
            groups,
        };
    }

    static async approveBorrowReceipt(id, approverCode) {
        const transaction = await database.sequelize.transaction();

        const borrowReceipt = await database.BorrowReceipt.findByPk(id, {
            transaction,
        });
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'requested') {
            throw new BadRequestError(
                'Only requested receipts can be approved',
            );
        }

        // Get all request items for this receipt
        const requestItems = await database.BorrowRequestItem.findAll({
            where: { borrow_id: id },
            transaction,
        });

        // For each group, check virtual available
        for (const item of requestItems) {
            const groupEquipmentCode = item.equipment_code;
            const requestedQty = item.quantity;

            // Real available
            const availableInWarehouse = await database.Equipment.count({
                where: {
                    group_equipment_code: groupEquipmentCode,
                    status: 'available',
                },
                transaction,
            });

            // Sum of approved but not yet borrowed for this group (excluding this receipt)
            // Find all approved receipts except this one
            const approvedReceipts = await database.BorrowReceipt.findAll({
                where: {
                    status: 'approved',
                    id: { [Op.ne]: id },
                },
                attributes: ['id'],
                transaction,
            });
            const approvedReceiptIds = approvedReceipts.map((r) => r.id);

            let approvedNotBorrowed = 0;
            if (approvedReceiptIds.length > 0) {
                approvedNotBorrowed =
                    (await database.BorrowRequestItem.sum('quantity', {
                        where: {
                            equipment_code: groupEquipmentCode,
                            borrow_id: { [Op.in]: approvedReceiptIds },
                        },
                        transaction,
                    })) || 0;
            }

            const virtualAvailable = availableInWarehouse - approvedNotBorrowed;
            if (virtualAvailable < requestedQty) {
                throw new BadRequestError(
                    `Not enough virtual available equipment for group ${groupEquipmentCode} (requested: ${requestedQty}, available: ${virtualAvailable})`,
                );
            }
        }

        borrowReceipt.status = 'approved';
        borrowReceipt.approve_by = approverCode;
        await borrowReceipt.save({ transaction });

        await transaction.commit();

        return { id: borrowReceipt.id, status: borrowReceipt.status };
    }

    static async rejectBorrowReceipt(id, approverCode, reason) {
        const borrowReceipt = await database.BorrowReceipt.findByPk(id);
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'requested') {
            throw new BadRequestError(
                'Only requested receipts can be rejected',
            );
        }

        borrowReceipt.status = 'rejected';
        borrowReceipt.approve_by = approverCode;
        borrowReceipt.note = reason || borrowReceipt.note;
        await borrowReceipt.save();

        return {
            code: 200,
            message: 'Borrow receipt rejected',
            data: {
                id: borrowReceipt.id,
                status: borrowReceipt.status,
                note: borrowReceipt.note,
            },
        };
    }

    static async markAsBorrowed(id, scannedSerialNumbers) {
        // scannedSerialNumbers: [{ groupEquipmentCode, serialNumbers: [serial_number, ...] }]
        const transaction = await database.sequelize.transaction();

        const borrowReceipt = await database.BorrowReceipt.findByPk(id, {
            transaction,
        });
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'approved') {
            throw new BadRequestError(
                'Only approved receipts can be marked as borrowed',
            );
        }

        // Get all request items for this receipt
        const requestItems = await database.BorrowRequestItem.findAll({
            where: { borrow_id: id },
            transaction,
        });

        // Validate scannedSerialNumbers matches request quantities
        for (const reqItem of requestItems) {
            const groupEquipmentCode = reqItem.equipment_code;
            const requestedQty = reqItem.quantity;
            const scannedGroup = scannedSerialNumbers.find(
                (g) => g.groupEquipmentCode === groupEquipmentCode,
            );
            if (
                !scannedGroup ||
                !Array.isArray(scannedGroup.serialNumbers) ||
                scannedGroup.serialNumbers.length !== requestedQty
            ) {
                throw new BadRequestError(
                    `Scanned serial numbers for group ${groupEquipmentCode} do not match requested quantity`,
                );
            }
            // Check all serials are available and belong to the group
            const equipments = await database.Equipment.findAll({
                where: {
                    serial_number: scannedGroup.serialNumbers,
                    group_equipment_code: groupEquipmentCode,
                    status: 'available',
                },
                transaction,
            });
            if (equipments.length !== requestedQty) {
                throw new BadRequestError(
                    `Some serial numbers for group ${groupEquipmentCode} are not available or do not belong to the group`,
                );
            }
        }

        // Create BorrowReceiptDetail and update equipment status
        for (const scannedGroup of scannedSerialNumbers) {
            for (const serialNumber of scannedGroup.serialNumbers) {
                await database.BorrowReceiptDetail.create(
                    {
                        borrow_receipt_id: id,
                        serial_number: serialNumber,
                        note: '', // use empty string for note, matches model/table
                        create_time: new Date(),
                        update_time: new Date(),
                    },
                    { transaction },
                );
                await database.Equipment.update(
                    { status: 'reserved', room_id: borrowReceipt.room_id },
                    { where: { serial_number: serialNumber }, transaction },
                );
            }
        }

        borrowReceipt.status = 'borrowed';
        await borrowReceipt.save({ transaction });

        await transaction.commit();

        return { id: borrowReceipt.id, status: borrowReceipt.status };
    }

    static async markAsReturned(id) {
        const borrowReceipt = await database.BorrowReceipt.findByPk(id);
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'borrowed') {
            throw new BadRequestError(
                'Only borrowed receipts can be marked as returned',
            );
        }

        borrowReceipt.status = 'returned';
        await borrowReceipt.save();

        // Set equipment status back to 'available'
        const details = await database.BorrowReceiptDetail.findAll({
            where: { borrow_receipt_id: id },
        });
        const serialNumbers = details.map((d) => d.serial_number);
        await database.Equipment.update(
            { status: 'available' },
            { where: { serial_number: serialNumbers } },
        );

        return {
            code: 200,
            message: 'Borrow receipt marked as returned',
            data: { id: borrowReceipt.id, status: borrowReceipt.status },
        };
    }

    /**
     * Lấy danh sách phiếu mượn với filter, sắp xếp, phân trang
     * @param {object} options
     * @param {number} options.page
     * @param {number} options.limit
     * @param {string} [options.status]
     * @param {string} [options.userCode]
     * @param {string} [options.sortBy] - column name
     * @param {string} [options.sortOrder] - ASC | DESC
     */
    static async getAllBorrowReceipts({
        page = 1,
        limit = 20,
        status,
        userCode,
        sortBy = 'create_time',
        sortOrder = 'DESC',
    }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (userCode) where.user_code = userCode;

        const result = await database.BorrowReceipt.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            include: [
                { model: database.Account, as: 'account' },
                {
                    model: database.Room,
                    as: 'room',
                    include: [{ model: database.Department, as: 'department' }],
                },
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                    include: [
                        { model: database.EquipmentType, as: 'equipment_type' },
                        {
                            model: database.EquipmentManufacturer,
                            as: 'equipment_manufacturer',
                        },
                    ],
                },
            ],
            order: [[sortBy, sortOrder]],
        });

        return {
            code: 200,
            message: 'Get all borrow receipts successfully',
            metadata: result.rows.map((receipt) => {
                return {
                    id: receipt.id,
                    userCode: receipt.user_code,
                    borrowDate: receipt.borrow_date,
                    createdTime: receipt.create_time,
                    returnDate: receipt.return_date,
                    status: receipt.status,
                    note: receipt.note,
                    room: {
                        roomId: receipt.room.room_id,
                        roomName: receipt.room.room_name,
                        roomStatus: receipt.room.status,
                        department: {
                            departmentId: receipt.room.department.department_id,
                            departmentName:
                                receipt.room.department.department_name,
                        },
                    },
                    requestedBy: {
                        userCode: receipt.account.user_code,
                        fullName: receipt.account.full_name,
                        username: receipt.account.username,
                        phone: receipt.account.phone_number,
                        email: receipt.account.email,
                    },
                    requestItems: receipt.group_equipment.map((group) => {
                        return {
                            groupEquipmentCode: group.group_equipment_code,
                            name: group.group_equipment_name,
                            quantity: group.BorrowRequestItem.quantity,
                            note: group.BorrowRequestItem.note,
                            type: {
                                id: group.equipment_type.id,
                                name: group.equipment_type.equipment_type_name,
                                description:
                                    group.equipment_type
                                        .equipment_type_description,
                            },
                            manufacturer: {
                                id: group.equipment_manufacturer.id,
                                name: group.equipment_manufacturer
                                    .manufacturer_name,
                                contactInfo:
                                    group.equipment_manufacturer.contact_info,
                                address: group.equipment_manufacturer.address,
                            },
                        };
                    }),
                };
            }),
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    static async getBorrowReceiptDetails(id) {
        const borrowReceipt = await database.BorrowReceipt.findOne({
            where: { id },
            include: [
                { model: database.Account, as: 'account' },
                {
                    model: database.Equipment,
                    as: 'equipment',
                },
                {
                    model: database.Room,
                    as: 'room',
                    include: [{ model: database.Department, as: 'department' }],
                },
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                    include: [
                        { model: database.EquipmentType, as: 'equipment_type' },
                        {
                            model: database.EquipmentManufacturer,
                            as: 'equipment_manufacturer',
                        },
                    ],
                },
            ],
        });
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');

        return {
            code: 200,
            message: 'Get borrow receipt details successfully',
            data: {
                id: borrowReceipt.id,
                userCode: borrowReceipt.user_code,
                returnDate: borrowReceipt.return_date,
                status: borrowReceipt.status,
                note: borrowReceipt.note,
                room: {
                    roomId: borrowReceipt.room.room_id,
                    roomName: borrowReceipt.room.room_name,
                    roomStatus: borrowReceipt.room.status,
                    department: {
                        departmentId:
                            borrowReceipt.room.department.department_id,
                        departmentName:
                            borrowReceipt.room.department.department_name,
                    },
                },
                requestedBy: {
                    userCode: borrowReceipt.account.user_code,
                    fullName: borrowReceipt.account.full_name,
                    username: borrowReceipt.account.username,
                    phone: borrowReceipt.account.phone_number,
                    email: borrowReceipt.account.email,
                },
                borrowEquipments: borrowReceipt.equipment.map((eq) => ({
                    serialNumber: eq.serial_number,
                    groupEquipmentCode: eq.group_equipment_code,
                    status: eq.status,
                })),
                requestItems: borrowReceipt.group_equipment.map((group) => ({
                    groupEquipmentCode: group.group_equipment_code,
                    name: group.group_equipment_name,
                    quantity: group.BorrowRequestItem.quantity,
                    note: group.BorrowRequestItem.note,
                    type: {
                        id: group.equipment_type.id,
                        name: group.equipment_type.equipment_type_name,
                        description:
                            group.equipment_type.equipment_type_description,
                    },
                    manufacturer: {
                        id: group.equipment_manufacturer.id,
                        name: group.equipment_manufacturer.manufacturer_name,
                        contactInfo: group.equipment_manufacturer.contact_info,
                        address: group.equipment_manufacturer.address,
                    },
                })),
            },
        };
    }

    static async checkEquipmentAvailable({ groups }) {
        // groups: [{ groupEquipmentCode, quantity }]
        if (!Array.isArray(groups) || groups.length === 0) {
            throw new BadRequestError('groups is required');
        }
        const results = [];
        for (const group of groups) {
            const { groupEquipmentCode, quantity } = group;
            if (!groupEquipmentCode || !quantity || quantity <= 0) {
                throw new BadRequestError(
                    'Each group must have groupEquipmentCode and quantity > 0',
                );
            }
            const availableCount = await database.Equipment.count({
                where: {
                    group_equipment_code: groupEquipmentCode,
                    status: 'available',
                },
            });
            results.push({
                groupEquipmentCode,
                requested: quantity,
                available: availableCount >= quantity,
                availableCount,
            });
        }
        return {
            code: 200,
            results,
        };
    }

    /**
     * Scan and export a single equipment for a borrow receipt.
     * @param {number} borrowReceiptId
     * @param {string} serialNumber
     * @returns {object}
     */
    static async scanAndExportEquipment({ borrowReceiptId, serialNumber }) {
        const transaction = await database.sequelize.transaction();

        // Find receipt and check status
        const borrowReceipt = await database.BorrowReceipt.findByPk(
            borrowReceiptId,
            { transaction },
        );
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (
            borrowReceipt.status !== 'approved' &&
            borrowReceipt.status !== 'partial_borrowed' &&
            borrowReceipt.status !== 'processing'
        ) {
            throw new BadRequestError(
                'Receipt must be approved or partial_borrowed to export equipment',
            );
        }

        // Find equipment and check status
        const equipment = await database.Equipment.findOne({
            where: { serial_number: serialNumber },
            transaction,
        });
        if (!equipment) throw new BadRequestError('Equipment not found');
        if (equipment.status !== 'available') {
            throw new BadRequestError(
                'Equipment is not available for borrowing',
            );
        }

        // Create BorrowReceiptDetail
        await database.BorrowReceiptDetail.create(
            {
                borrow_receipt_id: parseInt(borrowReceiptId),
                serial_number: serialNumber,
            },
            { transaction },
        );

        // Update equipment status
        await database.Equipment.update(
            { status: 'reserved', room_id: borrowReceipt.room_id },
            { where: { serial_number: serialNumber }, transaction },
        );

        // Get total requested
        const totalRequested = await database.BorrowRequestItem.sum(
            'quantity',
            {
                where: { borrow_id: borrowReceiptId },
                transaction,
            },
        );

        // Count how many devices have been exported for this receipt
        const totalExported = await database.BorrowReceiptDetail.count({
            where: { borrow_receipt_id: borrowReceiptId },
            transaction,
        });

        // Update receipt status if needed
        let newStatus = borrowReceipt.status;
        if (totalExported < totalRequested) {
            newStatus = 'processing';
        } else if (totalExported === totalRequested) {
            newStatus = 'borrowed';
            // Update all equipment in this receipt to in_use
            const allSerials = await database.BorrowReceiptDetail.findAll({
                attributes: ['serial_number'],
                where: { borrow_receipt_id: borrowReceiptId },
                transaction,
            });
            const serialNumbers = allSerials.map((item) => item.serial_number);
            if (serialNumbers.length > 0) {
                await database.Equipment.update(
                    { status: 'in_use' },
                    { where: { serial_number: serialNumbers }, transaction },
                );
                // Update day_of_first_use if null
                await database.Equipment.update(
                    { day_of_first_use: new Date() },
                    {
                        where: {
                            serial_number: serialNumbers,
                            day_of_first_use: null,
                        },
                        transaction,
                    },
                );
            }
        }
        borrowReceipt.status = newStatus;
        await borrowReceipt.save({ transaction });

        await transaction.commit();

        return {
            borrowReceiptId,
            serialNumber,
            status: newStatus,
            actualQuantity: totalExported,
            totalRequested,
        };
    }

    /**
     * Delete a scanned equipment from a borrow receipt (undo scan).
     * @param {number} borrowReceiptId
     * @param {string} serialNumber
     * @returns {object}
     */
    static async deleteScannedEquipment({ borrowReceiptId, serialNumber }) {
        const transaction = await database.sequelize.transaction();

        // Check borrow receipt status
        const borrowReceipt = await database.BorrowReceipt.findByPk(
            borrowReceiptId,
            { transaction },
        );
        if (!borrowReceipt) {
            throw new BadRequestError('Borrow receipt not found');
        }
        if (borrowReceipt.status !== 'processing') {
            throw new BadRequestError(
                'Can only remove equipment when receipt is in processing status',
            );
        }

        // Check if the detail exists
        const detail = await database.BorrowReceiptDetail.findOne({
            where: {
                borrow_receipt_id: borrowReceiptId,
                serial_number: serialNumber,
            },
            transaction,
        });
        if (!detail) {
            throw new BadRequestError(
                'Scanned equipment not found in this receipt',
            );
        }

        // Delete the BorrowReceiptDetail
        await database.BorrowReceiptDetail.destroy({
            where: {
                borrow_receipt_id: borrowReceiptId,
                serial_number: serialNumber,
            },
            transaction,
        });

        // Set equipment status back to 'available'
        await database.Equipment.update(
            { status: 'available' },
            { where: { serial_number: serialNumber }, transaction },
        );

        // Optionally, update actual_quantity in BorrowRequestItem if needed

        await transaction.commit();

        return {
            borrowReceiptId,
            serialNumber,
            message: 'Scanned equipment deleted successfully',
        };
    }
}

module.exports = BorrowReceiptService;
