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
        unit_of_measure_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        unit_of_measure_description: {
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
        tableName: 'tb_unit_of_measure',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const UnitOfMeasure = sequelize.define(
        'UnitOfMeasure',
        attributes,
        options,
    );

    return UnitOfMeasure;
}
