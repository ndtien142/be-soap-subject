const db = require('../../models');
const { Op, fn, col, literal, Sequelize } = require('sequelize');


class ReportService {
    // Count statuses for a given model, with optional filter
    static async countStatuses(model, statusField = 'status', where = {}) {
        const results = await model.findAll({
            attributes: [
                [statusField, 'status'],
                [
                    db.Sequelize.fn('COUNT', db.Sequelize.col(statusField)),
                    'count',
                ],
            ],
            where,
            group: [statusField],
            raw: true,
        });
        return results.map((row) => ({
            status: row.status,
            count: Number(row.count),
        }));
    }

    // Generalized function for each receipt type
    static async getReceiptStatusCounts(
        model,
        statusField = 'status',
        where = {},
    ) {
        const data = await ReportService.countStatuses(
            model,
            statusField,
            where,
        );
        return { code: 200, metadata: data };
    }

    // All receipt types at once
    static async getAllReceiptStatusCounts() {
        const [importCounts, borrowCounts, transferCounts, liquidationCounts] =
            await Promise.all([
                ReportService.countStatuses(db.ImportReceipt),
                ReportService.countStatuses(db.BorrowReceipt),
                ReportService.countStatuses(db.TransferReceipt),
                ReportService.countStatuses(db.LiquidationReceipt),
            ]);
        return {
            code: 200,
            metadata: {
                import: importCounts,
                borrow: borrowCounts,
                transfer: transferCounts,
                liquidation: liquidationCounts,
            },
        };
    }

    // Individual receipt type status counts
    static async getImportReceiptStatusCounts(where = {}) {
        const data = await ReportService.countStatuses(
            db.ImportReceipt,
            'status',
            where,
        );
        return { code: 200, metadata: data };
    }

    static async getBorrowReceiptStatusCounts(where = {}) {
        const data = await ReportService.countStatuses(
            db.BorrowReceipt,
            'status',
            where,
        );
        return { code: 200, metadata: data };
    }

    static async getTransferReceiptStatusCounts(where = {}) {
        const data = await ReportService.countStatuses(
            db.TransferReceipt,
            'status',
            where,
        );
        return { code: 200, metadata: data };
    }

    static async getLiquidationReceiptStatusCounts(where = {}) {
        const data = await ReportService.countStatuses(
            db.LiquidationReceipt,
            'status',
            where,
        );
        return { code: 200, metadata: data };
    }

    // Example: count all import receipts (not by status)
    static async countImportReceipts(where = {}) {
        const count = await db.ImportReceipt.count({ where });
        return { code: 200, metadata: count };
    }
    static async getAssetInflowReport({ period, from, to }) {
        if (!['week', 'quarter', 'year'].includes(period)) {
          throw new Error('Invalid period');
        }
      
        const where = {
          date_of_order: {
            [Op.between]: [from, to],
          },
        };
      
        let groupFormat;
        if (period === 'week') {
          groupFormat = Sequelize.literal("YEAR(date_of_order) * 100 + WEEK(date_of_order, 1)");
        } else if (period === 'quarter') {
          groupFormat = Sequelize.literal("CONCAT(YEAR(date_of_order), '-Q', QUARTER(date_of_order))");
        } else if (period === 'year') {
          groupFormat = fn('YEAR', col('date_of_order'));
        }
      
        const result = await db.ImportReceipt.findAll({
          where,
          include: [
            {
              model: db.GroupEquipment,
              as: 'group_equipment',
            },
          ],
          raw: true,
        });

        console.log('Asset inflow report result:', result);
      
        return {
          code: 200,
          message: 'Get asset inflow report successfully',
          metadata: result,
        };
      }
}

module.exports = ReportService;
