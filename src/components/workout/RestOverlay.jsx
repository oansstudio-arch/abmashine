import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, SkipForward } from 'lucide-react';
import { formatSeconds } from '@/lib/dates';

export default function RestOverlay({ open, remaining, nextLabel, nextMeta, onSkip, paused, onPause }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/96 px-8 backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-0 aurora" />
          <p className="relative text-xs font-bold uppercase tracking-[0.4em] text-primary">Rest</p>

          <div className="relative mt-6 flex h-64 w-64 items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full border border-primary/30"
              animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.05, 0.55] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute inset-6 rounded-full border border-fuchsia-400/25"
              animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.05, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
            <span className="numeric relative text-7xl font-black tracking-tighter text-glow">
              {formatSeconds(remaining)}
            </span>
          </div>

          <div className="relative mt-8 w-full max-w-xs rounded-[24px] border border-white/10 bg-card/80 p-4 text-center glow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Up next</p>
            <p className="mt-1 text-lg font-bold">{nextLabel}</p>
            {nextMeta && <p className="mt-1 text-xs text-muted-foreground">{nextMeta}</p>}
          </div>

          <div className="relative mt-8 flex items-center gap-3">
            <button type="button" onClick={onPause} aria-label={paused ? 'Resume rest' : 'Pause rest'}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button type="button" onClick={onSkip}
              className="flex h-12 items-center gap-2 rounded-2xl brand-gradient px-6 text-sm font-bold tracking-wide text-white glow-button">
              <SkipForward className="h-4 w-4" /> Skip rest
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}