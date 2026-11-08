import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts';

export default function WeekChart({ data }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-card/80 p-4 glow-card">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">This week</h3>
        <p className="numeric text-xs font-bold text-primary">
          {data.reduce((sum, d) => sum + d.sessions, 0)} sessions
        </p>
      </div>
      <div className="mt-3 h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(281 90% 68%)" />
                <stop offset="100%" stopColor="hsl(320 86% 60%)" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label" tickLine={false} axisLine={false}
              tick={{ fill: 'hsl(268 16% 62%)', fontSize: 10, fontWeight: 600 }}
            />
            <Bar dataKey="sessions" radius={[8, 8, 8, 8]} maxBarSize={26}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.sessions > 0 ? 'url(#barGrad)' : 'hsl(0 0% 100% / 0.08)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}