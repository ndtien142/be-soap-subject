'use strict';

const express = require('express');
const importReceiptController = require('../../controllers/importReceipt.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Import Receipts
 *     description: API for managing import receipts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ImportReceipt:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         code:
 *           type: string
 *         supplierId:
 *           type: integer
 *         dateOfReceived:
 *           type: string
 *           format: date
 *         dateOfOrder:
 *           type: string
 *           format: date
 *         note:
 *           type: string
 *         status:
 *           type: string
 *           enum: [requested, approved, rejected, processed]
 */

/**
 * @swagger
 * /import-receipt:
 *   get:
 *     summary: Get all import receipts
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     tags: [Import Receipts]
 *     responses:
 *       200:
 *         description: List of import receipts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     receipts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ImportReceipt'
 */

/**
 * @swagger
 * /import-receipt:
 *   post:
 *     summary: Create a new import receipt
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [Import Receipts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier
 *               - items
 *               - dateOfReceived
 *               - dateOfOrder
 *               - user
 *             properties:
 *               supplier:
 *                 type: object
 *                 required: [id]
 *                 properties:
 *                   id:
 *                     type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [code, price, quantity]
 *                   properties:
 *                     code:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: integer
 *               dateOfReceived:
 *                 type: string
 *                 format: date
 *               dateOfOrder:
 *                 type: string
 *                 format: date
 *               note:
 *                 type: string
 *               user:
 *                 type: object
 *                 required: [code]
 *                 properties:
 *                   code:
 *                     type: string
 *     responses:
 *       201:
 *         description: Import receipt created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /import-receipt/{id}:
 *   get:
 *     summary: Get import receipt details by ID
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
 *         description: Import receipt ID
 *     tags: [Import Receipts]
 *     responses:
 *       200:
 *         description: Import receipt details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportReceipt'
 *       404:
 *         description: Import receipt not found
 */

/**
 * @swagger
 * /import-receipt/{id}/status:
 *   put:
 *     summary: Update the status of an import receipt
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
 *         description: Import receipt ID
 *     tags: [Import Receipts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Import receipt status updated successfully
 *       400:
 *         description: Invalid status update
 */

/**
 * @swagger
 * /import-receipt/{id}/process:
 *   post:
 *     summary: Process an approved import receipt
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
 *         description: Import receipt ID
 *     tags: [Import Receipts]
 *     responses:
 *       200:
 *         description: Import receipt processed successfully
 *       400:
 *         description: Cannot process the receipt
 */

router.use(authenticationV2);

router.get('', asyncHandler(importReceiptController.getAllImportReceipts));
router.post('', asyncHandler(importReceiptController.createNewImportReceipt));
router.get(
    '/:id',
    asyncHandler(importReceiptController.getImportReceiptDetails),
);
router.put(
    '/:id/status',
    asyncHandler(importReceiptController.updateImportReceiptStatus),
);
router.post(
    '/:id/process',
    asyncHandler(importReceiptController.processSuccessfulImport),
);

module.exports = router;
