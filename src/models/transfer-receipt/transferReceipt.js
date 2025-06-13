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
        transfer_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        transfer_from: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        transfer_to: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        user_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        created_by: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        approve_by: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(
                'requested',
                'approved',
                'rejected',
                'transferred',
            ),
            allowNull: false,
            defaultValue: 'requested',
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_transfer_receipt',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const TransferReceipt = sequelize.define(
        'TransferReceipt',
        attributes,
        options,
    );

    return TransferReceipt;
}
