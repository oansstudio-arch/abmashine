import { dateKey } from '@/lib/dates';

const KEY = 'abmashine.state.v1';

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export const SESSION_LABELS = ['Morning', 'Noon', 'Evening', 'Session 4', 'Session 5'];
export const DEFAULT_TIMES = ['06:30', '13:30', '19:00', '08:00', '17:30'];

export const makeStarterWorkout = () => ({
  id: uid(),
  name: 'Classic Abs',
  emoji: '🔥',
  overload: { enabled: false, amount: 2, everyDays: 7 },
  exercises: [
    {
      id: uid(), name: 'Leg Raises', tip: 'Keep your lower back pressed into the floor.',
      type: 'reps', target: 15, estDuration: 45, sets: 1, restAfter: 30, restBetweenSets: 20,
    },
    {
      id: uid(), name: 'Mountain Climbers', tip: 'Hips low, knees driving fast.',
      type: 'reps', target: 20, estDuration: 40, sets: 1, restAfter: 30, restBetweenSets: 20,
    },
    {
      id: uid(), name: 'Bicycle Crunches', tip: 'Slow and controlled, twist from the ribs.',
      type: 'reps', target: 20, estDuration: 50, sets: 1, restAfter: 30, restBetweenSets: 20,
    },
    {
      id: uid(), name: 'Plank', tip: 'Squeeze your glutes and breathe steady.',
      type: 'timed', target: 40, sets: 1, restAfter: 30, restBetweenSets: 20,
    },
  ],
});

export const defaultSettings = () => ({
  darkMode: true,
  voiceEnabled: true,
  volume: 0.8,
  sfxEnabled: true,
  beepsEnabled: true,
  defaultRest: 30,
  defaultRestBetweenSets: 20,
});

export const defaultState = () => ({
  deviceId: uid(),
  onboarded: false,
  name: '',
  challengeLength: 30,
  startDate: dateKey(),
  settings: defaultSettings(),
  workouts: [],
  schedule: [],
  goals: [],
  reminders: [],
  days: {},
  firedReminders: {},
  celebratedGoals: [],
});

export const loadState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings || {}) },
      days: parsed.days || {},
      workouts: parsed.workouts || [],
      schedule: parsed.schedule || [],
      goals: parsed.goals || [],
      reminders: parsed.reminders || [],
    };
  } catch (e) {
    return defaultState();
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    /* storage full or unavailable */
  }
};

export const buildSessionTemplate = (index, time, workoutId) => ({
  id: uid(),
  label: SESSION_LABELS[index] || `Session ${index + 1}`,
  time: time || DEFAULT_TIMES[index] || '18:00',
  workoutId: workoutId || null,
});