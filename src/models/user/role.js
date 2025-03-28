'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: {
            type: DataTypes.TINYINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        role_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            // unique: true,
        },
        role_description: { type: DataTypes.TEXT, allowNull: false },
    };

    const options = {
        tableName: 'tb_role',
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    return sequelize.define('Role', attributes, options);
}
