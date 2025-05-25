'use strict';

const BorrowReceiptService = require('../services/borrow-receipt/borrowReceipt.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class BorrowReceiptController {
    createBorrowReceipt = async (req, res, next) => {
        new CREATED({
            message: 'Create borrow receipt successfully',
            data: await BorrowReceiptService.createBorrowReceipt(req.body),
        }).send(res);
    };

    approveBorrowReceipt = async (req, res, next) => {
        new SuccessResponse({
            message: 'Approve borrow receipt successfully',
            data: await BorrowReceiptService.approveBorrowReceipt(
                req.params.id,
                req.body.approverCode,
            ),
        }).send(res);
    };

    rejectBorrowReceipt = async (req, res, next) => {
        new SuccessResponse({
            message: 'Reject borrow receipt successfully',
            data: await BorrowReceiptService.rejectBorrowReceipt(
                req.params.id,
                req.body.approverCode,
                req.body.reason,
            ),
        }).send(res);
    };

    markAsBorrowed = async (req, res, next) => {
        new SuccessResponse({
            message: 'Mark as borrowed successfully',
            data: await BorrowReceiptService.markAsBorrowed(req.params.id),
        }).send(res);
    };

    markAsReturned = async (req, res, next) => {
        new SuccessResponse({
            message: 'Mark as returned successfully',
            data: await BorrowReceiptService.markAsReturned(req.params.id),
        }).send(res);
    };

    getAllBorrowReceipts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all borrow receipts successfully',
            data: await BorrowReceiptService.getAllBorrowReceipts(req.query),
        }).send(res);
    };

    getBorrowReceiptDetails = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get borrow receipt details successfully',
            data: await BorrowReceiptService.getBorrowReceiptDetails(
                req.params.id,
            ),
        }).send(res);
    };
}

module.exports = new BorrowReceiptController();
