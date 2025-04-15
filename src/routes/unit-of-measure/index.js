'use strict';

const express = require('express');
const unitOfMeasureController = require('../../controllers/unitOfMeasure.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UnitOfMeasure
 *   description: Quản lý đơn vị tính (Unit of Measure)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UnitOfMeasure:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
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
 * /unit-of-measure:
 *   get:
 *     summary: Lấy danh sách đơn vị tính
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại (mặc định 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng mỗi trang (mặc định 20)
 *     tags: [UnitOfMeasure]
 *     responses:
 *       200:
 *         description: Danh sách đơn vị tính
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 metadata:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UnitOfMeasure'
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
 * /unit-of-measure/{id}:
 *   get:
 *     summary: Lấy đơn vị tính theo ID
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
 *         description: ID của đơn vị tính
 *     tags: [UnitOfMeasure]
 *     responses:
 *       200:
 *         description: Chi tiết đơn vị tính
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitOfMeasure'
 *       404:
 *         description: Không tìm thấy đơn vị tính
 */

/**
 * @swagger
 * /unit-of-measure:
 *   post:
 *     summary: Tạo đơn vị tính mới
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [UnitOfMeasure]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitOfMeasure'
 *       400:
 *         description: Tên đơn vị tính đã tồn tại
 */

/**
 * @swagger
 * /unit-of-measure:
 *   put:
 *     summary: Cập nhật đơn vị tính
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserCodeHeader'
 *       - $ref: '#/components/parameters/RefreshTokenHeader'
 *     tags: [UnitOfMeasure]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitOfMeasure'
 *       404:
 *         description: Không tìm thấy đơn vị tính
 */

/**
 * @swagger
 * /unit-of-measure/{id}:
 *   delete:
 *     summary: Xoá mềm đơn vị tính
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
 *         description: ID của đơn vị tính
 *     tags: [UnitOfMeasure]
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       404:
 *         description: Không tìm thấy đơn vị tính
 */

router.use(authenticationV2);

router.get('/:id', asyncHandler(unitOfMeasureController.getUnitOfMeasureById));
router.get('', asyncHandler(unitOfMeasureController.getAllUnitOfMeasure));
router.post('', asyncHandler(unitOfMeasureController.createNewUnitOfMeasure));
router.put('', asyncHandler(unitOfMeasureController.updateUnitOfMeasure));
router.delete(
    '/:id',
    asyncHandler(unitOfMeasureController.deleteUnitOfMeasure),
);

module.exports = router;
