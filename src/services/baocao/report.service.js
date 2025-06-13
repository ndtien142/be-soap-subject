const { Op, fn, col, literal, Sequelize } = require('sequelize');
const database = require('../../models'); // đường dẫn tới models Sequelize của bạn

class ReportService {
  static async getAssetInflowReport({ period, from, to }) {
    if (!['week', 'quarter', 'year'].includes(period)) {
      throw new Error('Invalid period');
    }

    const where = {
      date_of_order: {
        [Op.between]: [from, to],
      },
    };

    // Lấy format group theo period
    let groupFormat;
    if (period === 'week') {
      groupFormat = Sequelize.literal("YEAR(date_of_order) * 100 + WEEK(date_of_order, 1)");
    } else if (period === 'quarter') {
      groupFormat = Sequelize.literal("CONCAT(YEAR(date_of_order), '-Q', QUARTER(date_of_order))");
    } else if (period === 'year') {
      groupFormat = fn('YEAR', col('date_of_order'));
    }

    const result = await database.ImportReceipt.findAll({
      attributes: [
        [groupFormat, 'period'],
        [fn('SUM', literal('`ImportReceiptDetails`.`price` * `ImportReceiptDetails`.`quantity`')), 'totalValue'],
      ],
      where,
      include: [
        {
          model: database.ImportReceiptDetail,
          as: 'ImportReceiptDetails',
          attributes: [],
        },
      ],
      group: ['period'],
      raw: true,
    });

    return {
      code: 200,
      message: 'Get asset inflow report successfully',
      metadata: result,
    };
  }
}

module.exports = ReportService;
