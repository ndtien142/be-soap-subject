'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class DepartmentService {
    static async createDepartment({ departmentId, departmentName, notes }) {
        // Check if department already exists
        const existing = await database.Department.findOne({
            where: { department_id: departmentId },
        });
        if (existing) {
            throw new BadRequestError('Department ID already exists');
        }

        const department = await database.Department.create({
            department_id: departmentId,
            department_name: departmentName,
            notes,
            status: true,
        });

        return {
            code: 200,
            message: 'Department created successfully',
            data: {
                departmentId: department.department_id,
                departmentName: department.department_name,
                notes: department.notes,
                status: department.status,
                createdAt: department.create_time,
                updatedAt: department.update_time,
            },
        };
    }

    static async updateDepartment({
        departmentId,
        departmentName,
        notes,
        status,
    }) {
        const department = await database.Department.findOne({
            where: { department_id: departmentId },
        });
        if (!department) {
            throw new BadRequestError('Department not found');
        }

        if (departmentName) department.department_name = departmentName;
        if (notes !== undefined) department.notes = notes;
        if (status !== undefined) department.status = status;

        await department.save();

        return {
            code: 200,
            message: 'Department updated successfully',
            data: {
                departmentId: department.department_id,
                departmentName: department.department_name,
                notes: department.notes,
                status: department.status,
                createdAt: department.create_time,
                updatedAt: department.update_time,
            },
        };
    }

    static async deleteDepartment(departmentId) {
        const department = await database.Department.findOne({
            where: { department_id: departmentId },
        });
        if (!department) {
            throw new BadRequestError('Department not found');
        }

        department.status = false;
        await department.save();

        return {
            code: 200,
            message: 'Department deleted (deactivated) successfully',
        };
    }

    static async getAllDepartments({ page = 1, limit = 20 }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await database.Department.findAndCountAll({
            limit: parseInt(limit),
            offset,
            order: [['create_time', 'DESC']],
        });

        return {
            code: 200,
            message: 'Get all departments successfully',
            metadata: result.rows.map((d) => ({
                departmentId: d.department_id,
                departmentName: d.department_name,
                notes: d.notes,
                status: d.status,
                createdAt: d.create_time,
                updatedAt: d.update_time,
            })),
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    static async getDepartmentById(departmentId) {
        const department = await database.Department.findOne({
            where: { department_id: departmentId },
        });
        if (!department) {
            throw new BadRequestError('Department not found');
        }

        return {
            code: 200,
            message: 'Get department by ID successfully',
            data: {
                departmentId: department.department_id,
                departmentName: department.department_name,
                notes: department.notes,
                status: department.status,
                createdAt: department.create_time,
                updatedAt: department.update_time,
            },
        };
    }
}

module.exports = DepartmentService;
