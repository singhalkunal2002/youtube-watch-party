import React from "react";

const Navbar = ({ roomCode, onLeaveRoom }) => {
  return (
    <nav className={roomCode ? "room-navbar" : "navbar"}>
      <div className="logo">WatchParty</div>
      {roomCode && (
        <div className="room-info">
          <span>Room Code: <strong>{roomCode}</strong></span>
          <button onClick={onLeaveRoom}>Leave Room</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;