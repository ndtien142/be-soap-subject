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
                        {
                            model: database.Supplier,
                            as: 'supplier',
                        },
                        {
                            model: database.GroupEquipment,
                            as: 'group_equipment',
                        },
                    ],
                },
                {
                    model: database.Room,
                    as: 'room',
                    include: [
                        {
                            model: database.Department,
                            as: 'department',
                        },
                    ],
                },
                {
                    model: database.EquipmentImages,
                    as: 'images',
                },
            ],
        });
        if (equipment.import_receipt.approve_by) {
            const approver = await database.Account.findOne({
                where: { user_code: equipment.import_receipt.approve_by },
            });
            equipment.import_receipt.approved_by = {
                userCode: approver.user_code,
                name: approver.full_name,
                username: approver.username,
                email: approver.email,
                phone: approver.phone_number,
            };
        }

        if (equipment.import_receipt.user_code) {
            const user = await database.Account.findOne({
                where: { user_code: equipment.import_receipt.user_code },
            });
            equipment.import_receipt.user_requested = {
                userCode: user.user_code,
                name: user.full_name,
                username: user.username,
                email: user.email,
                phone: user.phone_number,
            };
        }

        if (!equipment) {
            throw new BadRequestError('Equipment not found');
        }

        // Get price from DetailImportReceipt if available
        let price = null;
        if (
            equipment.import_receipt &&
            equipment.import_receipt.group_equipment?.length > 0
        ) {
            price = equipment.import_receipt.group_equipment?.find((item) => {
                return (
                    item.group_equipment_code ===
                    equipment.group_equipment.group_equipment_code
                );
            })?.DetailImportReceipt?.price;
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
                    price,
                    userRequested: equipment.import_receipt?.user_requested,
                    approvedBy: equipment.import_receipt.approved_by,
                    receivedAt: equipment.import_receipt.date_of_received,
                    note: equipment.import_receipt.note,
                    supplier: equipment.import_receipt.supplier
                        ? {
                              id: equipment.import_receipt.supplier.supplier_id,
                              name: equipment.import_receipt.supplier
                                  .supplier_name,
                              address:
                                  equipment.import_receipt.supplier
                                      .supplier_address,
                              description:
                                  equipment.import_receipt.supplier
                                      .supplier_description,
                              phone: equipment.import_receipt.supplier
                                  .supplier_phone,
                              email: equipment.import_receipt.supplier
                                  .supplier_email,
                          }
                        : null,
                },
                groupEquipment: equipment.group_equipment
                    ? {
                          code: equipment.group_equipment.group_equipment_code,
                          name: equipment.group_equipment.group_equipment_name,
                      }
                    : null,
                room: equipment.room
                    ? {
                          id: equipment.room.room_id,
                          name: equipment.room.room_name,
                          note: equipment.room.notes,
                          status: equipment.room.status,
                          department: {
                              id: equipment.room.department.department_id,
                              name: equipment.room.department.department_name,
                          },
                      }
                    : null,
                images: equipment.images
                    ? equipment.images.map((img) => ({
                          id: img.id,
                          actionType: img.action_type,
                          actionId: img.action_id,
                          imageUrl: img.image_url,
                          note: img.note,
                          uploadedBy: img.uploaded_by,
                          uploadedAt: img.uploaded_at,
                      }))
                    : [],
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
                            as: 'account',
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
                              id: equipment.room.room_id,
                              name: equipment.room.room_name,
                              note: equipment.room.notes,
                              status: equipment.room.status,
                              department: equipment.room.department
                                  ? {
                                        id: equipment.room.department
                                            .department_id,
                                        name: equipment.room.department
                                            .department_name,
                                    }
                                  : undefined,
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
    static async getEquipmentsByRoomId(roomId) {
        // Kiểm tra phòng/kho có tồn tại không
        const room = await database.Room.findOne({
            where: { room_id: roomId },
        });
        
        if (!room) {
            throw new BadRequestError('Room not found');
        }
    
        // Lấy danh sách thiết bị thuộc phòng này
        const equipments = await database.Equipment.findAll({
            where: { room_id: roomId },
            include: [
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                    attributes: ['group_equipment_code', 'group_equipment_name'],
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
                    attributes: ['room_id', 'room_name'],
                }
            ],
            order: [['create_time', 'DESC']],
        });
    
        return {
            code: 200,
            message: 'Get equipments by room successfully',
            data: equipments.map((e) => ({
                serialNumber: e.serial_number,
                dayOfFirstUse: e.day_of_first_use,
                description: e.equipment_description,
                location: e.equipment_location,
                status: e.status,
                groupEquipment: e.group_equipment
                    ? {
                          code: e.group_equipment.group_equipment_code,
                          name: e.group_equipment.group_equipment_name,
                      }
                    : null,
                room: e.room
                    ? {
                          id: e.room.id,
                          name: e.room.name,
                      }
                    : null,
                importReceipt: e.import_receipt
                    ? {
                          id: e.import_receipt.id,
                          userCode: e.import_receipt.user_code,
                          approvedBy: e.import_receipt.approved_by,
                          receivedAt: e.import_receipt.date_of_received,
                          note: e.import_receipt.note,
                      }
                    : null,
                createdAt: e.create_time,
                updatedAt: e.update_time,
            })),
        };
    }
    
    

}

module.exports = EquipmentService;
