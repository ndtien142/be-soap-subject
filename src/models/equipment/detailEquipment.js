'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        serial_number: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false,
        },
        fk_equipment_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: { model: 'tb_equipment', key: 'equipment_code' },
        },
        fk_equipment_type_id: {
            type: DataTypes.TINYINT,
            allowNull: false,
            references: { model: 'tb_equipment_type', key: 'id' },
        },
        fk_equipment_status_id: {
            type: DataTypes.TINYINT,
            allowNull: false,
            references: { model: 'tb_equipment_status', key: 'id' },
        },
        day_of_first_use: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        equipment_description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        equipment_location: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_detail_equipment',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const DetailEquipment = sequelize.define(
        'DetailEquipment',
        attributes,
        options,
    );

    return DetailEquipment;
}
