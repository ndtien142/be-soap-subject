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
        borrow_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        return_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        user_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
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
                'returned',
                'borrowed',
            ),
            allowNull: false,
            defaultValue: 'requested',
        },
        note: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_borrow_receipt',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const BorrowReceipt = sequelize.define(
        'BorrowReceipt',
        attributes,
        options,
    );

    return BorrowReceipt;
}
