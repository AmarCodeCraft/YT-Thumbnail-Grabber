import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const spring = { type: 'spring', stiffness: 200, damping: 24 };
const smooth = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };

const BASE = 'https://img.youtube.com/vi';

const VARIANT_META = {
  maxresdefault: { label: 'Max Resolution', res: '1920 × 1080', guaranteed: false },
  sddefault:     { label: 'SD Default',     res: '640 × 480',   guaranteed: false },
  hqdefault:     { label: 'HQ Default',     res: '480 × 360',   guaranteed: true },
  mqdefault:     { label: 'MQ Default',     res: '320 × 180',   guaranteed: true },
  default:       { label: 'Default',        res: '120 × 90',    guaranteed: true },
};

/* ── Download helper ───────────────────────────────────────────────────────── */

async function downloadImage(url, filename) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
}

/* ── Single Thumbnail Card ─────────────────────────────────────────────────── */

export default function ThumbnailCard({ videoId, variant }) {
  const meta = VARIANT_META[variant];
  const url = `${BASE}/${videoId}/${variant}.jpg`;

  const [status, setStatus] = useState('loading'); // loading | loaded | failed
  const [downloading, setDownloading] = useState(false);

  const handleLoad = useCallback(() => setStatus('loaded'), []);
  const handleError = useCallback(() => setStatus('failed'), []);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    await downloadImage(url, `${videoId}_${variant}.jpg`);
    setDownloading(false);
  }, [url, videoId, variant]);

  /* ── Failed / Unavailable ────────────────────────────────────────────────── */

  if (status === 'failed') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 aspect-video"
      >
        <svg className="h-10 w-10 text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <p className="text-sm font-medium text-zinc-500">{meta.label}</p>
        <p className="text-xs text-zinc-600 mt-1">{meta.res} — Not available</p>
      </motion.div>
    );
  }

  /* ── Main Card ───────────────────────────────────────────────────────────── */

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-shadow duration-500 hover:shadow-xl hover:shadow-black/30 hover:border-zinc-700/60"
    >
      {/* Image area */}
      <div className="relative aspect-video overflow-hidden bg-black">
        {/* Shimmer */}
        <AnimatePresence>
          {status === 'loading' && (
            <motion.div
              className="absolute inset-0 z-10 bg-zinc-800"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite linear',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.img
          src={url}
          alt={`${meta.label} thumbnail`}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: status === 'loaded' ? 1 : 0, scale: 1 }}
          transition={smooth}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover overlay with download icon */}
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-500"
        >
          <motion.button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-xl bg-white/90 px-5 py-2.5 text-sm font-semibold text-zinc-900 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out hover:bg-white cursor-pointer shadow-xl"
            whileTap={{ scale: 0.95 }}
          >
            {downloading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            {downloading ? 'Downloading...' : 'Download'}
          </motion.button>
        </div>

        {/* Resolution badge */}
        <div className="absolute top-2 left-2 z-30">
          <span className="rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold tracking-wider text-white/80 uppercase backdrop-blur-sm">
            {meta.res}
          </span>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-zinc-200">{meta.label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {variant}.jpg
            {meta.guaranteed && (
              <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                Guaranteed
              </span>
            )}
            {!meta.guaranteed && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                May 404
              </span>
            )}
          </p>
        </div>
        <motion.button
          onClick={handleDownload}
          disabled={downloading || status !== 'loaded'}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Download"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </motion.button>
      </div>

    </motion.div>
  );
}

export { VARIANT_META, BASE, downloadImage };
