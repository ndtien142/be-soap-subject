'use strict';

const ReportService = require('../services/report/report.service');
const { SuccessResponse } = require('../core/success.response');

class ReportController {
    getAllReceiptStatusCounts = async (req, res, next) => {
        new SuccessResponse(
            await ReportService.getAllReceiptStatusCounts(),
        ).send(res);
    };

    getImportReceiptStatusCounts = async (req, res, next) => {
        new SuccessResponse(
            await ReportService.getImportReceiptStatusCounts(req.query),
        ).send(res);
    };

    getBorrowReceiptStatusCounts = async (req, res, next) => {
        new SuccessResponse(
            await ReportService.getBorrowReceiptStatusCounts(req.query),
        ).send(res);
    };

    getTransferReceiptStatusCounts = async (req, res, next) => {
        new SuccessResponse(
            await ReportService.getTransferReceiptStatusCounts(req.query),
        ).send(res);
    };

    getLiquidationReceiptStatusCounts = async (req, res, next) => {
        new SuccessResponse(
            await ReportService.getLiquidationReceiptStatusCounts(req.query),
        ).send(res);
    };

    countImportReceipts = async (req, res, next) => {
        new SuccessResponse(
            await ReportService.countImportReceipts(req.query),
        ).send(res);
    };
}

module.exports = new ReportController();
