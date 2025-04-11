'use strict';

const EquipmentService = require('../services/equipment/equipment.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class EquipmentController {
    createNewEquipment = async (req, res, next) => {
        new CREATED({
            message: 'Create new equipment successfully',
            metadata: await EquipmentService.createNewEquipment(req.body),
        }).send(res);
    };
    updateEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update equipment successfully',
            metadata: await EquipmentService.updateEquipment(req.body),
        }).send(res);
    };
    getAllEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all equipment successfully',
            metadata: await EquipmentService.getAllEquipment(),
        }).send(res);
    };
    getEquipmentByCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get equipment by code successfully',
            metadata: await EquipmentService.getEquipmentByCode(req.params),
        }).send(res);
    };
    updateEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update equipment successfully',
            metadata: await EquipmentService.updateEquipment(req.body),
        }).send(res);
    };
    deleteEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete equipment successfully',
            metadata: await EquipmentService.deleteEquipment(req.params),
        }).send(res);
    };
    deactivateEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Deactive equipment successfully',
            metadata: await EquipmentService.deactivateEquipment(req.params),
        }).send(res);
    };
}

module.exports = new EquipmentController();
