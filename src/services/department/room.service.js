'use strict';

const { BadRequestError } = require('../../core/error.response');
const database = require('../../models');

class RoomService {
    static async createRoom({ roomId, roomName, departmentId, notes }) {
        // Check if room already exists
        const existing = await database.Room.findOne({
            where: { room_id: roomId },
        });
        if (existing) {
            throw new BadRequestError('Room ID already exists');
        }

        // Check if department exists
        const department = await database.Department.findOne({
            where: { department_id: departmentId },
        });
        if (!department) {
            throw new BadRequestError('Department not found');
        }

        const room = await database.Room.create({
            room_id: roomId,
            room_name: roomName,
            department_id: departmentId,
            notes,
            status: true,
        });

        return {
            code: 200,
            message: 'Room created successfully',
            data: {
                id: room.room_id,
                name: room.room_name,
                department: {
                    id: room.department_id,
                    name: department.department_name,
                    notes: department.notes,
                    status: department.status,
                },
                notes: room.notes,
                status: room.status,
                createdAt: room.create_time,
                updatedAt: room.update_time,
            },
        };
    }

    static async updateRoom({ roomId, roomName, departmentId, notes, status }) {
        const room = await database.Room.findOne({
            where: { room_id: roomId },
        });
        if (!room) {
            throw new BadRequestError('Room not found');
        }

        if (roomName) room.room_name = roomName;
        if (departmentId) {
            const department = await database.Department.findOne({
                where: { department_id: departmentId },
            });
            if (!department) {
                throw new BadRequestError('Department not found');
            }
            room.department_id = departmentId;
        }
        if (notes !== undefined) room.notes = notes;
        if (status !== undefined) room.status = status;

        await room.save();

        return {
            code: 200,
            message: 'Room updated successfully',
            data: {
                roomId: room.room_id,
                roomName: room.room_name,
                departmentId: room.department_id,
                notes: room.notes,
                status: room.status,
                createdAt: room.create_time,
                updatedAt: room.update_time,
            },
        };
    }

    static async deleteRoom(roomId) {
        const room = await database.Room.findOne({
            where: { room_id: roomId },
        });
        if (!room) {
            throw new BadRequestError('Room not found');
        }

        room.status = false;
        await room.save();

        return {
            code: 200,
            message: 'Room deleted (deactivated) successfully',
        };
    }

    static async getAllRooms({ page = 1, limit = 20 }) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await database.Room.findAndCountAll({
            limit: parseInt(limit),
            offset,
            order: [['create_time', 'DESC']],
            include: [
                {
                    model: database.Department,
                    as: 'department',
                    attributes: [
                        'department_id',
                        'department_name',
                        'notes',
                        'status',
                    ],
                },
            ],
        });

        return {
            code: 200,
            message: 'Get all rooms successfully',
            metadata: result.rows.map((r) => ({
                id: r.room_id,
                name: r.room_name,
                department: {
                    id: r.department.department_id,
                    name: r.department.department_name,
                    notes: r.department.notes,
                    status: r.department.status,
                },
                notes: r.notes,
                status: r.status,
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

    static async getRoomById(roomId) {
        const room = await database.Room.findOne({
            where: { room_id: roomId },
            include: [
                {
                    model: database.Department,
                    as: 'department',
                    attributes: [
                        'department_id',
                        'department_name',
                        'notes',
                        'status',
                    ],
                },
            ],
        });
        if (!room) {
            throw new BadRequestError('Room not found');
        }

        return {
            code: 200,
            message: 'Get room by ID successfully',
            data: {
                roomId: room.room_id,
                roomName: room.room_name,
                department: {
                    id: room.department.department_id,
                    name: room.department.department_name,
                    notes: room.department.notes,
                    status: room.department.status,
                },
                notes: room.notes,
                status: room.status,
                createdAt: room.create_time,
                updatedAt: room.update_time,
            },
        };
    }
}

module.exports = RoomService;
