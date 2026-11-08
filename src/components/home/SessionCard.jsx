import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SessionCard({ session, isNow }) {
  const done = !!session.completedAt;
  return (
    <Link to="/workout"
      className={cn('relative flex items-center gap-3 overflow-hidden rounded-[24px] border p-4 transition-all',
        isNow ? 'border-primary/60 bg-primary/10 glow-ring' : 'border-white/10 bg-card/80',
        done && 'opacity-70')}>
      {isNow && <div className="pointer-events-none absolute inset-0 brand-gradient-soft" />}
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xl">
        {done ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : session.emoji || '💪'}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold">{session.label}</p>
          {isNow && !done && (
            <span className="rounded-full brand-gradient px-2 py-0.5 text-[9px] font-black tracking-widest text-white">NOW</span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {session.time} · {session.workoutName}
        </p>
      </div>
      <span className="relative numeric text-[11px] font-bold text-muted-foreground">
        {done ? 'DONE' : `${session.exercises?.length || 0} ex`}
      </span>
      <ChevronRight className="relative h-4 w-4 text-muted-foreground" />
    </Link>
  );
}