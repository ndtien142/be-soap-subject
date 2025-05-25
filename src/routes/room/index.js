'use strict';

const express = require('express');
const roomController = require('../../controllers/room.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Room
 *   description: Room management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         roomId:
 *           type: string
 *         roomName:
 *           type: string
 *         departmentId:
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
 *     CreateRoomInput:
 *       type: object
 *       required:
 *         - roomId
 *         - roomName
 *         - departmentId
 *       properties:
 *         roomId:
 *           type: string
 *         roomName:
 *           type: string
 *         departmentId:
 *           type: string
 *         notes:
 *           type: string
 *     UpdateRoomInput:
 *       type: object
 *       required:
 *         - roomId
 *       properties:
 *         roomId:
 *           type: string
 *         roomName:
 *           type: string
 *         departmentId:
 *           type: string
 *         notes:
 *           type: string
 *         status:
 *           type: boolean
 */

/**
 * @swagger
 * /room:
 *   post:
 *     summary: Create a new room
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [Room]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomInput'
 *     responses:
 *       200:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 */

/**
 * @swagger
 * /room:
 *   put:
 *     summary: Update a room
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [Room]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoomInput'
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 */

/**
 * @swagger
 * /room/{roomId}:
 *   delete:
 *     summary: Delete (deactivate) a room
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: Room deleted successfully
 */

/**
 * @swagger
 * /room:
 *   get:
 *     summary: Get all rooms
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
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: List of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
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
 * /room/{roomId}:
 *   get:
 *     summary: Get room by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 */

router.use(authenticationV2);

router.post('', asyncHandler(roomController.createRoom));
router.put('', asyncHandler(roomController.updateRoom));
router.delete('/:roomId', asyncHandler(roomController.deleteRoom));
router.get('', asyncHandler(roomController.getAllRooms));
router.get('/:roomId', asyncHandler(roomController.getRoomById));

module.exports = router;
