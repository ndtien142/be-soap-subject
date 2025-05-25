'use strict';

const TransferReceiptService = require('../services/transfer-receipt/transferReceipt.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class TransferReceiptController {
    createTransferReceipt = async (req, res, next) => {
        new CREATED({
            message: 'Create transfer receipt successfully',
            data: await TransferReceiptService.createTransferReceipt(req.body),
        }).send(res);
    };

    approveTransferReceipt = async (req, res, next) => {
        new SuccessResponse({
            message: 'Approve transfer receipt successfully',
            data: await TransferReceiptService.approveTransferReceipt(
                req.params.id,
                req.body.approverCode,
            ),
        }).send(res);
    };

    rejectTransferReceipt = async (req, res, next) => {
        new SuccessResponse({
            message: 'Reject transfer receipt successfully',
            data: await TransferReceiptService.rejectTransferReceipt(
                req.params.id,
                req.body.approverCode,
                req.body.reason,
            ),
        }).send(res);
    };

    markAsTransferred = async (req, res, next) => {
        new SuccessResponse({
            message: 'Mark as transferred successfully',
            data: await TransferReceiptService.markAsTransferred(req.params.id),
        }).send(res);
    };

    getAllTransferReceipts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all transfer receipts successfully',
            data: await TransferReceiptService.getAllTransferReceipts(
                req.query,
            ),
        }).send(res);
    };

    getTransferReceiptDetails = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get transfer receipt details successfully',
            data: await TransferReceiptService.getTransferReceiptDetails(
                req.params.id,
            ),
        }).send(res);
    };
}

module.exports = new TransferReceiptController();
