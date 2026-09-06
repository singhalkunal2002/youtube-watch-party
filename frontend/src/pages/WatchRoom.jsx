import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import VideoPlayer from "../components/VideoPlayer";
import UserList from "../components/UserList";
import ChatBox from "../components/ChatBox";
import useSocket from "../hooks/useSocket";
import { getYouTubeVideoId } from "../utils/youtube";

const WatchRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const joinedRef = useRef(false);

  const [videoId, setVideoId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [users, setUsers] = useState([]);

  const [messages, setMessages] = useState([]);

  const [connected, setConnected] = useState(false);

  const [myRole, setMyRole] = useState("viewer");

  // =========================
  // USER NAME
  // =========================
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("watchPartyName") || "";
  });

  // =========================
  // ASK NAME IF NOT AVAILABLE
  // =========================
  useEffect(() => {
    if (!userName.trim()) {
      const name = window.prompt("Enter your name:");

      const finalName = name?.trim() || "Guest";

      localStorage.setItem("watchPartyName", finalName);

      setUserName(finalName);
    }
  }, [userName]);

  // =========================
  // SOCKET EVENTS
  // =========================
  useEffect(() => {
    if (!socket) return;

    // =========================
    // SYNC STATE
    // =========================
    const handleSyncState = (state) => {
      console.log("📥 SYNC STATE:", state);

      setVideoId(state.videoId || "");

      setCurrentTime(Number(state.currentTime) || 0);

      setIsPlaying(Boolean(state.isPlaying));

      const role = state.myRole || "viewer";

      console.log("🔑 MY ROLE:", role);

      setMyRole(role);
    };

    // =========================
    // USERS LIST
    // =========================
    const handleUsersList = ({ users }) => {
      console.log("👥 USERS:", users);

      if (Array.isArray(users)) {
        setUsers(users);
      } else {
        setUsers([]);
      }
    };

    // =========================
    // VIDEO CHANGE
    // =========================
    const handleVideoChange = ({ videoId }) => {
      console.log("🎬 VIDEO CHANGE:", videoId);

      setVideoId(videoId || "");

      setCurrentTime(0);

      setIsPlaying(false);
    };

    // =========================
    // ROLE UPDATED
    // =========================
    const handleRoleUpdated = ({ newRole }) => {
      console.log("🔑 ROLE UPDATED:", newRole);

      setMyRole(newRole);
    };

    // =========================
    // CHAT MESSAGE
    // =========================
    const handleChatMessage = (message) => {
      console.log("💬 CHAT MESSAGE:", message);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          user: message.user || "Guest",
          text: message.text || "",
        },
      ]);
    };

    // =========================
    // CHAT HISTORY
    // =========================
    const handleChatHistory = ({ messages }) => {
      console.log("💬 CHAT HISTORY:", messages);

      if (Array.isArray(messages)) {
        setMessages(messages);
      }
    };

    // =========================
    // ERROR
    // =========================
    const handleError = (message) => {
      console.error("❌ SERVER ERROR:", message);

      alert(message);
    };

    // =========================
    // KICKED
    // =========================
    const handleKicked = (message) => {
      alert(message);

      socket.disconnect();

      navigate("/");
    };

    socket.on("sync-state", handleSyncState);

    socket.on("room-users-list", handleUsersList);

    socket.on("video-change", handleVideoChange);

    socket.on("role-updated", handleRoleUpdated);

    socket.on("chat-message", handleChatMessage);

    socket.on("chat-history", handleChatHistory);

    socket.on("error-msg", handleError);

    socket.on("kicked", handleKicked);

    return () => {
      socket.off("sync-state", handleSyncState);

      socket.off("room-users-list", handleUsersList);

      socket.off("video-change", handleVideoChange);

      socket.off("role-updated", handleRoleUpdated);

      socket.off("chat-message", handleChatMessage);

      socket.off("chat-history", handleChatHistory);

      socket.off("error-msg", handleError);

      socket.off("kicked", handleKicked);
    };
  }, [socket, navigate]);

  // =========================
  // CONNECT + JOIN ROOM
  // =========================
  useEffect(() => {
    if (!socket || !roomId || !userName.trim()) {
      return;
    }

    const joinRoom = () => {
      if (joinedRef.current) {
        return;
      }

      joinedRef.current = true;

      setConnected(true);

      console.log("🟢 SOCKET CONNECTED:", socket.id);

      console.log("➡️ JOINING ROOM:", roomId);

      console.log("👤 USER NAME:", userName);

      socket.emit("join-room", {
        roomId,

        user: {
          name: userName.trim(),
        },
      });
    };

    const handleDisconnect = () => {
      console.log("🔴 SOCKET DISCONNECTED");

      setConnected(false);

      joinedRef.current = false;
    };

    const handleConnectError = (error) => {
      console.error("❌ CONNECTION ERROR:", error.message);

      setConnected(false);
    };

    socket.on("connect", joinRoom);

    socket.on("disconnect", handleDisconnect);

    socket.on("connect_error", handleConnectError);

    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.off("connect", joinRoom);

      socket.off("disconnect", handleDisconnect);

      socket.off("connect_error", handleConnectError);
    };
  }, [socket, roomId, userName]);

  // =========================
  // CHANGE VIDEO
  // =========================
  const changeVideo = () => {
    if (myRole !== "host" && myRole !== "moderator") {
      alert("Only Host or Moderator can change video.");

      return;
    }

    const newVideoId = getYouTubeVideoId(videoUrl);

    if (!newVideoId) {
      alert("Please enter a valid YouTube URL.");

      return;
    }

    socket.emit("change-video", {
      roomId,
      videoId: newVideoId,
    });

    setVideoUrl("");
  };

  // =========================
  // ASSIGN ROLE
  // =========================
  const handleAssignRole = (targetSocketId, newRole) => {
    if (myRole !== "host") {
      alert("Only Host can assign roles.");

      return;
    }

    socket.emit("assign-role", {
      roomId,
      targetSocketId,
      newRole,
    });
  };

  // =========================
  // REMOVE USER
  // =========================
  const handleRemoveUser = (targetSocketId) => {
    if (myRole !== "host") {
      alert("Only Host can remove users.");

      return;
    }

    const targetUser = users.find((user) => user.id === targetSocketId);

    const confirmed = window.confirm(
      `Remove ${targetUser?.name || "this user"} from the room?`,
    );

    if (!confirmed) {
      return;
    }

    socket.emit("remove-participant", {
      roomId,
      targetSocketId,
    });
  };

  // =========================
  // TRANSFER HOST
  // =========================
  const handleTransferHost = (targetSocketId) => {
    if (myRole !== "host") {
      alert("Only Host can transfer host.");

      return;
    }

    const targetUser = users.find((user) => user.id === targetSocketId);

    if (!targetUser) {
      return;
    }

    const confirmed = window.confirm(`Make ${targetUser.name} the new Host?`);

    if (!confirmed) {
      return;
    }

    socket.emit("transfer-host", {
      roomId,
      targetSocketId,
    });
  };

  // =========================
  // SEND CHAT MESSAGE
  // =========================
  const handleSendMessage = (text) => {
    if (!socket || !socket.connected) {
      alert("You are not connected.");

      return;
    }

    if (!text?.trim()) {
      return;
    }

    socket.emit("chat-message", {
      roomId,
      user: userName,
      text: text.trim(),
    });
  };

  // =========================
  // COPY ROOM ID
  // =========================
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);

      alert("Room ID copied!");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // =========================
  // LEAVE ROOM
  // =========================
  const leaveRoom = () => {
    if (socket) {
      socket.disconnect();
    }

    navigate("/");
  };

  // =========================
  // PERMISSIONS
  // =========================
  const canControl = myRole === "host" || myRole === "moderator";

  const isHost = myRole === "host";

  // =========================
  // UI
  // =========================
  return (
    <div className="watch-page">
      {/* =========================
          NAVBAR
      ========================= */}
      <header className="room-navbar">
        <div className="logo">WatchParty</div>

        <div className="room-info">
          <span>
            Room: <strong>{roomId}</strong>
          </span>

          <span>👥 {users.length}</span>

          <span>{connected ? "🟢 Connected" : "🔴 Disconnected"}</span>

          <span>👤 {userName}</span>

          <span>🔑 {myRole}</span>

          <button onClick={copyRoomId}>Copy ID</button>

          <button onClick={leaveRoom}>Leave</button>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================= */}
      <main className="watch-container">
        {/* =========================
            VIDEO SECTION
        ========================= */}
        <section className="video-section">
          <VideoPlayer
            videoId={videoId}
            socket={socket}
            roomId={roomId}
            initialTime={currentTime}
            initialPlaying={isPlaying}
            canControl={canControl}
          />

          {/* =========================
              VIDEO URL CONTROL
          ========================= */}
          <div className="video-controls">
            <input
              type="text"
              placeholder={
                canControl
                  ? "Paste YouTube URL..."
                  : "Only Host or Moderator can change video"
              }
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  changeVideo();
                }
              }}
              disabled={!canControl}
            />

            <button onClick={changeVideo} disabled={!canControl}>
              Change Video
            </button>
          </div>
        </section>

        {/* =========================
            SIDEBAR
        ========================= */}
        <aside className="sidebar">
          <h2>👥 Watch Party</h2>

          {/* CONNECTION */}
          <div className="online-status">
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>

          {/* ROOM ID */}
          <div className="party-info">
            <p>Room ID</p>

            <strong>{roomId}</strong>
          </div>

          {/* USERS COUNT */}
          <div className="party-info">
            <p>Users watching</p>

            <strong>👥 {users.length}</strong>
          </div>

          {/* CURRENT USER */}
          <div className="party-info">
            <p>You</p>

            <strong>👤 {userName}</strong>

            <small>Role: {myRole}</small>
          </div>

          {/* =========================
              USER LIST
          ========================= */}
          <UserList
            users={users}
            currentUserSocketId={socket?.id}
            onAssignRole={handleAssignRole}
            onRemoveUser={handleRemoveUser}
            onTransferHost={handleTransferHost}
            isHost={isHost}
          />

          {/* =========================
              CHAT BOX
          ========================= */}
          <ChatBox messages={messages} onSendMessage={handleSendMessage} />

          {/* =========================
              SYNC INFO
          ========================= */}
          <div className="sync-info">
            <h3>🔄 Real-Time Sync</h3>

            <p>
              {canControl
                ? "You can control playback for everyone."
                : "You can watch only. Playback is controlled by Host or Moderator."}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default WatchRoom;
