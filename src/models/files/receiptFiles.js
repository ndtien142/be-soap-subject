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
        receipt_type: {
            type: DataTypes.ENUM(
                'import',
                'transfer',
                'liquidation',
                'borrow',
                'return',
            ),
            allowNull: false,
        },
        receipt_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        file_path: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        upload_by: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        upload_time: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        status: {
            type: DataTypes.ENUM('active', 'archived', 'deleted'),
            allowNull: false,
            defaultValue: 'active',
        },
        note: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_receipt_files',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const ReceiptFiles = sequelize.define('ReceiptFiles', attributes, options);

    return ReceiptFiles;
}
