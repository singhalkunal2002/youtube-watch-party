export const getYouTubeVideoId = (url) => {
    if (!url) return null;

    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname === "youtu.be") {
            return parsedUrl.pathname.substring(1);
        }

        if (
            parsedUrl.hostname === "www.youtube.com" ||
            parsedUrl.hostname === "youtube.com"
        ) {
            return parsedUrl.searchParams.get("v");
        }

        return null;
    } catch {
        return null;
    }
};