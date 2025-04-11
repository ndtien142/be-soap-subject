const EquipmentTypeService = require('../services/equipment/equipmentType.service');
const { CREATED, SuccessResponse } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class EquipmentTypeController {
    createNewEquipmentType = async (req, res, next) => {
        new CREATED({
            message: 'Create new equipment type successfully',
            metadata: await EquipmentTypeService.createNewEquipmentType(
                req.body,
            ),
        }).send(res);
    };

    getAllEquipmentType = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all equipment type successfully',
            metadata: await EquipmentTypeService.getAllEquipmentType(req.query),
        }).send(res);
    };

    getEquipmentTypeById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get equipment type by ID successfully',
            metadata: await EquipmentTypeService.getEquipmentTypeById(
                req.params.id,
            ),
        }).send(res);
    };

    updateEquipmentType = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update equipment type successfully',
            metadata: await EquipmentTypeService.updateEquipmentType(req.body),
        }).send(res);
    };
    deleteEquipmentType = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete equipment type successfully',
            metadata: await EquipmentTypeService.deleteEquipmentType(
                req.params.id,
            ),
        }).send(res);
    };
}

module.exports = new EquipmentTypeController();
