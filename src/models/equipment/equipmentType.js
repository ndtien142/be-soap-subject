'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: {
            type: DataTypes.TINYINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        prefix: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        equipment_type_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        equipment_type_description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        is_deleted: { type: DataTypes.BOOLEAN, allowNull: false },
    };

    const options = {
        tableName: 'tb_equipment_type',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const EquipmentType = sequelize.define(
        'EquipmentType',
        attributes,
        options,
    );

    return EquipmentType;
}
