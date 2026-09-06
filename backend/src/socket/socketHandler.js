const rooms = new Map();

const socketHandler = (io) => {
  // =========================
  // GET ROOM
  // =========================
  const getRoom = (roomId) => {
    return rooms.get(roomId);
  };

  // =========================
  // GET USER
  // =========================
  const getUser = (socket, roomId) => {
    const room = getRoom(roomId);

    if (!room) {
      socket.emit("error-msg", "Room does not exist.");
      return null;
    }

    const user = room.users.get(socket.id);

    if (!user) {
      socket.emit("error-msg", "You are not in this room.");
      return null;
    }

    return {
      room,
      user,
    };
  };

  // =========================
  // PLAYBACK PERMISSION
  // =========================
  const canControl = (user) => {
    return user.role === "host" || user.role === "moderator";
  };

  // =========================
  // BROADCAST USERS
  // =========================
  const broadcastUsers = (roomId) => {
    const room = rooms.get(roomId);

    if (!room) return;

    const users = Array.from(room.users.values()).map((user) => ({
      id: user.id,
      name: user.name || "Guest",
      role: user.role || "participant",
    }));

    io.to(roomId).emit("room-users-list", {
      users,
    });
  };

  // =========================
  // SOCKET CONNECTION
  // =========================
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // ==================================================
    // JOIN ROOM
    // ==================================================
    socket.on("join-room", ({ roomId, user }) => {
      try {
        if (!roomId) {
          socket.emit("error-msg", "Room ID is required.");
          return;
        }

        const name = user?.name?.trim() || "Guest";

        // =========================
        // CREATE ROOM
        // =========================
        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            roomId,
            videoId: "",
            currentTime: 0,
            isPlaying: false,
            hostId: null,
            users: new Map(),
            messages: [],
          });

          console.log("🏠 Room created:", roomId);
        }

        const room = rooms.get(roomId);

        // =========================
        // HOST
        // =========================
        if (!room.hostId || !room.users.has(room.hostId)) {
          room.hostId = socket.id;
        }

        // =========================
        // ROLE
        // =========================
        const role = socket.id === room.hostId ? "host" : "participant";

        const newUser = {
          id: socket.id,
          name,
          role,
        };

        room.users.set(socket.id, newUser);

        socket.join(roomId);
        socket.roomId = roomId;

        console.log("=================================");
        console.log("👤 USER JOINED:", newUser);
        console.log("🆔 SOCKET:", socket.id);
        console.log("🔑 ROLE:", role);
        console.log("👑 HOST ID:", room.hostId);
        console.log("🏠 ROOM:", roomId);
        console.log("🎬 VIDEO:", room.videoId);
        console.log("⏱️ TIME:", room.currentTime);
        console.log("▶️ PLAYING:", room.isPlaying);
        console.log("👥 TOTAL USERS:", room.users.size);
        console.log("=================================");

        // =========================
        // SEND CURRENT STATE
        // =========================
        socket.emit("sync-state", {
          videoId: room.videoId,
          currentTime: room.currentTime,
          isPlaying: room.isPlaying,
          myRole: role,
        });

        // =========================
        // CHAT HISTORY
        // =========================
        socket.emit("chat-history", {
          messages: room.messages,
        });

        // =========================
        // USERS
        // =========================
        broadcastUsers(roomId);
      } catch (error) {
        console.error("❌ Join error:", error);

        socket.emit("error-msg", "Unable to join room.");
      }
    });

    // ==================================================
    // CHAT
    // ==================================================
    socket.on("chat-message", ({ roomId, user, text }) => {
      const result = getUser(socket, roomId);

      if (!result) return;

      const { room } = result;

      if (!text || !text.trim()) {
        return;
      }

      const currentUser = room.users.get(socket.id);

      const message = {
        user: currentUser?.name || user?.trim() || "Guest",
        text: text.trim(),
      };

      room.messages.push(message);

      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }

      io.to(roomId).emit("chat-message", message);
    });

    // ==================================================
    // CHANGE VIDEO
    // ==================================================
    socket.on("change-video", ({ roomId, videoId }) => {
      const result = getUser(socket, roomId);

      if (!result) return;

      const { room, user } = result;

      if (!canControl(user)) {
        socket.emit("error-msg", "Only Host or Moderator can change video.");
        return;
      }

      if (!videoId) {
        socket.emit("error-msg", "Video ID is required.");
        return;
      }

      room.videoId = videoId;
      room.currentTime = 0;
      room.isPlaying = false;

      console.log(`🎬 VIDEO CHANGE by ${user.name}: ${videoId}`);

      io.to(roomId).emit("video-change", {
        videoId,
      });
    });

    // ==================================================
    // PLAY
    // ==================================================
    socket.on("play", ({ roomId, currentTime }) => {
      const result = getUser(socket, roomId);

      if (!result) return;

      const { room, user } = result;

      if (!canControl(user)) {
        socket.emit("error-msg", "Only Host or Moderator can play.");
        return;
      }

      room.currentTime = Number(currentTime) || 0;

      room.isPlaying = true;

      console.log(`▶️ PLAY by ${user.name} at ${room.currentTime}`);

      socket.to(roomId).emit("remote-play", {
        currentTime: room.currentTime,
      });
    });

    // ==================================================
    // PAUSE
    // ==================================================
    socket.on("pause", ({ roomId, currentTime }) => {
      const result = getUser(socket, roomId);

      if (!result) return;

      const { room, user } = result;

      if (!canControl(user)) {
        socket.emit("error-msg", "Only Host or Moderator can pause.");
        return;
      }

      room.currentTime = Number(currentTime) || 0;

      room.isPlaying = false;

      console.log(`⏸️ PAUSE by ${user.name} at ${room.currentTime}`);

      socket.to(roomId).emit("remote-pause", {
        currentTime: room.currentTime,
      });
    });

    // ==================================================
    // SEEK
    // ==================================================
    socket.on("seek", ({ roomId, currentTime }) => {
      const result = getUser(socket, roomId);

      if (!result) return;

      const { room, user } = result;

      if (!canControl(user)) {
        socket.emit("error-msg", "Only Host or Moderator can seek.");
        return;
      }

      room.currentTime = Number(currentTime) || 0;

      console.log(`⏩ SEEK by ${user.name} at ${room.currentTime}`);

      socket.to(roomId).emit("remote-seek", {
        currentTime: room.currentTime,
      });
    });

    // ==================================================
    // CONTINUOUS TIME SYNC
    // ==================================================
    socket.on("sync-progress", ({ roomId, currentTime }) => {
      const result = getUser(socket, roomId);

      if (!result) return;

      const { room, user } = result;

      if (!canControl(user)) {
        return;
      }

      if (!room.isPlaying) {
        return;
      }

      const time = Number(currentTime) || 0;

      room.currentTime = time;

      // Send latest time to everyone else
      socket.to(roomId).emit("remote-time", {
        currentTime: time,
      });
    });

    // ==================================================
    // ASSIGN ROLE
    // ==================================================
    socket.on("assign-role", ({ roomId, targetSocketId, newRole }) => {
      const result = getUser(socket, roomId);

      if (!result) return;

      const { room, user } = result;

      if (user.role !== "host") {
        socket.emit("error-msg", "Only Host can assign roles.");
        return;
      }

      const allowedRoles = ["moderator", "participant", "viewer"];

      if (!allowedRoles.includes(newRole)) {
        socket.emit("error-msg", "Invalid role.");
        return;
      }

      const targetUser = room.users.get(targetSocketId);

      if (!targetUser) {
        socket.emit("error-msg", "User not found.");
        return;
      }

      if (targetUser.role === "host") {
        socket.emit("error-msg", "Host role cannot be changed.");
        return;
      }

      targetUser.role = newRole;

      io.to(targetSocketId).emit("role-updated", {
        newRole,
      });

      broadcastUsers(roomId);
    });

    // ==================================================
    // TRANSFER HOST
    // ==================================================
    socket.on("transfer-host", ({ roomId, targetSocketId }) => {
      const result = getUser(socket, roomId);

      if (!result) return;

      const { room, user } = result;

      if (user.role !== "host") {
        socket.emit("error-msg", "Only Host can transfer host.");
        return;
      }

      const targetUser = room.users.get(targetSocketId);

      if (!targetUser) {
        socket.emit("error-msg", "User not found.");
        return;
      }

      if (targetSocketId === socket.id) {
        socket.emit("error-msg", "You are already the Host.");
        return;
      }

      user.role = "participant";
      targetUser.role = "host";

      room.hostId = targetSocketId;

      socket.emit("role-updated", {
        newRole: "participant",
      });

      io.to(targetSocketId).emit("role-updated", {
        newRole: "host",
      });

      broadcastUsers(roomId);
    });

    // ==================================================
    // REMOVE PARTICIPANT
    // ==================================================
    socket.on("remove-participant", ({ roomId, targetSocketId }) => {
      const result = getUser(socket, roomId);

      if (!result) return;

      const { room, user } = result;

      if (user.role !== "host") {
        socket.emit("error-msg", "Only Host can remove users.");
        return;
      }

      const targetUser = room.users.get(targetSocketId);

      if (!targetUser) {
        socket.emit("error-msg", "User not found.");
        return;
      }

      if (targetSocketId === socket.id) {
        socket.emit("error-msg", "Host cannot remove himself.");
        return;
      }

      if (targetUser.role === "host") {
        socket.emit("error-msg", "Host cannot be removed.");
        return;
      }

      room.users.delete(targetSocketId);

      const targetSocket = io.sockets.sockets.get(targetSocketId);

      if (targetSocket) {
        targetSocket.leave(roomId);
        targetSocket.roomId = null;

        targetSocket.emit(
          "kicked",
          "You have been removed from the room by the Host.",
        );
      }

      broadcastUsers(roomId);
    });

    // ==================================================
    // DISCONNECT
    // ==================================================
    socket.on("disconnect", () => {
      const roomId = socket.roomId;

      console.log("🔴 Disconnected:", socket.id);

      if (!roomId) return;

      const room = rooms.get(roomId);

      if (!room) return;

      const leavingUser = room.users.get(socket.id);

      if (!leavingUser) return;

      const wasHost = leavingUser.role === "host";

      room.users.delete(socket.id);

      console.log(`👋 ${leavingUser.name} left the room.`);

      // =========================
      // HOST LEFT
      // =========================
      if (wasHost && room.users.size > 0) {
        const nextHost = room.users.values().next().value;

        if (nextHost) {
          nextHost.role = "host";

          room.hostId = nextHost.id;

          io.to(nextHost.id).emit("role-updated", {
            newRole: "host",
          });
        }
      }

      // =========================
      // ROOM EMPTY
      // =========================
      if (room.users.size === 0) {
        rooms.delete(roomId);

        console.log("🗑️ Room deleted:", roomId);

        return;
      }

      broadcastUsers(roomId);
    });
  });
};

module.exports = socketHandler;
