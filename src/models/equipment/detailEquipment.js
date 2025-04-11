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
        status: {
            type: DataTypes.ENUM(
                'available',
                'in_use',
                'under_maintenance',
                'out_of_service',
                'liquidation',
            ),
            allowNull: false,
            defaultValue: 'available',
        },
        fk_import_receipt_id: {
            type: DataTypes.INTEGER,
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
