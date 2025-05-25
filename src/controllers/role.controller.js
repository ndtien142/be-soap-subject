'use strict';

const RoleService = require('../services/access/role.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class RoleController {
    createRole = async (req, res, next) => {
        new CREATED({
            message: 'Create role successfully',
            data: await RoleService.createRole(req.body),
        }).send(res);
    };

    updateRole = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update role successfully',
            data: await RoleService.updateRole(req.body),
        }).send(res);
    };

    deleteRole = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete role successfully',
            data: await RoleService.deleteRole(req.params.id),
        }).send(res);
    };

    getAllRoles = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all roles successfully',
            data: await RoleService.getAllRoles(req.query),
        }).send(res);
    };

    getRoleById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get role by ID successfully',
            data: await RoleService.getRoleById(req.params.id),
        }).send(res);
    };
}

module.exports = new RoleController();
