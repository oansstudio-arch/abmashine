import { useApp } from '@/lib/AppStateContext';
import { dateKey, dayNumber } from '@/lib/dates';
import { Field, inputClass } from '@/components/settings/SettingsSection';

export default function ProfileSettings() {
  const { state, update } = useApp();
  const num = dayNumber(state.startDate, dateKey());

  return (
    <div className="space-y-3">
      <Field label="Your name">
        <input
          value={state.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Your name"
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Challenge days">
          <input
            type="number" min={1} max={365}
            value={state.challengeLength}
            onChange={(e) => update({ challengeLength: Math.max(1, Math.min(365, Number(e.target.value) || 1)) })}
            className={inputClass}
          />
        </Field>
        <Field label="Start date">
          <input
            type="date"
            value={state.startDate}
            onChange={(e) => { if (e.target.value) update({ startDate: e.target.value }); }}
            className={inputClass}
          />
        </Field>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {num > 0 && num <= state.challengeLength ? `You're on day ${num} of ${state.challengeLength}.` : `Challenge runs ${state.challengeLength} days from ${state.startDate}.`}
      </p>
    </div>
  );
}