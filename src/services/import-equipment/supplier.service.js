const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class SupplierService {
    static createNewSupplier = async ({
        name,
        description,
        address,
        phone,
        email,
    }) => {
        if (!name) {
            throw new BadRequestError('Supplier name is required');
        }

        const existingSupplier = await database.Supplier.findOne({
            where: { supplier_name: name },
        });
        if (existingSupplier) {
            throw new BadRequestError('Supplier with this name already exists');
        }

        const newSupplier = await database.Supplier.create({
            supplier_name: name,
            supplier_description: description,
            supplier_address: address,
            supplier_phone: phone,
            supplier_email: email,
        });

        return {
            code: 200,
            message: 'Create new supplier success!',
            metadata: {
                id: newSupplier.id,
                name: newSupplier.supplier_name,
                description: newSupplier.supplier_description,
                address: newSupplier.supplier_address,
                phone: newSupplier.supplier_phone,
                email: newSupplier.supplier_email,
            },
        };
    };

    static getAllSuppliers = async ({ page = 1, limit = 20 }) => {
        const offset = (page - 1) * limit;
        console.log(
            `Fetching suppliers with offset: ${offset}, limit: ${limit}`,
        );
        const suppliers = await database.Supplier.findAndCountAll({
            limit: parseInt(limit),
            offset,
            order: [['create_time', 'DESC']],
        });
        if (!suppliers) {
            throw new BadRequestError('No suppliers found');
        }

        return {
            code: 200,
            message: 'Get all suppliers success!',
            metadata: suppliers.rows.map((supplier) => ({
                id: supplier.id,
                name: supplier.supplier_name,
                description: supplier.supplier_description,
                address: supplier.supplier_address,
                phone: supplier.supplier_phone,
                email: supplier.supplier_email,
            })),
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: suppliers.count,
                totalPages: Math.ceil(suppliers.count / limit),
            },
        };
    };

    static getSupplierById = async (id) => {
        const supplier = await database.Supplier.findByPk(id);
        if (!supplier) {
            throw new BadRequestError('Supplier not found');
        }
        return {
            code: 200,
            message: 'Get supplier success!',
            metadata: {
                id: supplier.id,
                name: supplier.supplier_name,
                description: supplier.supplier_description,
                address: supplier.supplier_address,
                phone: supplier.supplier_phone,
                email: supplier.supplier_email,
            },
        };
    };

    static updateSupplier = async (updates) => {
        const supplier = await database.Supplier.findByPk(updates.id);
        if (!supplier) {
            throw new BadRequestError('Supplier not found');
        }

        await supplier.update({
            supplier_name: updates.name || supplier.supplier_name,
            supplier_description:
                updates.description || supplier.supplier_description,
            supplier_address: updates.address || supplier.supplier_address,
            supplier_phone: updates.phone || supplier.supplier_phone,
            supplier_email: updates.email || supplier.supplier_email,
        });
        return {
            code: 200,
            message: 'Supplier updated successfully',
            metadata: {
                id: supplier.id,
                name: supplier.supplier_name,
                description: supplier.supplier_description,
                address: supplier.supplier_address,
                phone: supplier.supplier_phone,
                email: supplier.supplier_email,
            },
        };
    };

    static deleteSupplier = async (id) => {
        const supplier = await database.Supplier.findByPk(id);
        if (!supplier) {
            throw new BadRequestError('Supplier not found');
        }

        await supplier.destroy();
        return { message: 'Supplier deleted successfully' };
    };
}

module.exports = SupplierService;
