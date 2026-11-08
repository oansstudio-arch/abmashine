import { CheckCircle2, Circle, Coffee } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { dayNumber, monthLabel } from '@/lib/dates';
import { dayStatus } from '@/lib/stats';

const statusText = {
  completed: 'Completed',
  rest: 'Rest day',
  skipped: 'Skipped',
  today: 'Today',
  upcoming: 'Upcoming',
};

const timeOf = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null;

export default function DayDetail({ state, dayKey, onClose }) {
  if (!dayKey) return null;
  const day = state.days[dayKey];
  const status = dayStatus(state, dayKey);
  const num = dayNumber(state.startDate, dayKey);

  return (
    <Dialog open={!!dayKey} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[80dvh] overflow-y-auto rounded-[28px] border-white/10 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Day {num} · {monthLabel(dayKey)}</DialogTitle>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{statusText[status]}</p>
        </DialogHeader>

        {status === 'rest' && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Coffee className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Recovery day — your streak is safe.</p>
          </div>
        )}

        {!day && status !== 'rest' && (
          <p className="py-6 text-center text-sm text-muted-foreground">Nothing logged for this day.</p>
        )}

        {day && (day.sessions || []).map((s) => (
          <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold">{s.label} · {s.workoutName}</p>
              {s.completedAt
                ? <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    {timeOf(s.completedAt)}
                  </span>
                : <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Open</span>}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Scheduled {s.time}</p>

            <div className="mt-3 space-y-1.5">
              {(s.exercises || []).map((ex, i) => {
                const done = ex.done || Number(ex.doneSets) >= Number(ex.sets || 1);
                return (
                  <div key={`${ex.id || i}`} className="flex items-center gap-2 text-xs">
                    {done
                      ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      : <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
                    <span className={done ? 'font-semibold' : 'text-muted-foreground'}>{ex.name}</span>
                    <span className="ml-auto numeric text-[11px] text-muted-foreground">
                      {ex.type === 'timed' ? `${ex.target}s` : `${ex.target} reps`} · {ex.sets}×
                    </span>
                  </div>
                );
              })}
              {(s.exercises || []).length === 0 && (
                <p className="text-xs text-muted-foreground">No workout assigned.</p>
              )}
            </div>
            {s.durationSec > 0 && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Took {Math.max(1, Math.round(s.durationSec / 60))} min
              </p>
            )}
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}