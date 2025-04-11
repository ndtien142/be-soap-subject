'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        fk_import_receipt_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: { model: 'tb_import_receipt', key: 'id' },
        },
        fk_equipment_code: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false,
            references: { model: 'tb_equipment', key: 'equipment_code' },
        },
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
        tableName: 'tb_import_receipt',
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
