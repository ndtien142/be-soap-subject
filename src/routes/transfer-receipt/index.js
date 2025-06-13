'use strict';

const express = require('express');
const transferReceiptController = require('../../controllers/transferReceipt.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TransferReceipt
 *   description: Transfer receipt management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TransferReceiptItem:
 *       type: object
 *       properties:
 *         serialNumber:
 *           type: string
 *         notes:
 *           type: string
 *     TransferReceipt:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         transferDate:
 *           type: string
 *           format: date
 *         transferFrom:
 *           type: string
 *         transferTo:
 *           type: string
 *         userCode:
 *           type: string
 *         status:
 *           type: string
 *           enum: [requested, approved, rejected, transferred]
 *         notes:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TransferReceiptItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateTransferReceiptInput:
 *       type: object
 *       required:
 *         - transferDate
 *         - transferFrom
 *         - transferTo
 *         - userCode
 *         - items
 *       properties:
 *         transferDate:
 *           type: string
 *           format: date
 *         transferFrom:
 *           type: string
 *         transferTo:
 *           type: string
 *         userCode:
 *           type: string
 *         notes:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TransferReceiptItem'
 */

/**
 * @swagger
 * /transfer-receipt:
 *   post:
 *     summary: Create a new transfer receipt
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [TransferReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransferReceiptInput'
 *     responses:
 *       200:
 *         description: Transfer receipt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransferReceipt'
 */

/**
 * @swagger
 * /transfer-receipt/{id}/approve:
 *   put:
 *     summary: Approve a transfer receipt
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
 *     tags: [TransferReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approverCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer receipt approved
 */

/**
 * @swagger
 * /transfer-receipt/{id}/reject:
 *   put:
 *     summary: Reject a transfer receipt
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
 *     tags: [TransferReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approverCode:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer receipt rejected
 */

/**
 * @swagger
 * /transfer-receipt/{id}/mark-transferred:
 *   put:
 *     summary: Mark a transfer receipt as transferred and update equipment room
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
 *     tags: [TransferReceipt]
 *     responses:
 *       200:
 *         description: Transfer receipt marked as transferred
 */

/**
 * @swagger
 * /transfer-receipt:
 *   get:
 *     summary: Get all transfer receipts
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
 *     tags: [TransferReceipt]
 *     responses:
 *       200:
 *         description: List of transfer receipts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TransferReceipt'
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
 * /transfer-receipt/{id}:
 *   get:
 *     summary: Get transfer receipt details by ID
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
 *     tags: [TransferReceipt]
 *     responses:
 *       200:
 *         description: Transfer receipt details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransferReceipt'
 */

/**
 * @swagger
 * /transfer-receipt/room/{roomId}/equipment:
 *   get:
 *     summary: Get all equipment in a specific room with status 'in_use'
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     tags: [TransferReceipt]
 *     responses:
 *       200:
 *         description: List of equipment in the room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Equipment'
 */

router.use(authenticationV2);

router.post('', asyncHandler(transferReceiptController.createTransferReceipt));
router.put(
    '/:id/approve',
    asyncHandler(transferReceiptController.approveTransferReceipt),
);
router.put(
    '/:id/reject',
    asyncHandler(transferReceiptController.rejectTransferReceipt),
);
router.put(
    '/:id/mark-transferred',
    asyncHandler(transferReceiptController.markAsTransferred),
);
router.get('', asyncHandler(transferReceiptController.getAllTransferReceipts));
router.get(
    '/:id',
    asyncHandler(transferReceiptController.getTransferReceiptDetails),
);
router.get(
    '/room/:roomId/equipment',
    asyncHandler(transferReceiptController.getAllEquipmentInRoom),
);

module.exports = router;
