'use strict';

const express = require('express');
const groupEquipmentController = require('../../controllers/groupEquipment.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: GroupEquipment
 *   description: Group Equipment management APIs
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
 *     ManufacturerInput:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     GroupEquipment:
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
 *         manufacturer:
 *           $ref: '#/components/schemas/ManufacturerInput'
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
 * /group-equipment:
 *   post:
 *     summary: Create a new group equipment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [GroupEquipment]
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
 *               manufacturer:
 *                 $ref: '#/components/schemas/ManufacturerInput'
 *     responses:
 *       200:
 *         description: Group equipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupEquipment'
 */

/**
 * @swagger
 * /group-equipment:
 *   put:
 *     summary: Update an existing group equipment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [GroupEquipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 $ref: '#/components/schemas/EquipmentTypeInput'
 *               description:
 *                 type: string
 *               equipmentType:
 *                 type: string
 *               unitOfMeasure:
 *                 $ref: '#/components/schemas/UnitOfMeasureInput'
 *               manufacturer:
 *                 $ref: '#/components/schemas/ManufacturerInput'
 *     responses:
 *       200:
 *         description: Group equipment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupEquipment'
 */

/**
 * @swagger
 * /group-equipment/{groupEquipmentCode}:
 *   get:
 *     summary: Get group equipment by code
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: groupEquipmentCode
 *         required: true
 *         schema:
 *           type: string
 *     tags: [GroupEquipment]
 *     responses:
 *       200:
 *         description: Group equipment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupEquipment'
 */

/**
 * @swagger
 * /group-equipment:
 *   get:
 *     summary: Get all group equipment
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
 *     tags: [GroupEquipment]
 *     responses:
 *       200:
 *         description: List of group equipment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GroupEquipment'
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
 * /group-equipment/{groupEquipmentCode}:
 *   delete:
 *     summary: Delete a group equipment (soft delete)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: groupEquipmentCode
 *         required: true
 *         schema:
 *           type: string
 *     tags: [GroupEquipment]
 *     responses:
 *       200:
 *         description: Group equipment deleted successfully
 */

/**
 * @swagger
 * /group-equipment/deactivate/{groupEquipmentCode}:
 *   patch:
 *     summary: Deactivate a group equipment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: groupEquipmentCode
 *         required: true
 *         schema:
 *           type: string
 *     tags: [GroupEquipment]
 *     responses:
 *       200:
 *         description: Group equipment deactivated successfully
 */

router.use(authenticationV2);

router.post('', asyncHandler(groupEquipmentController.createNewGroupEquipment));
router.put('', asyncHandler(groupEquipmentController.updateGroupEquipment));
router.get(
    '/:groupEquipmentCode',
    asyncHandler(groupEquipmentController.getGroupEquipmentByCode),
);
router.get('', asyncHandler(groupEquipmentController.getAllGroupEquipment));
router.delete(
    '/:groupEquipmentCode',
    asyncHandler(groupEquipmentController.deleteGroupEquipment),
);
router.patch(
    '/deactivate/:groupEquipmentCode',
    asyncHandler(groupEquipmentController.deactivateGroupEquipment),
);

module.exports = router;
