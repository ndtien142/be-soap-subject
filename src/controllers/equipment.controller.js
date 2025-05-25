'use strict';

const EquipmentService = require('../services/equipment/equipment.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class EquipmentController {
    createEquipment = async (req, res, next) => {
        new CREATED({
            message: 'Create equipment successfully',
            data: await EquipmentService.createEquipment(req.body),
        }).send(res);
    };

    updateEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update equipment successfully',
            data: await EquipmentService.updateEquipment(
                req.params.serialNumber,
                req.body,
            ),
        }).send(res);
    };

    deleteEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete equipment successfully',
            data: await EquipmentService.deleteEquipment(
                req.params.serialNumber,
            ),
        }).send(res);
    };

    getEquipmentBySerialNumber = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get equipment by serial number successfully',
            data: await EquipmentService.getEquipmentBySerialNumber(
                req.params.serialNumber,
            ),
        }).send(res);
    };

    getAllEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all equipment successfully',
            data: await EquipmentService.getAllEquipment(req.query),
        }).send(res);
    };
}

module.exports = new EquipmentController();
