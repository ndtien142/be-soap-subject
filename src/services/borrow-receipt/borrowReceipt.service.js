'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');
const { Op } = require('sequelize');

class BorrowReceiptService {
    static async createBorrowReceipt({
        user,
        borrowDate,
        returnDate,
        note,
        roomId,
        groups, // array of { groupEquipmentCode, quantity, note }
    }) {
        const transaction = await database.sequelize.transaction();

        // Validate user
        const foundUser = await database.Account.findOne({
            where: { user_code: user.userCode },
            transaction,
        });
        if (!user) throw new BadRequestError('User not found');

        // Validate room
        const foundRoom = await database.Room.findOne({
            where: { room_id: roomId },
            transaction,
        });
        if (!foundRoom) throw new BadRequestError('Room not found');

        // Create borrow receipt
        const borrowReceipt = await database.BorrowReceipt.create(
            {
                return_date: returnDate || null,
                user_code: foundUser.user_code,
                status: 'requested',
                note,
                room_id: roomId,
                borrow_date: borrowDate || null,
            },
            { transaction },
        );

        if (!Array.isArray(groups) || groups.length === 0) {
            throw new BadRequestError('Groups must be a non-empty array');
        }

        // Create BorrowRequestItem for each group
        for (const group of groups) {
            const { groupEquipmentCode, quantity, note: groupNote } = group;
            if (!groupEquipmentCode || !quantity || quantity <= 0) {
                throw new BadRequestError(
                    'Each group must have groupEquipmentCode and quantity > 0',
                );
            }
            await database.BorrowRequestItem.create(
                {
                    borrow_id: borrowReceipt.id,
                    equipment_code: groupEquipmentCode,
                    quantity,
                    note: groupNote,
                },
                { transaction },
            );
        }

        await transaction.commit();

        return {
            id: borrowReceipt.id,
            userCode: borrowReceipt.user_code,
            createdTime: borrowReceipt.create_time,
            borrowDate: borrowReceipt.borrow_date,
            returnDate: borrowReceipt.return_date,
            status: borrowReceipt.status,
            note: borrowReceipt.note,
            roomId: borrowReceipt.room_id,
            groups,
        };
    }

    static async approveBorrowReceipt(id, approverCode) {
        const transaction = await database.sequelize.transaction();

        const borrowReceipt = await database.BorrowReceipt.findByPk(id, {
            transaction,
        });
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'requested') {
            throw new BadRequestError(
                'Only requested receipts can be approved',
            );
        }

        // Get all request items for this receipt
        const requestItems = await database.BorrowRequestItem.findAll({
            where: { borrow_id: id },
            transaction,
        });

        // For each group, check virtual available
        for (const item of requestItems) {
            const groupEquipmentCode = item.equipment_code;
            const requestedQty = item.quantity;

            // Real available
            const availableInWarehouse = await database.Equipment.count({
                where: {
                    group_equipment_code: groupEquipmentCode,
                    status: 'available',
                },
                transaction,
            });

            // Sum of approved but not yet borrowed for this group (excluding this receipt)
            // Find all approved receipts except this one
            const approvedReceipts = await database.BorrowReceipt.findAll({
                where: {
                    status: 'approved',
                    id: { [Op.ne]: id },
                },
                attributes: ['id'],
                transaction,
            });
            const approvedReceiptIds = approvedReceipts.map((r) => r.id);

            let approvedNotBorrowed = 0;
            if (approvedReceiptIds.length > 0) {
                approvedNotBorrowed =
                    (await database.BorrowRequestItem.sum('quantity', {
                        where: {
                            equipment_code: groupEquipmentCode,
                            borrow_id: { [Op.in]: approvedReceiptIds },
                        },
                        transaction,
                    })) || 0;
            }

            const virtualAvailable = availableInWarehouse - approvedNotBorrowed;
            if (virtualAvailable < requestedQty) {
                throw new BadRequestError(
                    `Not enough virtual available equipment for group ${groupEquipmentCode} (requested: ${requestedQty}, available: ${virtualAvailable})`,
                );
            }
        }

        borrowReceipt.status = 'approved';
        borrowReceipt.approve_by = approverCode;
        await borrowReceipt.save({ transaction });

        await transaction.commit();

        return { id: borrowReceipt.id, status: borrowReceipt.status };
    }

    static async rejectBorrowReceipt(id, approverCode, reason) {
        const borrowReceipt = await database.BorrowReceipt.findByPk(id);
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'requested') {
            throw new BadRequestError(
                'Only requested receipts can be rejected',
            );
        }

        borrowReceipt.status = 'rejected';
        borrowReceipt.approve_by = approverCode;
        borrowReceipt.note = reason || borrowReceipt.note;
        await borrowReceipt.save();

        return {
            code: 200,
            message: 'Borrow receipt rejected',
            data: {
                id: borrowReceipt.id,
                status: borrowReceipt.status,
                note: borrowReceipt.note,
            },
        };
    }

    static async markAsBorrowed(id, scannedSerialNumbers) {
        // scannedSerialNumbers: [{ groupEquipmentCode, serialNumbers: [serial_number, ...] }]
        const transaction = await database.sequelize.transaction();

        const borrowReceipt = await database.BorrowReceipt.findByPk(id, {
            transaction,
        });
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'approved') {
            throw new BadRequestError(
                'Only approved receipts can be marked as borrowed',
            );
        }

        // Get all request items for this receipt
        const requestItems = await database.BorrowRequestItem.findAll({
            where: { borrow_id: id },
            transaction,
        });

        // Validate scannedSerialNumbers matches request quantities
        for (const reqItem of requestItems) {
            const groupEquipmentCode = reqItem.equipment_code;
            const requestedQty = reqItem.quantity;
            const scannedGroup = scannedSerialNumbers.find(
                (g) => g.groupEquipmentCode === groupEquipmentCode,
            );
            if (
                !scannedGroup ||
                !Array.isArray(scannedGroup.serialNumbers) ||
                scannedGroup.serialNumbers.length !== requestedQty
            ) {
                throw new BadRequestError(
                    `Scanned serial numbers for group ${groupEquipmentCode} do not match requested quantity`,
                );
            }
            // Check all serials are available and belong to the group
            const equipments = await database.Equipment.findAll({
                where: {
                    serial_number: scannedGroup.serialNumbers,
                    group_equipment_code: groupEquipmentCode,
                    status: 'available',
                },
                transaction,
            });
            if (equipments.length !== requestedQty) {
                throw new BadRequestError(
                    `Some serial numbers for group ${groupEquipmentCode} are not available or do not belong to the group`,
                );
            }
        }

        // Create BorrowReceiptDetail and update equipment status
        for (const scannedGroup of scannedSerialNumbers) {
            for (const serialNumber of scannedGroup.serialNumbers) {
                await database.BorrowReceiptDetail.create(
                    {
                        borrow_receipt_id: id,
                        serial_number: serialNumber,
                        note: '', // use empty string for note, matches model/table
                        create_time: new Date(),
                        update_time: new Date(),
                    },
                    { transaction },
                );
                await database.Equipment.update(
                    { status: 'reserved', room_id: borrowReceipt.room_id },
                    { where: { serial_number: serialNumber }, transaction },
                );
            }
        }

        borrowReceipt.status = 'borrowed';
        await borrowReceipt.save({ transaction });

        await transaction.commit();

        return { id: borrowReceipt.id, status: borrowReceipt.status };
    }

    static async markAsReturned(id) {
        const borrowReceipt = await database.BorrowReceipt.findByPk(id);
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');
        if (borrowReceipt.status !== 'borrowed') {
            throw new BadRequestError(
                'Only borrowed receipts can be marked as returned',
            );
        }

        borrowReceipt.status = 'returned';
        await borrowReceipt.save();

        // Set equipment status back to 'available'
        const details = await database.BorrowReceiptDetail.findAll({
            where: { borrow_receipt_id: id },
        });
        const serialNumbers = details.map((d) => d.serial_number);
        await database.Equipment.update(
            { status: 'available' },
            { where: { serial_number: serialNumbers } },
        );

        return {
            code: 200,
            message: 'Borrow receipt marked as returned',
            data: { id: borrowReceipt.id, status: borrowReceipt.status },
        };
    }

    /**
     * Lấy danh sách phiếu mượn với filter, sắp xếp, phân trang
     * @param {object} options
     * @param {number} options.page
     * @param {number} options.limit
     * @param {string} [options.status]
     * @param {string} [options.userCode]
     * @param {string} [options.sortBy] - column name
     * @param {string} [options.sortOrder] - ASC | DESC
     */
    static async getAllBorrowReceipts({
        page = 1,
        limit = 20,
        status,
        userCode,
        sortBy = 'create_time',
        sortOrder = 'DESC',
    }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (userCode) where.user_code = userCode;

        const result = await database.BorrowReceipt.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            include: [
                { model: database.Account, as: 'account' },
                {
                    model: database.Room,
                    as: 'room',
                    include: [{ model: database.Department, as: 'department' }],
                },
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                    include: [
                        { model: database.EquipmentType, as: 'equipment_type' },
                        {
                            model: database.EquipmentManufacturer,
                            as: 'equipment_manufacturer',
                        },
                    ],
                },
            ],
            order: [[sortBy, sortOrder]],
        });

        return {
            code: 200,
            message: 'Get all borrow receipts successfully',
            metadata: result.rows.map((receipt) => {
                return {
                    id: receipt.id,
                    userCode: receipt.user_code,
                    borrowDate: receipt.borrow_date,
                    createdTime: receipt.create_time,
                    returnDate: receipt.return_date,
                    status: receipt.status,
                    note: receipt.note,
                    room: {
                        roomId: receipt.room.room_id,
                        roomName: receipt.room.room_name,
                        roomStatus: receipt.room.status,
                        department: {
                            departmentId: receipt.room.department.department_id,
                            departmentName:
                                receipt.room.department.department_name,
                        },
                    },
                    requestedBy: {
                        userCode: receipt.account.user_code,
                        fullName: receipt.account.full_name,
                        username: receipt.account.username,
                        phone: receipt.account.phone_number,
                        email: receipt.account.email,
                    },
                    requestItems: receipt.group_equipment.map((group) => {
                        return {
                            groupEquipmentCode: group.group_equipment_code,
                            name: group.group_equipment_name,
                            quantity: group.BorrowRequestItem.quantity,
                            note: group.BorrowRequestItem.note,
                            type: {
                                id: group.equipment_type.id,
                                name: group.equipment_type.equipment_type_name,
                                description:
                                    group.equipment_type
                                        .equipment_type_description,
                            },
                            manufacturer: {
                                id: group.equipment_manufacturer.id,
                                name: group.equipment_manufacturer
                                    .manufacturer_name,
                                contactInfo:
                                    group.equipment_manufacturer.contact_info,
                                address: group.equipment_manufacturer.address,
                            },
                        };
                    }),
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

    static async getBorrowReceiptDetails(id) {
        const borrowReceipt = await database.BorrowReceipt.findOne({
            where: { id },
            include: [
                { model: database.Account, as: 'account' },
                {
                    model: database.Equipment,
                    as: 'equipment',
                },
                {
                    model: database.Room,
                    as: 'room',
                    include: [{ model: database.Department, as: 'department' }],
                },
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                    include: [
                        { model: database.EquipmentType, as: 'equipment_type' },
                        {
                            model: database.EquipmentManufacturer,
                            as: 'equipment_manufacturer',
                        },
                    ],
                },
            ],
        });
        if (!borrowReceipt)
            throw new BadRequestError('Borrow receipt not found');

        return {
            code: 200,
            message: 'Get borrow receipt details successfully',
            metadata: {
                id: borrowReceipt.id,
                userCode: borrowReceipt.user_code,
                returnDate: borrowReceipt.return_date,
                status: borrowReceipt.status,
                note: borrowReceipt.note,
                room: {
                    roomId: borrowReceipt.room.room_id,
                    roomName: borrowReceipt.room.room_name,
                    roomStatus: borrowReceipt.room.status,
                    department: {
                        departmentId:
                            borrowReceipt.room.department.department_id,
                        departmentName:
                            borrowReceipt.room.department.department_name,
                    },
                },
                requestedBy: {
                    userCode: borrowReceipt.account.user_code,
                    fullName: borrowReceipt.account.full_name,
                    username: borrowReceipt.account.username,
                    phone: borrowReceipt.account.phone_number,
                    email: borrowReceipt.account.email,
                },
                borrowEquipments: borrowReceipt.equipment.map((eq) => ({
                    serialNumber: eq.serial_number,
                    groupEquipmentCode: eq.group_equipment_code,
                    status: eq.status,
                })),
                requestItems: borrowReceipt.group_equipment.map((group) => ({
                    groupEquipmentCode: group.group_equipment_code,
                    name: group.group_equipment_name,
                    quantity: group.BorrowRequestItem.quantity,
                    note: group.BorrowRequestItem.note,
                    type: {
                        id: group.equipment_type.id,
                        name: group.equipment_type.equipment_type_name,
                        description:
                            group.equipment_type.equipment_type_description,
                    },
                    manufacturer: {
                        id: group.equipment_manufacturer.id,
                        name: group.equipment_manufacturer.manufacturer_name,
                        contactInfo: group.equipment_manufacturer.contact_info,
                        address: group.equipment_manufacturer.address,
                    },
                })),
            },
        };
    }

    static async checkEquipmentAvailable({ groups }) {
        // groups: [{ groupEquipmentCode, quantity }]
        console.log(groups);
        if (!Array.isArray(groups) || groups.length === 0) {
            throw new BadRequestError('groups is required');
        }
        const results = [];
        let allAvailable = true; // Variable to check if all groups are available

        for (const group of groups) {
            const { groupEquipmentCode, quantity } = group;
            if (!groupEquipmentCode || !quantity || quantity <= 0) {
                throw new BadRequestError(
                    'Each group must have groupEquipmentCode and quantity > 0',
                );
            }
            const availableCount = await database.Equipment.count({
                where: {
                    group_equipment_code: groupEquipmentCode,
                    status: 'available',
                },
            });
            const isAvailable = availableCount >= quantity;
            if (!isAvailable) allAvailable = false;

            results.push({
                groupEquipmentCode,
                requested: quantity,
                available: isAvailable,
                availableCount,
            });
        }
        return {
            code: 200,
            results,
            allAvailable, // true if all groups are available
        };
    }

    /**
     * Scan and export a single equipment for a borrow receipt.
     * @param {number} borrowReceiptId
     * @param {string} serialNumber
     * @returns {object}
     */
    static async scanAndExportEquipment({ borrowReceiptId, serialNumber }) {
        const transaction = await database.sequelize.transaction();

        try {
            // 1️⃣ Tìm phiếu và kiểm tra trạng thái
            const borrowReceipt = await database.BorrowReceipt.findByPk(
                borrowReceiptId,
                { transaction },
            );
            if (!borrowReceipt)
                throw new BadRequestError('Borrow receipt not found');
            if (
                borrowReceipt.status !== 'approved' &&
                borrowReceipt.status !== 'partial_borrowed' &&
                borrowReceipt.status !== 'processing'
            ) {
                throw new BadRequestError(
                    'Receipt must be approved or partial_borrowed to export equipment',
                );
            }

            // 2️⃣ Tìm thiết bị và kiểm tra
            const equipment = await database.Equipment.findOne({
                where: { serial_number: serialNumber },
                transaction,
            });
            if (!equipment) throw new BadRequestError('Equipment not found');
            if (equipment.status !== 'available') {
                throw new BadRequestError(
                    'Equipment is not available for borrowing',
                );
            }

            // 3️⃣ Tạo BorrowReceiptDetail
            await database.BorrowReceiptDetail.create(
                {
                    borrow_receipt_id: parseInt(borrowReceiptId),
                    serial_number: serialNumber,
                },
                { transaction },
            );

            // 4️⃣ Cập nhật thiết bị sang reserved
            await database.Equipment.update(
                { status: 'reserved', room_id: borrowReceipt.room_id },
                { where: { serial_number: serialNumber }, transaction },
            );

            // 5️⃣ Lấy danh sách request items (group + quantity)
            const requestItems = await database.BorrowRequestItem.findAll({
                where: { borrow_id: borrowReceiptId },
                attributes: ['equipment_code', 'quantity'],
                transaction,
            });

            // 6️⃣ Đếm số lượng serial_number đã scan theo group
            const scannedCounts = await database.BorrowReceipt.findAll({
                where: { id: borrowReceiptId },
                include: [
                    {
                        model: database.Equipment,
                        attributes: ['group_equipment_code', 'serial_number'],
                        as: 'equipment',
                    },
                ],
                transaction,
            });

            // Tạo map đếm group_equipment_code
            const scannedMap = {};
            scannedCounts.forEach((item) => {
                item.equipment.forEach((eq) => {
                    scannedMap[eq.group_equipment_code] =
                        (scannedMap[eq.group_equipment_code] || 0) + 1;
                });
            });

            // 7️⃣ Kiểm tra từng requestItem để quyết định status
            let allGroupsDone = true;
            for (const req of requestItems) {
                const scannedQty = scannedMap[req.equipment_code] || 0;
                if (scannedQty < req.quantity) {
                    allGroupsDone = false;
                    break;
                }

                if (scannedQty > req.quantity) {
                    throw new BadRequestError(
                        `Scanned quantity for group ${req.equipment_code} exceeds requested quantity`,
                    );
                }
            }

            // 8️⃣ Cập nhật status phiếu
            let newStatus = borrowReceipt.status;

            if (allGroupsDone) {
                newStatus = 'borrowed';
                // Update tất cả thiết bị sang in_use + day_of_first_use
                const serialNumbers = [];
                scannedCounts.forEach((item) => {
                    serialNumbers.push(
                        ...item.equipment.map((eq) => eq.serial_number),
                    );
                });
                if (serialNumbers.length > 0) {
                    await database.Equipment.update(
                        {
                            status: 'in_use',
                            day_of_first_use: database.sequelize.literal(
                                'CASE WHEN day_of_first_use IS NULL THEN NOW() ELSE day_of_first_use END',
                            ),
                        },
                        {
                            where: { serial_number: serialNumbers },
                            transaction,
                        },
                    );
                }
            } else {
                newStatus = 'processing';
            }

            borrowReceipt.status = newStatus;
            await borrowReceipt.save({ transaction });

            await transaction.commit();

            return {
                borrowReceiptId,
                serialNumber,
                status: newStatus,
                // Thêm báo cáo số lượng cho rõ ràng
                scannedCounts: scannedMap,
                requestItems: requestItems.map((r) => ({
                    equipment_code: r.equipment_code,
                    requested: r.quantity,
                    scanned: scannedMap[r.equipment_code] || 0,
                })),
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Delete a scanned equipment from a borrow receipt (undo scan).
     * @param {number} borrowReceiptId
     * @param {string} serialNumber
     * @returns {object}
     */
    static async deleteScannedEquipment({ borrowReceiptId, serialNumber }) {
        const transaction = await database.sequelize.transaction();

        try {
            // 1️⃣ Kiểm tra phiếu
            const borrowReceipt = await database.BorrowReceipt.findByPk(
                borrowReceiptId,
                { transaction },
            );
            if (!borrowReceipt)
                throw new BadRequestError('Borrow receipt not found');
            if (
                borrowReceipt.status !== 'processing' &&
                borrowReceipt.status !== 'borrowed'
            ) {
                throw new BadRequestError(
                    'Can only remove equipment when receipt is in processing or borrowed status',
                );
            }

            // 2️⃣ Kiểm tra chi tiết
            const detail = await database.BorrowReceiptDetail.findOne({
                where: {
                    borrow_receipt_id: borrowReceiptId,
                    serial_number: serialNumber,
                },
                transaction,
            });

            if (!detail) {
                throw new BadRequestError(
                    'Scanned equipment not found in this receipt',
                );
            }

            // 3️⃣ Xóa chi tiết
            await database.BorrowReceiptDetail.destroy({
                where: {
                    borrow_receipt_id: borrowReceiptId,
                    serial_number: serialNumber,
                },
                transaction,
            });

            // 4️⃣ Đổi trạng thái thiết bị lại 'available'
            await database.Equipment.update(
                { status: 'available', room_id: null },
                { where: { serial_number: serialNumber }, transaction },
            );

            // 5️⃣ Đếm lại số lượng thiết bị đã scan theo group
            const requestItems = await database.BorrowRequestItem.findAll({
                where: { borrow_id: borrowReceiptId },
                attributes: ['equipment_code', 'quantity'],
                transaction,
            });

            const scannedCounts = await database.BorrowReceipt.findAll({
                include: [
                    {
                        model: database.Equipment,
                        attributes: ['group_equipment_code'],
                        as: 'equipment',
                    },
                ],
                where: { id: borrowReceiptId },
                transaction,
            });

            const scannedMap = {};
            scannedCounts.forEach((item) => {
                item.equipment.forEach((eq) => {
                    scannedMap[eq.group_equipment_code] =
                        (scannedMap[eq.group_equipment_code] || 0) + 1;
                });
            });

            // 6️⃣ Xác định trạng thái mới
            let newStatus = 'approved';
            let hasAnyScanned = scannedCounts.length > 0;

            if (hasAnyScanned) {
                let allGroupsDone = true;
                for (const req of requestItems) {
                    const scannedQty = scannedMap[req.equipment_code] || 0;
                    if (scannedQty < req.quantity) {
                        allGroupsDone = false;
                        break;
                    }
                }
                newStatus = allGroupsDone ? 'borrowed' : 'processing';
            }

            borrowReceipt.status = newStatus;
            await borrowReceipt.save({ transaction });

            await transaction.commit();

            return {
                borrowReceiptId,
                serialNumber,
                newStatus,
                message:
                    'Scanned equipment deleted and status updated successfully',
                scannedCounts: scannedMap,
                requestItems: requestItems.map((r) => ({
                    equipment_code: r.equipment_code,
                    requested: r.quantity,
                    scanned: scannedMap[r.equipment_code] || 0,
                })),
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Check available status for all items in a borrow receipt.
     * @param {number} borrowReceiptId
     * @returns {object}
     */
    static async getListAvailableOfBorrowReceipt(borrowReceiptId) {
        // Get all request items for this receipt
        const requestItems = await database.BorrowRequestItem.findAll({
            where: { borrow_id: borrowReceiptId },
            attributes: ['equipment_code', 'quantity'],
        });

        const results = [];
        let allAvailable = true; // Track if all groups are available

        for (const item of requestItems) {
            const groupEquipmentCode = item.equipment_code;
            const requestedQty = item.quantity;

            // Get group equipment info
            const groupEquipment = await database.GroupEquipment.findOne({
                where: { group_equipment_code: groupEquipmentCode },
                attributes: [
                    'group_equipment_code',
                    'group_equipment_name',
                    'group_equipment_description',
                    'equipment_type_id',
                    'equipment_manufacturer_id',
                ],
                include: [
                    {
                        model: database.EquipmentType,
                        as: 'equipment_type',
                        attributes: ['id', 'equipment_type_name'],
                    },
                    {
                        model: database.EquipmentManufacturer,
                        as: 'equipment_manufacturer',
                        attributes: ['id', 'manufacturer_name'],
                    },
                ],
            });

            // Count available equipment for this group
            const availableCount = await database.Equipment.count({
                where: {
                    group_equipment_code: groupEquipmentCode,
                    status: 'available',
                },
            });

            const isAvailable = availableCount >= requestedQty;
            if (!isAvailable) allAvailable = false;

            results.push({
                groupEquipmentCode,
                groupEquipmentName:
                    groupEquipment?.group_equipment_name || null,
                groupEquipmentDescription:
                    groupEquipment?.group_equipment_description || null,
                equipmentType: {
                    id: groupEquipment?.equipment_type_id || null,
                    name:
                        groupEquipment?.equipment_type?.equipment_type_name ||
                        null,
                },
                equipmentManufacturer: {
                    id: groupEquipment?.equipment_manufacturer_id || null,
                    name:
                        groupEquipment?.equipment_manufacturer
                            ?.manufacturer_name || null,
                },
                requested: requestedQty,
                available: isAvailable,
                availableCount,
            });
        }

        return {
            code: 200,
            metadata: results,
            allAvailable,
            message: 'Available status checked successfully',
        };
    }
}

module.exports = BorrowReceiptService;
