import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import useSocket from "../hooks/useSocket";
import { getYouTubeVideoId } from "../utils/youtube";

const WatchRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const socket = useSocket();

    const [videoId, setVideoId] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [users, setUsers] = useState(1);
    const [connected, setConnected] = useState(false);

    console.log("WatchRoom loaded:", roomId);


    // ==========================================
    // ROOM STATE + USERS LISTENER
    // IMPORTANT: YE JOIN SE PEHLE HONA CHAHIYE
    // ==========================================
    useEffect(() => {
        if (!socket) return;

        const handleSyncState = (state) => {
            console.log("Room state received:", state);

            setVideoId(state.videoId || "");
            setCurrentTime(state.currentTime || 0);
            setIsPlaying(state.isPlaying || false);
        };

        const handleRoomUsers = ({ users }) => {
            console.log("🔥 USERS UPDATED:", users);

            setUsers(users);
        };

        socket.on("sync-state", handleSyncState);
        socket.on("room-users", handleRoomUsers);

        return () => {
            socket.off("sync-state", handleSyncState);
            socket.off("room-users", handleRoomUsers);
        };
    }, [socket]);


    // ==========================================
    // SOCKET CONNECT + JOIN ROOM
    // ==========================================
    useEffect(() => {
        if (!socket) return;

        const joinRoom = () => {
            console.log("🟢 Socket connected:", socket.id);

            setConnected(true);

            console.log("➡️ Joining room:", roomId);

            socket.emit("join-room", {
                roomId,
            });
        };

        const handleDisconnect = () => {
            console.log("🔴 Socket disconnected");

            setConnected(false);
        };

        const handleConnectError = (error) => {
            console.error("❌ Socket connection error:", error.message);

            setConnected(false);
        };

        socket.on("connect", joinRoom);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        // Agar socket already connected hai
        if (socket.connected) {
            joinRoom();
        }

        return () => {
            socket.off("connect", joinRoom);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket, roomId]);


    // ==========================================
    // VIDEO CHANGE LISTENER
    // ==========================================
    useEffect(() => {
        if (!socket) return;

        const handleVideoChange = ({ videoId }) => {
            console.log("🎬 Video changed:", videoId);

            setVideoId(videoId);
            setCurrentTime(0);
            setIsPlaying(false);
        };

        socket.on("video-change", handleVideoChange);

        return () => {
            socket.off("video-change", handleVideoChange);
        };
    }, [socket]);


    // ==========================================
    // CHANGE VIDEO
    // ==========================================
    const changeVideo = () => {
        const newVideoId = getYouTubeVideoId(videoUrl);

        if (!newVideoId) {
            alert("Please enter a valid YouTube URL");
            return;
        }

        console.log("🎬 Changing video:", newVideoId);

        setVideoId(newVideoId);
        setCurrentTime(0);
        setIsPlaying(false);

        socket.emit("video-change", {
            roomId,
            videoId: newVideoId,
        });

        setVideoUrl("");
    };


    // ==========================================
    // COPY ROOM ID
    // ==========================================
    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);

            alert("Room ID copied!");
        } catch (error) {
            console.error("Copy failed:", error);
        }
    };


    // ==========================================
    // UI
    // ==========================================
    return (
        <div className="watch-page">

            {/* ================= NAVBAR ================= */}

            <header className="room-navbar">

                <div className="logo">
                    WatchParty
                </div>

                <div className="room-info">

                    <span>
                        Room: <strong>{roomId}</strong>
                    </span>

                    <span>
                        👥 {users}
                    </span>

                    <span>
                        {connected
                            ? "🟢 Connected"
                            : "🔴 Disconnected"}
                    </span>

                    <button onClick={copyRoomId}>
                        Copy ID
                    </button>

                    <button onClick={() => navigate("/")}>
                        Leave
                    </button>

                </div>

            </header>


            {/* ================= MAIN ================= */}

            <main className="watch-container">

                {/* ================= VIDEO ================= */}

                <section className="video-section">

                    <VideoPlayer
                        videoId={videoId}
                        socket={socket}
                        roomId={roomId}
                        initialTime={currentTime}
                        initialPlaying={isPlaying}
                    />


                    {/* VIDEO URL CONTROLS */}

                    <div className="video-controls">

                        <input
                            type="text"
                            placeholder="Paste YouTube URL..."
                            value={videoUrl}
                            onChange={(e) => {
                                setVideoUrl(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    changeVideo();
                                }
                            }}
                        />

                        <button onClick={changeVideo}>
                            Change Video
                        </button>

                    </div>

                </section>


                {/* ================= SIDEBAR ================= */}

                <aside className="sidebar">

                    <h2>
                        👥 Watch Party
                    </h2>


                    {/* CONNECTION */}

                    <div className="online-status">

                        {connected
                            ? "🟢 Connected"
                            : "🔴 Disconnected"}

                    </div>


                    {/* ROOM ID */}

                    <div className="party-info">

                        <p>
                            Room ID
                        </p>

                        <strong>
                            {roomId}
                        </strong>

                    </div>


                    {/* USERS */}

                    <div className="party-info">

                        <p>
                            Users watching
                        </p>

                        <strong>
                            👥 {users}
                        </strong>

                    </div>


                    {/* SYNC INFO */}

                    <div className="sync-info">

                        <h3>
                            🔄 Real-Time Sync
                        </h3>

                        <p>
                            Play, pause, seek and video changes
                            are synchronized with everyone in
                            this room.
                        </p>

                    </div>

                </aside>

            </main>

        </div>
    );
};

export default WatchRoom;