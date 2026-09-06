export const getYouTubeVideoId = (url) => {
  if (!url) return null;

  try {
    const value = url.trim();

    // Direct video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
      return value;
    }

    const parsedUrl = new URL(value);

    // =================================
    // youtu.be/VIDEO_ID
    // =================================
    if (
      parsedUrl.hostname === "youtu.be" ||
      parsedUrl.hostname === "www.youtu.be"
    ) {
      const id = parsedUrl.pathname.split("/").filter(Boolean)[0];

      return id && id.length === 11 ? id : null;
    }

    // =================================
    // youtube.com/watch?v=VIDEO_ID
    // =================================
    if (
      parsedUrl.hostname === "youtube.com" ||
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "m.youtube.com"
    ) {
      // watch?v=
      const watchId = parsedUrl.searchParams.get("v");

      if (watchId && watchId.length === 11) {
        return watchId;
      }

      // /shorts/VIDEO_ID
      const shortsMatch = parsedUrl.pathname.match(
        /\/shorts\/([a-zA-Z0-9_-]{11})/,
      );

      if (shortsMatch) {
        return shortsMatch[1];
      }

      // /embed/VIDEO_ID
      const embedMatch = parsedUrl.pathname.match(
        /\/embed\/([a-zA-Z0-9_-]{11})/,
      );

      if (embedMatch) {
        return embedMatch[1];
      }
    }

    return null;
  } catch (error) {
    console.error("YouTube URL error:", error);

    return null;
  }
};
