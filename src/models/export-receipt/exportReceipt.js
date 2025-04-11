'use strict';

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    export_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fk_user_code: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'tb_account', key: 'user_code' },
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  };

  const options = {
    tableName: 'tb_export_receipt',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: 'update_time',
  };

  const ExportReceipt = sequelize.define('ExportReceipt', attributes, options);
  return ExportReceipt;
}
