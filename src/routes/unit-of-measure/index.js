'use strict';

const express = require('express');
const unitOfMeasureController = require('../../controllers/unitOfMeasure.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

const router = express.Router();

router.get('/:id', asyncHandler(unitOfMeasureController.getUnitOfMeasureById));
router.get('', asyncHandler(unitOfMeasureController.getAllUnitOfMeasure));
router.post('', asyncHandler(unitOfMeasureController.createNewUnitOfMeasure));
router.put('', asyncHandler(unitOfMeasureController.updateUnitOfMeasure));
router.delete(
    '/:id',
    asyncHandler(unitOfMeasureController.deleteUnitOfMeasure),
);

module.exports = router;
