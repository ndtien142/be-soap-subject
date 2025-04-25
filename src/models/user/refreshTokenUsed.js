'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        token: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fk_user_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
    };

    const options = {
        tableName: 'tb_refresh_token_used',
        timestamps: false,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const RefreshTokenUsed = sequelize.define(
        'RefreshTokenUsed',
        attributes,
        options,
    );

    return RefreshTokenUsed;
}
