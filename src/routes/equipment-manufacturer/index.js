'use strict';

const express = require('express');
const equipmentManufacturerController = require('../../controllers/equipmentManufacturer.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: EquipmentManufacturer
 *   description: Equipment Manufacturer management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EquipmentManufacturer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         contactInfo:
 *           type: string
 *         address:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateManufacturerInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         contactInfo:
 *           type: string
 *         address:
 *           type: string
 *     UpdateManufacturerInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         contactInfo:
 *           type: string
 *         address:
 *           type: string
 */

/**
 * @swagger
 * /equipment-manufacturer:
 *   post:
 *     summary: Create a new manufacturer
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [EquipmentManufacturer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateManufacturerInput'
 *     responses:
 *       200:
 *         description: Manufacturer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EquipmentManufacturer'
 */

/**
 * @swagger
 * /equipment-manufacturer:
 *   put:
 *     summary: Update an existing manufacturer
 *     tags: [EquipmentManufacturer]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateManufacturerInput'
 *     responses:
 *       200:
 *         description: Manufacturer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EquipmentManufacturer'
 */

/**
 * @swagger
 * /equipment-manufacturer/{id}:
 *   delete:
 *     summary: Delete a manufacturer
 *     tags: [EquipmentManufacturer]
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
 *     responses:
 *       200:
 *         description: Manufacturer deleted successfully
 */

/**
 * @swagger
 * /equipment-manufacturer:
 *   get:
 *     summary: Get all manufacturers
 *     tags: [EquipmentManufacturer]
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
 *         description: List of manufacturers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EquipmentManufacturer'
 */

/**
 * @swagger
 * /equipment-manufacturer/{id}:
 *   get:
 *     summary: Get manufacturer by ID
 *     tags: [EquipmentManufacturer]
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
 *     responses:
 *       200:
 *         description: Manufacturer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EquipmentManufacturer'
 */

router.use(authenticationV2);

router.post(
    '',
    asyncHandler(equipmentManufacturerController.createManufacturer),
);
router.put(
    '/:id',
    asyncHandler(equipmentManufacturerController.updateManufacturer),
);
router.delete(
    '/:id',
    asyncHandler(equipmentManufacturerController.deleteManufacturer),
);
router.get(
    '',
    asyncHandler(equipmentManufacturerController.getAllManufacturers),
);
router.get(
    '/:id',
    asyncHandler(equipmentManufacturerController.getManufacturerById),
);

module.exports = router;
