'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Access
 *   description: API for user access management
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup (admin/staff)
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - roleName
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the account
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the account
 *               roleName:
 *                 type: string
 *                 description: Role name (e.g., admin, staff)
 *     responses:
 *       201:
 *         description: Signup successful
 *       400:
 *         description: Username already registered or role not found
 */

/**
 * @swagger
 * /signup-customer:
 *   post:
 *     summary: User signup as customer
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Customer account created
 *       400:
 *         description: Username already registered or error in key generation
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Account not active or blocked
 */

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: User logout
 *     tags: [Access]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userCode
 *             properties:
 *               userCode:
 *                 type: string
 *                 description: User code of the logged-in account
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Invalid user code
 */

router.post('/signup', asyncHandler(accessController.signUp));
router.post('/login', asyncHandler(accessController.login));

// router.use(authenticationV2);

module.exports = router;
