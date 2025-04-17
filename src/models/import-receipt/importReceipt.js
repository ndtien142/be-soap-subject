'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        date_of_order: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_of_received: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        date_of_actual_received: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        supplier_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        note: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(
                'pending',
                'approved',
                'completed',
                'rejected',
            ),
            allowNull: false,
            defaultValue: 'pending',
        },
    };

    const options = {
        tableName: 'tb_import_receipt',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const ImportReceipt = sequelize.define(
        'ImportReceipt',
        attributes,
        options,
    );

    return ImportReceipt;
}
