'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class EquipmentManufacturerService {
    static createManufacturer = async ({
        name,
        contactInfo,
        address,
        prefix,
    }) => {
        // Check if the manufacturer name already exists
        const existingManufacturer =
            await database.EquipmentManufacturer.findOne({
                where: { manufacturer_name: name, is_active: true },
            });
        if (existingManufacturer) {
            throw new BadRequestError('Manufacturer name already exists');
        }

        // Check if prefix already exists
        const existingPrefix = await database.EquipmentManufacturer.findOne({
            where: { prefix },
        });
        if (existingPrefix) {
            throw new BadRequestError('Manufacturer prefix already exists');
        }

        const newManufacturer = await database.EquipmentManufacturer.create({
            manufacturer_name: name,
            contact_info: contactInfo,
            address: address,
            prefix: prefix,
            is_active: true,
        });

        return {
            code: 200,
            message: 'Manufacturer created successfully',
            metadata: {
                id: newManufacturer.id,
                name: newManufacturer.manufacturer_name,
                prefix: newManufacturer.prefix,
                contactInfo: newManufacturer.contact_info,
                address: newManufacturer.address,
                isActive: newManufacturer.is_active,
                createAt: newManufacturer.create_time,
                updateAt: newManufacturer.update_time,
            },
        };
    };

    static updateManufacturer = async ({
        id,
        name,
        contactInfo,
        address,
        prefix,
    }) => {
        // Check if the manufacturer exists
        const manufacturer = await database.EquipmentManufacturer.findByPk(id);
        if (!manufacturer) {
            throw new BadRequestError('Manufacturer not found');
        }

        // Check if the manufacturer name already exists
        const existingManufacturer =
            await database.EquipmentManufacturer.findOne({
                where: { manufacturer_name: name },
            });
        if (
            existingManufacturer &&
            parseInt(existingManufacturer.id) !== parseInt(id)
        ) {
            throw new BadRequestError('Manufacturer name already exists');
        }

        // Check if prefix already exists for another manufacturer
        if (prefix) {
            const existingPrefix = await database.EquipmentManufacturer.findOne(
                {
                    where: { prefix },
                },
            );
            if (
                existingPrefix &&
                parseInt(existingPrefix.id) !== parseInt(id)
            ) {
                throw new BadRequestError('Manufacturer prefix already exists');
            }
            manufacturer.prefix = prefix;
        }

        manufacturer.manufacturer_name = name;
        manufacturer.contact_info = contactInfo;
        manufacturer.address = address;
        await manufacturer.save();

        return {
            code: 200,
            message: 'Manufacturer updated successfully',
            metadata: {
                id: manufacturer.id,
                name: manufacturer.manufacturer_name,
                prefix: manufacturer.prefix,
                contactInfo: manufacturer.contact_info,
                address: manufacturer.address,
                isActive: manufacturer.is_active,
                createAt: manufacturer.create_time,
                updateAt: manufacturer.update_time,
            },
        };
    };

    static deleteManufacturer = async (id) => {
        // Check if the manufacturer exists
        const manufacturer = await database.EquipmentManufacturer.findByPk(id);
        if (!manufacturer) {
            throw new BadRequestError('Manufacturer not found');
        }

        // Soft delete the manufacturer
        manufacturer.is_active = false;
        await manufacturer.save();

        return {
            code: 200,
            message: 'Manufacturer deleted successfully',
        };
    };

    static getAllManufacturers = async ({ page = 1, limit = 20 }) => {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const manufacturers =
            await database.EquipmentManufacturer.findAndCountAll({
                limit: parseInt(limit),
                offset,
                where: {
                    is_active: true,
                },
                order: [['create_time', 'DESC']],
            });

        return {
            code: 200,
            message: 'Get all manufacturers successfully',
            metadata: manufacturers.rows.map((manufacturer) => {
                return {
                    id: manufacturer.id,
                    name: manufacturer.manufacturer_name,
                    contactInfo: manufacturer.contact_info,
                    address: manufacturer.address,
                    isActive: manufacturer.is_active,
                    createAt: manufacturer.create_time,
                    updateAt: manufacturer.update_time,
                };
            }),
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: manufacturers.count,
                totalPages: Math.ceil(manufacturers.count / limit),
            },
        };
    };

    static getManufacturerById = async (id) => {
        const manufacturer = await database.EquipmentManufacturer.findByPk(id);
        if (!manufacturer) {
            throw new BadRequestError('Manufacturer not found');
        }

        if (manufacturer.is_active === false) {
            throw new BadRequestError('Manufacturer id not found');
        }

        return {
            code: 200,
            message: 'Get manufacturer by ID successfully',
            metadata: {
                id: manufacturer.id,
                name: manufacturer.manufacturer_name,
                contactInfo: manufacturer.contact_info,
                address: manufacturer.address,
                isActive: manufacturer.is_active,
                createAt: manufacturer.create_time,
                updateAt: manufacturer.update_time,
            },
        };
    };
}

module.exports = EquipmentManufacturerService;
