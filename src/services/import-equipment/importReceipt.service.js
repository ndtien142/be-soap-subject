const { BadRequestError } = require('../../core/error.response');
const { IMPORT_RECEIPT_STATUS } = require('../../common/constant.common');
const database = require('../../models');

class ImportReceiptService {
    static async createImportReceipt({
        supplier,
        items,
        dateOfReceived,
        dateOfOrder,
        note,
        user,
    }) {
        const transaction = await database.sequelize.transaction();

        // Check if supplier exists
        const supplierData = await database.Supplier.findOne({
            where: { id: supplier.id },
            transaction,
        });
        if (!supplierData) {
            throw new BadRequestError('Supplier not found');
        }

        // Check if items exist
        if (!items || items.length === 0) {
            throw new BadRequestError('No items found');
        }
        const itemsList = await database.GroupEquipment.findAll({
            where: {
                group_equipment_code: items.map((item) => item.code),
            },
            transaction,
        });
        if (itemsList.length !== items.length) {
            throw new BadRequestError('Some items not found');
        }

        // Check if user exists
        const userData = await database.Account.findOne({
            where: { user_code: user.userCode },
            transaction,
        });
        if (!userData) {
            throw new BadRequestError('User not found');
        }

        // Validate dateOfReceived
        if (!dateOfReceived || isNaN(new Date(dateOfReceived))) {
            throw new BadRequestError('Invalid date of received');
        }

        // Create import receipt
        const importReceipt = await database.ImportReceipt.create(
            {
                supplier_id: supplierData.id,
                date_of_order: dateOfOrder,
                date_of_received: dateOfReceived,
                user_code: userData.user_code,
                note,
                status: IMPORT_RECEIPT_STATUS.requested,
            },
            { transaction },
        );

        // Create detail import receipt entries
        await Promise.all(
            items.map((item) => {
                const groupEquipment = itemsList.find(
                    (eq) => eq.group_equipment_code === item.code,
                );
                return database.DetailImportReceipt.create(
                    {
                        import_receipt_id: importReceipt.id,
                        group_equipment_code:
                            groupEquipment.group_equipment_code,
                        price: item.price,
                        quantity: item.quantity,
                    },
                    { transaction },
                );
            }),
        );

        await transaction.commit();

        return {
            code: 200,
            message: 'Import receipt created successfully',
            metadata: {
                id: importReceipt.id,
                supplier: {
                    id: supplierData.id,
                    name: supplierData.name,
                    address: supplierData.address,
                    phone: supplierData.phone,
                    email: supplierData.email,
                },
                dateOfReceived,
                user: {
                    code: userData.user_code,
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                },
                note,
                status: importReceipt.status,
                items: items.map((item) => ({
                    code: item.code,
                    price: item.price,
                    quantity: item.quantity,
                })),
            },
        };
    }

    static async updateImportReceiptStatus(
        importReceiptId,
        status,
        reason = null,
        user,
    ) {
        // Check if the import receipt exists
        const importReceipt = await database.ImportReceipt.findOne({
            where: { id: importReceiptId },
        });
        if (!importReceipt) {
            throw new BadRequestError('Import receipt not found');
        }

        // Validate status transition
        if (importReceipt.status !== IMPORT_RECEIPT_STATUS.requested) {
            throw new BadRequestError(
                `Cannot update import receipt with status: ${importReceipt.status}`,
            );
        }

        // Update the status and optionally add a reason and approver
        if (status === IMPORT_RECEIPT_STATUS.approved) {
            importReceipt.status = IMPORT_RECEIPT_STATUS.approved;
            if (user) {
                console.log('User:', user);
                importReceipt.approve_by = user.userCode;
            }
        } else if (status === IMPORT_RECEIPT_STATUS.rejected) {
            importReceipt.status = IMPORT_RECEIPT_STATUS.rejected;
            importReceipt.note = reason || 'No reason provided';
            if (user) {
                importReceipt.approve_by = user.userCode;
            }
        } else {
            throw new BadRequestError('Invalid status update');
        }

        await importReceipt.save();

        return {
            code: 200,
            message: `Import receipt ${status} successfully`,
            metadata: {
                id: importReceipt.id,
                status: importReceipt.status,
                note: importReceipt.note,
                approveBy: importReceipt.approve_by,
                updatedAt: importReceipt.updatedAt,
            },
        };
    }

    static async processSuccessfulImport(importReceiptId) {
        const importReceipt = await database.ImportReceipt.findOne({
            where: { id: importReceiptId },
            include: [
                {
                    model: database.Supplier,
                    as: 'Supplier',
                    attributes: [
                        'id',
                        'supplier_name',
                        'supplier_address',
                        'supplier_phone',
                        'supplier_email',
                    ],
                },
                {
                    model: database.Account,
                    as: 'Account',
                    attributes: ['user_code', 'username', 'email', 'is_active'],
                },
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                    attributes: [
                        'group_equipment_code',
                        'group_equipment_name',
                        'equipment_type_id',
                        'equipment_manufacturer_id',
                    ],
                },
            ],
        });
        if (!importReceipt) {
            throw new BadRequestError('Import receipt not found');
        }

        // Ensure the import receipt is approved
        if (importReceipt.status !== IMPORT_RECEIPT_STATUS.approved) {
            throw new BadRequestError(
                `Cannot process import receipt with status: ${importReceipt.status}`,
            );
        }

        // Create equipment entries for each item in the detail import receipt
        const createdEquipments = [];
        for (const detail of importReceipt.group_equipment) {
            const month = new Date().getMonth() + 1;
            const date = new Date().getDate();

            for (let i = 0; i < detail.DetailImportReceipt.quantity; i++) {
                // crate serial number
                const serialNumber = `${detail.group_equipment_code}-${date}.${month}-${importReceiptId}-${i + 1}`;

                const equipment = await database.Equipment.create({
                    serial_number: serialNumber,
                    group_equipment_code: detail.group_equipment_code,
                    status: 'available',
                    import_receipt_id: importReceiptId,
                    equipment_description: `date: ${date}, month: ${month}, import receipt id: ${importReceiptId}`,
                    equipment_location: null,
                    day_of_first_use: null,
                    room_id: null,
                });
                createdEquipments.push(equipment);
            }
        }

        // Update the import receipt status to completed
        importReceipt.status = 'received';
        importReceipt.date_of_actual_received = new Date()
            .toISOString()
            .split('T')[0];
        await importReceipt.save();

        return {
            code: 200,
            message:
                'Import receipt processed successfully, and equipment created',
            metadata: {
                id: importReceipt.id,
                dateOfOrder: importReceipt.date_of_order,
                dateOfReceived: importReceipt.date_of_received,
                dateOfActualReceived: importReceipt.date_of_actual_received,
                status: importReceipt.status,
                note: importReceipt.note,
                supplier: {
                    id: importReceipt.Supplier.id,
                    name: importReceipt.Supplier.supplier_name,
                    address: importReceipt.Supplier.supplier_address,
                    phone: importReceipt.Supplier.supplier_phone,
                    email: importReceipt.Supplier.supplier_email,
                },
                user: {
                    code: importReceipt.Account.user_code,
                    username: importReceipt.Account.username,
                    email: importReceipt.Account.email,
                    isActive: importReceipt.Account.is_active,
                },
                items: importReceipt.group_equipment.map((detail) => ({
                    code: detail.group_equipment_code,
                    name: detail.group_equipment_name,
                    price: detail.DetailImportReceipt.price,
                    quantity: detail.DetailImportReceipt.quantity,
                })),
                createdEquipments: createdEquipments.map((eq) => ({
                    serialNumber: eq.serial_number,
                    groupEquipmentCode: eq.group_equipment_code,
                    status: eq.status,
                })),
                updatedAt: importReceipt.updatedAt,
            },
        };
    }

    static async getAllImportReceipts({ page = 1, limit = 20 }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const importReceipts = await database.ImportReceipt.findAndCountAll({
            limit: parseInt(limit),
            offset,
            include: [
                {
                    model: database.Supplier,
                    as: 'Supplier',
                    attributes: [
                        'id',
                        'supplier_name',
                        'supplier_address',
                        'supplier_phone',
                        'supplier_email',
                    ],
                },
                {
                    model: database.Account,
                    as: 'Account',
                    attributes: ['user_code', 'username', 'email', 'is_active'],
                },
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                    attributes: [
                        'group_equipment_code',
                        'group_equipment_name',
                    ],
                },
            ],
        });

        if (!importReceipts.rows.length) {
            throw new BadRequestError('No import receipts found');
        }

        return {
            code: 200,
            message: 'Get all import receipts successfully',
            metadata: importReceipts.rows.map((receipt) => ({
                id: receipt.id,
                dateOfOrder: receipt.date_of_order,
                dateOfReceived: receipt.date_of_received,
                dateOfActualReceived: receipt.date_of_actual_received,
                status: receipt.status,
                note: receipt.note,
                supplier: {
                    id: receipt.Supplier.id,
                    name: receipt.Supplier.supplier_name,
                    address: receipt.Supplier.supplier_address,
                    phone: receipt.Supplier.supplier_phone,
                    email: receipt.Supplier.supplier_email,
                },
                requestedUser: {
                    code: receipt.Account.user_code,
                    username: receipt.Account.username,
                    email: receipt.Account.email,
                    isActive: receipt.Account.is_active,
                },
                items: receipt.group_equipment.map((item) => ({
                    code: item.group_equipment_code,
                    name: item.group_equipment_name,
                    price: parseInt(item.DetailImportReceipt?.price) || null,
                    quantity: item.DetailImportReceipt?.quantity || null,
                })),
            })),
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: importReceipts.count,
                totalPages: Math.ceil(importReceipts.count / limit),
            },
        };
    }

    static async getImportReceiptDetails(importReceiptId) {
        const importReceipt = await database.ImportReceipt.findOne({
            where: { id: importReceiptId },
            include: [
                {
                    model: database.Supplier,
                    as: 'Supplier',
                    attributes: [
                        'id',
                        'supplier_name',
                        'supplier_address',
                        'supplier_phone',
                        'supplier_email',
                    ],
                },
                {
                    model: database.Account,
                    as: 'Account',
                    attributes: ['user_code', 'username', 'email', 'is_active'],
                },
                {
                    model: database.GroupEquipment,
                    as: 'group_equipment',
                },
            ],
        });

        if (importReceipt.approve_by) {
            const approver = await database.Account.findOne({
                where: { user_code: importReceipt.approve_by },
                attributes: ['user_code', 'username', 'email', 'is_active'],
            });
            importReceipt.approvedBy = {
                code: approver.user_code,
                username: approver.username,
                email: approver.email,
                isActive: approver.is_active,
            };
        }

        if (!importReceipt) {
            throw new BadRequestError('Import receipt not found');
        }

        return {
            code: 200,
            message: 'Get import receipt details successfully',
            metadata: {
                id: importReceipt.id,
                dateOfOrder: importReceipt.date_of_order,
                dateOfReceived: importReceipt.date_of_received,
                dateOfActualReceived: importReceipt.date_of_actual_received,
                status: importReceipt.status,
                note: importReceipt.note,
                supplier: {
                    id: importReceipt.Supplier.id,
                    name: importReceipt.Supplier.supplier_name,
                    address: importReceipt.Supplier.supplier_address,
                    phone: importReceipt.Supplier.supplier_phone,
                    email: importReceipt.Supplier.supplier_email,
                },
                requestedUser: {
                    code: importReceipt.Account.user_code,
                    username: importReceipt.Account.username,
                    email: importReceipt.Account.email,
                    isActive: importReceipt.Account.is_active,
                },
                approvedBy: importReceipt.approvedBy || null,
                items: importReceipt.group_equipment.map((item) => ({
                    code: item.group_equipment_code,
                    name: item.group_equipment_name,
                    price: item.DetailImportReceipt.price,
                    quantity: item.DetailImportReceipt.quantity,
                })),
            },
        };
    }
}

module.exports = ImportReceiptService;
