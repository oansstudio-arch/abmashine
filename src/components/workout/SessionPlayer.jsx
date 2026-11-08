import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/AppStateContext';
import { beep, playClip, speakText } from '@/lib/voice';
import { effectiveTarget } from '@/lib/stats';
import ExerciseCard from '@/components/workout/ExerciseCard';
import RestOverlay from '@/components/workout/RestOverlay';

const amountText = (ex, target) =>
  ex?.type === 'timed' ? `${target} seconds` : `${target} reps`;

export default function SessionPlayer({ dayKey, session, dayNum, onSessionComplete }) {
  const { state, setExerciseProgress } = useApp();
  const workout = (state.workouts || []).find((w) => w.id === session.workoutId);
  const exercises = session.exercises || [];

  const [run, setRun] = useState(null);
  const [now, setNow] = useState(Date.now());
  const runRef = useRef(null);
  const advanceRef = useRef(() => {});
  const beepRef = useRef(0);
  const calledRef = useRef(new Set());
  const startedRef = useRef(Date.now());
  const finishedRef = useRef(false);
  const runSeq = useRef(0);

  runRef.current = run;

  const targetFor = (i) => effectiveTarget(exercises[i] || {}, workout, dayNum);
  const workSeconds = (i) => {
    const ex = exercises[i];
    if (!ex) return 30;
    if (ex.type === 'timed') return Math.max(5, targetFor(i));
    return Math.max(15, Number(ex.estDuration) || targetFor(i) * 3);
  };

  const startWork = (index, setIndex) => {
    const ex = exercises[index];
    if (!ex) return;
    const duration = workSeconds(index);
    runSeq.current += 1;
    setNow(Date.now());
    beep(640, 0.08);
    setRun({
      key: runSeq.current, phase: 'work', exIndex: index, setIndex,
      duration, endsAt: Date.now() + duration * 1000, paused: false,
    });
    const sets = Math.max(1, Number(ex.sets) || 1);
    const setPart = sets > 1 ? ` Set ${setIndex + 1} of ${sets}.` : '';
    speakText(`${ex.name}. ${amountText(ex, targetFor(index))}.${setPart}`);
  };

  const startRest = (kind, nextIndex, nextSetIndex, duration) => {
    runSeq.current += 1;
    beepRef.current = 0;
    setNow(Date.now());
    setRun({
      key: runSeq.current, phase: 'rest', kind, exIndex: nextIndex, setIndex: nextSetIndex,
      duration: Math.max(0, duration), endsAt: Date.now() + Math.max(0, duration) * 1000, paused: false,
    });
    if (duration > 0) {
      if (kind === 'exercise') playClip('rest_start', 'Great work. Rest now, breathe deep.');
      else speakText(`Rest ${Math.round(duration)} seconds.`);
    }
  };

  const finishSession = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setRun(null);
    speakText(`Session complete. Nice work!`);
    const duration = Math.max(1, Math.round((Date.now() - startedRef.current) / 1000));
    onSessionComplete(duration);
  };

  const advance = () => {
    const r = runRef.current;
    if (!r) return;
    if (r.phase === 'rest') {
      startWork(r.exIndex, r.kind === 'set' ? r.setIndex : 0);
      return;
    }
    const ex = exercises[r.exIndex];
    const sets = Math.max(1, Number(ex?.sets) || 1);
    const doneSets = Math.min(sets, r.setIndex + 1);
    setExerciseProgress(dayKey, session.id, r.exIndex, doneSets);
    beep(1040, 0.12);
    if (doneSets < sets) {
      startRest('set', r.exIndex, doneSets, Math.max(0, Number(ex?.restBetweenSets) || 0));
      return;
    }
    playClip('exercise_complete', 'Nice! Another one done!');
    if (r.exIndex >= exercises.length - 1) finishSession();
    else startRest('exercise', r.exIndex + 1, 0, Math.max(0, Number(ex?.restAfter) || 0));
  };
  advanceRef.current = advance;

  const remaining = run
    ? Math.max(0, (run.paused ? run.pausedRemaining ?? 0 : (run.endsAt - now) / 1000))
    : 0;

  useEffect(() => {
    if (!run || run.paused) return undefined;
    const id = setInterval(() => {
      const rem = (run.endsAt - Date.now()) / 1000;
      if (rem <= 0) {
        clearInterval(id);
        advanceRef.current();
        return;
      }
      setNow(Date.now());
      const secs = Math.ceil(rem);
      if (run.phase === 'rest' && secs <= 3 && secs >= 1 && beepRef.current !== secs) {
        beepRef.current = secs;
        beep(secs === 1 ? 1180 : 880, 0.11);
      }
      if (run.phase === 'work' && exercises[run.exIndex]?.type === 'timed') {
        const marks = [Math.round(run.duration / 2), 10, 3, 2, 1];
        const markKey = `${run.key}-${secs}`;
        if (marks.includes(secs) && !calledRef.current.has(markKey)) {
          calledRef.current.add(markKey);
          speakText(secs <= 3 ? String(secs) : secs === 10 ? 'Ten seconds left' : 'Halfway there!');
        }
      }
    }, 200);
    return () => clearInterval(id);
  }, [run, exercises]);

  const togglePause = () => {
    setRun((r) => {
      if (!r) return r;
      if (r.paused) {
        return { ...r, paused: false, endsAt: Date.now() + (r.pausedRemaining || 0) * 1000 };
      }
      return { ...r, paused: true, pausedRemaining: Math.max(0, (r.endsAt - Date.now()) / 1000) };
    });
    setNow(Date.now());
  };

  const restartPhase = () => {
    setRun((r) => (r ? { ...r, paused: false, endsAt: Date.now() + r.duration * 1000 } : r));
    setNow(Date.now());
  };

  const startFrom = (i) => {
    const ex = session.exercises[i];
    if (!ex) return;
    const sets = Math.max(1, Number(ex.sets) || 1);
    const done = Number(ex.doneSets) || 0;
    if (done >= sets) {
      setExerciseProgress(dayKey, session.id, i, 0);
      startWork(i, 0);
      return;
    }
    startWork(i, done);
  };

  const toggleDone = (i) => {
    const ex = session.exercises[i];
    if (!ex) return;
    const sets = Math.max(1, Number(ex.sets) || 1);
    const done = Number(ex.doneSets) || 0;
    const next = done >= sets ? 0 : sets;
    setExerciseProgress(dayKey, session.id, i, next);
    if (runRef.current?.phase === 'work' && runRef.current.exIndex === i) setRun(null);
  };

  const upcoming = run?.phase === 'rest'
    ? {
        label: exercises[run.exIndex]?.name || 'Next exercise',
        meta: run.kind === 'set'
          ? `Set ${run.setIndex + 1} of ${Math.max(1, Number(exercises[run.exIndex]?.sets) || 1)}`
          : amountText(exercises[run.exIndex], targetFor(run.exIndex)),
      }
    : { label: '', meta: '' };

  return (
    <div className="space-y-3">
      {exercises.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-white/15 bg-card/60 p-6 text-center">
          <p className="font-bold">No exercises yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign a workout to this session in Settings, or add exercises to your workout.
          </p>
        </div>
      )}

      {exercises.map((ex, i) => {
        const active = run?.phase === 'work' && run.exIndex === i;
        return (
          <ExerciseCard
            key={`${ex.id || i}`}
            index={i}
            exercise={ex}
            target={targetFor(i)}
            active={active}
            doneSets={Number(ex.doneSets) || 0}
            remaining={active ? remaining : 0}
            paused={!!run?.paused}
            running={!!run}
            onStart={() => startFrom(i)}
            onPause={togglePause}
            onRestart={restartPhase}
            onAdvance={() => advanceRef.current()}
            onToggleDone={() => toggleDone(i)}
          />
        );
      })}

      <RestOverlay
        open={run?.phase === 'rest'}
        remaining={remaining}
        paused={!!run?.paused}
        onPause={togglePause}
        onSkip={() => advanceRef.current()}
        nextLabel={upcoming.label}
        nextMeta={upcoming.meta}
      />
    </div>
  );
}