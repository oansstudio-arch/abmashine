import { motion } from 'framer-motion';
import { Check, Pause, Play, RotateCcw, Play as PlayIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatSeconds } from '@/lib/dates';

const typeLabel = (ex) => (ex.type === 'timed' ? `${ex.target}s hold` : `${ex.target} reps`);

export default function ExerciseCard({
  exercise, target, active, doneSets, remaining, paused, running,
  onStart, onPause, onRestart, onAdvance, onToggleDone, index,
}) {
  const sets = Math.max(1, Number(exercise.sets) || 1);
  const done = doneSets >= sets;
  const progress = Math.min(100, Math.round((doneSets / sets) * 100));
  const amount = exercise.type === 'timed' ? `${target}` : `${target}`;
  const unit = exercise.type === 'timed' ? 'sec' : 'reps';

  return (
    <motion.div
      layout
      className={cn('relative overflow-hidden rounded-[24px] border p-5 transition-colors',
        active ? 'border-primary/60 bg-primary/10 glow-ring' : 'border-white/10 bg-card/80 glow-card',
        done && !active && 'opacity-80')}
    >
      {active && <div className="pointer-events-none absolute inset-0 brand-gradient-soft" />}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            Exercise {index + 1}
          </p>
          <h3 className="mt-1 truncate text-lg font-bold leading-tight">{exercise.name}</h3>
          {exercise.tip && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{exercise.tip}</p>
          )}
        </div>
        <button type="button" onClick={onToggleDone} aria-label="Mark exercise done"
          className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all',
            done ? 'border-transparent brand-gradient text-white' : 'border-white/20 bg-white/5 text-muted-foreground')}>
          <Check className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mt-4 flex items-end gap-2">
        <span className="numeric text-4xl font-black leading-none">{amount}</span>
        <span className="pb-1 text-sm font-semibold text-muted-foreground">{unit}</span>
        <span className="ml-auto rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
          {sets} {sets > 1 ? 'sets' : 'set'}
        </span>
      </div>

      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full brand-gradient"
          animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <div className="relative mt-4">
        {active ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-black/30 px-3 py-2">
              <span className="numeric text-2xl font-black tracking-tight">
                {formatSeconds(remaining)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {paused ? 'paused' : 'left'}
              </span>
            </div>
            <button type="button" onClick={onPause} aria-label={paused ? 'Resume' : 'Pause'}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button type="button" onClick={onRestart} aria-label="Restart"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button type="button" onClick={onAdvance}
              className="h-11 rounded-2xl brand-gradient px-4 text-sm font-bold text-white glow-button">
              Done
            </button>
          </div>
        ) : (
          <button type="button" onClick={onStart} disabled={running}
            className={cn('flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold tracking-wide transition-all',
              done ? 'border border-white/15 bg-white/5 text-foreground' : 'brand-gradient text-white glow-button',
              running && 'opacity-40')}>
            <PlayIcon className="h-4 w-4" />
            {done ? 'REPEAT' : 'START'}
          </button>
        )}
      </div>

      <p className="relative mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground/70">
        {typeLabel({ ...exercise, target })}
      </p>
    </motion.div>
  );
}