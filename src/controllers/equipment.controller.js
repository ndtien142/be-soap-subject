'use strict';

const EquipmentService = require('../services/equipment/equipment.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class EquipmentController {
    createEquipment = async (req, res, next) => {
        new CREATED({
            message: 'Create equipment successfully',
            metadata: await EquipmentService.createEquipment(req.body),
        }).send(res);
    };

    updateEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update equipment successfully',
            metadata: await EquipmentService.updateEquipment(
                req.params.serialNumber,
                req.body,
            ),
        }).send(res);
    };

    deleteEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete equipment successfully',
            metadata: await EquipmentService.deleteEquipment(
                req.params.serialNumber,
            ),
        }).send(res);
    };

    getEquipmentBySerialNumber = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get equipment by serial number successfully',
            metadata: await EquipmentService.getEquipmentBySerialNumber(
                req.params.serialNumber,
            ),
        }).send(res);
    };

    getAllEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all equipment successfully',
            metadata: await EquipmentService.getAllEquipment(req.query),
        }).send(res);
    };
    getEquipmentsByRoomId = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get equipments by room successfully',
            metadata: await EquipmentService.getEquipmentsByRoomId(req.params.roomId),
        }).send(res);
    };
    
}

module.exports = new EquipmentController();
