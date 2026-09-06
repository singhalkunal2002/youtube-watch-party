import React from "react";

const UserList = ({
  users = [],
  currentUserSocketId,
  onAssignRole,
  onRemoveUser,
  onTransferHost,
  isHost = false,
}) => {
  const getRoleBadge = (role) => {
    switch (role) {
      case "host":
        return {
          label: "👑 HOST",
          bg: "#f59e0b",
          color: "#000",
        };

      case "moderator":
        return {
          label: "🛡️ MOD",
          bg: "#a855f7",
          color: "#fff",
        };

      case "participant":
        return {
          label: "🙋 PARTICIPANT",
          bg: "#3b82f6",
          color: "#fff",
        };

      case "viewer":
      default:
        return {
          label: "👁️ VIEWER",
          bg: "#334155",
          color: "#cbd5e1",
        };
    }
  };

  return (
    <div
      className="sidebar"
      style={{
        marginBottom: "15px",
      }}
    >
      <h2>👥 Participants ({users.length})</h2>

      <div
        className="party-info"
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {users.length === 0 ? (
          <p>No participants</p>
        ) : (
          users.map((u) => {
            const badge = getRoleBadge(u.role);

            const isMe = u.id === currentUserSocketId;

            return (
              <div
                key={u.id}
                style={{
                  background: "#0f172a",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                }}
              >
                {/* USER */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {u.name}

                    {isMe && (
                      <span
                        style={{
                          color: "#38bdf8",
                          fontSize: "11px",
                          marginLeft: "4px",
                        }}
                      >
                        (You)
                      </span>
                    )}
                  </span>

                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "bold",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      backgroundColor: badge.bg,
                      color: badge.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* ==================================
                      HOST CONTROLS
                  ================================== */}

                {isHost && !isMe && u.role !== "host" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      marginTop: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* MOD */}

                    {u.role !== "moderator" && (
                      <button
                        onClick={() => onAssignRole(u.id, "moderator")}
                        style={{
                          fontSize: "9px",
                          padding: "4px 7px",
                          background: "#7c3aed",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Make Mod
                      </button>
                    )}

                    {/* PARTICIPANT */}

                    {u.role !== "participant" && (
                      <button
                        onClick={() => onAssignRole(u.id, "participant")}
                        style={{
                          fontSize: "9px",
                          padding: "4px 7px",
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Participant
                      </button>
                    )}

                    {/* VIEWER */}

                    {u.role !== "viewer" && (
                      <button
                        onClick={() => onAssignRole(u.id, "viewer")}
                        style={{
                          fontSize: "9px",
                          padding: "4px 7px",
                          background: "#475569",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Viewer
                      </button>
                    )}

                    {/* TRANSFER HOST */}

                    <button
                      onClick={() => onTransferHost(u.id)}
                      style={{
                        fontSize: "9px",
                        padding: "4px 7px",
                        background: "#f59e0b",
                        color: "#000",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Make Host
                    </button>

                    {/* KICK */}

                    <button
                      onClick={() => onRemoveUser(u.id)}
                      style={{
                        fontSize: "9px",
                        padding: "4px 7px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Kick
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserList;
