'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class LiquidationReceiptService {
    static async createLiquidationReceipt({
        liquidationDate,
        reason,
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

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new BadRequestError('No equipment items provided');
        }

        // Check equipment existence and status
        const equipmentList = await database.Equipment.findAll({
            where: { serial_number: items.map((i) => i.serialNumber) },
            transaction,
        });
        if (equipmentList.length !== items.length) {
            throw new BadRequestError('Some equipment not found');
        }
        for (const eq of equipmentList) {
            if (
                eq.status === 'pending' ||
                eq.status === 'reserved'
            ) {
                throw new BadRequestError(
                    `Equipment ${eq.serial_number} is already pending liquidation or reserved`,
                );
            }
        }

        // Create liquidation receipt`
        const liquidationReceipt = await database.LiquidationReceipt.create(
            {
                liquidation_date: liquidationDate,
                reason,
                user_code: userCode,
                status: 'requested',
                notes,
            },
            { transaction },
        );

        // Create liquidation receipt details and set equipment status to pending_liquidation
        for (const item of items) {
            await database.LiquidationReceiptDetail.create(
                {
                    liquidation_receipt_id: liquidationReceipt.id,
                    serial_number: item.serialNumber,
                    notes: item.notes || null,
                },
                { transaction },
            );
        }

        await transaction.commit();
        console.log(
            `Liquidation receipt created with ID: ${liquidationReceipt.id}`,
        );
        return {
            code: 200,
            message: 'Liquidation receipt created successfully',
            metadata: {
                id: liquidationReceipt.id,
                liquidationDate: liquidationReceipt.liquidation_date,
                userCode: liquidationReceipt.user_code,
                status: liquidationReceipt.status,
                notes: liquidationReceipt.notes,
                items: items.map((i) => ({
                    serialNumber: i.serialNumber,
                    notes: i.notes,
                })),
            },
        };
    }

    static async approveLiquidationReceipt(id, approverCode) {
        const liquidationReceipt =
            await database.LiquidationReceipt.findByPk(id);
        if (!liquidationReceipt)
            throw new BadRequestError('Liquidation receipt not found');
        if (liquidationReceipt.status !== 'requested') {
            throw new BadRequestError(
                'Only requested receipts can be approved',
            );
        }
        liquidationReceipt.status = 'approved';
        liquidationReceipt.approve_by = approverCode;
        await liquidationReceipt.save();

        // Set equipment status to 'pending'
        const details = await database.LiquidationReceiptDetail.findAll({
            where: { liquidation_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { status: 'pending' },
                { where: { serial_number: detail.serial_number } },
            );
        }

        return {
            code: 200,
            message: 'Liquidation receipt approved',
            data: {
                id: liquidationReceipt.id,
                status: liquidationReceipt.status,
            },
        };
    }

    static async rejectLiquidationReceipt(id, approverCode, reason) {
        const liquidationReceipt =
            await database.LiquidationReceipt.findByPk(id);
        if (!liquidationReceipt)
            throw new BadRequestError('Liquidation receipt not found');
        if (liquidationReceipt.status !== 'requested') {
            throw new BadRequestError(
                'Only requested receipts can be rejected',
            );
        }
        liquidationReceipt.status = 'rejected';
        liquidationReceipt.approve_by = approverCode;
        liquidationReceipt.notes = reason || liquidationReceipt.notes;
        await liquidationReceipt.save();

        // Set equipment status back to 'available'
        const details = await database.LiquidationReceiptDetail.findAll({
            where: { liquidation_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { status: 'available' },
                { where: { serial_number: detail.serial_number } },
            );
        }

        return {
            code: 200,
            message: 'Liquidation receipt rejected',
            data: {
                id: liquidationReceipt.id,
                status: liquidationReceipt.status,
                notes: liquidationReceipt.notes,
            },
        };
    }

    static async markAsLiquidated(id) {
        const liquidationReceipt =
            await database.LiquidationReceipt.findByPk(id);
        if (!liquidationReceipt)
            throw new BadRequestError('Liquidation receipt not found');
        if (liquidationReceipt.status !== 'approved') {
            throw new BadRequestError(
                'Only approved receipts can be marked as liquidated',
            );
        }
        liquidationReceipt.status = 'liquidated';
        await liquidationReceipt.save();

        // Update equipment status to 'liquidated'
        const details = await database.LiquidationReceiptDetail.findAll({
            where: { liquidation_receipt_id: id },
        });
        for (const detail of details) {
            await database.Equipment.update(
                { status: 'liquidated' },
                { where: { serial_number: detail.serial_number } },
            );
        }

        return {
            code: 200,
            message: 'Liquidation receipt marked as liquidated',
            data: {
                id: liquidationReceipt.id,
                status: liquidationReceipt.status,
            },
        };
    }

    static async getAllLiquidationReceipts({
        page = 1,
        limit = 20,
        searchText,
        status,
        liquidationDate,
    }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { Op } = require('sequelize');
    
        // Điều kiện truy vấn bảng LiquidationReceipt
        const where = {};
        if (status) {
            where.status = status;
        }
        if (liquidationDate) {
            where.liquidation_date = liquidationDate;
        }
    
        // Điều kiện truy vấn bảng Account (tìm theo tên)
        let accountWhere = undefined;
        if (searchText) {
            accountWhere = {
                full_name: { [Op.iLike]: `%${searchText}%` },
            };
        }
    
        const result = await database.LiquidationReceipt.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            distinct: true,
            order: [['create_time', 'DESC']],
            include: [
                {
                    model: database.Account,
                    as: 'account',
                    ...(accountWhere && { where: accountWhere }),
                },
            ],
        });
    
        return {
            receipts: result.rows,
            pagination: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }
    

    static async getLiquidationReceiptDetails(id) {
        const liquidationReceipt = await database.LiquidationReceipt.findOne({
            where: { id },
            include: [
                {
                    model: database.Account,
                    as: 'account',
                },
                {
                    model: database.LiquidationReceiptDetail,
                    as: 'LiquidationReceiptDetails',
                    include: [
                        {
                            model: database.Equipment,
                            as: 'equipment',
                        },
                    ],
                },
            ],
        });
        if (!liquidationReceipt)
            throw new BadRequestError('Liquidation receipt not found');
        return {
            code: 200,
            message: 'Get liquidation receipt details successfully',
            data: liquidationReceipt,
        };
    }
}

module.exports = LiquidationReceiptService;
