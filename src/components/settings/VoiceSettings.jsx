import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { useApp } from '@/lib/AppStateContext';
import { CLIPS, playClip, probeClip } from '@/lib/voice';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Row } from '@/components/settings/SettingsSection';

export default function VoiceSettings() {
  const { state, setSettings } = useApp();
  const [custom, setCustom] = useState({});

  useEffect(() => {
    let alive = true;
    Promise.all(CLIPS.map(async (clip) => [clip.key, await probeClip(clip.file)]))
      .then((entries) => { if (alive) setCustom(Object.fromEntries(entries)); });
    return () => { alive = false; };
  }, []);

  const volume = Math.round((state.settings.volume ?? 0.8) * 100);

  return (
    <div className="space-y-3">
      <Row label="Voice coach" hint="Spoken coaching during sessions">
        <Switch checked={state.settings.voiceEnabled}
          onCheckedChange={(v) => setSettings({ voiceEnabled: v })} />
      </Row>
      <Row label="Sound effects" hint="Countdown beeps and cues">
        <Switch checked={state.settings.sfxEnabled}
          onCheckedChange={(v) => setSettings({ sfxEnabled: v })} />
      </Row>
      <Row label="Rest countdown beeps" hint="Last 3 seconds of every rest">
        <Switch checked={state.settings.beepsEnabled}
          onCheckedChange={(v) => setSettings({ beepsEnabled: v })} />
      </Row>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Volume</p>
          <span className="numeric text-xs font-bold text-muted-foreground">{volume}%</span>
        </div>
        <Slider className="mt-2" value={[volume]} min={0} max={100} step={5}
          onValueChange={([v]) => setSettings({ volume: v / 100 })} />
      </div>

      <div className="space-y-1.5 pt-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Voice clips</p>
        {CLIPS.map((clip) => (
          <div key={clip.key} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{clip.label}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {custom[clip.key] === undefined
                  ? 'checking…'
                  : custom[clip.key] ? 'custom recording' : 'synthetic voice'}
              </p>
            </div>
            <button type="button" aria-label={`Play ${clip.label}`}
              onClick={() => playClip(clip.key, clip.text(state.name), true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-primary">
              <Play className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
          Drop your own MP3s into the audio folder to replace any line. Missing files fall back to the
          browser's English voice.
        </p>
      </div>
    </div>
  );
}