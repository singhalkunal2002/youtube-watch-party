import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a room ID");
      return;
    }

    navigate(`/room/${roomId.trim().toUpperCase()}`);
  };

  return (
    <div className="create-page">
      <div className="room-card">
        <h1>🎬 Watch Party</h1>

        <p>Create a new room or join an existing room.</p>

        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button className="primary-button" onClick={joinRoom}>
          Join Room
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <button className="secondary-button" onClick={generateRoomId}>
          Generate Room ID
        </button>

        {roomId && (
          <div className="generated-room">
            <p>Your Room ID</p>
            <strong>{roomId}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoom;