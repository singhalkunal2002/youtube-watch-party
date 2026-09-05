const rooms = new Map();

const createRoom = (roomId) => {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            roomId,
            videoId: "",
            currentTime: 0,
            isPlaying: false,
            users: 0,
        });
    }

    return rooms.get(roomId);
};

const getRoom = (roomId) => {
    return rooms.get(roomId);
};

const updateRoom = (roomId, data) => {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }

    Object.assign(room, data);

    return room;
};

const deleteRoom = (roomId) => {
    rooms.delete(roomId);
};

const getAllRooms = () => {
    return rooms;
};

module.exports = {
    createRoom,
    getRoom,
    updateRoom,
    deleteRoom,
    getAllRooms,
};