'use strict';

const express = require('express');
const reportController = require('../../controllers/report.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Report
 *     description: Report APIs for receipt status counts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReportStatusCount:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         count:
 *           type: integer
 *     ReportStatusCountsGroup:
 *       type: object
 *       properties:
 *         import:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportStatusCount'
 *         borrow:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportStatusCount'
 *         transfer:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportStatusCount'
 *         liquidation:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportStatusCount'
 *     SuccessResponseReport:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *         metadata:
 *           oneOf:
 *             - $ref: '#/components/schemas/ReportStatusCountsGroup'
 *             - type: array
 *               items:
 *                 $ref: '#/components/schemas/ReportStatusCount'
 *             - type: integer
 */

/**
 * @swagger
 * /report/all:
 *   get:
 *     summary: Get status counts for all receipt types
 *     tags: [Report]
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     responses:
 *       200:
 *         description: Status counts for all receipt types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseReport'
 */

/**
 * @swagger
 * /report/import:
 *   get:
 *     summary: Get status counts for import receipts
 *     tags: [Report]
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     responses:
 *       200:
 *         description: Status counts for import receipts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseReport'
 */

/**
 * @swagger
 * /report/borrow:
 *   get:
 *     summary: Get status counts for borrow receipts
 *     tags: [Report]
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     responses:
 *       200:
 *         description: Status counts for borrow receipts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseReport'
 */

/**
 * @swagger
 * /report/transfer:
 *   get:
 *     summary: Get status counts for transfer receipts
 *     tags: [Report]
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     responses:
 *       200:
 *         description: Status counts for transfer receipts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseReport'
 */

/**
 * @swagger
 * /report/liquidation:
 *   get:
 *     summary: Get status counts for liquidation receipts
 *     tags: [Report]
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     responses:
 *       200:
 *         description: Status counts for liquidation receipts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseReport'
 */

/**
 * @swagger
 * /report/import/count:
 *   get:
 *     summary: Get total count of import receipts
 *     tags: [Report]
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     responses:
 *       200:
 *         description: Total count of import receipts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseReport'
 */

router.get('/all', asyncHandler(reportController.getAllReceiptStatusCounts));
router.get(
    '/import',
    asyncHandler(reportController.getImportReceiptStatusCounts),
);
router.get(
    '/borrow',
    asyncHandler(reportController.getBorrowReceiptStatusCounts),
);
router.get(
    '/transfer',
    asyncHandler(reportController.getTransferReceiptStatusCounts),
);
router.get(
    '/liquidation',
    asyncHandler(reportController.getLiquidationReceiptStatusCounts),
);
router.get('/import/count', asyncHandler(reportController.countImportReceipts));

module.exports = router;
