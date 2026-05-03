import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThumbnailCard, { VARIANT_META } from './components/YouTubeThumbnail'

const VARIANTS = Object.keys(VARIANT_META)

const spring = { type: 'spring', stiffness: 200, damping: 24 }
const smooth = { duration: 0.5, ease: [0.22, 1, 0.36, 1] }

/* ── Extract Video ID ──────────────────────────────────────────────────────── */

function extractVideoId(input) {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed

  const patterns = [
    /(?:youtube\.com\/watch\?.*v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  ]

  for (const p of patterns) {
    const m = trimmed.match(p)
    if (m) return m[1]
  }
  return null
}

/* ── App ───────────────────────────────────────────────────────────────────── */

function App() {
  const [url, setUrl] = useState('')
  const videoId = useMemo(() => extractVideoId(url), [url])

  useEffect(() => {
    document.title = videoId
      ? `${videoId} — YT Thumbnail Grabber`
      : 'YT Thumbnail Grabber — Download YouTube Thumbnails in All Resolutions'
  }, [videoId])

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
    } catch {
      // clipboard permission denied — ignore
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-6">
          <svg className="h-7 w-7 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
          </svg>
          <h1 className="text-lg font-semibold tracking-tight">YT Thumbnail Grabber</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* ── Input Section ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={smooth}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Download YouTube Thumbnails
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Paste any YouTube link below to preview and download thumbnails in all available resolutions.
          </p>

          <div className="mt-8 flex items-center gap-2 mx-auto max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here... (e.g. https://youtu.be/dQw4w9WgXcQ)"
                className="w-full rounded-xl border border-zinc-700/50 bg-zinc-900/80 px-4 py-3.5 pl-11 text-sm text-white placeholder-zinc-500 outline-none ring-0 transition-all duration-300 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:bg-zinc-900"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.343 8.28" />
              </svg>
            </div>
            <motion.button
              onClick={handlePaste}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="shrink-0 rounded-xl bg-zinc-800 px-4 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 cursor-pointer"
            >
              Paste
            </motion.button>
            {url && (
              <motion.button
                onClick={() => setUrl('')}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="shrink-0 rounded-xl bg-zinc-800 px-4 py-3.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-600/20 hover:text-red-400 cursor-pointer"
              >
                Clear
              </motion.button>
            )}
          </div>

          {/* Video ID indicator */}
          <AnimatePresence mode="wait">
            {url && (
              <motion.div
                key={videoId || 'invalid'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-3"
              >
                {videoId ? (
                  <span className="inline-flex items-center gap-2 text-sm text-emerald-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Video ID: <code className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-xs">{videoId}</code>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-red-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    Invalid YouTube URL — check your link
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Thumbnail Grid ───────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {videoId ? (
            <motion.div
              key={videoId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={smooth}
            >
              {/* Download All bar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-zinc-400">
                  Showing <span className="font-semibold text-white">{VARIANTS.length}</span> thumbnail variants
                </p>
              </div>

              <motion.div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
                }}
              >
                {VARIANTS.map((variant) => (
                  <motion.div
                    key={variant}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={spring}
                  >
                    <ThumbnailCard videoId={videoId} variant={variant} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 mb-5">
                <svg className="h-10 w-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
              <p className="text-zinc-400 text-sm">Paste a YouTube URL above to get started</p>
              <p className="text-zinc-600 text-xs mt-1">Supports youtube.com, youtu.be, embeds, and shorts</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/40 py-8 text-center">
        <p className="text-xs text-zinc-600">
          YT Thumbnail Grabber — Thumbnails fetched directly from img.youtube.com
        </p>
        <p className="text-[10px] text-zinc-700 mt-1">
          No API key required. Not affiliated with YouTube or Google.
        </p>
      </footer>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'YT Thumbnail Grabber',
            url: 'https://yt-thumbnail-grabber.netlify.app',
            description: 'Free online tool to download YouTube video thumbnails in all resolutions.',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
    </div>
  )
}

export default App
