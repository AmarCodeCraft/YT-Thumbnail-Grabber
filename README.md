# YT Thumbnail Grabber

A free, fast, client-side YouTube thumbnail downloader. Paste any YouTube link — get all thumbnail variants instantly with one-click download. No API key, no backend, no BS.

---

## Features

- **All Resolutions** — Shows every thumbnail variant (1920x1080, 640x480, 480x360, 320x180, 120x90)
- **One-Click Download** — Downloads via blob (forces save dialog, not a new tab)
- **Auto URL Parsing** — Supports `youtube.com/watch`, `youtu.be`, `youtube.com/embed`, `youtube.com/shorts`, raw video IDs
- **Availability Detection** — Shows which variants exist and which 404
- **Paste Button** — Reads from clipboard instantly
- **Smooth Animations** — Framer Motion spring transitions, staggered grid, hover effects
- **SEO Optimized** — Open Graph, Twitter Card, JSON-LD structured data, canonical URL, preconnect
- **Fully Client-Side** — Zero backend, zero API calls, fetches directly from `img.youtube.com`

---

## Tech Stack

| Layer       | Technology                 |
| ----------- | -------------------------- |
| Framework   | React 19 + Vite 7         |
| Styling     | Tailwind CSS v4            |
| Animations  | Framer Motion              |
| Language    | JavaScript (ES Modules)    |
| Build       | Vite                       |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
yt/
├── index.html                    # SEO meta tags, OG, Twitter Card, preconnect
├── package.json
├── vite.config.js                # React + Tailwind v4 plugins
├── DEEP-DIVE.md                  # Technical analysis of YouTube thumbnail HTTP requests
├── src/
│   ├── main.jsx                  # React entry point
│   ├── index.css                 # Tailwind import, smooth scroll, custom scrollbar
│   ├── App.jsx                   # URL input, video ID extraction, thumbnail grid
│   ├── components/
│   │   └── YouTubeThumbnail.jsx  # ThumbnailCard component with download + fallback
│   └── utils/
│       └── thumbnail-utils.js    # Vanilla JS thumbnail utility (standalone)
```

---

## How It Works

1. User pastes a YouTube URL into the input field
2. `extractVideoId()` parses the URL using regex patterns to extract the 11-char video ID
3. App renders 5 `ThumbnailCard` components — one for each resolution variant
4. Each card loads `https://img.youtube.com/vi/{VIDEO_ID}/{VARIANT}.jpg`
5. `onLoad` → shows thumbnail with fade-in + hover-to-download overlay
6. `onError` → shows "Not available" state (common for `maxresdefault` on non-HD videos)
7. Download button fetches the image as a blob and triggers a browser save dialog

**No YouTube Data API is used.** Thumbnail URLs are deterministic and publicly accessible.

---

## Thumbnail Variants

| Variant           | Resolution  | Guaranteed? |
| ----------------- | ----------- | ----------- |
| `maxresdefault`   | 1920 x 1080 | No          |
| `sddefault`       | 640 x 480   | No          |
| `hqdefault`       | 480 x 360   | Yes         |
| `mqdefault`       | 320 x 180   | Yes         |
| `default`         | 120 x 90    | Yes         |

`maxresdefault` only exists for videos uploaded at 1080p or higher.

---

## SEO

- **`<title>`** — Keyword-rich, under 60 chars
- **`<meta description>`** — Action-oriented, under 160 chars
- **Open Graph** — `og:title`, `og:description`, `og:image`, `og:url`
- **Twitter Card** — `summary_large_image` with preview thumbnail
- **JSON-LD** — `WebApplication` schema with free pricing
- **Performance** — `<link rel="preconnect">` + `dns-prefetch` to `img.youtube.com`
- **Canonical URL** — Prevents duplicate content
- **Dynamic `<title>`** — Updates to show video ID when active

---

## License

MIT
