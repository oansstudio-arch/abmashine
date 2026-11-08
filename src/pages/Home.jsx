import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Flame, Sparkles, Trophy } from 'lucide-react';
import { useApp } from '@/lib/AppStateContext';
import { clockToMinutes, dateKey, nowClock } from '@/lib/dates';
import { computeStats, goalProgress } from '@/lib/stats';
import ProgressRing from '@/components/ProgressRing';
import SessionCard from '@/components/home/SessionCard';
import { cn } from '@/lib/utils';

export default function Home() {
  const { state, toggleRestDay } = useApp();
  const today = dateKey();
  const day = state.days[today];
  const stats = computeStats(state);
  const sessions = day?.sessions || [];
  const now = clockToMinutes(nowClock());

  let dueIndex = -1;
  sessions.forEach((s, i) => {
    if (!s.completedAt && clockToMinutes(s.time) <= now) dueIndex = i;
  });

  const mainGoal = state.goals?.[0] ? goalProgress(state.goals[0], stats) : null;
  const allDone = sessions.length > 0 && sessions.every((s) => s.completedAt);
  const isRest = day?.status === 'rest';

  const coach = stats.finished
    ? 'You finished the whole challenge. Absolute legend.'
    : isRest
      ? 'Rest is part of progress too. Recover well.'
      : allDone
        ? 'Every day counts. See you tomorrow!'
        : stats.completedDays === 0
          ? "Let's go! You've got this!"
          : 'Consistency beats perfection. Keep going!';

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">{dateLabel}</p>
        <h1 className="mt-1.5 text-[2rem] font-black leading-tight tracking-tight">
          Hi, {state.name || 'athlete'}!
        </h1>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative flex justify-center rounded-[32px] border border-white/10 bg-card/70 py-7 glow-card"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px] brand-gradient-soft" />
        <ProgressRing percent={stats.percent} size={232} stroke={13}>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">Day</p>
          <p className="numeric text-6xl font-black leading-none tracking-tighter text-glow">
            {stats.dayNum}
          </p>
          <p className="numeric mt-1 text-sm font-semibold text-muted-foreground">/ {stats.length}</p>
          <p className="mt-2 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-foreground/80">
            {stats.percent}% complete
          </p>
        </ProgressRing>
      </motion.div>

      <div className="grid grid-cols-2 gap-2.5">
        <Stat icon={<Flame className="h-3.5 w-3.5" />} label="Streak" value={`${stats.currentStreak}d`} accent />
        <Stat icon={<Trophy className="h-3.5 w-3.5" />} label="Days done" value={`${stats.completedDays}`} />
        <Stat icon={<Coffee className="h-3.5 w-3.5" />} label="Rest days" value={`${stats.restDays}`} />
        <Stat
          icon={<Sparkles className="h-3.5 w-3.5" />}
          label={mainGoal ? 'Main goal' : 'Sessions'}
          value={mainGoal ? `${mainGoal.pct}%` : `${stats.totalSessions}`}
        />
      </div>

      <Link to="/workout"
        className="flex h-14 items-center justify-center rounded-2xl brand-gradient text-sm font-black tracking-[0.14em] text-white glow-button">
        CONTINUE TRAINING
      </Link>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Today's sessions</h2>
          <span className="numeric text-xs font-bold text-muted-foreground">
            {sessions.filter((s) => s.completedAt).length}/{sessions.length}
          </span>
        </div>
        {sessions.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-card/60 p-5 text-center text-sm text-muted-foreground">
            No sessions scheduled for today.
          </div>
        )}
        {sessions.map((s, i) => (
          <SessionCard key={s.id} session={s} isNow={i === dueIndex} />
        ))}
      </section>

      <section className="relative overflow-hidden rounded-[24px] border border-primary/25 bg-primary/10 p-5">
        <div className="pointer-events-none absolute inset-0 brand-gradient-soft" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full brand-gradient text-sm">
            🎙️
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Coach</p>
            <p className="mt-1 text-sm font-medium leading-relaxed">{coach}</p>
          </div>
        </div>
      </section>

      {day && !stats.finished && (
        <button type="button" onClick={() => toggleRestDay(today)}
          className={cn('flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-bold transition-all',
            isRest ? 'border-primary/60 bg-primary/15 text-primary' : 'border-white/10 bg-card/60 text-muted-foreground')}>
          <Coffee className="h-4 w-4" />
          {isRest ? 'Rest day marked — undo' : 'Take a rest day'}
        </button>
      )}
    </div>
  );
}

function Stat({ icon, label, value, accent }) {
  return (
    <div className={cn('rounded-[22px] border p-4',
      accent ? 'border-primary/30 bg-primary/10' : 'border-white/10 bg-card/80')}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className={cn('numeric mt-2 text-2xl font-black tracking-tight', accent && 'text-primary')}>{value}</p>
    </div>
  );
}