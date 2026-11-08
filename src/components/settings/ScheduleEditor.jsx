import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/AppStateContext';
import { refreshDayRecord } from '@/lib/stats';
import { dateKey } from '@/lib/dates';
import { DEFAULT_TIMES, buildSessionTemplate } from '@/lib/storage';
import { inputClass } from '@/components/settings/SettingsSection';

export default function ScheduleEditor() {
  const { state, update } = useApp();
  const today = dateKey();

  const persist = (schedule) => {
    const patch = { schedule };
    if (state.days[today]) {
      patch.days = { ...state.days, [today]: refreshDayRecord({ ...state, schedule }, today) };
    }
    update(patch);
  };

  const patchSession = (id, p) => persist(state.schedule.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const removeSession = (id) => persist(state.schedule.filter((s) => s.id !== id));
  const addSession = () => {
    if (state.schedule.length >= 5) return;
    const index = state.schedule.length;
    persist([...state.schedule, buildSessionTemplate(index, DEFAULT_TIMES[index], state.workouts[0]?.id || null)]);
  };

  return (
    <div className="space-y-2.5">
      {state.schedule.map((session) => (
        <div key={session.id} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2">
            <input value={session.label} onChange={(e) => patchSession(session.id, { label: e.target.value })}
              className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-bold outline-none focus:border-primary/60" />
            <input type="time" value={session.time} onChange={(e) => patchSession(session.id, { time: e.target.value })}
              className="h-10 rounded-xl border border-white/10 bg-black/25 px-2 text-sm font-semibold outline-none focus:border-primary/60" />
            <button type="button" onClick={() => removeSession(session.id)} aria-label="Remove session"
              className="flex h-10 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-muted-foreground">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <select
            value={session.workoutId || ''}
            onChange={(e) => patchSession(session.id, { workoutId: e.target.value || null })}
            className={inputClass}
          >
            <option value="">No workout assigned</option>
            {state.workouts.map((w) => (
              <option key={w.id} value={w.id}>{w.emoji} {w.name}</option>
            ))}
          </select>
        </div>
      ))}

      <div className="flex gap-2">
        <button type="button" onClick={addSession} disabled={state.schedule.length >= 5}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 text-sm font-bold text-muted-foreground disabled:opacity-40">
          <Plus className="h-4 w-4" /> Add session
        </button>
      </div>

      {state.workouts.length > 1 && (
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Same workout for every session
          </p>
          <select
            value=""
            onChange={(e) => { if (e.target.value) persist(state.schedule.map((s) => ({ ...s, workoutId: e.target.value }))); }}
            className={inputClass}
          >
            <option value="">Choose a workout…</option>
            {state.workouts.map((w) => (
              <option key={w.id} value={w.id}>{w.emoji} {w.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}