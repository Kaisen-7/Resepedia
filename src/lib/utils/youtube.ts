/**
 * Utility helper to safely extract YouTube Video IDs and build bulletproof embed URLs
 * avoiding "refused to connect" / X-Frame-Options blocks in browser iframes.
 */

export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;

  const trimmed = url.trim();
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/|^)([a-zA-Z0-9_-]{11})(?:[?&]|$)/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

export function getYouTubeEmbedInfo(url: string | null | undefined): {
  videoId: string;
  embedUrl: string;
  watchUrl: string;
} | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  return {
    videoId,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}
