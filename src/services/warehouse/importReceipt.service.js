'use strict';

const { BadRequestError, NotFoundError } = require('../../core/error.response');
const {
  createImportReceipt,
  createImportReceiptDetail,
  getAllImportReceipts,
  getImportReceiptDetail,
  updateImportReceiptById,
  deleteImportReceiptDetails,
} = require('../../models/repo/warehouse/importReceipt.repo');
const db = require('../../models');

class ImportReceiptService {
  // Create a new import receipt with details
  static async createImportReceipt({
    dateOfOrder,
    dateOfReceived,
    dateOfActualReceived,
    supplierId,
    userCode,
    note,
    items
  }) {
    const t = await db.sequelize.transaction();
    try {
      const newImportReceipt = await createImportReceipt({
        date_of_order: dateOfOrder,
        date_of_received: dateOfReceived,
        date_of_actual_received: dateOfActualReceived,
        fk_supplier_id: supplierId,
        fk_user_code: userCode,
        note
      }, t);

      for (const item of items) {
        await createImportReceiptDetail({
          fk_import_receipt_id: newImportReceipt.id,
          fk_equipment_code: item.equipmentCode,
          quantity: item.quantity,
          unit_price: item.unitPrice
        }, t);
      }

      await t.commit();
      return {
        code: 201,
        message: 'Import receipt created successfully!',
        data: newImportReceipt
      };
    } catch (err) {
      await t.rollback();
      throw new BadRequestError('Failed to create import receipt: ' + err.message);
    }
  }

  // Get all import receipts
  //check import id exist
  static async getAllImportReceipts() {
    const receipts = await getAllImportReceipts();
    if (!receipts || receipts.length === 0) {
      throw new NotFoundError('No import receipts found');
    }
    return {
      code: 200,
      data: receipts
    };
  }

  // Get receipt detail by id
  static async getImportReceiptDetail(importReceiptId) {
    const receipt = await getImportReceiptDetail(importReceiptId);
    if (!receipt) {
      throw new NotFoundError('Import receipt not found');
    }
    return {
      code: 200,
      data: receipt
    };
  }

  // Update import receipt and details
  static async updateImportReceipt({
    importReceiptId,
    dateOfOrder,
    dateOfReceived,
    dateOfActualReceived,
    supplierId,
    userCode,
    note,
    items
  }) {
    const t = await db.sequelize.transaction();
    try {
      const existingReceipt = await getImportReceiptDetail(importReceiptId);
      if (!existingReceipt) throw new NotFoundError('Import receipt not found');

      await updateImportReceiptById(importReceiptId, {
        date_of_order: dateOfOrder,
        date_of_received: dateOfReceived,
        date_of_actual_received: dateOfActualReceived,
        fk_supplier_id: supplierId,
        fk_user_code: userCode,
        note
      }, t);

      await deleteImportReceiptDetails(importReceiptId, t);

      for (const item of items) {
        await createImportReceiptDetail({
          fk_import_receipt_id: importReceiptId,
          fk_equipment_code: item.equipmentCode,
          quantity: item.quantity,
          unit_price: item.unitPrice
        }, t);
      }

      await t.commit();
      return {
        code: 200,
        message: 'Import receipt updated successfully',
      };
    } catch (err) {
      await t.rollback();
      throw new BadRequestError('Update failed: ' + err.message);
    }
  }
}

module.exports = ImportReceiptService;
