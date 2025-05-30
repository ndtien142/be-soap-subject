'use strict';

const express = require('express');
const equipmentTypeController = require('../../controllers/equipmentType.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: EquipmentType
 *   description: Equipment Type management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EquipmentType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *           description: Name of the equipment type
 *         description:
 *           type: string
 *           description: Description of the equipment type
 *         prefix:
 *           type: string
 *           description: Prefix for the equipment type
 *         isActive:
 *           type: boolean
 *         isDeleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /equipment-type:
 *   post:
 *     summary: Create a new equipment type
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [EquipmentType]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - prefix
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               prefix:
 *                 type: string
 *                 description: Prefix for the equipment type
 *     responses:
 *       200:
 *         description: Equipment type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EquipmentType'
 */

/**
 * @swagger
 * /equipment-type:
 *   get:
 *     summary: Get all equipment types
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     tags: [EquipmentType]
 *     responses:
 *       200:
 *         description: List of equipment types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EquipmentType'
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
 * /equipment-type/{id}:
 *   get:
 *     summary: Get equipment type by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment type ID
 *     tags: [EquipmentType]
 *     responses:
 *       200:
 *         description: Equipment type data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EquipmentType'
 *       404:
 *         description: Equipment type not found
 */

/**
 * @swagger
 * /equipment-type:
 *   put:
 *     summary: Update an equipment type
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [EquipmentType]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - prefix
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               prefix:
 *                 type: string
 *                 description: Prefix for the equipment type
 *     responses:
 *       200:
 *         description: Equipment type updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EquipmentType'
 *       404:
 *         description: Equipment type not found
 */

/**
 * @swagger
 * /equipment-type/{id}:
 *   delete:
 *     summary: Delete an equipment type (soft delete)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment type ID
 *     tags: [EquipmentType]
 *     responses:
 *       200:
 *         description: Equipment type deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EquipmentType'
 *       404:
 *         description: Equipment type not found
 */

router.use(authenticationV2);
router.get('/:id', asyncHandler(equipmentTypeController.getEquipmentTypeById));
router.get('', asyncHandler(equipmentTypeController.getAllEquipmentType));
router.post('', asyncHandler(equipmentTypeController.createNewEquipmentType));
router.put('', asyncHandler(equipmentTypeController.updateEquipmentType));
router.delete(
    '/:id',
    asyncHandler(equipmentTypeController.deleteEquipmentType),
);

module.exports = router;
