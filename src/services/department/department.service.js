'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class DepartmentService {
    static async createDepartment({ id, name, notes }) {
        // Check if department already exists
        const existing = await database.Department.findOne({
            where: { department_id: id },
        });
        if (existing) {
            throw new BadRequestError('Department ID already exists');
        }

        const department = await database.Department.create({
            department_id: id,
            department_name: name,
            notes,
            status: true,
        });

        console.log('Department created:', department);

        return {
            code: 200,
            message: 'Department created successfully',
            metadata: {
                id: department.department_id,
                name: department.department_name,
                notes: department.notes,
                status: department.status,
                createdAt: department.create_time,
                updatedAt: department.update_time,
            },
        };
    }

    static async updateDepartment({ id, name, notes, status }) {
        const department = await database.Department.findOne({
            where: { department_id: id },
        });
        if (!department) {
            throw new BadRequestError('Department not found');
        }

        if (name) department.department_name = name;
        if (notes !== undefined) department.notes = notes;
        if (status !== undefined) department.status = status;

        await department.save();

        return {
            code: 200,
            message: 'Department updated successfully',
            metadata: {
                id: department.department_id,
                name: department.department_name,
                notes: department.notes,
                status: department.status,
                createdAt: department.create_time,
                updatedAt: department.update_time,
            },
        };
    }

    static async deleteDepartment(id) {
        const department = await database.Department.findOne({
            where: { department_id: id },
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
                id: d.department_id,
                name: d.department_name,
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

    static async getDepartmentById(id) {
        const department = await database.Department.findOne({
            where: { department_id: id },
        });
        if (!department) {
            throw new BadRequestError('Department not found');
        }

        return {
            code: 200,
            message: 'Get department by ID successfully',
            metadata: {
                id: department.department_id,
                name: department.department_name,
                notes: department.notes,
                status: department.status,
                createdAt: department.create_time,
                updatedAt: department.update_time,
            },
        };
    }
}

module.exports = DepartmentService;
