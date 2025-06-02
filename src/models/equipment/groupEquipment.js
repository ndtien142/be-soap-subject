'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        group_equipment_code: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
        },
        group_equipment_name: {
            type: DataTypes.STRING(1000),
            allowNull: false,
        },
        equipment_type_id: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        equipment_manufacturer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        is_deleted: { type: DataTypes.BOOLEAN, allowNull: false },
    };

    const options = {
        tableName: 'tb_group_equipment',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const GroupEquipment = sequelize.define(
        'GroupEquipment',
        attributes,
        options,
    );

    return GroupEquipment;
}
