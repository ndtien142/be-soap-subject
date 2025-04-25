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
        fk_transfer_from: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        fk_transfer_to: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        fk_department_id: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        fk_user_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('draft', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'draft',
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
