const UnitOfMeasureService = require('../services/equipment/unitOfMeasure.service');
const { CREATED, SuccessResponse } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class UnitOfMeasureController {
    createNewUnitOfMeasure = async (req, res, next) => {
        new CREATED({
            message: 'Create new unit of measure successfully',
            metadata: await UnitOfMeasureService.createNewUnitOfMeasure(
                req.body,
            ),
        }).send(res);
    };

    getAllUnitOfMeasure = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all unit of measure successfully',
            metadata: await UnitOfMeasureService.getAllUnitOfMeasure(req.query),
        }).send(res);
    };

    getUnitOfMeasureById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get unit of measure by ID successfully',
            metadata: await UnitOfMeasureService.getUnitOfMeasureById(
                req.params.id,
            ),
        }).send(res);
    };

    updateUnitOfMeasure = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update unit of measure successfully',
            metadata: await UnitOfMeasureService.updateUnitOfMeasure(req.body),
        }).send(res);
    };
    deleteUnitOfMeasure = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete unit of measure successfully',
            metadata: await UnitOfMeasureService.deleteUnitOfMeasure(
                req.params,
            ),
        }).send(res);
    };
}

module.exports = new UnitOfMeasureController();
