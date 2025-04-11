'use strict';

const express = require('express');
const router = express.Router();

router.use('/v1/api', require('./access'));
router.use('/v1/api/equipment', require('./equipment'));
router.use('/v1/api/equipment-type', require('./equipment-type'));
router.use('/v1/api/unit-of-measure', require('./unit-of-measure'));
router.use('/v1/api/supplier', require('./supplier'));
router.use('/v1/api/import-receipt', require('./import-receipt'));

module.exports = router;
