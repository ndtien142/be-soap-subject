'use strict';

const EquipmentService = require('../services/forui/equipment.service'); // đổi tên phù hợp với service bạn đã chọn
const { SuccessResponse } = require('../core/success.response');

class EquipmentController {
    static createEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Equipment created successfully',
            metadata: await EquipmentService.createEquipment(req.body),
        }).send(res);
    };

    static updateEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Equipment updated successfully',
            metadata: await EquipmentService.updateEquipment({
                serial_number: req.params.serial_number,
                ...req.body,
            }),
        }).send(res);
    };

    static deleteEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Equipment deleted successfully',
            metadata: await EquipmentService.deleteEquipment(
                req.params.serial_number
            ),
        }).send(res);
    };

    static getAllEquipment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Equipment list retrieved successfully',
            metadata: await EquipmentService.getAllEquipment(req.query),
        }).send(res);
    };

    static getEquipmentBySerial = async (req, res, next) => {
        new SuccessResponse({
            message: 'Equipment retrieved successfully',
            metadata: await EquipmentService.getEquipmentBySerial(
                req.params.serial_number
            ),
        }).send(res);
    };
}

module.exports = EquipmentController;
