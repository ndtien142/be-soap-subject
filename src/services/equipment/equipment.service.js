const { BadRequestError } = require('../../core/error.response');

const database = require('../../models');

class EquipmentService {
    static createNewEquipment = async ({
        type,
        name,
        description,
        unitOfMeasure,
    }) => {
        const equipmentCode = EquipmentService.generateEquipmentCode(type);

        const unitOfMeasureData = await database.UnitOfMeasure.findOne({
            where: {
                unit_of_measure_name: unitOfMeasure.name,
                id: unitOfMeasure.id,
            },
        });
        if (!unitOfMeasureData) {
            throw new BadRequestError('Unit of measure not found');
        }

        const equipmentTypeData = await database.EquipmentType.findOne({
            where: { equipment_type_name: type.name, id: type.id },
        });

        if (!equipmentTypeData) {
            throw new BadRequestError('Equipment type not found');
        }

        // Check if the equipment name already exists
        const existingEquipmentName = await database.Equipment.findOne({
            where: { equipment_name: name },
        });
        if (existingEquipmentName) {
            throw new BadRequestError('Equipment name already exists');
        }

        const newEquipment = await database.Equipment.create({
            equipment_code: equipmentCode,
            equipment_name: name,
            equipment_description: description,
            fk_unit_of_measure_id: unitOfMeasureData.id,
            fk_equipment_type_id: equipmentTypeData.id,
            is_deleted: false,
            is_active: true,
        });
        return {
            code: 200,
            message: 'Equipment created successfully',
            metadata: {
                code: newEquipment.equipment_code,
                name: newEquipment.equipment_name,
                description: newEquipment.equipment_description,
                unitOfMeasure: {
                    id: unitOfMeasureData.id,
                    name: unitOfMeasureData.unit_of_measure_name,
                },
                type: {
                    id: equipmentTypeData.id,
                    name: equipmentTypeData.type_equipment_name,
                },
                isDeleted: newEquipment.is_deleted,
                isActive: newEquipment.is_active,
                createdAt: newEquipment.createdAt,
                updatedAt: newEquipment.updatedAt,
            },
        };
    };
    static generateEquipmentCode = (typeEquipment) => {
        const prefix = typeEquipment.name.trim().slice(0, 3).toUpperCase();
        const timestamp = Date.now();
        return `${prefix}-${timestamp}`;
    };
    static updateEquipment = async ({
        equipmentCode,
        equipmentName,
        equipmentDescription,
        equipmentType,
        unitOfMeasure,
    }) => {
        // Check if the equipment exists
        const equipment = await database.Equipment.findOne({
            where: { equipment_code: equipmentCode },
        });
        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }
        // Check if the equipment name already exists
        const existingEquipmentName = await database.Equipment.findOne({
            where: { equipment_name: equipmentName },
        });
        if (
            existingEquipmentName &&
            existingEquipmentName.equipment_code !== equipmentCode
        ) {
            throw new BadRequestError('Equipment name already exists');
        }
        // Check if the unit of measure exists
        const unitOfMeasureData = await database.UnitOfMeasure.findOne({
            where: { unit_of_measure_name: unitOfMeasure },
        });
        if (!unitOfMeasureData) {
            throw new BadRequestError('Unit of measure not found');
        }
        // Check if the equipment type exists
        const equipmentTypeData = await database.EquipmentType.findOne({
            where: { type_equipment_name: equipmentType },
        });
        if (!equipmentTypeData) {
            throw new BadRequestError('Equipment type not found');
        }
        // Update the equipment
        equipment.equipment_name = equipmentName;
        equipment.equipment_description = equipmentDescription;
        equipment.fk_unit_of_measure_id = unitOfMeasureData.id;
        equipment.fk_equipment_type_id = equipmentTypeData.id;
        await equipment.save();
        return {
            code: 200,
            message: 'Equipment updated successfully',
            metadata: {
                code: equipment.equipment_code,
                name: equipment.equipment_name,
                description: equipment.equipment_description,
                unitOfMeasure: {
                    id: unitOfMeasureData.id,
                    name: unitOfMeasureData.unit_of_measure_name,
                },
                type: {
                    id: equipmentTypeData.id,
                    name: equipmentTypeData.type_equipment_name,
                },
                isDeleted: equipment.is_deleted,
                isActive: equipment.is_active,
                createdAt: equipment.createdAt,
                updatedAt: equipment.updatedAt,
            },
        };
    };
    static deleteEquipment = async (equipmentCode) => {
        // Check if the equipment exists
        const equipment = await database.Equipment.findOne({
            where: { equipment_code: equipmentCode },
        });
        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }
        // Delete the equipment
        equipment.is_deleted = true;
        equipment.is_active = false;
        await equipment.save();

        return {
            code: 200,
            message: 'Equipment deleted successfully',
            metadata: equipment,
        };
    };
    static deactivateEquipment = async (equipmentCode) => {
        // Check if the equipment exists
        const equipment = await database.Equipment.findOne({
            where: { equipment_code: equipmentCode },
        });
        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }
        // Deactivate the equipment
        equipment.is_active = false;
        await equipment.save();

        return {
            code: 200,
            message: 'Equipment deactivated successfully',
            metadata: equipment,
        };
    };
    static getAllEquipment = async ({ page = 1, limit = 20 }) => {
        const offset = (page - 1) * limit;
        const equipmentList = await database.Equipment.findAndCountAll({
            where: { is_deleted: false },
            limit,
            offset,
            include: [
                {
                    model: database.EquipmentType,
                    as: 'EquipmentType',
                    attributes: ['equipment_type_name', 'id'],
                },
                {
                    model: database.UnitOfMeasure,
                    as: 'UnitOfMeasure',
                    attributes: ['unit_of_measure_name', 'id'],
                },
            ],
        });
        if (!equipmentList) {
            throw new BadRequestError('No equipment found');
        }
        return {
            code: 200,
            message: 'Get all equipment successfully',
            metadata: equipmentList.rows.map((equipment) => {
                return {
                    code: equipment.equipment_code,
                    name: equipment.equipment_name,
                    description: equipment.equipment_description,
                    unitOfMeasure: {
                        id: equipment.UnitOfMeasure.id,
                        name: equipment.UnitOfMeasure.unit_of_measure_name,
                    },
                    type: {
                        id: equipment.EquipmentType.id,
                        name: equipment.EquipmentType.equipment_type_name,
                    },
                    isDeleted: equipment.is_deleted,
                    isActive: equipment.is_active,
                    createdAt: equipment.createdAt,
                    updatedAt: equipment.updatedAt,
                };
            }),
            meta: {
                currentPage: page,
                itemPerPage: limit,
                totalItems: equipmentList.count,
                totalPages: Math.ceil(equipmentList.count / limit),
            },
        };
    };
    static getEquipmentByCode = async (equipmentCode) => {
        // Check if the equipment exists
        const equipment = await database.Equipment.findOne({
            where: { equipment_code: equipmentCode },
            include: [
                {
                    model: database.EquipmentType,
                    as: 'EquipmentType',
                    attributes: ['equipment_type_name', 'id'],
                },
                {
                    model: database.UnitOfMeasure,
                    as: 'UnitOfMeasure',
                    attributes: ['unit_of_measure_name', 'id'],
                },
            ],
        });
        console.log(equipment);
        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }
        return {
            code: 200,
            message: 'Get equipment by code successfully',
            metadata: {
                code: equipment.equipment_code,
                name: equipment.equipment_name,
                description: equipment.equipment_description,
                unitOfMeasure: {
                    id: equipment.UnitOfMeasure.id,
                    name: equipment.UnitOfMeasure.unit_of_measure_name,
                },
                type: {
                    id: equipment.EquipmentType.id,
                    name: equipment.EquipmentType.equipment_type_name,
                },
                isDeleted: equipment.is_deleted,
                isActive: equipment.is_active,
                createdAt: equipment.createdAt,
                updatedAt: equipment.updatedAt,
            },
        };
    };
}

module.exports = EquipmentService;
