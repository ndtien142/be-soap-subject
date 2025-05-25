'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class LiquidationReceiptService {
    static async createLiquidationReceipt({
        userCode,
        liquidationDate,
        items,
        note,
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
            if (eq.status === 'liquidation') {
                throw new BadRequestError(
                    `Equipment ${eq.serial_number} is already liquidated`,
                );
            }
        }

        // Create liquidation receipt
        const liquidationReceipt = await database.LiquidationReceipt.create(
            {
                liquidation_date: liquidationDate,
                user_code: userCode,
                status: 'requested',
                note,
            },
            { transaction },
        );

        // Create liquidation receipt details and update equipment status
        for (const item of items) {
            await database.LiquidationReceiptDetail.create(
                {
                    liquidation_receipt_id: liquidationReceipt.id,
                    serial_number: item.serialNumber,
                    note: item.note || null,
                },
                { transaction },
            );

            await database.Equipment.update(
                { status: 'liquidation' },
                { where: { serial_number: item.serialNumber }, transaction },
            );
        }

        await transaction.commit();

        return {
            code: 200,
            message: 'Liquidation receipt created successfully',
            data: {
                id: liquidationReceipt.id,
                userCode: liquidationReceipt.user_code,
                liquidationDate: liquidationReceipt.liquidation_date,
                status: liquidationReceipt.status,
                note: liquidationReceipt.note,
                items: items.map((i) => ({
                    serialNumber: i.serialNumber,
                    note: i.note,
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
        liquidationReceipt.note = reason || liquidationReceipt.note;
        await liquidationReceipt.save();

        // Set equipment status back to available
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
                note: liquidationReceipt.note,
            },
        };
    }

    static async getAllLiquidationReceipts({ page = 1, limit = 20 }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await database.LiquidationReceipt.findAndCountAll({
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
            message: 'Get all liquidation receipts successfully',
            metadata: result.rows,
            meta: {
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
