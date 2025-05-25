'use strict';

const express = require('express');
const departmentController = require('../../controllers/department.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Department
 *   description: Department management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         departmentId:
 *           type: string
 *         departmentName:
 *           type: string
 *         notes:
 *           type: string
 *         status:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateDepartmentInput:
 *       type: object
 *       required:
 *         - departmentId
 *         - departmentName
 *       properties:
 *         departmentId:
 *           type: string
 *         departmentName:
 *           type: string
 *         notes:
 *           type: string
 *     UpdateDepartmentInput:
 *       type: object
 *       required:
 *         - departmentId
 *       properties:
 *         departmentId:
 *           type: string
 *         departmentName:
 *           type: string
 *         notes:
 *           type: string
 *         status:
 *           type: boolean
 */

/**
 * @swagger
 * /department:
 *   post:
 *     summary: Create a new department
 *     security:
 *       - BearerAuth: []
 *     tags: [Department]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDepartmentInput'
 *     responses:
 *       200:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 */

/**
 * @swagger
 * /department:
 *   put:
 *     summary: Update a department
 *     security:
 *       - BearerAuth: []
 *     tags: [Department]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDepartmentInput'
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 */

/**
 * @swagger
 * /department/{departmentId}:
 *   delete:
 *     summary: Delete (deactivate) a department
 *     security:
 *       - BearerAuth: []
 *     tags: [Department]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department deleted successfully
 */

/**
 * @swagger
 * /department:
 *   get:
 *     summary: Get all departments
 *     security:
 *       - BearerAuth: []
 *     tags: [Department]
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
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
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
 * /department/{departmentId}:
 *   get:
 *     summary: Get department by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Department]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 */

router.use(authenticationV2);

router.post('', asyncHandler(departmentController.createDepartment));
router.put('', asyncHandler(departmentController.updateDepartment));
router.delete(
    '/:departmentId',
    asyncHandler(departmentController.deleteDepartment),
);
router.get('', asyncHandler(departmentController.getAllDepartments));
router.get(
    '/:departmentId',
    asyncHandler(departmentController.getDepartmentById),
);

module.exports = router;
