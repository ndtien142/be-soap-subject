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
        manufacturer_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        contact_info: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    };

    const options = {
        tableName: 'tb_equipment_manufacturer',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const EquipmentManufacturer = sequelize.define(
        'EquipmentManufacturer',
        attributes,
        options,
    );

    return EquipmentManufacturer;
}
