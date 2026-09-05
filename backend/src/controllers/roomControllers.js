const generateRoomId = require("../utils/generateRoomId");

const {
    createRoom,
    getRoom,
} = require("../services/roomService");

const createNewRoom = (req, res) => {
    try {
        const roomId = generateRoomId();

        const room = createRoom(roomId);

        res.status(201).json({
            success: true,
            message: "Room created successfully",
            room,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create room",
        });
    }
};

const getRoomDetails = (req, res) => {
    try {
        const { roomId } = req.params;

        const room = getRoom(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        res.json({
            success: true,
            room,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get room",
        });
    }
};

module.exports = {
    createNewRoom,
    getRoomDetails,
};