'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        fk_user_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        privateKey: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        publicKey: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    };

    const options = {
        tableName: 'tb_key_token',
        timestamps: true,
        createdAt: 'create_time',
        updatedAt: 'update_time',
    };

    const KeyToken = sequelize.define('KeyToken', attributes, options);

    return KeyToken;
}
