'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class EquipmentService {
    static async createEquipment({
        serialNumber,
        groupEquipmentCode,
        dayOfFirstUse,
        equipmentDescription,
        equipmentLocation,
        status,
        roomId,
        importReceiptId,
    }) {
        // Check if group equipment exists
        const groupEquipment = await database.GroupEquipment.findOne({
            where: { group_equipment_code: groupEquipmentCode },
        });
        if (!groupEquipment) {
            throw new BadRequestError('Group equipment not found');
        }

        // Check for duplicate serial number
        const existing = await database.Equipment.findOne({
            where: { serial_number: serialNumber },
        });
        if (existing) {
            throw new BadRequestError('Serial number already exists');
        }

        const equipment = await database.Equipment.create({
            serial_number: serialNumber,
            group_equipment_code: groupEquipmentCode,
            day_of_first_use: dayOfFirstUse,
            equipment_description: equipmentDescription,
            equipment_location: equipmentLocation,
            status,
            room_id: roomId,
            import_receipt_id: importReceiptId,
        });

        return {
            code: 200,
            message: 'Equipment created successfully',
            data: equipment,
        };
    }

    static async updateEquipment(serialNumber, updateData) {
        const equipment = await database.Equipment.findOne({
            where: { serial_number: serialNumber },
        });
        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }

        Object.assign(equipment, updateData);
        await equipment.save();

        return {
            code: 200,
            message: 'Equipment updated successfully',
            data: equipment,
        };
    }

    static async deleteEquipment(serialNumber) {
        const equipment = await database.Equipment.findOne({
            where: { serial_number: serialNumber },
        });
        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }

        // Soft delete: set status to 'liquidation'
        equipment.status = 'liquidation';
        await equipment.save();

        return {
            code: 200,
            message: 'Equipment deleted (soft) successfully',
            data: equipment,
        };
    }

    static async getEquipmentBySerialNumber(serialNumber) {
        const equipment = await database.Equipment.findOne({
            where: { serial_number: serialNumber },
            include: [
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                },
                {
                    model: database.ImportReceipt,
                    as: 'import_receipt',
                    include: [
                        {
                            model: database.Account,
                        },
                    ],
                },
                {
                    model: database.Room,
                    as: 'room',
                },
            ],
        });
        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }
        return {
            code: 200,
            message: 'Get equipment by serial number successfully',
            metadata: {
                serialNumber: equipment.serial_number,
                dayOfFirstUse: equipment.day_of_first_use,
                description: equipment.equipment_description,
                location: equipment.equipment_location,
                status: equipment.status,
                importReceipt: {
                    id: equipment.import_receipt_id,
                    userCode: equipment.import_receipt?.user_code,
                    approvedBy: equipment.import_receipt.approved_by,
                    receivedAt: equipment.import_receipt.date_of_received,
                    note: equipment.import_receipt.note,
                },
                groupEquipment: equipment.group_equipment
                    ? {
                          code: equipment.group_equipment.group_equipment_code,
                          name: equipment.group_equipment.group_equipment_name,
                      }
                    : null,
                room: equipment.room
                    ? {
                          id: equipment.room.id,
                          name: equipment.room.name,
                      }
                    : null,
            },
        };
    }

    static async getAllEquipment({ page = 1, limit = 20 }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await database.Equipment.findAndCountAll({
            limit: parseInt(limit),
            offset,
            include: [
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                },
                {
                    model: database.ImportReceipt,
                    as: 'import_receipt',
                    include: [
                        {
                            model: database.Account,
                        },
                    ],
                },
                {
                    model: database.Room,
                    as: 'room',
                },
            ],
        });
        return {
            code: 200,
            message: 'Get all equipment successfully',
            metadata: result.rows.map((equipment) => {
                return {
                    serialNumber: equipment.serial_number,
                    dayOfFirstUse: equipment.day_of_first_use,
                    description: equipment.equipment_description,
                    location: equipment.equipment_location,
                    status: equipment.status,
                    importReceipt: {
                        id: equipment.import_receipt_id,
                        userCode: equipment.import_receipt?.user_code,
                        approvedBy: equipment.import_receipt.approved_by,
                        receivedAt: equipment.import_receipt.date_of_received,
                        note: equipment.import_receipt.note,
                    },
                    groupEquipment: equipment.group_equipment
                        ? {
                              code: equipment.group_equipment
                                  .group_equipment_code,
                              name: equipment.group_equipment
                                  .group_equipment_name,
                          }
                        : null,
                    room: equipment.room
                        ? {
                              id: equipment.room.id,
                              name: equipment.room.name,
                          }
                        : null,
                };
            }),
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }
}

module.exports = EquipmentService;
