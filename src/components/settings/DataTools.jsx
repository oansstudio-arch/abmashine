import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/lib/AppStateContext';
import { dateKey } from '@/lib/dates';
import ConfirmDialog from '@/components/settings/ConfirmDialog';

export default function DataTools() {
  const { state, importState, resetChallenge } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `abmashine-backup-${dateKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded.');
  };

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== 'object') throw new Error('invalid');
      importState(parsed);
      toast.success('Backup restored.');
      navigate('/home');
    } catch (e) {
      toast.error('That file is not an Abmashine backup.');
    }
  };

  return (
    <div className="space-y-2.5">
      <button type="button" onClick={exportData}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm font-bold">
        <Download className="h-4 w-4" /> Export data (JSON)
      </button>

      <button type="button" onClick={() => fileRef.current?.click()}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm font-bold">
        <Upload className="h-4 w-4" /> Import backup
      </button>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />

      <button type="button" onClick={() => setConfirmReset(true)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 text-sm font-bold text-destructive">
        <RotateCcw className="h-4 w-4" /> Reset challenge
      </button>

      <ConfirmDialog
        open={confirmReset}
        title="Reset your challenge?"
        description="All progress, workouts and goals on this device will be deleted. This cannot be undone."
        confirmLabel="Reset everything"
        onOpenChange={setConfirmReset}
        onConfirm={() => { resetChallenge(); setConfirmReset(false); navigate('/'); }}
      />
    </div>
  );
}