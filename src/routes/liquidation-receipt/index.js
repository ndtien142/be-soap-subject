'use strict';

const express = require('express');
const liquidationController = require('../../controllers/liquidation.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: LiquidationReceipt
 *   description: Liquidation receipt management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LiquidationReceiptItem:
 *       type: object
 *       properties:
 *         serialNumber:
 *           type: string
 *         note:
 *           type: string
 *     LiquidationReceipt:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userCode:
 *           type: string
 *         liquidationDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [requested, approved, rejected]
 *         note:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LiquidationReceiptItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateLiquidationReceiptInput:
 *       type: object
 *       required:
 *         - userCode
 *         - liquidationDate
 *         - items
 *       properties:
 *         userCode:
 *           type: string
 *         liquidationDate:
 *           type: string
 *           format: date
 *         note:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LiquidationReceiptItem'
 */

/**
 * @swagger
 * /liquidation-receipt:
 *   post:
 *     summary: Create a new liquidation receipt
 *     security:
 *       - BearerAuth: []
 *     tags: [LiquidationReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLiquidationReceiptInput'
 *     responses:
 *       200:
 *         description: Liquidation receipt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiquidationReceipt'
 */

/**
 * @swagger
 * /liquidation-receipt/{id}/approve:
 *   put:
 *     summary: Approve a liquidation receipt
 *     security:
 *       - BearerAuth: []
 *     tags: [LiquidationReceipt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Liquidation receipt approved
 */

/**
 * @swagger
 * /liquidation-receipt/{id}/reject:
 *   put:
 *     summary: Reject a liquidation receipt
 *     security:
 *       - BearerAuth: []
 *     tags: [LiquidationReceipt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Liquidation receipt rejected
 */

/**
 * @swagger
 * /liquidation-receipt:
 *   get:
 *     summary: Get all liquidation receipts
 *     security:
 *       - BearerAuth: []
 *     tags: [LiquidationReceipt]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of liquidation receipts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LiquidationReceipt'
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
 * /liquidation-receipt/{id}:
 *   get:
 *     summary: Get liquidation receipt details by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [LiquidationReceipt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liquidation receipt details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiquidationReceipt'
 */

router.use(authenticationV2);

router.post('', asyncHandler(liquidationController.createLiquidationReceipt));
router.put(
    '/:id/approve',
    asyncHandler(liquidationController.approveLiquidationReceipt),
);
router.put(
    '/:id/reject',
    asyncHandler(liquidationController.rejectLiquidationReceipt),
);
router.get('', asyncHandler(liquidationController.getAllLiquidationReceipts));
router.get(
    '/:id',
    asyncHandler(liquidationController.getLiquidationReceiptDetails),
);

module.exports = router;
