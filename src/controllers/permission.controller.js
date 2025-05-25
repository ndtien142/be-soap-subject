'use strict';

const PermissionService = require('../services/access/permission.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class PermissionController {
    createPermission = async (req, res, next) => {
        new CREATED({
            message: 'Create permission successfully',
            data: await PermissionService.createPermission(req.body),
        }).send(res);
    };

    updatePermission = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update permission successfully',
            data: await PermissionService.updatePermission(req.body),
        }).send(res);
    };

    deletePermission = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete permission successfully',
            data: await PermissionService.deletePermission(req.params.id),
        }).send(res);
    };

    getAllPermissions = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all permissions successfully',
            data: await PermissionService.getAllPermissions(req.query),
        }).send(res);
    };

    getPermissionById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get permission by ID successfully',
            data: await PermissionService.getPermissionById(req.params.id),
        }).send(res);
    };
}

module.exports = new PermissionController();
