import { useEffect, useRef } from "react";
import YouTube from "react-youtube";

const VideoPlayer = ({
  videoId,
  socket,
  roomId,
  initialTime = 0,
  initialPlaying = false,
  canControl = false,
}) => {
  const playerRef = useRef(null);

  const syncingRef = useRef(false);

  const lastTimeRef = useRef(Number(initialTime) || 0);

  const previousTimeRef = useRef(Number(initialTime) || 0);

  const lastPlayingRef = useRef(Boolean(initialPlaying));

  // ==================================================
  // PLAYER READY
  // ==================================================
  const handleReady = (event) => {
    playerRef.current = event.target;

    const player = event.target;

    const time = Number(initialTime) || 0;

    console.log("🎥 YouTube ready");
    console.log("🎮 Can control:", canControl);
    console.log("⏱️ Initial time:", time);
    console.log("▶️ Initial playing:", initialPlaying);

    if (time > 0) {
      player.seekTo(time, true);
    }

    if (initialPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }

    lastTimeRef.current = time;
    previousTimeRef.current = time;
    lastPlayingRef.current = Boolean(initialPlaying);
  };

  // ==================================================
  // PLAYER STATE CHANGE
  // ==================================================
  const handleStateChange = (event) => {
    if (!playerRef.current) return;

    if (syncingRef.current) return;

    const player = event.target;

    const currentTime = player.getCurrentTime();

    // =========================
    // PLAYING
    // =========================
    if (event.data === 1) {
      // =========================
      // NON CONTROLLER
      // =========================
      if (!canControl) {
        console.log("🚫 User tried to play");

        if (!lastPlayingRef.current) {
          syncingRef.current = true;

          player.pauseVideo();

          player.seekTo(lastTimeRef.current, true);

          setTimeout(() => {
            syncingRef.current = false;
          }, 300);
        }

        return;
      }

      // =========================
      // CONTROLLER
      // =========================
      lastPlayingRef.current = true;

      lastTimeRef.current = currentTime;

      previousTimeRef.current = currentTime;

      socket.emit("play", {
        roomId,
        currentTime,
      });

      return;
    }

    // =========================
    // PAUSED
    // =========================
    if (event.data === 2) {
      // =========================
      // NON CONTROLLER
      // =========================
      if (!canControl) {
        console.log("🚫 User tried to pause");

        if (lastPlayingRef.current) {
          syncingRef.current = true;

          player.playVideo();

          setTimeout(() => {
            syncingRef.current = false;
          }, 300);
        }

        return;
      }

      // =========================
      // CONTROLLER
      // =========================
      lastPlayingRef.current = false;

      lastTimeRef.current = currentTime;

      previousTimeRef.current = currentTime;

      socket.emit("pause", {
        roomId,
        currentTime,
      });
    }
  };

  // ==================================================
  // CONTROLLER SEEK + CONTINUOUS SYNC
  // ==================================================
  useEffect(() => {
    if (!socket || !videoId || !canControl) {
      return;
    }

    const interval = setInterval(() => {
      if (!playerRef.current) return;

      if (syncingRef.current) return;

      const player = playerRef.current;

      const currentTime = player.getCurrentTime();

      const playerState = player.getPlayerState();

      // =========================
      // MANUAL SEEK
      // =========================
      const difference = Math.abs(currentTime - previousTimeRef.current);

      if (difference > 3 && playerState === 1) {
        console.log("⏩ MANUAL SEEK:", currentTime);

        socket.emit("seek", {
          roomId,
          currentTime,
        });
      }

      // =========================
      // UPDATE LOCAL TIME
      // =========================
      previousTimeRef.current = currentTime;

      lastTimeRef.current = currentTime;

      // =========================
      // CONTINUOUS SERVER SYNC
      // =========================
      if (playerState === 1) {
        socket.emit("sync-progress", {
          roomId,
          currentTime,
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [socket, roomId, videoId, canControl]);

  // ==================================================
  // PROTECT VIEWER / PARTICIPANT
  // ==================================================
  useEffect(() => {
    if (canControl) return;

    const interval = setInterval(() => {
      if (!playerRef.current) return;

      if (syncingRef.current) return;

      const player = playerRef.current;

      const currentTime = player.getCurrentTime();

      const playerState = player.getPlayerState();

      // =========================
      // PREVENT SEEK
      // =========================
      if (Math.abs(currentTime - lastTimeRef.current) > 2) {
        console.log("🚫 Viewer tried to seek");

        syncingRef.current = true;

        player.seekTo(lastTimeRef.current, true);

        setTimeout(() => {
          syncingRef.current = false;
        }, 300);
      }

      // =========================
      // PREVENT PAUSE
      // =========================
      if (playerState === 2 && lastPlayingRef.current) {
        console.log("🚫 Viewer tried to pause");

        syncingRef.current = true;

        player.playVideo();

        setTimeout(() => {
          syncingRef.current = false;
        }, 300);
      }

      // =========================
      // PREVENT PLAY
      // =========================
      if (playerState === 1 && !lastPlayingRef.current) {
        console.log("🚫 Viewer tried to play");

        syncingRef.current = true;

        player.pauseVideo();

        player.seekTo(lastTimeRef.current, true);

        setTimeout(() => {
          syncingRef.current = false;
        }, 300);
      }
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, [canControl]);

  // ==================================================
  // REMOTE PLAY / PAUSE / SEEK / TIME
  // ==================================================
  useEffect(() => {
    if (!socket) return;

    // =========================
    // REMOTE PLAY
    // =========================
    const handleRemotePlay = ({ currentTime }) => {
      if (!playerRef.current) return;

      const time = Number(currentTime) || 0;

      syncingRef.current = true;

      const player = playerRef.current;

      player.seekTo(time, true);
      player.playVideo();

      lastTimeRef.current = time;
      previousTimeRef.current = time;
      lastPlayingRef.current = true;

      setTimeout(() => {
        syncingRef.current = false;
      }, 500);
    };

    // =========================
    // REMOTE PAUSE
    // =========================
    const handleRemotePause = ({ currentTime }) => {
      if (!playerRef.current) return;

      const time = Number(currentTime) || 0;

      syncingRef.current = true;

      const player = playerRef.current;

      player.seekTo(time, true);
      player.pauseVideo();

      lastTimeRef.current = time;
      previousTimeRef.current = time;
      lastPlayingRef.current = false;

      setTimeout(() => {
        syncingRef.current = false;
      }, 500);
    };

    // =========================
    // REMOTE SEEK
    // =========================
    const handleRemoteSeek = ({ currentTime }) => {
      if (!playerRef.current) return;

      const time = Number(currentTime) || 0;

      syncingRef.current = true;

      const player = playerRef.current;

      player.seekTo(time, true);

      lastTimeRef.current = time;
      previousTimeRef.current = time;

      setTimeout(() => {
        syncingRef.current = false;
      }, 500);
    };

    // =========================
    // CONTINUOUS REMOTE TIME
    // =========================
    const handleRemoteTime = ({ currentTime }) => {
      if (!playerRef.current) return;

      const time = Number(currentTime) || 0;

      const player = playerRef.current;

      const localTime = player.getCurrentTime();

      const difference = Math.abs(localTime - time);

      // Small difference ko ignore karo
      // warna video baar-baar jump karegi
      if (difference < 1.5) {
        lastTimeRef.current = time;
        return;
      }

      console.log("🔄 TIME SYNC:", localTime, "→", time);

      syncingRef.current = true;

      player.seekTo(time, true);

      lastTimeRef.current = time;
      previousTimeRef.current = time;

      setTimeout(() => {
        syncingRef.current = false;
      }, 300);
    };

    socket.on("remote-play", handleRemotePlay);

    socket.on("remote-pause", handleRemotePause);

    socket.on("remote-seek", handleRemoteSeek);

    socket.on("remote-time", handleRemoteTime);

    return () => {
      socket.off("remote-play", handleRemotePlay);

      socket.off("remote-pause", handleRemotePause);

      socket.off("remote-seek", handleRemoteSeek);

      socket.off("remote-time", handleRemoteTime);
    };
  }, [socket]);

  // ==================================================
  // VIDEO CHANGE
  // ==================================================
  useEffect(() => {
    syncingRef.current = true;

    lastTimeRef.current = 0;
    previousTimeRef.current = 0;
    lastPlayingRef.current = false;

    const timer = setTimeout(() => {
      syncingRef.current = false;
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [videoId]);

  // ==================================================
  // NO VIDEO
  // ==================================================
  if (!videoId) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#94a3b8",
          borderRadius: "10px",
        }}
      >
        <h2>🎬 No video selected</h2>
      </div>
    );
  }

  // ==================================================
  // YOUTUBE PLAYER
  // ==================================================
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        background: "#000",
        borderRadius: "10px",
        overflow: "hidden",

        // Viewer cannot click controls
        pointerEvents: canControl ? "auto" : "none",
      }}
    >
      <YouTube
        videoId={videoId}
        onReady={handleReady}
        onStateChange={handleStateChange}
        opts={{
          width: "100%",
          height: "100%",

          playerVars: {
            autoplay: 0,

            controls: canControl ? 1 : 0,

            disablekb: canControl ? 0 : 1,

            rel: 0,
            modestbranding: 1,
          },
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default VideoPlayer;
