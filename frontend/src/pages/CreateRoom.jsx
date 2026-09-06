import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("host");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleAction = (actionType) => {
    const generatedId = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    let idToUse = roomIdInput.trim().toUpperCase();

    // Create Room
    if (actionType === "create") {
      idToUse = idToUse || generatedId;
    }

    // Join Room
    else if (!idToUse) {
      alert("Please enter a Room ID to join.");
      return;
    }

    // User name
    const nameToUse = userName.trim() || `${selectedRole.toUpperCase()} User`;

    // ⭐ Save user name
    localStorage.setItem("watchPartyName", nameToUse);

    // ⭐ Save selected role for this room
    localStorage.setItem(`user_role_${idToUse}`, selectedRole);

    console.log("👤 User Name:", nameToUse);
    console.log("🔑 User Role:", selectedRole);
    console.log("🏠 Room ID:", idToUse);

    // Go to Watch Room
    navigate(`/room/${idToUse}`, {
      state: {
        user: {
          role: selectedRole,
          name: nameToUse,
        },
      },
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>🎬</div>

          <h1 style={styles.title}>WatchParty</h1>

          <p style={styles.subtitle}>
            Watch videos together with role-based permissions
          </p>
        </div>

        {/* Name */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Your Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Room Code */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Room Code</label>

          <input
            type="text"
            placeholder="Enter Room Code (e.g. X8K2P9)"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Role */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Select Your Role</label>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={styles.select}
          >
            <option value="host">👑 Host (Full Control & Admin)</option>

            <option value="moderator">🛡️ Moderator (Playback & Chat)</option>

            <option value="participant">🎙️ Participant (Chat & React)</option>

            <option value="viewer">👁️ Viewer (Watch Only)</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleAction("create")}
            style={styles.btnPrimary}
          >
            ➕ Create Room
          </button>

          <button
            onClick={() => handleAction("join")}
            style={styles.btnSecondary}
          >
            🚪 Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f12",
    backgroundImage:
      "radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f0f12 70%)",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: "20px",
  },

  card: {
    backgroundColor: "rgba(23, 23, 33, 0.75)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "36px",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
    textAlign: "center",
  },

  header: {
    marginBottom: "24px",
  },

  logoBadge: {
    fontSize: "40px",
    marginBottom: "8px",
  },

  title: {
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: "700",
    margin: "0 0 6px 0",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: 0,
    lineHeight: "1.4",
  },

  inputGroup: {
    marginBottom: "16px",
    textAlign: "left",
  },

  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "6px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    backgroundColor: "#181824",
    border: "1px solid #2e2e42",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  select: {
    width: "100%",
    padding: "12px 14px",
    backgroundColor: "#181824",
    border: "1px solid #2e2e42",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  },

  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },

  btnPrimary: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  btnSecondary: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#27273a",
    color: "#e2e8f0",
    border: "1px solid #3f3f5a",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default CreateRoom;
