'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    };

    const options = {
        tableName: 'tb_detail_import_receipt',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const DetailImportReceipt = sequelize.define(
        'DetailImportReceipt',
        attributes,
        options,
    );

    return DetailImportReceipt;
}
