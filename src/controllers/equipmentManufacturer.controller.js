'use strict';

const EquipmentManufacturerService = require('../services/equipment/equipmentManufacturer.service');
const { SuccessResponse } = require('../core/success.response');

class EquipmentManufacturerController {
    static createManufacturer = async (req, res, next) => {
        new SuccessResponse({
            message: 'Manufacturer created successfully',
            metadata: await EquipmentManufacturerService.createManufacturer(
                req.body,
            ),
        }).send(res);
    };

    static updateManufacturer = async (req, res, next) => {
        new SuccessResponse({
            message: 'Manufacturer updated successfully',
            metadata: await EquipmentManufacturerService.updateManufacturer({
                id: req.params.id,
                ...req.body,
            }),
        }).send(res);
    };

    static deleteManufacturer = async (req, res, next) => {
        new SuccessResponse({
            message: 'Manufacturer deleted successfully',
            metadata: await EquipmentManufacturerService.deleteManufacturer(
                req.params.id,
            ),
        }).send(res);
    };

    static getAllManufacturers = async (req, res, next) => {
        new SuccessResponse({
            message: 'Manufacturers retrieved successfully',
            metadata: await EquipmentManufacturerService.getAllManufacturers(
                req.query,
            ),
        }).send(res);
    };

    static getManufacturerById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Manufacturer retrieved successfully',
            metadata: await EquipmentManufacturerService.getManufacturerById(
                req.params.id,
            ),
        }).send(res);
    };
}

module.exports = EquipmentManufacturerController;
