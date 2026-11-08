import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

const COPY = {
  session: { kicker: 'Session complete', title: 'Nice work!', sub: 'Nice! Another one done!' },
  day: { kicker: 'Day complete', title: 'Day done!', sub: 'Consistency beats perfection.' },
  challenge: { kicker: 'Challenge complete', title: 'You did it!', sub: 'You finished the whole challenge. Legend.' },
};

export default function Celebration({ open, kind = 'session', name, dayNum, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    try {
      confetti({
        particleCount: 110,
        spread: 75,
        startVelocity: 38,
        origin: { y: 0.4 },
        colors: ['#9333EA', '#E040A0', '#C084FC', '#FFFFFF'],
      });
    } catch (e) { /* confetti unavailable */ }
    return undefined;
  }, [open, kind]);

  const copy = COPY[kind] || COPY.session;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 px-6 backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-0 aurora" />
          <motion.div
            initial={{ scale: 0.75, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full max-w-sm rounded-[28px] border border-white/10 bg-card/90 p-8 text-center glow-card"
          >
            <motion.div
              animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full brand-gradient glow-button"
            >
              <Sparkles className="h-9 w-9 text-white" />
            </motion.div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.35em] text-primary">{copy.kicker}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {kind === 'challenge' ? 'Challenge complete!' : kind === 'day' ? `Day ${dayNum} done!` : copy.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {name ? `${name}, ` : ''}{copy.sub}
            </p>
            {kind !== 'challenge' && (
              <p className="mt-1 text-xs text-muted-foreground/80">Every day counts. Keep going!</p>
            )}

            <button type="button" onClick={onClose}
              className="mt-7 h-12 w-full rounded-2xl brand-gradient text-sm font-bold tracking-wide text-white glow-button">
              CONTINUE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}