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
        action_type: {
            type: DataTypes.ENUM(
                'import',
                'transfer',
                'liquidation',
                'borrow',
                'return',
            ),
            allowNull: false,
        },
        action_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        serial_number: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
        uploaded_by: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        uploaded_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    };

    const options = {
        tableName: 'tb_equipment_images',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const EquipmentImages = sequelize.define(
        'EquipmentImages',
        attributes,
        options,
    );

    return EquipmentImages;
}
