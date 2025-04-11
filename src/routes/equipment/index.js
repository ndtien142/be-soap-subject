'use strict';

const express = require('express');
const equipmentController = require('../../controllers/equipment.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

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
