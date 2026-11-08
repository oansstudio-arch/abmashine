import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Search, ShieldCheck } from 'lucide-react';
import { monthLabel, timeAgo } from '@/lib/dates';

export default function AdminPanel({ open, onOpenChange }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [query, setQuery] = useState('');

  const close = (next) => {
    onOpenChange(next);
    if (!next) {
      setPassword('');
      setError('');
      setData(null);
      setQuery('');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('adminParticipants', { password });
      const payload = res?.data || {};
      if (payload.error) {
        setError(payload.error);
      } else {
        setData(payload);
      }
    } catch (err) {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const list = (data?.participants || []).filter((p) =>
    !query.trim() || String(p.name || '').toLowerCase().includes(query.trim().toLowerCase()));
  const total = data?.participants?.length || 0;
  const completed = (data?.participants || []).filter(
    (p) => Number(p.completedDays) >= Number(p.challengeLength || 0) && Number(p.challengeLength) > 0).length;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-[28px] border-white/10 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" /> Admin Panel
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {data ? 'Everyone who ever started an Abmashine challenge.' : 'Restricted area — password required.'}
          </DialogDescription>
        </DialogHeader>

        {!data && (
          <form onSubmit={submit} className="space-y-3">
            <Input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="h-12 rounded-2xl border-white/10 bg-white/5"
            />
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
            <Button type="submit" disabled={loading || !password}
              className="h-12 w-full rounded-2xl brand-gradient font-bold text-white glow-button">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Lock className="mr-2 h-4 w-4" /> Unlock</>}
            </Button>
          </form>
        )}

        {data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Participants</p>
                <p className="numeric text-2xl font-black">{total}</p>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Completed</p>
                <p className="numeric text-2xl font-black text-primary">{completed}</p>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name"
                className="h-11 rounded-2xl border-white/10 bg-white/5 pl-9" />
            </div>

            <div className="space-y-2">
              {list.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No participants found.</p>
              )}
              {list.map((p) => (
                <div key={p.deviceId || p.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-bold">{p.name || 'Anonymous'}</p>
                    <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {p.completedDays}/{p.challengeLength}d
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Started {p.startDate ? monthLabel(p.startDate) : '—'} · last active {timeAgo(p.lastActive)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}