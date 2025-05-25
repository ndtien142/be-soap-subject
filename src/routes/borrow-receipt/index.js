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
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BorrowReceiptItem'
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
 *         - items
 *         - roomId
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
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BorrowReceiptItem'
 */

/**
 * @swagger
 * /borrow-receipt:
 *   post:
 *     summary: Create a new borrow receipt
 *     security:
 *       - BearerAuth: []
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
 * /borrow-receipt/{id}/approve:
 *   put:
 *     summary: Approve a borrow receipt
 *     security:
 *       - BearerAuth: []
 *     tags: [BorrowReceipt]
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
 *         description: Borrow receipt approved
 */

/**
 * @swagger
 * /borrow-receipt/{id}/reject:
 *   put:
 *     summary: Reject a borrow receipt
 *     security:
 *       - BearerAuth: []
 *     tags: [BorrowReceipt]
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
 *         description: Borrow receipt rejected
 */

/**
 * @swagger
 * /borrow-receipt/{id}/mark-borrowed:
 *   put:
 *     summary: Mark a borrow receipt as borrowed and update equipment room
 *     security:
 *       - BearerAuth: []
 *     tags: [BorrowReceipt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Borrow receipt marked as borrowed
 */

/**
 * @swagger
 * /borrow-receipt/{id}/mark-returned:
 *   put:
 *     summary: Mark a borrow receipt as returned and update equipment status
 *     security:
 *       - BearerAuth: []
 *     tags: [BorrowReceipt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Borrow receipt marked as returned
 */

/**
 * @swagger
 * /borrow-receipt:
 *   get:
 *     summary: Get all borrow receipts
 *     security:
 *       - BearerAuth: []
 *     tags: [BorrowReceipt]
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
 *     tags: [BorrowReceipt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Borrow receipt details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BorrowReceipt'
 */

router.use(authenticationV2);

router.post('', asyncHandler(borrowReceiptController.createBorrowReceipt));
router.put(
    '/:id/approve',
    asyncHandler(borrowReceiptController.approveBorrowReceipt),
);
router.put(
    '/:id/reject',
    asyncHandler(borrowReceiptController.rejectBorrowReceipt),
);
router.put(
    '/:id/mark-borrowed',
    asyncHandler(borrowReceiptController.markAsBorrowed),
);
router.put(
    '/:id/mark-returned',
    asyncHandler(borrowReceiptController.markAsReturned),
);
router.get('', asyncHandler(borrowReceiptController.getAllBorrowReceipts));
router.get(
    '/:id',
    asyncHandler(borrowReceiptController.getBorrowReceiptDetails),
);

module.exports = router;
