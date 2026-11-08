import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Flame, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/AppStateContext';
import { DEFAULT_TIMES, SESSION_LABELS } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const LENGTHS = [7, 14, 21, 30, 60];

const slide = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function Welcome() {
  const navigate = useNavigate();
  const { startChallenge } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [length, setLength] = useState(30);
  const [customLength, setCustomLength] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  const [sessions, setSessions] = useState(3);
  const [times, setTimes] = useState(DEFAULT_TIMES.slice(0, 3));

  const isCustom = !LENGTHS.includes(length);
  const finalLength = isCustom ? Math.min(365, Math.max(1, Number(customLength) || 0)) : length;
  const nameOk = name.trim().length >= 2;
  const lengthOk = finalLength >= 1;

  const setTime = (i, value) => {
    setTimes((prev) => prev.map((t, idx) => (idx === i ? value : t)));
  };

  const changeSessions = (count) => {
    setSessions(count);
    setTimes((prev) => {
      const next = [...prev];
      DEFAULT_TIMES.slice(0, count).forEach((t, i) => { if (!next[i]) next[i] = t; });
      return next;
    });
  };

  const finish = () => {
    startChallenge({
      name: name.trim(),
      length: finalLength,
      useTemplate,
      sessionsPerDay: sessions,
      times: times.slice(0, sessions),
    });
    navigate('/home');
  };

  const canNext = step === 0 ? nameOk : step === 1 ? lengthOk : true;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 aurora" />
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-12">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Core training
          </div>
          <h1 className="mt-3 text-[2.7rem] font-black leading-none tracking-tighter brand-text text-glow">
            ABMASHINE™
          </h1>
          <p className="mt-3 max-w-[19rem] text-[15px] leading-relaxed text-muted-foreground">
            Your challenge. Your rules. Every day one step closer.
          </p>
        </motion.div>

        <div className="mt-7 flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn('h-1 flex-1 rounded-full transition-all duration-500',
              i <= step ? 'brand-gradient' : 'bg-white/10')} />
          ))}
        </div>

        <div className="mt-6 flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={step} variants={slide} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.28, ease: 'easeOut' }} className="space-y-5">
              {step === 0 && (
                <div className="rounded-[28px] border border-white/10 bg-card/80 p-6 glow-card backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 1</p>
                  <h2 className="mt-2 text-2xl font-bold">What should the coach call you?</h2>
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your first name"
                    className="mt-5 h-14 rounded-2xl border-white/10 bg-white/5 text-lg font-semibold placeholder:font-normal"
                  />
                  <p className={cn('mt-2 text-xs', nameOk ? 'text-emerald-400' : 'text-muted-foreground')}>
                    {nameOk ? 'Nice to meet you!' : 'At least 2 characters.'}
                  </p>
                </div>
              )}

              {step === 1 && (
                <div className="rounded-[28px] border border-white/10 bg-card/80 p-6 glow-card backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 2</p>
                  <h2 className="mt-2 text-2xl font-bold">Choose your challenge length</h2>
                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {LENGTHS.map((n) => (
                      <button key={n} type="button" onClick={() => { setLength(n); setCustomLength(''); }}
                        className={cn('rounded-2xl border py-4 text-lg font-bold transition-all',
                          !isCustom && length === n
                            ? 'border-primary/60 brand-gradient text-white glow-button'
                            : 'border-white/10 bg-white/5 text-foreground hover:border-primary/40')}>
                        {n}
                        <span className="ml-1 text-xs font-medium opacity-70">d</span>
                      </button>
                    ))}
                    <button type="button" onClick={() => setLength(-1)}
                      className={cn('rounded-2xl border py-4 text-sm font-bold transition-all',
                        isCustom ? 'border-primary/60 brand-gradient text-white glow-button'
                          : 'border-white/10 bg-white/5 hover:border-primary/40')}>
                      Custom
                    </button>
                  </div>
                  {isCustom && (
                    <Input
                      autoFocus
                      type="number"
                      min={1}
                      max={365}
                      value={customLength}
                      onChange={(e) => setCustomLength(e.target.value)}
                      placeholder="Number of days"
                      className="mt-4 h-14 rounded-2xl border-white/10 bg-white/5 text-lg font-semibold"
                    />
                  )}
                  <p className="mt-4 text-xs text-muted-foreground">
                    {lengthOk ? `${finalLength} days of showing up for yourself.` : 'Enter a length between 1 and 365 days.'}
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="rounded-[28px] border border-white/10 bg-card/80 p-6 glow-card backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 3</p>
                    <h2 className="mt-2 text-2xl font-bold">Start with a template?</h2>
                  </div>
                  <button type="button" onClick={() => setUseTemplate(true)}
                    className={cn('w-full rounded-[24px] border p-5 text-left transition-all',
                      useTemplate ? 'border-primary/60 bg-primary/15 glow-ring' : 'border-white/10 bg-card/70')}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-lg font-bold"><Flame className="h-5 w-5 text-primary" /> Classic Abs</div>
                      {useTemplate && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <li>Leg Raises · 15 reps</li>
                      <li>Mountain Climbers · 20 reps</li>
                      <li>Bicycle Crunches · 20 reps</li>
                      <li>Plank · 40 seconds</li>
                    </ul>
                  </button>
                  <button type="button" onClick={() => setUseTemplate(false)}
                    className={cn('w-full rounded-[24px] border p-5 text-left transition-all',
                      !useTemplate ? 'border-primary/60 bg-primary/15 glow-ring' : 'border-white/10 bg-card/70')}>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold">Start empty</div>
                      {!useTemplate && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Build every exercise yourself in Settings.</p>
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="rounded-[28px] border border-white/10 bg-card/80 p-6 glow-card backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 4</p>
                  <h2 className="mt-2 text-2xl font-bold">Daily goal</h2>
                  <p className="mt-1 text-sm text-muted-foreground">How many sessions per day?</p>
                  <div className="mt-4 flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => changeSessions(n)}
                        className={cn('h-12 flex-1 rounded-2xl border text-base font-bold transition-all',
                          sessions === n ? 'border-primary/60 brand-gradient text-white glow-button'
                            : 'border-white/10 bg-white/5 hover:border-primary/40')}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 space-y-2.5">
                    {Array.from({ length: sessions }, (_, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="w-20 text-sm font-semibold">{SESSION_LABELS[i]}</span>
                        <input
                          type="time"
                          value={times[i] || DEFAULT_TIMES[i]}
                          onChange={(e) => setTime(i, e.target.value)}
                          className="ml-auto rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-sm font-semibold text-foreground outline-none focus:border-primary/60"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {finalLength} days · {sessions} session{sessions > 1 ? 's' : ''} a day · starting today
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {step > 0 && (
            <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}
              className="h-14 rounded-2xl px-5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)}
              className="h-14 flex-1 rounded-2xl brand-gradient text-base font-bold tracking-wide text-white glow-button disabled:opacity-40">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={finish}
              className="h-14 flex-1 rounded-2xl brand-gradient text-base font-bold tracking-[0.14em] text-white glow-button">
              START CHALLENGE
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-[10px] leading-relaxed text-muted-foreground/70">
          Abmashine™ is a trademark of FitnesS Corporations™
        </p>
      </div>
    </div>
  );
}