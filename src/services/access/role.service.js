'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class RoleService {
    static async createRole({ roleName, roleDescription, permissions = [] }) {
        // Check if role already exists
        const existing = await database.Role.findOne({
            where: { role_name: roleName },
        });
        if (existing) {
            throw new BadRequestError('Role name already exists');
        }

        const role = await database.Role.create({
            role_name: roleName,
            role_description: roleDescription,
        });

        // Set permissions if provided (accepts array of {id, slug})
        if (Array.isArray(permissions) && permissions.length > 0) {
            const permissionIds = permissions.map((p) => p.id).filter(Boolean);
            const permissionSlugs = permissions
                .map((p) => p.slug)
                .filter(Boolean);

            let foundPermissions = [];
            if (permissionIds.length > 0) {
                foundPermissions = await database.Permission.findAll({
                    where: { id: permissionIds },
                });
            }
            if (permissionSlugs.length > 0) {
                const slugPermissions = await database.Permission.findAll({
                    where: { slug: permissionSlugs },
                });
                // Merge, avoiding duplicates
                const ids = new Set(foundPermissions.map((p) => p.id));
                for (const p of slugPermissions) {
                    if (!ids.has(p.id)) foundPermissions.push(p);
                }
            }
            await role.setPermissions(foundPermissions);
        }

        return {
            code: 200,
            message: 'Role created successfully',
            data: {
                id: role.id,
                roleName: role.role_name,
                roleDescription: role.role_description,
                createdAt: role.create_time,
                updatedAt: role.update_time,
            },
        };
    }

    static async updateRole({ id, roleName, roleDescription, permissions }) {
        const role = await database.Role.findByPk(id);
        if (!role) {
            throw new BadRequestError('Role not found');
        }

        if (roleName) role.role_name = roleName;
        if (roleDescription !== undefined)
            role.role_description = roleDescription;
        await role.save();

        // Update permissions if provided (accepts array of {id, slug})
        if (Array.isArray(permissions)) {
            const permissionIds = permissions.map((p) => p.id).filter(Boolean);
            const permissionSlugs = permissions
                .map((p) => p.slug)
                .filter(Boolean);

            let foundPermissions = [];
            if (permissionIds.length > 0) {
                foundPermissions = await database.Permission.findAll({
                    where: { id: permissionIds },
                });
            }
            if (permissionSlugs.length > 0) {
                const slugPermissions = await database.Permission.findAll({
                    where: { slug: permissionSlugs },
                });
                // Merge, avoiding duplicates
                const ids = new Set(foundPermissions.map((p) => p.id));
                for (const p of slugPermissions) {
                    if (!ids.has(p.id)) foundPermissions.push(p);
                }
            }
            await role.setPermissions(foundPermissions);
        }

        return {
            code: 200,
            message: 'Role updated successfully',
            data: {
                id: role.id,
                roleName: role.role_name,
                roleDescription: role.role_description,
                createdAt: role.create_time,
                updatedAt: role.update_time,
            },
        };
    }

    static async deleteRole(id) {
        const role = await database.Role.findByPk(id);
        if (!role) {
            throw new BadRequestError('Role not found');
        }

        // Remove all associations before deleting
        await role.setPermissions([]);
        await role.destroy();

        return {
            code: 200,
            message: 'Role deleted successfully',
        };
    }

    static async getAllRoles({ page = 1, limit = 20 }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await database.Role.findAndCountAll({
            limit: parseInt(limit),
            offset,
            include: [
                {
                    model: database.Permission,
                    as: 'permissions',
                    through: { attributes: [] },
                },
            ],
            order: [['id', 'ASC']],
        });

        return {
            code: 200,
            message: 'Get all roles successfully',
            metadata: result.rows.map((r) => ({
                id: r.id,
                roleName: r.role_name,
                roleDescription: r.role_description,
                permissions:
                    r.permissions?.map((p) => ({
                        id: p.id,
                        permissionName: p.permission_name,
                        permissionDescription: p.permission_description,
                        slug: p.slug,
                    })) || [],
                createdAt: r.create_time,
                updatedAt: r.update_time,
            })),
            meta: {
                currentPage: parseInt(page),
                itemPerPage: parseInt(limit),
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    static async getRoleById(id) {
        const role = await database.Role.findByPk(id, {
            include: [
                {
                    model: database.Permission,
                    as: 'permissions',
                    through: { attributes: [] },
                },
            ],
        });
        if (!role) {
            throw new BadRequestError('Role not found');
        }

        return {
            code: 200,
            message: 'Get role by ID successfully',
            data: {
                id: role.id,
                roleName: role.role_name,
                roleDescription: role.role_description,
                permissions:
                    role.permissions?.map((p) => ({
                        id: p.id,
                        permissionName: p.permission_name,
                        permissionDescription: p.permission_description,
                        slug: p.slug,
                    })) || [],
                createdAt: role.create_time,
                updatedAt: role.update_time,
            },
        };
    }
}

module.exports = RoleService;
