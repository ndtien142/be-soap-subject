const SupplierService = require('../services/import-equipment/supplier.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class SupplierController {
    createNewSupplier = async (req, res, next) => {
        new CREATED({
            message: 'Create new supplier successfully',
            metadata: await SupplierService.createNewSupplier(req.body),
        }).send(res);
    };
    getAllSupplier = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all supplier successfully',
            metadata: await SupplierService.getAllSuppliers(req.query),
        }).send(res);
    };
    getSupplierById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get supplier by ID successfully',
            metadata: await SupplierService.getSupplierById(req.params.id),
        }).send(res);
    };
    updateSupplier = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update supplier successfully',
            metadata: await SupplierService.updateSupplier(req.body),
        }).send(res);
    };
    deleteSupplier = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete supplier successfully',
            metadata: await SupplierService.deleteSupplier(req.params.id),
        }).send(res);
    };
}

module.exports = new SupplierController();
