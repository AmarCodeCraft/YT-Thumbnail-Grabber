/**
 * YouTube Thumbnail Utility — Production-Ready
 *
 * Zero-dependency vanilla JS utility for generating YouTube thumbnail URLs
 * with automatic fallback handling.
 */

const THUMBNAIL_VARIANTS = Object.freeze({
  MAX:     'maxresdefault',   // 1920×1080 — NOT guaranteed
  SD:      'sddefault',       // 640×480   — NOT guaranteed
  HQ:      'hqdefault',       // 480×360   — guaranteed
  MQ:      'mqdefault',       // 320×180   — guaranteed
  DEFAULT: 'default',         // 120×90    — guaranteed
});

const FALLBACK_ORDER = [
  THUMBNAIL_VARIANTS.MAX,
  THUMBNAIL_VARIANTS.SD,
  THUMBNAIL_VARIANTS.HQ,
  THUMBNAIL_VARIANTS.MQ,
  THUMBNAIL_VARIANTS.DEFAULT,
];

const BASE_URL = 'https://img.youtube.com/vi';

/**
 * Extracts a YouTube video ID from various URL formats.
 *
 * Supported formats:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/v/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - Raw 11-character video ID string
 *
 * @param {string} input - YouTube URL or video ID
 * @returns {string|null} The 11-character video ID, or null if invalid
 */
function extractVideoId(input) {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();

  // Direct video ID (11 chars, Base64url-safe)
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /(?:youtube\.com\/watch\?.*v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Generates a thumbnail URL for a given video ID and variant.
 *
 * @param {string} videoId - 11-character YouTube video ID
 * @param {string} [variant='hqdefault'] - Thumbnail variant
 * @returns {string} The full thumbnail URL
 */
function getThumbnailUrl(videoId, variant = THUMBNAIL_VARIANTS.HQ) {
  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    throw new Error(`Invalid video ID: "${videoId}"`);
  }
  return `${BASE_URL}/${videoId}/${variant}.jpg`;
}

/**
 * Generates all thumbnail variant URLs for a video.
 *
 * @param {string} videoId - 11-character YouTube video ID
 * @returns {Object} Map of variant names to URLs
 */
function getAllThumbnailUrls(videoId) {
  const urls = {};
  for (const [key, variant] of Object.entries(THUMBNAIL_VARIANTS)) {
    urls[key] = getThumbnailUrl(videoId, variant);
  }
  return urls;
}

/**
 * Checks if a thumbnail URL is reachable (non-404) via HEAD request.
 *
 * @param {string} url - Thumbnail URL to check
 * @returns {Promise<boolean>} True if the URL returns 200
 */
async function isThumbnailAvailable(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Returns the highest-resolution available thumbnail URL for a video.
 * Tries each variant in descending quality order, falling back as needed.
 *
 * @param {string} videoId - 11-character YouTube video ID
 * @returns {Promise<string>} The URL of the best available thumbnail
 */
async function getBestThumbnailUrl(videoId) {
  for (const variant of FALLBACK_ORDER) {
    const url = getThumbnailUrl(videoId, variant);
    if (await isThumbnailAvailable(url)) {
      return url;
    }
  }
  // hqdefault is guaranteed — if we got here, the video likely doesn't exist
  return getThumbnailUrl(videoId, THUMBNAIL_VARIANTS.HQ);
}

/**
 * Creates a thumbnail <img> element with automatic fallback on error.
 *
 * Usage:
 *   const img = createThumbnailElement('T_jnSN4ByzI', {
 *     preferredVariant: 'maxresdefault',
 *     alt: 'My video thumbnail',
 *     className: 'thumb',
 *     lazy: true,
 *   });
 *   document.body.appendChild(img);
 *
 * @param {string} videoIdOrUrl - YouTube video ID or URL
 * @param {Object} [options]
 * @param {string} [options.preferredVariant='maxresdefault'] - Starting variant
 * @param {string} [options.alt='YouTube video thumbnail'] - Alt text
 * @param {string} [options.className=''] - CSS class name
 * @param {boolean} [options.lazy=true] - Enable native lazy loading
 * @returns {HTMLImageElement}
 */
function createThumbnailElement(videoIdOrUrl, options = {}) {
  const {
    preferredVariant = THUMBNAIL_VARIANTS.MAX,
    alt = 'YouTube video thumbnail',
    className = '',
    lazy = true,
  } = options;

  const videoId = extractVideoId(videoIdOrUrl);
  if (!videoId) {
    throw new Error(`Cannot extract video ID from: "${videoIdOrUrl}"`);
  }

  const img = document.createElement('img');
  img.alt = alt;
  img.width = 640;
  img.height = 360;
  img.decoding = 'async';

  if (className) img.className = className;
  if (lazy) img.loading = 'lazy';

  // Build fallback chain starting from preferred variant
  const startIndex = FALLBACK_ORDER.indexOf(preferredVariant);
  const fallbackChain = FALLBACK_ORDER.slice(
    startIndex >= 0 ? startIndex : 0
  );

  let currentIndex = 0;
  img.src = getThumbnailUrl(videoId, fallbackChain[currentIndex]);

  img.onerror = () => {
    currentIndex++;
    if (currentIndex < fallbackChain.length) {
      img.src = getThumbnailUrl(videoId, fallbackChain[currentIndex]);
    } else {
      // All variants failed — show a placeholder
      img.onerror = null;
      img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' fill='%23111'%3E%3Crect width='640' height='360'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='sans-serif' font-size='18'%3EThumbnail unavailable%3C/text%3E%3C/svg%3E`;
    }
  };

  return img;
}

// ── Exports ──────────────────────────────────────────────────────────────────

export {
  THUMBNAIL_VARIANTS,
  FALLBACK_ORDER,
  extractVideoId,
  getThumbnailUrl,
  getAllThumbnailUrls,
  isThumbnailAvailable,
  getBestThumbnailUrl,
  createThumbnailElement,
};
