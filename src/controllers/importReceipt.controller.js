const ImportReceiptService = require('../services/import-equipment/importReceipt.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class ImportReceiptController {
    createNewImportReceipt = async (req, res, next) => {
        new CREATED({
            message: 'Create new import receipt successfully',
            metadata: await ImportReceiptService.createImportReceipt({
                ...req.body,
                user: req.user,
            }),
        }).send(res);
    };
    getAllImportReceipts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all import receipts successfully',
            metadata: await ImportReceiptService.getAllImportReceipts(
                req.query,
            ),
        }).send(res);
    };
    getImportReceiptDetails = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get import receipt details successfully',
            metadata: await ImportReceiptService.getImportReceiptDetails(
                req.params.id,
            ),
        }).send(res);
    };
    updateImportReceiptStatus = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update import receipt status successfully',
            metadata: await ImportReceiptService.updateImportReceiptStatus(
                req.params.id,
                req.body.status,
                req.body.reason,
                req.user,
            ),
        }).send(res);
    };
    processSuccessfulImport = async (req, res, next) => {
        new SuccessResponse({
            message: 'Process import receipt successfully',
            metadata: await ImportReceiptService.processSuccessfulImport(
                req.params.id,
            ),
        }).send(res);
    };
}

module.exports = new ImportReceiptController();
