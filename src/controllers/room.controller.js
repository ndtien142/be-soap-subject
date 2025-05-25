'use strict';

const RoomService = require('../services/department/room.service');
const { CREATED, SuccessResponse } = require('../core/success.response');

class RoomController {
    createRoom = async (req, res, next) => {
        new CREATED({
            message: 'Create room successfully',
            metadata: await RoomService.createRoom(req.body),
        }).send(res);
    };

    updateRoom = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update room successfully',
            metadata: await RoomService.updateRoom(req.body),
        }).send(res);
    };

    deleteRoom = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete room successfully',
            metadata: await RoomService.deleteRoom(req.params.roomId),
        }).send(res);
    };

    getAllRooms = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all rooms successfully',
            metadata: await RoomService.getAllRooms(req.query),
        }).send(res);
    };

    getRoomById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get room by ID successfully',
            metadata: await RoomService.getRoomById(req.params.roomId),
        }).send(res);
    };
}

module.exports = new RoomController();
