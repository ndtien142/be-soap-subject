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
        equipment_status_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        equipment_status_description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_equipment_status',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const EquipmentStatus = sequelize.define(
        'EquipmentStatus',
        attributes,
        options,
    );

    return EquipmentStatus;
}
