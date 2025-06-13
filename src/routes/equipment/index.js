'use strict';

const express = require('express');
const equipmentController = require('../../controllers/equipment.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Equipment
 *   description: Equipment management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Equipment:
 *       type: object
 *       properties:
 *         serialNumber:
 *           type: string
 *         groupEquipmentCode:
 *           type: string
 *         dayOfFirstUse:
 *           type: string
 *           format: date-time
 *         equipmentDescription:
 *           type: string
 *         equipmentLocation:
 *           type: string
 *         status:
 *           type: string
 *           enum: [available, in_use, under_maintenance, out_of_service, liquidation]
 *         roomId:
 *           type: string
 *         importReceiptId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /equipment:
 *   post:
 *     summary: Create a new equipment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [Equipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipment'
 *     responses:
 *       200:
 *         description: Equipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 */

/**
 * @swagger
 * /equipment/{serialNumber}:
 *   put:
 *     summary: Update an equipment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Equipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipment'
 *     responses:
 *       200:
 *         description: Equipment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 */

/**
 * @swagger
 * /equipment/{serialNumber}:
 *   delete:
 *     summary: Delete (soft) an equipment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Equipment]
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
 */

/**
 * @swagger
 * /equipment/{serialNumber}:
 *   get:
 *     summary: Get equipment by serial number
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Equipment]
 *     responses:
 *       200:
 *         description: Equipment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 */

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: Get all equipment
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
 *     tags: [Equipment]
 *     responses:
 *       200:
 *         description: List of equipment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Equipment'
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

router.use(authenticationV2);

router.post('', asyncHandler(equipmentController.createEquipment));
router.put('/:serialNumber', asyncHandler(equipmentController.updateEquipment));
router.delete(
    '/:serialNumber',
    asyncHandler(equipmentController.deleteEquipment),
);
router.get(
    '/:serialNumber',
    asyncHandler(equipmentController.getEquipmentBySerialNumber),
);
router.get('', asyncHandler(equipmentController.getAllEquipment));
router.get(
    '/room/:roomId',
    asyncHandler(equipmentController.getEquipmentsByRoomId),
);


module.exports = router;
