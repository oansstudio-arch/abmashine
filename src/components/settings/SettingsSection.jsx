export default function SettingsSection({ title, icon, action, children }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-card/80 p-4 glow-card">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{title}</h2>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm font-semibold outline-none transition-colors focus:border-primary/60';