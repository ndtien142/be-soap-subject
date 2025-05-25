'use strict';

const { BadRequestError } = require('../../core/error.response');
const db = require('../../models');
const { Equipment } = db;

class EquipmentService {
    static async createNewEquipment(data) {
        const {
            serial_number,
            fk_group_equipment_code,
            day_of_first_use,
            equipment_description,
            equipment_location,
            status = 'available',
            fk_import_receipt_id,
        } = data;

        const existing = await Equipment.findOne({
            where: { serial_number },
        });

        if (existing) {
            throw new BadRequestError('Serial number already exists');
        }

        const newEquipment = await Equipment.create({
            serial_number,
            fk_group_equipment_code,
            day_of_first_use,
            equipment_description,
            equipment_location,
            status,
            fk_import_receipt_id,
        });

        return {
            code: 200,
            message: 'Equipment created successfully',
            metadata: newEquipment,
        };
    }

    static async getAllEquipment({ page = 1, limit = 20 }) {
        const offset = (parseInt(page) - 1) * limit;

        const result = await Equipment.findAndCountAll({
            limit: parseInt(limit),
            offset,
            order: [['create_time', 'DESC']],
        });

        return {
            code: 200,
            message: 'Fetched all equipment',
            metadata: result.rows,
            meta: {
                currentPage: parseInt(page),
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    static async getEquipmentBySerial(serial_number) {
        const equipment = await Equipment.findOne({ where: { serial_number } });

        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }

        return {
            code: 200,
            message: 'Fetched equipment successfully',
            metadata: equipment,
        };
    }

    static async updateEquipment(serial_number, updateData) {
        const equipment = await Equipment.findOne({ where: { serial_number } });

        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }

        Object.assign(equipment, updateData);
        await equipment.save();

        return {
            code: 200,
            message: 'Equipment updated successfully',
            metadata: equipment,
        };
    }

    static async deleteEquipment(serial_number) {
        const equipment = await Equipment.findOne({ where: { serial_number } });

        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }

        await equipment.destroy(); // hoặc đánh dấu xóa nếu bạn cần soft-delete

        return {
            code: 200,
            message: 'Equipment deleted successfully',
            metadata: {
                serial_number,
            },
        };
    }
}

module.exports = EquipmentService;
