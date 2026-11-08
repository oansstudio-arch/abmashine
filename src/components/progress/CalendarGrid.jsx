import { Coffee } from 'lucide-react';
import { addDays } from '@/lib/dates';
import { dayStatus } from '@/lib/stats';
import { cn } from '@/lib/utils';

const styles = {
  completed: 'brand-gradient text-white shadow-[0_0_18px_rgba(147,51,234,0.55)]',
  rest: 'bg-white/10 text-foreground',
  skipped: 'bg-white/[0.03] text-muted-foreground/50',
  upcoming: 'bg-white/[0.04] text-muted-foreground/60',
  today: 'border border-primary/70 bg-primary/15 text-foreground',
};

export default function CalendarGrid({ state, length, onSelect }) {
  const keys = Array.from({ length }, (_, i) => addDays(state.startDate, i));

  return (
    <div className="rounded-[24px] border border-white/10 bg-card/80 p-4 glow-card">
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {keys.map((key, i) => {
          const status = dayStatus(state, key);
          return (
            <button key={key} type="button" onClick={() => onSelect(key)}
              className={cn('relative flex aspect-square items-center justify-center rounded-xl text-xs font-bold transition-transform active:scale-95',
                styles[status] || styles.upcoming)}>
              {status === 'rest' ? <Coffee className="h-3.5 w-3.5 text-primary" /> : i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full brand-gradient" /> Completed</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-white/20" /> Rest</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" /> Skipped</span>
      </div>
    </div>
  );
}