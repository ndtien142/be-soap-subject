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
        supplier_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        supplier_description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        supplier_address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        supplier_phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        supplier_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_supplier',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const Supplier = sequelize.define('Supplier', attributes, options);

    return Supplier;
}
