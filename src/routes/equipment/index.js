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
 *         serial_number:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         manufacturer_id:
 *           type: integer
 *         status:
 *           type: string
 *         purchase_date:
 *           type: string
 *           format: date
 *         warranty_expiry:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateEquipmentInput:
 *       type: object
 *       required: [serial_number, name]
 *       properties:
 *         serial_number:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         manufacturer_id:
 *           type: integer
 *         status:
 *           type: string
 *         purchase_date:
 *           type: string
 *           format: date
 *         warranty_expiry:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 *     UpdateEquipmentInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         manufacturer_id:
 *           type: integer
 *         status:
 *           type: string
 *         purchase_date:
 *           type: string
 *           format: date
 *         warranty_expiry:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /equipment:
 *   post:
 *     summary: Create a new equipment
 *     tags: [Equipment]
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
 *             $ref: '#/components/schemas/CreateEquipmentInput'
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
 * /equipment/{serial_number}:
 *   put:
 *     summary: Update existing equipment
 *     tags: [Equipment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: serial_number
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEquipmentInput'
 *     responses:
 *       200:
 *         description: Equipment updated successfully
 */

/**
 * @swagger
 * /equipment/{serial_number}:
 *   delete:
 *     summary: Delete equipment
 *     tags: [Equipment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: serial_number
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
 */

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: Get all equipment
 *     tags: [Equipment]
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
 *     responses:
 *       200:
 *         description: List of equipment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipment'
 */

/**
 * @swagger
 * /equipment/{serial_number}:
 *   get:
 *     summary: Get equipment by serial number
 *     tags: [Equipment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: serial_number
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 */


router.use(authenticationV2);

router.post('', asyncHandler(equipmentController.createEquipment));
router.put('/:serial_number', asyncHandler(equipmentController.updateEquipment));
router.delete('/:serial_number', asyncHandler(equipmentController.deleteEquipment));
router.get('', asyncHandler(equipmentController.getAllEquipment));
router.get('/:serial_number', asyncHandler(equipmentController.getEquipmentBySerial));

module.exports = router;
