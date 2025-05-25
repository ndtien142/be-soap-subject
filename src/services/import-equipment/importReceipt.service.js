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
            where: { user_code: user.code },
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
            data: {
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

        // Update the status and optionally add a reason
        if (status === IMPORT_RECEIPT_STATUS.approved) {
            importReceipt.status = IMPORT_RECEIPT_STATUS.approved;
        } else if (status === IMPORT_RECEIPT_STATUS.rejected) {
            importReceipt.status = IMPORT_RECEIPT_STATUS.rejected;
            importReceipt.note = reason || 'No reason provided';
        } else {
            throw new BadRequestError('Invalid status update');
        }

        await importReceipt.save();

        return {
            code: 200,
            message: `Import receipt ${status} successfully`,
            data: {
                id: importReceipt.id,
                status: importReceipt.status,
                note: importReceipt.note,
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
                    model: database.DetailImportReceipt,
                    as: 'DetailImportReceipts',
                    include: [
                        {
                            model: database.GroupEquipment,
                            as: 'GroupEquipment',
                            attributes: [
                                'group_equipment_code',
                                'group_equipment_name',
                            ],
                        },
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

        // Create detail equipment entries for each item
        const createdDetails = [];
        for (const detail of importReceipt.DetailImportReceipts) {
            const { group_equipment_code, quantity } = detail;

            for (let i = 0; i < quantity; i++) {
                const serialNumber = `${group_equipment_code}-${Date.now()}-${i}`;
                const newDetail = await database.Equipment.create({
                    serial_number: serialNumber,
                    group_equipment_code,
                    status: DETAIL_EQUIPMENT_STATUS.available,
                    import_receipt_id: importReceiptId,
                    equipment_description: null,
                    equipment_location: null,
                    day_of_first_use: null,
                });
                createdDetails.push(newDetail);
            }
        }

        // Update the import receipt status to completed
        importReceipt.status = IMPORT_RECEIPT_STATUS.completed;
        await importReceipt.save();

        return {
            code: 200,
            message:
                'Import receipt processed successfully, and detail equipment created',
            data: {
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
                items: importReceipt.DetailImportReceipts.map((detail) => ({
                    groupEquipmentCode: detail.group_equipment_code,
                    groupEquipmentName:
                        detail.GroupEquipment.group_equipment_name,
                    price: detail.price,
                    quantity: detail.quantity,
                })),
                createdDetails: createdDetails.map((detail) => ({
                    serialNumber: detail.serial_number,
                    groupEquipmentCode: detail.group_equipment_code,
                    status: detail.status,
                    location: detail.equipment_location,
                    description: detail.equipment_description,
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
                user: {
                    code: receipt.Account.user_code,
                    username: receipt.Account.username,
                    email: receipt.Account.email,
                    isActive: receipt.Account.is_active,
                },
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
                    model: database.DetailImportReceipt,
                    as: 'DetailImportReceipts',
                    include: [
                        {
                            model: database.GroupEquipment,
                            as: 'GroupEquipment',
                            attributes: [
                                'group_equipment_code',
                                'group_equipment_name',
                            ],
                        },
                    ],
                },
            ],
        });

        if (!importReceipt) {
            throw new BadRequestError('Import receipt not found');
        }

        return {
            code: 200,
            message: 'Get import receipt details successfully',
            data: {
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
                items: importReceipt.DetailImportReceipts.map((detail) => ({
                    groupEquipmentCode: detail.group_equipment_code,
                    groupEquipmentName:
                        detail.GroupEquipment.group_equipment_name,
                    price: detail.price,
                    quantity: detail.quantity,
                })),
            },
        };
    }
}

module.exports = ImportReceiptService;
