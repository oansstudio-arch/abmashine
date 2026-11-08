import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { uid } from '@/lib/storage';
import { inputClass } from '@/components/settings/SettingsSection';
import { cn } from '@/lib/utils';

const EMOJIS = ['🔥', '💪', '⚡', '🧘', '🏋️', '🥵', '🌙', '⭐'];

const emptyExercise = (restAfter = 30, restBetween = 20) => ({
  id: uid(), name: '', tip: '', type: 'reps', target: 15, estDuration: 45,
  sets: 1, restAfter, restBetweenSets: restBetween,
});

function Mini({ label, children }) {
  return (
    <label className="block">
      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function WorkoutEditor({ open, workout, defaultRest = 30, defaultBetween = 20, onOpenChange, onSave }) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!open) return;
    setDraft(workout
      ? JSON.parse(JSON.stringify(workout))
      : {
          id: uid(), name: '', emoji: '🔥',
          overload: { enabled: false, amount: 2, everyDays: 7 },
          exercises: [emptyExercise(defaultRest, defaultBetween)],
        });
  }, [open, workout, defaultRest, defaultBetween]);

  if (!draft) return null;

  const patch = (p) => setDraft((d) => ({ ...d, ...p }));
  const patchEx = (i, p) =>
    setDraft((d) => ({ ...d, exercises: d.exercises.map((ex, idx) => (idx === i ? { ...ex, ...p } : ex)) }));

  const save = () => {
    const exercises = draft.exercises
      .filter((ex) => ex.name.trim())
      .map((ex) => ({
        ...ex,
        name: ex.name.trim(),
        target: Math.max(1, Number(ex.target) || 1),
        sets: Math.max(1, Number(ex.sets) || 1),
      }));
    onSave({ ...draft, name: draft.name.trim() || 'My workout', exercises });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto rounded-[28px] border-white/10 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{workout ? 'Edit workout' : 'New workout'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <input value={draft.name} onChange={(e) => patch({ name: e.target.value })}
            placeholder="Workout name" className={inputClass} />

          <div className="flex gap-1.5">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => patch({ emoji: e })}
                className={cn('flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-all',
                  draft.emoji === e ? 'border-primary/60 bg-primary/20' : 'border-white/10 bg-white/5')}>
                {e}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {draft.exercises.map((ex, i) => (
              <div key={ex.id || i} className="space-y-2 rounded-2xl border border-white/10 bg-black/25 p-3">
                <div className="flex items-center gap-2">
                  <input value={ex.name} onChange={(e) => patchEx(i, { name: e.target.value })}
                    placeholder={`Exercise ${i + 1}`}
                    className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-semibold outline-none focus:border-primary/60" />
                  <button type="button" onClick={() => patch({ exercises: draft.exercises.filter((_, idx) => idx !== i) })}
                    aria-label="Remove exercise"
                    className="flex h-10 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-muted-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <input value={ex.tip || ''} onChange={(e) => patchEx(i, { tip: e.target.value })}
                  placeholder="Tip or description (optional)"
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-xs outline-none focus:border-primary/60" />

                <div className="grid grid-cols-2 gap-1.5">
                  {['reps', 'timed'].map((t) => (
                    <button key={t} type="button" onClick={() => patchEx(i, { type: t })}
                      className={cn('h-9 rounded-xl border text-xs font-bold capitalize transition-all',
                        ex.type === t ? 'border-primary/60 brand-gradient text-white' : 'border-white/10 bg-white/5 text-muted-foreground')}>
                      {t === 'reps' ? 'Reps' : 'Timed'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <Mini label={ex.type === 'timed' ? 'Seconds' : 'Reps'}>
                    <input type="number" min={1} value={ex.target}
                      onChange={(e) => patchEx(i, { target: Number(e.target.value) })}
                      className="h-9 w-full rounded-xl border border-white/10 bg-black/30 px-2 text-sm font-semibold outline-none focus:border-primary/60" />
                  </Mini>
                  <Mini label="Sets">
                    <input type="number" min={1} max={10} value={ex.sets}
                      onChange={(e) => patchEx(i, { sets: Number(e.target.value) })}
                      className="h-9 w-full rounded-xl border border-white/10 bg-black/30 px-2 text-sm font-semibold outline-none focus:border-primary/60" />
                  </Mini>
                  <Mini label={ex.type === 'timed' ? 'Est. sec' : 'Sec/set'}>
                    <input type="number" min={5} value={ex.estDuration || 45}
                      onChange={(e) => patchEx(i, { estDuration: Number(e.target.value) })}
                      className="h-9 w-full rounded-xl border border-white/10 bg-black/30 px-2 text-sm font-semibold outline-none focus:border-primary/60" />
                  </Mini>
                  <Mini label="Rest after">
                    <input type="number" min={0} value={ex.restAfter}
                      onChange={(e) => patchEx(i, { restAfter: Number(e.target.value) })}
                      className="h-9 w-full rounded-xl border border-white/10 bg-black/30 px-2 text-sm font-semibold outline-none focus:border-primary/60" />
                  </Mini>
                  <Mini label="Rest / set">
                    <input type="number" min={0} value={ex.restBetweenSets}
                      onChange={(e) => patchEx(i, { restBetweenSets: Number(e.target.value) })}
                      className="h-9 w-full rounded-xl border border-white/10 bg-black/30 px-2 text-sm font-semibold outline-none focus:border-primary/60" />
                  </Mini>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => patch({ exercises: [...draft.exercises, emptyExercise(defaultRest, defaultBetween)] })}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 text-sm font-bold text-muted-foreground">
            <Plus className="h-4 w-4" /> Add exercise
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Progressive overload</p>
                <p className="text-[11px] text-muted-foreground">Grow reps or seconds over time.</p>
              </div>
              <button type="button"
                onClick={() => patch({ overload: { ...draft.overload, enabled: !draft.overload?.enabled } })}
                className={cn('h-7 w-12 rounded-full p-0.5 transition-colors',
                  draft.overload?.enabled ? 'bg-primary' : 'bg-white/15')}>
                <span className={cn('block h-6 w-6 rounded-full bg-white transition-transform',
                  draft.overload?.enabled ? 'translate-x-5' : 'translate-x-0')} />
              </button>
            </div>
            {draft.overload?.enabled && (
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Mini label="Add per step">
                  <input type="number" min={1} value={draft.overload.amount}
                    onChange={(e) => patch({ overload: { ...draft.overload, amount: Number(e.target.value) } })}
                    className="h-9 w-full rounded-xl border border-white/10 bg-black/30 px-2 text-sm font-semibold outline-none focus:border-primary/60" />
                </Mini>
                <Mini label="Every N days">
                  <input type="number" min={1} value={draft.overload.everyDays}
                    onChange={(e) => patch({ overload: { ...draft.overload, everyDays: Number(e.target.value) } })}
                    className="h-9 w-full rounded-xl border border-white/10 bg-black/30 px-2 text-sm font-semibold outline-none focus:border-primary/60" />
                </Mini>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl">Cancel</Button>
          <Button onClick={save} disabled={draft.exercises.every((ex) => !ex.name.trim())}
            className="rounded-2xl brand-gradient font-bold text-white glow-button">Save workout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}