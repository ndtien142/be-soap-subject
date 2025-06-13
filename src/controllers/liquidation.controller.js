'use strict';

const LiquidationReceiptService = require('../services/liquidation-receipt/liquidationReceipt.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class LiquidationController {
    createLiquidationReceipt = async (req, res, next) => {
        new CREATED({
            message: 'Create liquidation receipt successfully',
            metadata: await LiquidationReceiptService.createLiquidationReceipt({
                ...req.body,
                user: req.user, // nếu bạn muốn truyền thêm thông tin người dùng hiện tại
            }),
        }).send(res);
    };
    

    approveLiquidationReceipt = async (req, res, next) => {
        new SuccessResponse({
            message: 'Approve liquidation receipt successfully',
            data: await LiquidationReceiptService.approveLiquidationReceipt(
                req.params.id,
                req.body.approverCode,
            ),
        }).send(res);
    };

    rejectLiquidationReceipt = async (req, res, next) => {
        new SuccessResponse({
            message: 'Reject liquidation receipt successfully',
            data: await LiquidationReceiptService.rejectLiquidationReceipt(
                req.params.id,
                req.body.approverCode,
                req.body.reason,
            ),
        }).send(res);
    };

    getAllLiquidationReceipts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all liquidation receipts successfully',
            metadata: await LiquidationReceiptService.getAllLiquidationReceipts(
                req.query,
            ),
        }).send(res);
    };
    

    getLiquidationReceiptDetails = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get liquidation receipt details successfully',
            data: await LiquidationReceiptService.getLiquidationReceiptDetails(
                req.params.id,
            ),
        }).send(res);
    };
}

module.exports = new LiquidationController();
