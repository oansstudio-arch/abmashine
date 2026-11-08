import { addDays, dateKey, dayNumber, diffDays, shortWeekday } from '@/lib/dates';

export const buildDayRecord = (state, key) => {
  const sessions = (state.schedule || []).map((s) => {
    const workout = (state.workouts || []).find((w) => w.id === s.workoutId);
    return {
      id: s.id,
      label: s.label,
      time: s.time,
      workoutId: s.workoutId,
      workoutName: workout ? workout.name : 'No workout yet',
      emoji: workout ? workout.emoji : '➕',
      startedAt: null,
      completedAt: null,
      durationSec: 0,
      exercises: workout
        ? workout.exercises.map((ex) => ({
            ...ex,
            doneSets: 0,
            done: false,
            completedAt: null,
          }))
        : [],
    };
  });
  return { key, status: 'active', sessions, createdAt: new Date().toISOString() };
};

export const refreshDayRecord = (state, key) => {
  const rebuilt = buildDayRecord(state, key);
  const existing = state.days[key];
  if (!existing) return rebuilt;
  const sessions = rebuilt.sessions.map((fresh) => {
    const old = (existing.sessions || []).find((o) => o.id === fresh.id);
    if (!old) return fresh;
    const untouched = !old.startedAt && !old.completedAt;
    const sameWorkout = old.workoutId === fresh.workoutId;
    return {
      ...fresh,
      startedAt: old.startedAt || null,
      completedAt: old.completedAt || null,
      durationSec: old.durationSec || 0,
      exercises: sameWorkout && !untouched && (old.exercises || []).length
        ? old.exercises
        : fresh.exercises,
    };
  });
  return { ...rebuilt, status: existing.status === 'rest' ? 'rest' : 'active', sessions };
};

export const isDayRest = (day) => day?.status === 'rest';
export const isDayComplete = (day) =>
  !!day && day.status !== 'rest' && (day.sessions || []).length > 0 &&
  day.sessions.every((s) => !!s.completedAt);

export const dayStatus = (state, key) => {
  const day = state.days[key];
  const num = dayNumber(state.startDate, key);
  const today = dateKey();
  if (isDayRest(day)) return 'rest';
  if (isDayComplete(day)) return 'completed';
  if (diffDays(key, today) > 0) return 'upcoming';
  if (key === today) return 'today';
  if (num >= 1 && num <= state.challengeLength) return 'skipped';
  return 'upcoming';
};

export const effectiveTarget = (exercise, workout, dayNum) => {
  const base = Number(exercise.target) || 0;
  const ov = workout?.overload;
  if (!ov?.enabled) return base;
  const every = Math.max(1, Number(ov.everyDays) || 7);
  const steps = Math.floor((Math.max(1, dayNum) - 1) / every);
  return base + steps * (Number(ov.amount) || 0);
};

export const sessionSeconds = (exercise, workout, dayNum) => {
  const target = effectiveTarget(exercise, workout, dayNum);
  const perSet = exercise.type === 'timed' ? target : Math.max(15, Number(exercise.estDuration) || target * 3);
  const sets = Math.max(1, Number(exercise.sets) || 1);
  const rests = (Number(exercise.restBetweenSets) || 0) * (sets - 1) + (Number(exercise.restAfter) || 0);
  return perSet * sets + rests;
};

export function computeStats(state) {
  const length = Math.max(1, Number(state.challengeLength) || 1);
  const today = dateKey();
  const dayNum = Math.min(length, Math.max(1, dayNumber(state.startDate, today)));

  let completedDays = 0;
  let restDays = 0;
  let totalSessions = 0;
  let totalSeconds = 0;

  const keys = Array.from({ length }, (_, i) => addDays(state.startDate, i));
  keys.forEach((k) => {
    const day = state.days[k];
    if (!day) return;
    if (isDayRest(day)) { restDays += 1; return; }
    if (isDayComplete(day)) completedDays += 1;
    (day.sessions || []).forEach((s) => {
      if (s.completedAt) {
        totalSessions += 1;
        totalSeconds += Number(s.durationSec) || 0;
      }
    });
  });

  let currentStreak = 0;
  for (let i = keys.length - 1; i >= 0; i -= 1) {
    const k = keys[i];
    if (diffDays(k, today) > 0) continue;
    const day = state.days[k];
    if (isDayComplete(day) || isDayRest(day)) { currentStreak += 1; continue; }
    if (k === today) continue;
    break;
  }

  let bestStreak = 0;
  let run = 0;
  keys.forEach((k) => {
    if (diffDays(k, today) > 0) return;
    const day = state.days[k];
    if (isDayComplete(day) || isDayRest(day)) {
      run += 1;
      bestStreak = Math.max(bestStreak, run);
    } else if (k !== today) {
      run = 0;
    }
  });

  const week = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(today, i - 6);
    const day = state.days[k];
    const sessions = (day?.sessions || []).filter((s) => s.completedAt).length;
    return { key: k, label: shortWeekday(k), sessions };
  });

  return {
    dayNum,
    length,
    completedDays,
    restDays,
    totalSessions,
    totalSeconds,
    totalMinutes: Math.round(totalSeconds / 60),
    currentStreak,
    bestStreak,
    percent: Math.round((completedDays / length) * 100),
    remainingDays: Math.max(0, length - dayNum),
    week,
    finished: completedDays >= length,
  };
}

export const goalProgress = (goal, stats) => {
  let value = 0;
  let target = Math.max(1, Number(goal.target) || 1);
  let unit = 'days';
  if (goal.type === 'days') { value = stats.completedDays; unit = 'days'; }
  else if (goal.type === 'streak') { value = Math.max(stats.currentStreak, stats.bestStreak); unit = 'days'; }
  else if (goal.type === 'sessions') { value = stats.totalSessions; unit = 'sessions'; }
  else if (goal.type === 'minutes') { value = stats.totalMinutes; unit = 'min'; }
  else {
    const created = goal.createdAt ? new Date(goal.createdAt).getTime() : Date.now();
    const end = goal.targetDate ? new Date(goal.targetDate).getTime() : created + 30 * 86400000;
    const span = Math.max(1, Math.ceil((end - created) / 86400000));
    const passed = Math.max(0, Math.min(span, Math.ceil((Date.now() - created) / 86400000)));
    value = passed;
    target = span;
    unit = 'days';
  }
  const pct = Math.min(100, Math.round((value / target) * 100));
  return { ...goal, value, target, unit, pct, done: value >= target };
};

export const goalsWithProgress = (state, stats) =>
  (state.goals || []).map((g) => goalProgress(g, stats));

export const GOAL_LABELS = {
  days: 'Complete days',
  streak: 'Day streak',
  sessions: 'Total sessions',
  minutes: 'Training minutes',
  custom: 'Custom goal',
};