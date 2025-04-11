const db = require('../../index');

const createImportReceipt = async (data, transaction) => {
  return await db.ImportReceipt.create(data, { transaction });
};

const createImportReceiptDetail = async (data, transaction) => {
  return await db.DetailImportReceipt.create(data, { transaction });
};

const getAllImportReceipts = async () => {
  return await db.ImportReceipt.findAll({
    include: [db.Supplier, db.Account],
  });
};

const getImportReceiptDetail = async (id) => {
  return await db.ImportReceipt.findOne({
    where: { id },
    include: [
      {
        model: db.DetailImportReceipt,
        include: [db.Equipment],
      },
      db.Supplier,
      db.Account,
    ],
  });
};

const updateImportReceiptById = async (id, updateData, transaction) => {
  return await db.ImportReceipt.update(updateData, {
    where: { id },
    transaction,
  });
};

const deleteImportReceiptDetails = async (receiptId, transaction) => {
  return await db.DetailImportReceipt.destroy({
    where: { fk_import_receipt_id: receiptId },
    transaction,
  });
};

module.exports = {
  createImportReceipt,
  createImportReceiptDetail,
  getAllImportReceipts,
  getImportReceiptDetail,
  updateImportReceiptById,
  deleteImportReceiptDetails,
};
