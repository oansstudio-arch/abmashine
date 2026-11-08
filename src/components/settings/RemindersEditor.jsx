import { useState } from 'react';
import { BellRing, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/lib/AppStateContext';
import { notificationPermission, requestNotificationPermission } from '@/lib/notify';
import { uid } from '@/lib/storage';
import { Switch } from '@/components/ui/switch';

export default function RemindersEditor() {
  const { state, update } = useApp();
  const [perm, setPerm] = useState(notificationPermission());

  const ask = async () => {
    const result = await requestNotificationPermission();
    setPerm(result);
    if (result === 'granted') toast.success('System notifications enabled.');
    else if (result === 'denied') toast.error('Notifications are blocked — allow them in your browser settings.');
    else if (result === 'unsupported') toast.error('This browser does not support notifications. In-app reminders still work.');
    else toast('Permission dismissed. In-app reminders still work.');
  };

  const patch = (id, p) => update({ reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...p } : r)) });
  const remove = (id) => update({ reminders: state.reminders.filter((r) => r.id !== id) });
  const add = () => update({ reminders: [...state.reminders, { id: uid(), time: '18:00', enabled: true }] });

  const granted = perm === 'granted';

  return (
    <div className="space-y-2.5">
      <button type="button" onClick={ask}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 text-sm font-bold text-primary">
        <BellRing className="h-4 w-4" />
        {granted ? 'System notifications on' : 'Enable system notifications'}
      </button>

      {state.reminders.map((r) => (
        <div key={r.id} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5">
          <input type="time" value={r.time} onChange={(e) => patch(r.id, { time: e.target.value })}
            className="h-10 rounded-xl border border-white/10 bg-black/25 px-2 text-sm font-semibold outline-none focus:border-primary/60" />
          <span className="text-xs font-semibold text-muted-foreground">
            {r.enabled ? 'Reminder on' : 'Off'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Switch checked={r.enabled} onCheckedChange={(v) => patch(r.id, { enabled: v })} />
            <button type="button" onClick={() => remove(r.id)} aria-label="Remove reminder"
              className="flex h-9 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={add}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 text-sm font-bold text-muted-foreground">
        <Plus className="h-4 w-4" /> Add reminder
      </button>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Web reminders only fire while Abmashine is open — including in a background tab. They are skipped for
        sessions you already completed today and on rest days.
      </p>
    </div>
  );
}