'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        note: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_borrow_receipt_detail',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const BorrowReceiptDetail = sequelize.define(
        'BorrowReceiptDetail',
        attributes,
        options,
    );

    return BorrowReceiptDetail;
}
