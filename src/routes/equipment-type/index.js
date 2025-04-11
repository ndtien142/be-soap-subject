'use strict';

const express = require('express');
const equipmentTypeController = require('../../controllers/equipmentType.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

router.get('/:id', asyncHandler(equipmentTypeController.getEquipmentTypeById));
router.get('', asyncHandler(equipmentTypeController.getAllEquipmentType));
router.post('', asyncHandler(equipmentTypeController.createNewEquipmentType));
router.put('', asyncHandler(equipmentTypeController.updateEquipmentType));
router.delete(
    '/:id',
    asyncHandler(equipmentTypeController.deleteEquipmentType),
);

module.exports = router;
