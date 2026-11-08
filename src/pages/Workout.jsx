import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Coffee, Settings2 } from 'lucide-react';
import { useApp } from '@/lib/AppStateContext';
import { dateKey, dayNumber } from '@/lib/dates';
import { cn } from '@/lib/utils';
import SessionPlayer from '@/components/workout/SessionPlayer';
import Celebration from '@/components/workout/Celebration';

export default function Workout() {
  const { state, toggleRestDay, markSessionComplete } = useApp();
  const today = dateKey();
  const day = state.days[today];
  const dayNum = dayNumber(state.startDate, today);
  const sessions = day?.sessions || [];
  const [activeId, setActiveId] = useState(null);
  const [celebrate, setCelebrate] = useState(null);

  useEffect(() => {
    if (!sessions.length) {
      setActiveId(null);
      return;
    }
    if (!sessions.some((s) => s.id === activeId)) setActiveId(sessions[0].id);
  }, [sessions, activeId]);

  const active = sessions.find((s) => s.id === activeId) || sessions[0];
  const completedToday = sessions.filter((s) => s.completedAt).length;

  const handleComplete = (durationSec) => {
    if (!active) return;
    const info = markSessionComplete(today, active.id, durationSec);
    setCelebrate(info.challengeDone ? 'challenge' : info.dayDone ? 'day' : 'session');
  };

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Workout</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Day {Math.min(dayNum, state.challengeLength)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedToday}/{sessions.length || 0} sessions done today
          </p>
        </div>
        <Link to="/settings"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-card/80 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
        </Link>
      </header>

      {!day && (
        <div className="rounded-[24px] border border-white/10 bg-card/80 p-6 text-center glow-card">
          <p className="font-bold">This day isn't part of your challenge</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your challenge runs for {state.challengeLength} days from {state.startDate}.
          </p>
        </div>
      )}

      {day?.status === 'rest' && (
        <div className="rounded-[24px] border border-white/10 bg-card/80 p-6 text-center glow-card">
          <Coffee className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-bold">Rest day</p>
          <p className="mt-1 text-sm text-muted-foreground">Recovery is training too. Your streak is safe.</p>
          <button type="button" onClick={() => toggleRestDay(today)}
            className="mt-4 h-11 w-full rounded-2xl border border-white/15 bg-white/5 text-sm font-bold">
            Train anyway
          </button>
        </div>
      )}

      {day && day.status !== 'rest' && sessions.length > 0 && (
        <>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {sessions.map((s) => (
              <button key={s.id} type="button" onClick={() => setActiveId(s.id)}
                className={cn('flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all',
                  s.id === active?.id
                    ? 'border-primary/60 brand-gradient text-white glow-button'
                    : 'border-white/10 bg-card/70 text-muted-foreground')}>
                {s.completedAt ? <CheckCircle2 className="h-4 w-4" /> : null}
                <span>{s.label}</span>
                <span className={cn('text-[11px] font-semibold', s.id === active?.id ? 'text-white/70' : 'text-muted-foreground/70')}>
                  {s.time}
                </span>
              </button>
            ))}
          </div>

          {active?.completedAt && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-300">
                {active.label} complete · {Math.max(1, Math.round((active.durationSec || 0) / 60))} min
              </p>
            </motion.div>
          )}

          {active && (
            <SessionPlayer
              key={active.id}
              dayKey={today}
              session={active}
              dayNum={Math.min(dayNum, state.challengeLength)}
              onSessionComplete={handleComplete}
            />
          )}
        </>
      )}

      {day && day.status !== 'rest' && sessions.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-white/15 bg-card/60 p-6 text-center">
          <p className="font-bold">No sessions scheduled</p>
          <p className="mt-1 text-sm text-muted-foreground">Add sessions and assigned workouts in Settings.</p>
          <Link to="/settings"
            className="mt-4 inline-flex h-11 items-center rounded-2xl brand-gradient px-5 text-sm font-bold text-white glow-button">
            Open Settings
          </Link>
        </div>
      )}

      <Celebration
        open={!!celebrate}
        kind={celebrate || 'session'}
        name={state.name}
        dayNum={dayNum}
        onClose={() => setCelebrate(null)}
      />
    </div>
  );
}