const { BadRequestError } = require('../../core/error.response');

const database = require('../../models');

class UnitOfMeasureService {
    static createNewUnitOfMeasure = async ({ name, description }) => {
        // Check if the unit of measure name already exists
        const existingUnitOfMeasureName = await database.UnitOfMeasure.findOne({
            where: { unit_of_measure_name: name },
        });
        if (existingUnitOfMeasureName) {
            throw new BadRequestError('Unit of measure name already exists');
        }

        const newUnitOfMeasure = await database.UnitOfMeasure.create({
            unit_of_measure_name: name,
            unit_of_measure_description: description,
            is_active: true,
            is_deleted: false,
        });
        return {
            code: 200,
            message: 'Unit of measure created successfully',
            metadata: {
                id: newUnitOfMeasure.id,
                name: newUnitOfMeasure.unit_of_measure_name,
                description: newUnitOfMeasure.unit_of_measure_description,
                isActive: newUnitOfMeasure.is_active,
                isDeleted: newUnitOfMeasure.is_deleted,
                createdAt: newUnitOfMeasure.createdAt,
                updatedAt: newUnitOfMeasure.updatedAt,
            },
        };
    };
    static getAllUnitOfMeasure = async ({ page = 1, limit = 20 }) => {
        const offset = (page - 1) * limit;
        const unitOfMeasure = await database.UnitOfMeasure.findAndCountAll({
            where: { is_deleted: false },
            limit: limit,
            offset: offset,
        });
        if (!unitOfMeasure) {
            throw new BadRequestError('Unit of measure not found');
        }
        return {
            code: 200,
            message: 'Get all unit of measure successfully',
            metadata: unitOfMeasure.rows.map((unit) => {
                return {
                    id: unit.id,
                    name: unit.unit_of_measure_name,
                    description: unit.unit_of_measure_description,
                    isActive: unit.is_active,
                    isDeleted: unit.is_deleted,
                    createdAt: unit.createdAt,
                    updatedAt: unit.updatedAt,
                };
            }),
            meta: {
                currentPage: page,
                itemPerPage: limit,
                totalItems: unitOfMeasure.count,
                totalPages: Math.ceil(unitOfMeasure.count / limit),
            },
        };
    };
    static getUnitOfMeasureById = async (id) => {
        const unitOfMeasure = await database.UnitOfMeasure.findOne({
            where: { id: id },
        });
        if (!unitOfMeasure) {
            throw new BadRequestError('Unit of measure not found');
        }
        return {
            code: 200,
            message: 'Get unit of measure by ID successfully',
            metadata: {
                id: unitOfMeasure.id,
                name: unitOfMeasure.unit_of_measure_name,
                description: unitOfMeasure.unit_of_measure_description,
                isActive: unitOfMeasure.is_active,
                isDeleted: unitOfMeasure.is_deleted,
                createdAt: unitOfMeasure.createdAt,
                updatedAt: unitOfMeasure.updatedAt,
            },
        };
    };
    static updateUnitOfMeasure = async ({ id, name, description }) => {
        const unitOfMeasure = await database.UnitOfMeasure.findOne({
            where: { id: id },
        });
        if (!unitOfMeasure) {
            throw new BadRequestError('Unit of measure not found');
        }
        unitOfMeasure.unit_of_measure_name = name;
        unitOfMeasure.unit_of_measure_description = description;
        await unitOfMeasure.save();
        return {
            code: 200,
            message: 'Unit of measure updated successfully',
            metadata: {
                id: unitOfMeasure.id,
                name: unitOfMeasure.unit_of_measure_name,
                description: unitOfMeasure.unit_of_measure_description,
                isActive: unitOfMeasure.is_active,
                isDeleted: unitOfMeasure.is_deleted,
                createdAt: unitOfMeasure.createdAt,
                updatedAt: unitOfMeasure.updatedAt,
            },
        };
    };
    static deleteUnitOfMeasure = async (id) => {
        const unitOfMeasure = await database.UnitOfMeasure.findOne({
            where: { id: id },
        });
        if (!unitOfMeasure) {
            throw new BadRequestError('Unit of measure not found');
        }
        unitOfMeasure.is_deleted = true;
        unitOfMeasure.is_active = false;
        await unitOfMeasure.save();
        return {
            code: 200,
            message: 'Unit of measure deleted successfully',
            metadata: {
                id: unitOfMeasure.id,
                name: unitOfMeasure.unit_of_measure_name,
                description: unitOfMeasure.unit_of_measure_description,
                isActive: unitOfMeasure.is_active,
                isDeleted: unitOfMeasure.is_deleted,
                createdAt: unitOfMeasure.createdAt,
                updatedAt: unitOfMeasure.updatedAt,
            },
        };
    };
}

module.exports = UnitOfMeasureService;
