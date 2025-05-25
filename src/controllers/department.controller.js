'use strict';

const DepartmentService = require('../services/department/department.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class DepartmentController {
    createDepartment = async (req, res, next) => {
        new CREATED({
            message: 'Create department successfully',
            data: await DepartmentService.createDepartment(req.body),
        }).send(res);
    };

    updateDepartment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update department successfully',
            data: await DepartmentService.updateDepartment(req.body),
        }).send(res);
    };

    deleteDepartment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete department successfully',
            data: await DepartmentService.deleteDepartment(
                req.params.departmentId,
            ),
        }).send(res);
    };

    getAllDepartments = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all departments successfully',
            data: await DepartmentService.getAllDepartments(req.query),
        }).send(res);
    };

    getDepartmentById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get department by ID successfully',
            data: await DepartmentService.getDepartmentById(
                req.params.departmentId,
            ),
        }).send(res);
    };
}

module.exports = new DepartmentController();
