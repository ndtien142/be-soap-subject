'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class BorrowReceiptService {
    static async createBorrowReceipt({
        userCode,
        borrowDate,
        returnDate,
        items,
        note,
        roomId,
    }) {
        const transaction = await database.sequelize.transaction();

        // Validate user
        const user = await database.Account.findOne({
            where: { user_code: userCode },
            transaction,
        });
        if (!user) throw new BadRequestError('User not found');

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new BadRequestError('No equipment items provided');
        }

        // Check equipment existence and availability
        const equipmentList = await database.Equipment.findAll({
            where: { serial_number: items.map((i) => i.serialNumber) },
            transaction,
        });
        if (equipmentList.length !== items.length) {
            throw new BadRequestError('Some equipment not found');
        }
        for (const eq of equipmentList) {
            if (eq.status !== 'available') {
                throw new BadRequestError(
                    `Equipment ${eq.serial_number} is not available`,
                );
            }
        }

        // Create borrow receipt
        const borrowReceipt = await database.BorrowReceipt.create(
            {
                borrow_date: borrowDate,
                return_date: returnDate,
                user_code: userCode,
                status: 'requested',
                note,
                room_id: roomId,
            },
            { transaction },
        );

        // Create borrow receipt details and update equipment status to reserved
        for (const item of items) {
            await database.BorrowReceiptDetail.create(
                {
                    borrow_receipt_id: borrowReceipt.id,
                    serial_number: item.serialNumber,
                    note: item.note || null,
                },
                { transaction },
            );

            // Set equipment status to 'reserved'
            await database.Equipment.update(
                { status: 'reserved' },
                { where: { serial_number: item.serialNumber }, transaction },
            );
        }

        await transaction.commit();

        return {
            code: 200,
            message: 'Borrow receipt created successfully',
            data: {
                id: borrowReceipt.id,
                userCode: borrowReceipt.user_code,
                borrowDate: borrowReceipt.borrow_date,
                returnDate: borrowReceipt.return_date,
                status: borrowReceipt.status,
                note: borrowReceipt.note,
                roomId: borrowReceipt.room_id,
                items: items.map((i) => ({
                    serialNumber: i.serialNumber,
                    note: i.note,
                })),
            },
        };
    }

    static async approveBorrowReceipt(id, approverCode) {
        const borrowReceipt = await database.BorrowReceipt.findByPk(id);
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'requested') {
            throw new BadRequestError(
                'Only requested receipts can be approved',
            );
        }
        borrowReceipt.status = 'approved';
        borrowReceipt.approve_by = approverCode;
        await borrowReceipt.save();

        // Set equipment status to 'borrowed'
        const details = await database.BorrowReceiptDetail.findAll({
            where: { borrow_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { status: 'borrowed' },
                { where: { serial_number: detail.serial_number } },
            );
        }

        return {
            code: 200,
            message: 'Borrow receipt approved',
            data: { id: borrowReceipt.id, status: borrowReceipt.status },
        };
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

        // Set equipment status back to 'available'
        const details = await database.BorrowReceiptDetail.findAll({
            where: { borrow_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { status: 'available' },
                { where: { serial_number: detail.serial_number } },
            );
        }

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

    static async markAsBorrowed(id) {
        const borrowReceipt = await database.BorrowReceipt.findByPk(id);
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'approved') {
            throw new BadRequestError(
                'Only approved receipts can be marked as borrowed',
            );
        }
        borrowReceipt.status = 'borrowed';
        await borrowReceipt.save();

        // Update room_id for all borrowed equipment
        const details = await database.BorrowReceiptDetail.findAll({
            where: { borrow_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { room_id: borrowReceipt.room_id },
                { where: { serial_number: detail.serial_number } },
            );
        }

        return {
            code: 200,
            message: 'Borrow receipt marked as borrowed',
            data: { id: borrowReceipt.id, status: borrowReceipt.status },
        };
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

        // Set equipment status back to available
        const details = await database.BorrowReceiptDetail.findAll({
            where: { borrow_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { status: 'available' },
                { where: { serial_number: detail.serial_number } },
            );
        }

        return {
            code: 200,
            message: 'Borrow receipt marked as returned',
            data: { id: borrowReceipt.id, status: borrowReceipt.status },
        };
    }

    static async getAllBorrowReceipts({ page = 1, limit = 20 }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await database.BorrowReceipt.findAndCountAll({
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
            message: 'Get all borrow receipts successfully',
            metadata: result.rows,
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
                {
                    model: database.Account,
                    as: 'account',
                },
                {
                    model: database.BorrowReceiptDetail,
                    as: 'BorrowReceiptDetails',
                    include: [
                        {
                            model: database.Equipment,
                            as: 'equipment',
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
            data: borrowReceipt,
        };
    }
}

module.exports = BorrowReceiptService;
