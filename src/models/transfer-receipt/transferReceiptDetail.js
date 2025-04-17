'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_transfer_receipt_detail',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const TransferReceiptDetail = sequelize.define(
        'TransferReceiptDetail',
        attributes,
        options,
    );

    return TransferReceiptDetail;
}
