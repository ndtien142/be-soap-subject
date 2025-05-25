'use strict';

const express = require('express');
const roleController = require('../../controllers/role.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PermissionRef:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         slug:
 *           type: string
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         roleName:
 *           type: string
 *         roleDescription:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PermissionRef'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateRoleInput:
 *       type: object
 *       required:
 *         - roleName
 *       properties:
 *         roleName:
 *           type: string
 *         roleDescription:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PermissionRef'
 *     UpdateRoleInput:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: integer
 *         roleName:
 *           type: string
 *         roleDescription:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PermissionRef'
 */

/**
 * @swagger
 * /role:
 *   post:
 *     summary: Create a new role
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [Role]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleInput'
 *     responses:
 *       200:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */

/**
 * @swagger
 * /role:
 *   put:
 *     summary: Update a role
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [Role]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleInput'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */

/**
 * @swagger
 * /role/{id}:
 *   delete:
 *     summary: Delete a role
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
 *     tags: [Role]
 *     responses:
 *       200:
 *         description: Role deleted successfully
 */

/**
 * @swagger
 * /role:
 *   get:
 *     summary: Get all roles
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
 *     tags: [Role]
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
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
 * /role/{id}:
 *   get:
 *     summary: Get role by ID
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
 *     tags: [Role]
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */

router.use(authenticationV2);

router.post('', asyncHandler(roleController.createRole));
router.put('', asyncHandler(roleController.updateRole));
router.delete('/:id', asyncHandler(roleController.deleteRole));
router.get('', asyncHandler(roleController.getAllRoles));
router.get('/:id', asyncHandler(roleController.getRoleById));

module.exports = router;
