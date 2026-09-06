import React, { useState } from "react";

const ChatBox = ({ messages = [], onSendMessage }) => {
  const [text, setText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText("");
    }
  };

  return (
    <div className="sidebar" style={{ marginTop: "15px" }}>
      <h2>Live Chat</h2>
      <div
        className="party-info"
        style={{
          maxHeight: "150px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {messages.length === 0 ? (
          <p>No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <p
              key={index}
              style={{
                background: "#1e293b",
                padding: "6px 8px",
                borderRadius: "6px",
              }}
            >
              <strong style={{ color: "#38bdf8" }}>{msg.user}: </strong>{" "}
              {msg.text}
            </p>
          ))
        )}
      </div>

      <form
        onSubmit={handleSend}
        style={{ display: "flex", gap: "5px", marginTop: "10px" }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            background: "#0f172a",
            border: "1px solid #475569",
            borderRadius: "6px",
            color: "white",
          }}
        />
        <button
          type="submit"
          className="primary-button"
          style={{ padding: "8px 12px" }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
