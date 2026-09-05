import { useEffect, useRef } from "react";
import YouTube from "react-youtube";

const VideoPlayer = ({
    videoId,
    socket,
    roomId,
    initialTime = 0,
    initialPlaying = false,
}) => {
    const playerRef = useRef(null);

    // Remote action chal rahi hai ya nahi
    const syncingRef = useRef(false);

    // Last known player time
    const lastTimeRef = useRef(0);

    // Player ready hone ke baad initial state apply karna
    const onReady = (event) => {
        playerRef.current = event.target;

        if (initialTime > 0) {
            event.target.seekTo(initialTime, true);
        }

        lastTimeRef.current = initialTime || 0;

        if (initialPlaying) {
            syncingRef.current = true;

            event.target.playVideo();

            setTimeout(() => {
                syncingRef.current = false;
            }, 800);
        }
    };

    // YouTube player state change
    const onStateChange = (event) => {
        if (!playerRef.current) return;

        // Remote event ki wajah se state change hua
        if (syncingRef.current) return;

        const currentTime = playerRef.current.getCurrentTime();

        // PLAY
        if (event.data === 1) {
            lastTimeRef.current = currentTime;

            socket.emit("video-play", {
                roomId,
                currentTime,
            });

            console.log("PLAY:", currentTime);
        }

        // PAUSE
        if (event.data === 2) {
            lastTimeRef.current = currentTime;

            socket.emit("video-pause", {
                roomId,
                currentTime,
            });

            console.log("PAUSE:", currentTime);
        }
    };

    // SEEK detect
    useEffect(() => {
        const interval = setInterval(() => {
            if (!playerRef.current) return;

            if (syncingRef.current) return;

            const currentTime = playerRef.current.getCurrentTime();

            const difference = Math.abs(
                currentTime - lastTimeRef.current
            );

            /*
              Normal playback mein 0.5 sec ke andar
              difference roughly 0.5 sec hota hai.
      
              Agar difference 2 sec se zyada hai,
              to user ne seek kiya maana jayega.
            */
            if (difference > 2) {
                socket.emit("video-seek", {
                    roomId,
                    currentTime,
                });

                console.log("SEEK:", currentTime);
            }

            lastTimeRef.current = currentTime;
        }, 500);

        return () => {
            clearInterval(interval);
        };
    }, [socket, roomId]);

    // RECEIVE PLAY
    useEffect(() => {
        const handlePlay = ({ currentTime }) => {
            if (!playerRef.current) return;

            console.log("REMOTE PLAY:", currentTime);

            syncingRef.current = true;

            playerRef.current.seekTo(currentTime, true);
            playerRef.current.playVideo();

            lastTimeRef.current = currentTime;

            setTimeout(() => {
                syncingRef.current = false;
            }, 1000);
        };

        // RECEIVE PAUSE
        const handlePause = ({ currentTime }) => {
            if (!playerRef.current) return;

            console.log("REMOTE PAUSE:", currentTime);

            syncingRef.current = true;

            playerRef.current.seekTo(currentTime, true);
            playerRef.current.pauseVideo();

            lastTimeRef.current = currentTime;

            setTimeout(() => {
                syncingRef.current = false;
            }, 1000);
        };

        // RECEIVE SEEK
        const handleSeek = ({ currentTime }) => {
            if (!playerRef.current) return;

            console.log("REMOTE SEEK:", currentTime);

            syncingRef.current = true;

            playerRef.current.seekTo(currentTime, true);

            lastTimeRef.current = currentTime;

            setTimeout(() => {
                syncingRef.current = false;
            }, 700);
        };

        socket.on("video-play", handlePlay);
        socket.on("video-pause", handlePause);
        socket.on("video-seek", handleSeek);

        return () => {
            socket.off("video-play", handlePlay);
            socket.off("video-pause", handlePause);
            socket.off("video-seek", handleSeek);
        };
    }, [socket, roomId]);

    // No video
    if (!videoId) {
        return (
            <div className="video-placeholder">
                <h2>🎥 No Video Selected</h2>

                <p>
                    Paste a YouTube URL below to start watching.
                </p>
            </div>
        );
    }

    return (
        <div className="video-wrapper">
            <YouTube
                videoId={videoId}
                onReady={onReady}
                onStateChange={onStateChange}
                opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: {
                        autoplay: 0,
                        controls: 1,
                        rel: 0,
                        origin: window.location.origin,
                    },
                }}
                className="youtube-player"
            />
        </div>
    );
};

export default VideoPlayer;