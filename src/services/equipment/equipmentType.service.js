const { Op } = require('sequelize');
const db = require('../../models');
const { BadRequestError } = require('../../core/error.response');

const { EquipmentType } = db;

class EquipmentTypeService {
    static createNewEquipmentType = async ({ name, description }) => {
        // Check if the equipment type name already exists
        const existingEquipmentTypeName = await EquipmentType.findOne({
            where: { equipment_type_name: name },
        });
        if (existingEquipmentTypeName) {
            throw new BadRequestError('Equipment type name already exists');
        }

        const newEquipmentType = await EquipmentType.create({
            equipment_type_name: name,
            equipment_type_description: description,
            is_active: true,
            is_deleted: false,
        });
        return {
            code: 200,
            message: 'Equipment type created successfully',
            metadata: {
                id: newEquipmentType.id,
                name: newEquipmentType.equipment_type_name,
                description: newEquipmentType.equipment_type_description,
                isActive: newEquipmentType.is_active,
                isDeleted: newEquipmentType.is_deleted,
                createdAt: newEquipmentType.createdAt,
                updatedAt: newEquipmentType.updatedAt,
            },
        };
    };
    static getAllEquipmentType = async ({ page = 1, limit = 20 }) => {
        const offset = (parseInt(page) - 1) * limit;
        const equipmentType = await EquipmentType.findAndCountAll({
            where: { is_deleted: false },
            limit: parseInt(limit),
            offset: offset,
        });
        if (!equipmentType) {
            throw new BadRequestError('Equipment type not found');
        }
        console.log('equipmentType', equipmentType.rows);
        return {
            code: 200,
            message: 'Get all equipment type successfully',
            metadata: equipmentType.rows.map((equipment) => {
                return {
                    id: equipment.id,
                    name: equipment.equipment_type_name,
                    description: equipment.equipment_type_description,
                    isActive: equipment.is_active,
                    isDeleted: equipment.is_deleted,
                    createdAt: equipment.createdAt,
                    updatedAt: equipment.updatedAt,
                };
            }),
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: equipmentType.count,
                totalPages: Math.ceil(equipmentType.count / limit),
            },
        };
    };
    static getEquipmentTypeById = async (id) => {
        const equipmentType = await EquipmentType.findOne({
            where: { id: id, is_deleted: false },
        });
        if (!equipmentType) {
            throw new BadRequestError('Equipment type not found');
        }
        return {
            code: 200,
            message: 'Get equipment type by ID successfully',
            metadata: {
                id: equipmentType.id,
                name: equipmentType.equipment_type_name,
                description: equipmentType.equipment_type_description,
                isActive: equipmentType.is_active,
                isDeleted: equipmentType.is_deleted,
                createdAt: equipmentType.createdAt,
                updatedAt: equipmentType.updatedAt,
            },
        };
    };
    static updateEquipmentType = async ({ id, name, description }) => {
        const equipmentType = await EquipmentType.findOne({
            where: { id: id, is_deleted: false },
        });
        if (!equipmentType) {
            throw new BadRequestError('Equipment type not found');
        }
        // Check if the equipment type name already exists
        const existingEquipmentTypeName = await EquipmentType.findOne({
            where: {
                equipment_type_name: name,
                id: { [Op.ne]: id }, // Exclude the current equipment type
            },
        });
        if (existingEquipmentTypeName) {
            throw new BadRequestError('Equipment type name already exists');
        }

        equipmentType.equipment_type_name = name;
        equipmentType.equipment_type_description = description;
        await equipmentType.save();
        return {
            code: 200,
            message: 'Equipment type updated successfully',
            metadata: {
                id: equipmentType.id,
                name: equipmentType.equipment_type_name,
                description: equipmentType.equipment_type_description,
                isActive: equipmentType.is_active,
                isDeleted: equipmentType.is_deleted,
                createdAt: equipmentType.createdAt,
                updatedAt: equipmentType.updatedAt,
            },
        };
    };
    static deleteEquipmentType = async (id) => {
        const equipmentType = await EquipmentType.findOne({
            where: { id: parseInt(id) },
        });
        if (!equipmentType) {
            throw new BadRequestError('Equipment type not found');
        }
        equipmentType.is_deleted = true;
        equipmentType.is_active = false;
        await equipmentType.save();
        return {
            code: 200,
            message: 'Equipment type deleted successfully',
            metadata: {
                id: equipmentType.id,
                name: equipmentType.equipment_type_name,
                description: equipmentType.equipment_type_description,
                isActive: equipmentType.is_active,
                isDeleted: equipmentType.is_deleted,
                createdAt: equipmentType.createdAt,
                updatedAt: equipmentType.updatedAt,
            },
        };
    };
}

module.exports = EquipmentTypeService;
