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
        group_equipment_code: {
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
                'reserved',
                'pending_transfer',
            ),
            allowNull: false,
            defaultValue: 'available',
        },
        room_id: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        import_receipt_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
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
