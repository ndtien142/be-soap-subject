'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        department_id: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false,
        },
        department_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    };

    const options = {
        tableName: 'tb_department',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    return sequelize.define('Department', attributes, options);
}
