const {
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom,
} = require("../services/roomService");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // JOIN ROOM
    socket.on("join-room", ({ roomId, user }) => {
      if (!roomId) return;

      socket.user = user; // Store user details (role, id, name) on socket

      // Already in same room
      if (socket.roomId === roomId) {
        const room = getRoom(roomId);
        if (room) {
          socket.emit("sync-state", {
            videoId: room.videoId,
            currentTime: room.currentTime,
            isPlaying: room.isPlaying,
          });
          io.to(roomId).emit("room-users", { users: room.users });
        }
        return;
      }

      // Leave previous room if joined
      if (socket.roomId) {
        const oldRoom = getRoom(socket.roomId);
        if (oldRoom) {
          oldRoom.users = Math.max(0, oldRoom.users - 1);
          io.to(socket.roomId).emit("room-users", { users: oldRoom.users });
          if (oldRoom.users === 0) deleteRoom(socket.roomId);
        }
        socket.leave(socket.roomId);
      }

      // Join new room
      let room = getRoom(roomId);
      if (!room) {
        room = createRoom(roomId);
      }

      socket.join(roomId);
      socket.roomId = roomId;
      room.users += 1;

      // Sync video state to newly joined user
      socket.emit("sync-state", {
        videoId: room.videoId,
        currentTime: room.currentTime,
        isPlaying: room.isPlaying,
      });

      // Broadcast updated user count
      io.to(roomId).emit("room-users", { users: room.users });
    });

    // VIDEO CHANGE (Host & Admin Only)
    socket.on("video-change", ({ roomId, videoId }) => {
      if (!roomId || !videoId) return;

      // Role Verification
      if (socket.user?.role !== "host" && socket.user?.role !== "admin") {
        return socket.emit("error-msg", "Only Hosts can change the video.");
      }

      const room = getRoom(roomId);
      if (!room) return;

      updateRoom(roomId, { videoId, currentTime: 0, isPlaying: false });
      socket.to(roomId).emit("video-change", { videoId });
    });

    // PLAY (Host & Admin Only)
    socket.on("video-play", ({ roomId, currentTime }) => {
      if (socket.user?.role !== "host" && socket.user?.role !== "admin") return;

      const room = getRoom(roomId);
      if (!room) return;

      updateRoom(roomId, { currentTime, isPlaying: true });
      socket.to(roomId).emit("video-play", { currentTime });
    });

    // PAUSE (Host & Admin Only)
    socket.on("video-pause", ({ roomId, currentTime }) => {
      if (socket.user?.role !== "host" && socket.user?.role !== "admin") return;

      const room = getRoom(roomId);
      if (!room) return;

      updateRoom(roomId, { currentTime, isPlaying: false });
      socket.to(roomId).emit("video-pause", { currentTime });
    });

    // SEEK (Host & Admin Only)
    socket.on("video-seek", ({ roomId, currentTime }) => {
      if (socket.user?.role !== "host" && socket.user?.role !== "admin") return;

      const room = getRoom(roomId);
      if (!room) return;

      updateRoom(roomId, { currentTime });
      socket.to(roomId).emit("video-seek", { currentTime });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);
      const roomId = socket.roomId;
      if (!roomId) return;

      const room = getRoom(roomId);
      if (!room) return;

      room.users = Math.max(0, room.users - 1);
      io.to(roomId).emit("room-users", { users: room.users });

      if (room.users === 0) {
        deleteRoom(roomId);
        console.log(`🗑️ Room ${roomId} deleted from memory`);
      }
    });
  });
};

module.exports = socketHandler;