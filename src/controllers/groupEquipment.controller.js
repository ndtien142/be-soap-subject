'use strict';

const GroupEquipmentService = require('../services/equipment/groupEquipment.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class GroupEquipmentController {
    createNewGroupEquipment = async (req, res, next) => {
        new CREATED({
            message: 'Create new equipment successfully',
            metadata: await GroupEquipmentService.createNewGroupEquipment(req.body),
        }).send(res);
    };
    updateGroupEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update equipment successfully',
            metadata: await GroupEquipmentService.updateEquipment(req.body),
        }).send(res);
    };
    getAllGroupEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all equipment successfully',
            metadata: await GroupEquipmentService.getAllEquipment(req.query),
        }).send(res);
    };
    getGroupEquipmentByCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get equipment by code successfully',
            metadata: await GroupEquipmentService.getEquipmentByCode(
                req.params.equipmentCode,
            ),
        }).send(res);
    };
    updateGroupEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update equipment successfully',
            metadata: await GroupEquipmentService.updateEquipment(req.body),
        }).send(res);
    };
    deleteGroupEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete equipment successfully',
            metadata: await GroupEquipmentService.deleteEquipment(
                req.params.equipmentCode,
            ),
        }).send(res);
    };
    deactivateGroupEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Deactive equipment successfully',
            metadata: await GroupEquipmentService.deactivateEquipment(
                req.params.equipmentCode,
            ),
        }).send(res);
    };
}

module.exports = new GroupEquipmentController();
