'use strict';

const express = require('express');
const borrowReceiptController = require('../../controllers/borrowReceipt.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: BorrowReceipt
 *   description: Borrow receipt management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BorrowReceiptItem:
 *       type: object
 *       properties:
 *         serialNumber:
 *           type: string
 *         note:
 *           type: string
 *     BorrowGroupItem:
 *       type: object
 *       properties:
 *         groupEquipmentCode:
 *           type: string
 *         quantity:
 *           type: integer
 *     BorrowReceipt:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userCode:
 *           type: string
 *         borrowDate:
 *           type: string
 *           format: date
 *         returnDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [requested, approved, rejected, borrowed, returned]
 *         note:
 *           type: string
 *         roomId:
 *           type: string
 *         groups:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BorrowGroupItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateBorrowReceiptInput:
 *       type: object
 *       required:
 *         - userCode
 *         - borrowDate
 *         - roomId
 *         - type
 *       properties:
 *         userCode:
 *           type: string
 *         borrowDate:
 *           type: string
 *           format: date
 *         returnDate:
 *           type: string
 *           format: date
 *         note:
 *           type: string
 *         roomId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [specific, group]
 *         groups:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BorrowGroupItem'
 */

/**
 * @swagger
 * /borrow-receipt:
 *   post:
 *     summary: Create a new borrow receipt
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [BorrowReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBorrowReceiptInput'
 *     responses:
 *       200:
 *         description: Borrow receipt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BorrowReceipt'
 */

/**
 * @swagger
 * /borrow-receipt/{id}/action:
 *   put:
 *     summary: Perform an action on a borrow receipt (approve, reject, mark-borrowed, mark-returned)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     tags: [BorrowReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, mark-borrowed, mark-returned]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Action performed on borrow receipt
 */

/**
 * @swagger
 * /borrow-receipt:
 *   get:
 *     summary: Get all borrow receipts
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     tags: [BorrowReceipt]
 *     responses:
 *       200:
 *         description: List of borrow receipts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BorrowReceipt'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     itemPerPage:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */

/**
 * @swagger
 * /borrow-receipt/{id}:
 *   get:
 *     summary: Get borrow receipt details by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     tags: [BorrowReceipt]
 *     responses:
 *       200:
 *         description: Borrow receipt details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BorrowReceipt'
 */

/**
 * @swagger
 * /borrow-receipt/check-available:
 *   post:
 *     summary: Check equipment available for multiple groupEquipmentCode and quantity
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groups:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/BorrowGroupItem'
 *     tags: [BorrowReceipt]
 *     responses:
 *       200:
 *         description: Equipment availability for each group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       groupEquipmentCode:
 *                         type: string
 *                       requested:
 *                         type: integer
 *                       available:
 *                         type: boolean
 *                       availableCount:
 *                         type: integer
 */

/**
 * @swagger
 * /borrow-receipt/scan-export:
 *   post:
 *     summary: Scan and export a single equipment for a borrow receipt
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [BorrowReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               borrowReceiptId:
 *                 type: integer
 *               serialNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Equipment scanned and exported
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 borrowReceiptId:
 *                   type: integer
 *                 serialNumber:
 *                   type: string
 *                 status:
 *                   type: string
 *                 isPartial:
 *                   type: boolean
 *                 actualQuantity:
 *                   type: integer
 *                 totalRequested:
 *                   type: integer
 */

/**
 * @swagger
 * /borrow-receipt/delete-scanned-equipment:
 *   post:
 *     summary: Delete a scanned equipment from a borrow receipt (undo scan)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [BorrowReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               borrowReceiptId:
 *                 type: integer
 *               serialNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Scanned equipment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 borrowReceiptId:
 *                   type: integer
 *                 serialNumber:
 *                   type: string
 *                 message:
 *                   type: string
 */

router.use(authenticationV2);

router.post('', asyncHandler(borrowReceiptController.createBorrowReceipt));
router.post(
    '/check-available',
    asyncHandler(borrowReceiptController.checkEquipmentAvailable),
);
router.post(
    '/scan-export',
    asyncHandler(borrowReceiptController.scanAndExportEquipment),
);
router.post(
    '/delete-scanned-equipment',
    asyncHandler(borrowReceiptController.deleteScannedEquipment),
);
router.put('/:id/action', asyncHandler(borrowReceiptController.handleAction));
router.get('', asyncHandler(borrowReceiptController.getAllBorrowReceipts));
router.get(
    '/:id',
    asyncHandler(borrowReceiptController.getBorrowReceiptDetails),
);

module.exports = router;
