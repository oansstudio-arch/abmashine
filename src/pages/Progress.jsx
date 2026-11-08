import { useState } from 'react';
import { Target } from 'lucide-react';
import { useApp } from '@/lib/AppStateContext';
import { computeStats, goalsWithProgress, GOAL_LABELS } from '@/lib/stats';
import { formatMinutes } from '@/lib/dates';
import CalendarGrid from '@/components/progress/CalendarGrid';
import DayDetail from '@/components/progress/DayDetail';
import WeekChart from '@/components/progress/WeekChart';

export default function Progress() {
  const { state } = useApp();
  const [selected, setSelected] = useState(null);
  const stats = computeStats(state);
  const goals = goalsWithProgress(state, stats);

  const tiles = [
    { label: 'Completion', value: `${stats.percent}%` },
    { label: 'Streak now', value: `${stats.currentStreak}d` },
    { label: 'Best streak', value: `${stats.bestStreak}d` },
    { label: 'Sessions', value: `${stats.totalSessions}` },
    { label: 'Training', value: formatMinutes(stats.totalSeconds) },
    { label: 'Rest days', value: `${stats.restDays}` },
  ];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">My progress</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">{stats.completedDays} of {stats.length} days</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tap any day to see what you did.</p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-[20px] border border-white/10 bg-card/80 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{t.label}</p>
            <p className="numeric mt-1 text-lg font-black leading-tight">{t.value}</p>
          </div>
        ))}
      </div>

      <CalendarGrid state={state} length={stats.length} onSelect={setSelected} />
      <WeekChart data={stats.week} />

      <section className="space-y-2.5">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Goals</h2>
        {goals.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-card/60 p-5 text-center text-sm text-muted-foreground">
            No goals yet — add one in Settings.
          </div>
        )}
        {goals.map((g) => (
          <div key={g.id} className="rounded-[24px] border border-white/10 bg-card/80 p-4">
            <div className="flex items-center gap-2">
              <Target className={`h-3.5 w-3.5 ${g.done ? 'text-emerald-400' : 'text-primary'}`} />
              <p className="truncate text-sm font-bold">
                {g.type === 'custom' ? g.label : `${GOAL_LABELS[g.type]}: ${g.target}`}
              </p>
              <span className="numeric ml-auto text-xs font-bold text-muted-foreground">
                {g.value}/{g.target}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full brand-gradient transition-all duration-700"
                style={{ width: `${g.pct}%` }} />
            </div>
          </div>
        ))}
      </section>

      <DayDetail state={state} dayKey={selected} onClose={() => setSelected(null)} />
    </div>
  );
}