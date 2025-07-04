'use strict';

const BorrowReceiptService = require('../services/borrow-receipt/borrowReceipt.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class BorrowReceiptController {
    createBorrowReceipt = async (req, res, next) => {
        new CREATED({
            message: 'Create borrow receipt successfully',
            metadata: await BorrowReceiptService.createBorrowReceipt({
                ...req.body,
                user: req.user,
            }),
        }).send(res);
    };

    handleAction = async (req, res, next) => {
        const { action, reason } = req.body;
        let result;
        switch (action) {
            case 'approve':
                result = await BorrowReceiptService.approveBorrowReceipt(
                    req.params.id,
                    req.user.userCode,
                );
                break;
            case 'reject':
                result = await BorrowReceiptService.rejectBorrowReceipt(
                    req.params.id,
                    req.user.userCode,
                    reason,
                );
                break;
            case 'mark-returned':
                result = await BorrowReceiptService.markAsReturned(
                    req.params.id,
                );
                break;
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }
        new SuccessResponse({
            message: 'Action performed successfully',
            metadata: result,
        }).send(res);
    };

    getAllBorrowReceipts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all borrow receipts successfully',
            metadata: await BorrowReceiptService.getAllBorrowReceipts(
                req.query,
            ),
        }).send(res);
    };

    getBorrowReceiptDetails = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get borrow receipt details successfully',
            metadata: await BorrowReceiptService.getBorrowReceiptDetails(
                req.params.id,
            ),
        }).send(res);
    };

    checkEquipmentAvailable = async (req, res, next) => {
        new SuccessResponse({
            message: 'Check equipment available',
            metadata: await BorrowReceiptService.checkEquipmentAvailable(
                req.body,
            ),
        }).send(res);
    };

    scanAndExportEquipment = async (req, res, next) => {
        const { borrowReceiptId, serialNumber } = req.body;
        new SuccessResponse({
            message: 'Scan and export equipment',
            metadata: await BorrowReceiptService.scanAndExportEquipment({
                borrowReceiptId,
                serialNumber,
            }),
        }).send(res);
    };

    /**
     * Remove a scanned equipment from a borrow receipt (undo scan).
     * Expects: { borrowReceiptId, serialNumber } in req.body
     */
    deleteScannedEquipment = async (req, res, next) => {
        const { borrowReceiptId, serialNumber } = req.body;
        new SuccessResponse({
            message: 'Delete scanned equipment',
            metadata: await BorrowReceiptService.deleteScannedEquipment({
                borrowReceiptId,
                serialNumber,
            }),
        }).send(res);
    };

    getListAvailable = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list available of borrow receipt',
            metadata:
                await BorrowReceiptService.getListAvailableOfBorrowReceipt(
                    req.params.id,
                ),
        }).send(res);
    };

    /**
     * Confirm borrow: mark as borrowed, set day_of_first_use, set equipment status, create files.
     * Expects: { equipmentFiles } in req.body (see service for structure)
     */
    confirmBorrowed = async (req, res, next) => {
        const { equipmentFiles } = req.body;
        const borrowReceiptId = req.params.id;
        const userCode = req.user.userCode;
        const result =
            await BorrowReceiptService.maskBorrowedAndSetDayOfFirstUse({
                borrowReceiptId,
                equipmentFiles,
                userCode,
            });
        new SuccessResponse({
            message: 'Borrow receipt marked as borrowed and files created',
            metadata: result,
        }).send(res);
    };

    markAsPartialBorrowed = async (req, res, next) => {
        const { equipmentFiles } = req.body;
        const borrowReceiptId = req.params.id;
        const userCode = req.user.userCode;
        const result = await BorrowReceiptService.markAsPartialBorrowed({
            borrowReceiptId,
            equipmentFiles,
            userCode,
        });
        new SuccessResponse({
            message:
                'Borrow receipt marked as partial borrowed and equipment updated successfully',
            metadata: result,
        }).send(res);
    };
}

module.exports = new BorrowReceiptController();
