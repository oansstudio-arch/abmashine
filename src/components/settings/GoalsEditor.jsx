import { useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/AppStateContext';
import { computeStats, goalsWithProgress, GOAL_LABELS } from '@/lib/stats';
import { addDays, dateKey } from '@/lib/dates';
import { uid } from '@/lib/storage';
import { inputClass } from '@/components/settings/SettingsSection';

const TYPES = [
  { value: 'days', label: 'Complete days' },
  { value: 'streak', label: 'Day streak' },
  { value: 'sessions', label: 'Total sessions' },
  { value: 'minutes', label: 'Training minutes' },
  { value: 'custom', label: 'Custom goal (text + date)' },
];

export default function GoalsEditor() {
  const { state, update } = useApp();
  const stats = computeStats(state);
  const goals = goalsWithProgress(state, stats);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('days');
  const [target, setTarget] = useState(30);
  const [text, setText] = useState('');
  const [date, setDate] = useState(addDays(dateKey(), 30));

  const add = () => {
    const goal = type === 'custom'
      ? {
          id: uid(), type, label: text.trim() || 'My goal',
          targetDate: date, createdAt: new Date().toISOString(),
        }
      : { id: uid(), type, target: Math.max(1, Number(target) || 1), createdAt: new Date().toISOString() };
    update({ goals: [...state.goals, goal] });
    setOpen(false);
    setText('');
  };

  return (
    <div className="space-y-2.5">
      {goals.map((g) => (
        <div key={g.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="min-w-0 flex-1 truncate text-sm font-bold">
              {g.type === 'custom' ? g.label : `${GOAL_LABELS[g.type]} · ${g.target}`}
            </p>
            <span className="numeric text-[11px] font-bold text-muted-foreground">{g.pct}%</span>
            <button type="button" aria-label="Remove goal"
              onClick={() => update({ goals: state.goals.filter((x) => x.id !== g.id) })}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full brand-gradient" style={{ width: `${g.pct}%` }} />
          </div>
        </div>
      ))}

      {!open && (
        <button type="button" onClick={() => setOpen(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 text-sm font-bold text-muted-foreground">
          <Plus className="h-4 w-4" /> Add goal
        </button>
      )}

      {open && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/25 p-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {type === 'custom' ? (
            <>
              <input value={text} onChange={(e) => setText(e.target.value)}
                placeholder="e.g. 1000 crunches, feel stronger" className={inputClass} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </>
          ) : (
            <input type="number" min={1} value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              placeholder="Target" className={inputClass} />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)}
              className="h-10 flex-1 rounded-xl border border-white/10 text-sm font-bold text-muted-foreground">Cancel</button>
            <button type="button" onClick={add}
              className="h-10 flex-1 rounded-xl brand-gradient text-sm font-bold text-white glow-button">Add goal</button>
          </div>
        </div>
      )}
    </div>
  );
}