'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        equipment_code: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false,
        },
        equipment_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        fk_equipment_type_id: {
            type: DataTypes.TINYINT,
            allowNull: false,
            references: { model: 'tb_equipment_type', key: 'id' },
        },
        equipment_manufacturer: {
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
        tableName: 'tb_equipment',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const Equipment = sequelize.define('Equipment', attributes, options);

    return Equipment;
}
