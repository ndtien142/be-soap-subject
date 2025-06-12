'use strict';

const express = require('express');
const fileImageController = require('../../controllers/fileImage.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FileImage
 *   description: File and image management APIs
 */

/**
 * @swagger
 * /file-image/equipment:
 *   post:
 *     summary: Upload an equipment image (receipt-related)
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actionType:
 *                 type: string
 *                 enum: [import, transfer, liquidation, borrow, return, owner]
 *               actionId:
 *                 type: integer
 *               serialNumber:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               note:
 *                 type: string
 *               uploadedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Equipment image uploaded successfully
 */

/**
 * @swagger
 * /file-image/receipt:
 *   post:
 *     summary: Upload a file for a receipt
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiptType:
 *                 type: string
 *                 enum: [import, transfer, liquidation, borrow, return]
 *               receiptId:
 *                 type: integer
 *               filePath:
 *                 type: string
 *               fileName:
 *                 type: string
 *               uploadBy:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Receipt file uploaded successfully
 */

/**
 * @swagger
 * /file-image/equipment/{serialNumber}/images:
 *   get:
 *     summary: Get all images of a specific equipment
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     parameters:
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of images for the equipment
 */

/**
 * @swagger
 * /file-image/group-equipment/{groupEquipmentCode}/images:
 *   get:
 *     summary: Get all images of a specific group equipment
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     parameters:
 *       - in: path
 *         name: groupEquipmentCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of images for the group equipment
 */

/**
 * @swagger
 * /file-image/receipt/files:
 *   get:
 *     summary: Get all files for a specific receipt
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     parameters:
 *       - in: query
 *         name: receiptType
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: receiptId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of files for the receipt
 */

/**
 * @swagger
 * /file-image/equipment-image/{id}:
 *   delete:
 *     summary: Delete an equipment image by id
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment image deleted successfully
 */

/**
 * @swagger
 * /file-image/receipt-file/{id}:
 *   delete:
 *     summary: Delete a receipt file by id
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Receipt file deleted successfully
 */

/**
 * @swagger
 * /file-image/equipment/multi:
 *   post:
 *     summary: Upload multiple equipment images (receipt-related)
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     actionType:
 *                       type: string
 *                       enum: [import, transfer, liquidation, borrow, return, owner]
 *                     actionId:
 *                       type: integer
 *                     serialNumber:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     note:
 *                       type: string
 *     responses:
 *       201:
 *         description: Multiple equipment images uploaded successfully
 */

/**
 * @swagger
 * /file-image/receipt/multi:
 *   post:
 *     summary: Upload multiple files for receipts
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     receiptType:
 *                       type: string
 *                       enum: [import, transfer, liquidation, borrow, return]
 *                     receiptId:
 *                       type: integer
 *                     filePath:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     note:
 *                       type: string
 *     responses:
 *       201:
 *         description: Multiple receipt files uploaded successfully
 */

/**
 * @swagger
 * /file-image/equipment/multi:
 *   put:
 *     summary: Update multiple equipment images (receipt-related)
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     actionType:
 *                       type: string
 *                       enum: [import, transfer, liquidation, borrow, return, owner]
 *                     actionId:
 *                       type: integer
 *                     serialNumber:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     note:
 *                       type: string
 *     responses:
 *       200:
 *         description: Multiple equipment images updated successfully
 */

/**
 * @swagger
 * /file-image/receipt/multi:
 *   put:
 *     summary: Update multiple files for receipts
 *     security:
 *       - BearerAuth: []
 *     tags: [FileImage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     receiptType:
 *                       type: string
 *                       enum: [import, transfer, liquidation, borrow, return]
 *                     receiptId:
 *                       type: integer
 *                     filePath:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     note:
 *                       type: string
 *     responses:
 *       200:
 *         description: Multiple receipt files updated successfully
 */

router.use(authenticationV2);

router.post(
    '/equipment',
    asyncHandler(fileImageController.uploadEquipmentImage),
);
router.post(
    '/equipment/multi',
    asyncHandler(fileImageController.uploadMultipleEquipmentImages),
);
router.post('/receipt', asyncHandler(fileImageController.uploadReceiptFile));
router.post(
    '/receipt/multi',
    asyncHandler(fileImageController.uploadMultipleReceiptFiles),
);
router.get(
    '/equipment/:serialNumber/images',
    asyncHandler(fileImageController.getAllImagesOfEquipment),
);
router.get('/receipt/files', asyncHandler(fileImageController.getReceiptFiles));
router.delete(
    '/equipment-image/:id',
    asyncHandler(fileImageController.deleteEquipmentImage),
);
router.delete(
    '/receipt-file/:id',
    asyncHandler(fileImageController.deleteReceiptFile),
);

module.exports = router;
