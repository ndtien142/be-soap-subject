'use strict';

const e = require('express');
const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');
const slugify = require('slugify');
const { Op } = require('sequelize');

class GroupEquipmentService {
    static createNewGroupEquipment = async ({
        type,
        name,
        description,
        unitOfMeasure,
        manufacturer,
    }) => {
        // Fetch manufacturer and type for prefix
        const equipmentTypeData = await database.EquipmentType.findOne({
            where: { equipment_type_name: type.name, id: type.id },
        });
        if (!equipmentTypeData) {
            throw new BadRequestError('Equipment type not found');
        }

        const manufacturerData = await database.EquipmentManufacturer.findOne({
            where: {
                id: manufacturer.id,
                manufacturer_name: manufacturer.name,
            },
        });
        if (!manufacturerData) {
            throw new BadRequestError('Manufacturer not found');
        }

        const groupEquipmentCode =
            GroupEquipmentService.generateGroupEquipmentCode(
                equipmentTypeData.prefix,
                manufacturerData.prefix,
                name,
            );

        const unitOfMeasureData = await database.UnitOfMeasure.findOne({
            where: {
                unit_of_measure_name: unitOfMeasure.name,
                id: unitOfMeasure.id,
            },
        });
        if (!unitOfMeasureData) {
            throw new BadRequestError('Unit of measure not found');
        }

        const existingGroupEquipmentName =
            await database.GroupEquipment.findOne({
                where: { group_equipment_name: name },
            });
        if (existingGroupEquipmentName) {
            throw new BadRequestError('Group equipment name already exists');
        }

        const newGroupEquipment = await database.GroupEquipment.create({
            group_equipment_code: groupEquipmentCode,
            group_equipment_name: name,
            group_equipment_description: description,
            unit_of_measure_id: unitOfMeasureData.id,
            equipment_type_id: equipmentTypeData.id,
            equipment_manufacturer_id: manufacturerData.id,
            is_deleted: false,
            is_active: true,
        });
        return {
            code: 200,
            message: 'Group equipment created successfully',
            metadata: {
                code: newGroupEquipment.group_equipment_code,
                name: newGroupEquipment.group_equipment_name,
                description: newGroupEquipment.group_equipment_description,
                unitOfMeasure: {
                    id: unitOfMeasureData.id,
                    name: unitOfMeasureData.unit_of_measure_name,
                },
                type: {
                    id: equipmentTypeData.id,
                    name: equipmentTypeData.equipment_type_name,
                },
                manufacturer: {
                    id: manufacturerData.id,
                    name: manufacturerData.manufacturer_name,
                },
                isDeleted: newGroupEquipment.is_deleted,
                isActive: newGroupEquipment.is_active,
                createdAt: newGroupEquipment.createdAt,
                updatedAt: newGroupEquipment.updatedAt,
            },
        };
    };

    static generateGroupEquipmentCode = (
        typePrefix,
        manufacturerPrefix,
        name,
    ) => {
        // Convert name to slug
        const slug = slugify(name, {
            lower: true, // chữ thường
            strict: true, // loại bỏ ký tự đặc biệt
            locale: 'vi', // hỗ trợ tiếng Việt tốt hơn
        });

        return `${typePrefix}-${manufacturerPrefix}-${slug}`;
    };

    static updateGroupEquipment = async ({
        code,
        type,
        name,
        description,
        unitOfMeasure,
        manufacturer,
    }) => {
        const groupEquipment = await database.GroupEquipment.findOne({
            where: { group_equipment_code: code },
        });
        if (!groupEquipment) {
            throw new BadRequestError('Group equipment not found');
        }

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

        const manufacturerData = await database.EquipmentManufacturer.findOne({
            where: {
                id: manufacturer.id,
                manufacturer_name: manufacturer.name,
            },
        });
        if (!manufacturerData) {
            throw new BadRequestError('Manufacturer not found');
        }

        const existingGroupEquipmentName =
            await database.GroupEquipment.findOne({
                where: { group_equipment_name: name },
            });
        if (
            existingGroupEquipmentName &&
            existingGroupEquipmentName.group_equipment_code !== code
        ) {
            throw new BadRequestError('Group equipment name already exists');
        }

        groupEquipment.group_equipment_name = name;
        groupEquipment.group_equipment_description = description;
        groupEquipment.unit_of_measure_id = unitOfMeasureData.id;
        groupEquipment.equipment_type_id = equipmentTypeData.id;
        groupEquipment.equipment_manufacturer_id = manufacturerData.id;

        await groupEquipment.save();

        return {
            code: 200,
            message: 'Group equipment updated successfully',
            metadata: {
                code: groupEquipment.group_equipment_code,
                name: groupEquipment.group_equipment_name,
                description: groupEquipment.group_equipment_description,
                unitOfMeasure: {
                    id: unitOfMeasureData.id,
                    name: unitOfMeasureData.unit_of_measure_name,
                },
                type: {
                    id: equipmentTypeData.id,
                    name: equipmentTypeData.equipment_type_name,
                },
                manufacturer: {
                    id: manufacturerData.id,
                    name: manufacturerData.manufacturer_name,
                },
                isDeleted: groupEquipment.is_deleted,
                isActive: groupEquipment.is_active,
                createdAt: groupEquipment.createdAt,
                updatedAt: groupEquipment.updatedAt,
            },
        };
    };

    static deleteGroupEquipment = async (groupEquipmentCode) => {
        const groupEquipment = await database.GroupEquipment.findOne({
            where: { group_equipment_code: groupEquipmentCode },
        });
        if (!groupEquipment) {
            throw new BadRequestError('Group equipment not found');
        }

        groupEquipment.is_deleted = true;
        groupEquipment.is_active = false;
        await groupEquipment.save();

        return {
            code: 200,
            message: 'Group equipment deleted successfully',
            metadata: groupEquipment,
        };
    };

    static deactivateGroupEquipment = async (groupEquipmentCode) => {
        const groupEquipment = await database.GroupEquipment.findOne({
            where: { group_equipment_code: groupEquipmentCode },
        });
        if (!groupEquipment) {
            throw new BadRequestError('Group equipment not found');
        }

        groupEquipment.is_active = false;
        await groupEquipment.save();

        return {
            code: 200,
            message: 'Group equipment deactivated successfully',
            metadata: groupEquipment,
        };
    };

    static getAllGroupEquipment = async ({
        page = 1,
        limit = 20,
        searchText,
    }) => {
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = { is_deleted: false };
        if (searchText) {
            where[Op.or] = [
                { group_equipment_name: { [Op.like]: `%${searchText}%` } },
                { group_equipment_code: { [Op.like]: `%${searchText}%` } },
            ];
        }

        const groupEquipmentList =
            await database.GroupEquipment.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                include: [
                    {
                        model: database.EquipmentType,
                        as: 'equipment_type',
                        attributes: ['equipment_type_name', 'id'],
                    },
                    {
                        model: database.UnitOfMeasure,
                        as: 'unit_of_measure',
                        attributes: ['unit_of_measure_name', 'id'],
                    },
                    {
                        model: database.EquipmentManufacturer,
                        as: 'equipment_manufacturer',
                        attributes: ['manufacturer_name', 'id'],
                    },
                    {
                        model: database.Equipment,
                        as: 'equipments',
                        attributes: ['status'],
                        separate: true,
                    },
                ],
            });
        if (!groupEquipmentList) {
            throw new BadRequestError('No group equipment found');
        }
        return {
            code: 200,
            message: 'Get all group equipment successfully',
            metadata: groupEquipmentList.rows.map((groupEquipment) => {
                const statusCounts = groupEquipment.equipments.reduce(
                    (acc, equipment) => {
                        acc[equipment.status] =
                            (acc[equipment.status] || 0) + 1;
                        return acc;
                    },
                    {},
                );
                return {
                    code: groupEquipment.group_equipment_code,
                    name: groupEquipment.group_equipment_name,
                    description: groupEquipment.group_equipment_description,
                    unitOfMeasure: {
                        id: groupEquipment.unit_of_measure.id,
                        name: groupEquipment.unit_of_measure
                            .unit_of_measure_name,
                    },
                    type: {
                        id: groupEquipment.equipment_type.id,
                        name: groupEquipment.equipment_type.equipment_type_name,
                    },
                    manufacturer: {
                        id: groupEquipment.equipment_manufacturer.id,
                        name: groupEquipment.equipment_manufacturer
                            .manufacturer_name,
                    },
                    equipmentStatusCounts: statusCounts,
                    isDeleted: groupEquipment.is_deleted,
                    isActive: groupEquipment.is_active,
                    createdAt: groupEquipment.createdAt,
                    updatedAt: groupEquipment.updatedAt,
                };
            }),
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: groupEquipmentList.count,
                totalPages: Math.ceil(groupEquipmentList.count / limit),
            },
        };
    };

    static getGroupEquipmentByCode = async (groupEquipmentCode) => {
        console.log('groupEquipmentCode', groupEquipmentCode);
        const groupEquipment = await database.GroupEquipment.findOne({
            where: { group_equipment_code: groupEquipmentCode },
            include: [
                {
                    model: database.EquipmentType,
                    as: 'equipment_type',
                    attributes: ['equipment_type_name', 'id'],
                },
                {
                    model: database.UnitOfMeasure,
                    as: 'unit_of_measure',
                    attributes: ['unit_of_measure_name', 'id'],
                },
                {
                    model: database.EquipmentManufacturer,
                    as: 'equipment_manufacturer',
                    attributes: ['manufacturer_name', 'id'],
                },
                {
                    model: database.Equipment,
                    as: 'equipments',
                },
            ],
        });
        if (!groupEquipment) {
            throw new BadRequestError('Group equipment not found');
        }
        return {
            code: 200,
            message: 'Get group equipment by code successfully',
            metadata: {
                code: groupEquipment.group_equipment_code,
                name: groupEquipment.group_equipment_name,
                description: groupEquipment.group_equipment_description,
                unitOfMeasure: {
                    id: groupEquipment.unit_of_measure.id,
                    name: groupEquipment.unit_of_measure.unit_of_measure_name,
                },
                type: {
                    id: groupEquipment.equipment_type.id,
                    name: groupEquipment.equipment_type.equipment_type_name,
                },
                manufacturer: {
                    id: groupEquipment.equipment_manufacturer.id,
                    name: groupEquipment.equipment_manufacturer
                        .manufacturer_name,
                },
                equipments: groupEquipment.equipments.map((equipment) => ({
                    serialNumber: equipment.serial_number,
                    description: equipment.equipment_description,
                    location: equipment.equipment_location,
                    status: equipment.status,
                    dayOfFirstUse: equipment.day_of_first_use,
                })),
                isDeleted: groupEquipment.is_deleted,
                isActive: groupEquipment.is_active,
                createdAt: groupEquipment.createdAt,
                updatedAt: groupEquipment.updatedAt,
            },
        };
    };
}

module.exports = GroupEquipmentService;
