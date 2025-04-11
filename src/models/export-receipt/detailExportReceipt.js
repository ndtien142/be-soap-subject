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
    fk_export_receipt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'tb_export_receipt', key: 'id' },
    },
    fk_equipment_code: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'tb_equipment', key: 'equipment_code' },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  };

  const options = {
    tableName: 'tb_detail_export_receipt',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: 'update_time',
  };

  const DetailExportReceipt = sequelize.define('DetailExportReceipt', attributes, options);
  return DetailExportReceipt;
}
