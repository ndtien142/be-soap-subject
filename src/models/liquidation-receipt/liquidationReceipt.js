'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        liquidation_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(
                'requested',
                'approved',
                'rejected',
                'liquidated',
            ),
            defaultValue: 'requested',
            allowNull: false,
        },
        user_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        approve_by: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_liquidation_receipt',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    return sequelize.define('LiquidationReceipt', attributes, options);
}
