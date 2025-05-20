'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        reason: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        liquidation_price: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_liquidation_receipt_detail',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const LiquidationReceiptDetail = sequelize.define(
        'LiquidationReceiptDetail',
        attributes,
        options,
    );

    return LiquidationReceiptDetail;
}
