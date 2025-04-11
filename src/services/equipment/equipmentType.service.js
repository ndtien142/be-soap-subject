const db = require('../../models');

const { EquipmentType } = db;

class EquipmentTypeService {
    static crateNewEquipmentType = async ({ name, description }) => {
        // Check if the equipment type name already exists
        const existingEquipmentTypeName = await EquipmentType.findOne({
            where: { type_equipment_name: name },
        });
        if (existingEquipmentTypeName) {
            throw new BadRequestError('Equipment type name already exists');
        }

        const newEquipmentType = await EquipmentType.create({
            type_equipment_name: name,
            type_equipment_description: description,
            is_active: true,
        });
        return {
            code: 200,
            message: 'Equipment type created successfully',
            metadata: newEquipmentType,
        };
    };
    static getAllEquipmentType = async ({ page = 1, limit = 0 }) => {
        const offset = (page - 1) * limit;
        const equipmentType = await EquipmentType.findAndCountAll({
            where: { is_deleted: false },
            limit: limit,
            offset: offset,
        });
        if (!equipmentType) {
            throw new BadRequestError('Equipment type not found');
        }
        return {
            code: 200,
            message: 'Get all equipment type successfully',
            metadata: equipmentType,
        };
    };
    static getEquipmentTypeById = async (id) => {
        const equipmentType = await EquipmentType.findOne({
            where: { id: id },
        });
        if (!equipmentType) {
            throw new BadRequestError('Equipment type not found');
        }
        return {
            code: 200,
            message: 'Get equipment type by ID successfully',
            metadata: equipmentType,
        };
    };
    static updateEquipmentType = async ({ id, name, description }) => {
        const equipmentType = await EquipmentType.findOne({
            where: { id: id },
        });
        if (!equipmentType) {
            throw new BadRequestError('Equipment type not found');
        }
        equipmentType.type_equipment_name = name;
        equipmentType.type_equipment_description = description;
        await equipmentType.save();
        return {
            code: 200,
            message: 'Equipment type updated successfully',
            metadata: equipmentType,
        };
    };
    static deleteEquipmentType = async (id) => {
        const equipmentType = await EquipmentType.findOne({
            where: { id: id },
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
            metadata: equipmentType,
        };
    };
}

module.exports = EquipmentTypeService;
