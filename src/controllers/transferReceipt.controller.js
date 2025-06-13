'use strict';

const TransferReceiptService = require('../services/transfer-receipt/transferReceipt.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class TransferReceiptController {
    createTransferReceipt = async (req, res, next) => {
        new CREATED({
            message: 'Create transfer receipt successfully',
            metadata: await TransferReceiptService.createTransferReceipt(
                req.body,
            ),
        }).send(res);
    };

    approveTransferReceipt = async (req, res, next) => {
        new SuccessResponse({
            message: 'Approve transfer receipt successfully',
            metadata: await TransferReceiptService.approveTransferReceipt(
                req.params.id,
                req.body.approverCode,
            ),
        }).send(res);
    };

    rejectTransferReceipt = async (req, res, next) => {
        new SuccessResponse({
            message: 'Reject transfer receipt successfully',
            metadata: await TransferReceiptService.rejectTransferReceipt(
                req.params.id,
                req.body.approverCode,
                req.body.reason,
            ),
        }).send(res);
    };

    markAsTransferred = async (req, res, next) => {
        new SuccessResponse({
            message: 'Mark as transferred successfully',
            metadata: await TransferReceiptService.markAsTransferred(
                req.params.id,
            ),
        }).send(res);
    };

    getAllTransferReceipts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all transfer receipts successfully',
            metadata: await TransferReceiptService.getAllTransferReceipts(
                req.query,
            ),
        }).send(res);
    };

    getTransferReceiptDetails = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get transfer receipt details successfully',
            metadata: await TransferReceiptService.getTransferReceiptDetails(
                req.params.id,
            ),
        }).send(res);
    };

    getAllEquipmentInRoom = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all equipment in room successfully',
            metadata: await TransferReceiptService.getAllEquipmentInRoom(
                req.params.roomId,
            ),
        }).send(res);
    };
}

module.exports = new TransferReceiptController();
