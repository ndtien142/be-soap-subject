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
 *     EquipmentTypeInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     UnitOfMeasureInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     Equipment:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         unitOfMeasure:
 *           $ref: '#/components/schemas/UnitOfMeasureInput'
 *         type:
 *           $ref: '#/components/schemas/EquipmentTypeInput'
 *         isDeleted:
 *           type: boolean
 *         isActive:
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
 * /equipment:
 *   post:
 *     summary: Create a new equipment
 *     tags: [Equipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 $ref: '#/components/schemas/EquipmentTypeInput'
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               unitOfMeasure:
 *                 $ref: '#/components/schemas/UnitOfMeasureInput'
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
 * /equipment:
 *   put:
 *     summary: Update an existing equipment
 *     tags: [Equipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               equipmentCode:
 *                 type: string
 *               equipmentName:
 *                 type: string
 *               equipmentDescription:
 *                 type: string
 *               equipmentType:
 *                 type: string
 *               unitOfMeasure:
 *                 type: string
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
 * /equipment/{equipmentCode}:
 *   get:
 *     summary: Get equipment by code
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: equipmentCode
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

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: Get all equipment
 *     tags: [Equipment]
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

/**
 * @swagger
 * /equipment/{equipmentCode}:
 *   delete:
 *     summary: Delete an equipment (soft delete)
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: equipmentCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
 */

/**
 * @swagger
 * /equipment/deactivate/{equipmentCode}:
 *   patch:
 *     summary: Deactivate an equipment
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: equipmentCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Equipment deactivated successfully
 */

// router.use(authenticationV2);

router.post('', asyncHandler(equipmentController.createNewEquipment));
router.put('', asyncHandler(equipmentController.updateEquipment));
router.get(
    '/:equipmentCode',
    asyncHandler(equipmentController.getEquipmentByCode),
);
router.get('', asyncHandler(equipmentController.getAllEquipment));
router.delete(
    '/:equipmentCode',
    asyncHandler(equipmentController.deleteEquipment),
);
router.patch(
    '/deactivate/:equipmentCode',
    asyncHandler(equipmentController.deactivateEquipment),
);

module.exports = router;
