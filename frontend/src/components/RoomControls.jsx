import React, { useState } from "react";

const RoomControls = ({ onCreateRoom, onJoinRoom }) => {
  const [userName, setUserName] = useState(
    localStorage.getItem("watchPartyName") || "",
  );

  const [inputCode, setInputCode] = useState("");

  const [error, setError] = useState("");

  // ==========================================
  // CREATE ROOM
  // ==========================================

  const handleCreate = (e) => {
    e.preventDefault();

    const name = userName.trim();

    if (!name) {
      alert("Please enter your name first!");

      return;
    }

    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    localStorage.setItem("watchPartyName", name);

    onCreateRoom(newCode, name);
  };

  // ==========================================
  // JOIN ROOM
  // ==========================================

  const handleJoin = (e) => {
    e.preventDefault();

    const name = userName.trim();

    if (!name) {
      alert("Please enter your name first!");

      return;
    }

    const formattedCode = inputCode.trim().toUpperCase();

    if (!formattedCode) {
      setError("Please enter room code.");

      return;
    }

    /*
      IMPORTANT:

      localStorage se room check nahi karna.

      Har browser/device ka localStorage
      alag hota hai.

      Backend socket room handle karega.
    */

    setError("");

    localStorage.setItem("watchPartyName", name);

    onJoinRoom(formattedCode, name);
  };

  return (
    <div className="room-card">
      <h1>Start a Watch Party</h1>

      <p>Enter your name and create or join a room to watch together.</p>

      {/* NAME */}

      <input
        type="text"
        placeholder="Enter your name..."
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        style={{
          marginBottom: "20px",
        }}
        required
      />

      {/* CREATE */}

      <button
        onClick={handleCreate}
        className="primary-button"
        style={{
          width: "100%",
          marginBottom: "15px",
        }}
      >
        Create New Room
      </button>

      <div className="divider">OR</div>

      {/* JOIN */}

      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Enter Room Code"
          value={inputCode}
          onChange={(e) => {
            setInputCode(e.target.value);

            setError("");
          }}
        />

        {error && (
          <p
            style={{
              color: "#ef4444",
              fontSize: "13px",
              marginBottom: "10px",
              textAlign: "left",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="secondary-button"
          style={{
            width: "100%",
          }}
        >
          Join Room
        </button>
      </form>
    </div>
  );
};

export default RoomControls;
