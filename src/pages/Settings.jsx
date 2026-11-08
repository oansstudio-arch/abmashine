import { Bell, Database, Dumbbell, ListOrdered, Moon, Target, Timer, User, Volume2 } from 'lucide-react';
import { useApp } from '@/lib/AppStateContext';
import SettingsSection, { Field, Row, inputClass } from '@/components/settings/SettingsSection';
import ProfileSettings from '@/components/settings/ProfileSettings';
import WorkoutList from '@/components/settings/WorkoutList';
import ScheduleEditor from '@/components/settings/ScheduleEditor';
import GoalsEditor from '@/components/settings/GoalsEditor';
import RemindersEditor from '@/components/settings/RemindersEditor';
import VoiceSettings from '@/components/settings/VoiceSettings';
import DataTools from '@/components/settings/DataTools';
import { Switch } from '@/components/ui/switch';

const icon = 'h-3.5 w-3.5 text-primary';

export default function Settings() {
  const { state, setSettings } = useApp();

  return (
    <div className="space-y-4">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Settings</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Make it yours</h1>
      </header>

      <SettingsSection title="Profile" icon={<User className={icon} />}>
        <ProfileSettings />
      </SettingsSection>

      <SettingsSection title="Workouts" icon={<Dumbbell className={icon} />}>
        <WorkoutList />
      </SettingsSection>

      <SettingsSection title="Session schedule" icon={<ListOrdered className={icon} />}>
        <ScheduleEditor />
      </SettingsSection>

      <SettingsSection title="Goals" icon={<Target className={icon} />}>
        <GoalsEditor />
      </SettingsSection>

      <SettingsSection title="Rest & defaults" icon={<Timer className={icon} />}>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Rest after exercise">
            <input type="number" min={0} value={state.settings.defaultRest}
              onChange={(e) => setSettings({ defaultRest: Math.max(0, Number(e.target.value) || 0) })}
              className={inputClass} />
          </Field>
          <Field label="Rest between sets">
            <input type="number" min={0} value={state.settings.defaultRestBetweenSets}
              onChange={(e) => setSettings({ defaultRestBetweenSets: Math.max(0, Number(e.target.value) || 0) })}
              className={inputClass} />
          </Field>
        </div>
        <p className="text-[11px] text-muted-foreground">
          New exercises start with these values — you can change each one individually.
        </p>
      </SettingsSection>

      <SettingsSection title="Reminders" icon={<Bell className={icon} />}>
        <RemindersEditor />
      </SettingsSection>

      <SettingsSection title="Voice coach" icon={<Volume2 className={icon} />}>
        <VoiceSettings />
      </SettingsSection>

      <SettingsSection title="Appearance" icon={<Moon className={icon} />}>
        <Row label="Dark mode" hint="Purple night theme">
          <Switch checked={state.settings.darkMode}
            onCheckedChange={(v) => setSettings({ darkMode: v })} />
        </Row>
      </SettingsSection>

      <SettingsSection title="Data" icon={<Database className={icon} />}>
        <DataTools />
      </SettingsSection>

      <div className="pb-2 pt-4 text-center">
        <p className="text-[11px] font-semibold text-muted-foreground">Abmashine™</p>
        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground/70">
          Abmashine™ is a trademark of FitnesS Corporations™
        </p>
      </div>
    </div>
  );
}