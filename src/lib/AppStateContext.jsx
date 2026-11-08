import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  loadState, saveState, defaultState, makeStarterWorkout, buildSessionTemplate,
  DEFAULT_TIMES, uid,
} from '@/lib/storage';
import { buildDayRecord, computeStats } from '@/lib/stats';
import { dateKey, dayNumber, nowClock } from '@/lib/dates';
import { configureVoice, playClip } from '@/lib/voice';
import { base44 } from '@/api/base44Client';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(loadState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { configureVoice(state.settings); }, [state.settings]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!state.settings.darkMode);
  }, [state.settings.darkMode]);

  // Make sure today's record exists once the challenge has started
  useEffect(() => {
    if (!state.onboarded) return;
    const key = dateKey();
    if (state.days[key]) return;
    const num = dayNumber(state.startDate, key);
    if (num < 1 || num > state.challengeLength) return;
    setState((s) => (s.days[key] ? s : { ...s, days: { ...s.days, [key]: buildDayRecord(s, key) } }));
  }, [state.onboarded, state.startDate, state.challengeLength, state.schedule, state.workouts, state.days]);

  const update = useCallback((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const setSettings = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const startChallenge = useCallback(({ name, length, useTemplate, sessionsPerDay, times }) => {
    const workouts = useTemplate ? [makeStarterWorkout()] : [];
    const schedule = Array.from({ length: sessionsPerDay }, (_, i) =>
      buildSessionTemplate(i, times?.[i] || DEFAULT_TIMES[i], workouts[0]?.id || null));
    const startKey = dateKey();
    const fresh = {
      ...defaultState(),
      deviceId: stateRef.current.deviceId,
      settings: stateRef.current.settings,
      onboarded: true,
      name: String(name).trim(),
      challengeLength: length,
      startDate: startKey,
      workouts,
      schedule,
      goals: [{
        id: uid(), type: 'days', target: length,
        label: `Complete ${length} days`, createdAt: new Date().toISOString(),
      }],
      reminders: schedule.map((s) => ({ id: uid(), time: s.time, enabled: true })),
      days: {},
    };
    fresh.days[startKey] = buildDayRecord(fresh, startKey);
    setState(fresh);
  }, []);

  const updateDay = useCallback((key, updater) => {
    setState((s) => {
      const day = s.days[key];
      if (!day) return s;
      return { ...s, days: { ...s.days, [key]: updater(day) } };
    });
  }, []);

  const setExerciseProgress = useCallback((dayKey, sessionId, exerciseIndex, doneSets) => {
    updateDay(dayKey, (day) => ({
      ...day,
      sessions: day.sessions.map((se) => {
        if (se.id !== sessionId) return se;
        return {
          ...se,
          startedAt: se.startedAt || new Date().toISOString(),
          exercises: se.exercises.map((ex, i) =>
            i === exerciseIndex ? { ...ex, doneSets } : ex),
        };
      }),
    }));
  }, [updateDay]);

  const markSessionComplete = useCallback((dayKey, sessionId, durationSec) => {
    const day = stateRef.current.days[dayKey];
    if (!day) return { dayDone: false, challengeDone: false };
    const stamp = new Date().toISOString();
    const sessions = day.sessions.map((se) => {
      if (se.id !== sessionId) return se;
      return {
        ...se,
        startedAt: se.startedAt || stamp,
        completedAt: stamp,
        durationSec: Math.max(0, Math.round(durationSec || se.durationSec || 0)),
        exercises: se.exercises.map((ex) => ({ ...ex, done: true, doneSets: ex.sets })),
      };
    });
    const nextDay = { ...day, sessions };
    setState((s) => ({ ...s, days: { ...s.days, [dayKey]: nextDay } }));
    const dayDone = sessions.every((se) => !!se.completedAt);
    const num = dayNumber(stateRef.current.startDate, dayKey);
    return { dayDone, challengeDone: dayDone && num >= stateRef.current.challengeLength };
  }, []);

  const toggleRestDay = useCallback((key) => {
    updateDay(key, (day) => ({
      ...day,
      status: day.status === 'rest' ? 'active' : 'rest',
    }));
  }, [updateDay]);

  const resetChallenge = useCallback(() => {
    setState((s) => ({ ...defaultState(), deviceId: s.deviceId, settings: s.settings }));
  }, []);

  const importState = useCallback((incoming) => {
    const base = defaultState();
    setState((s) => ({
      ...base,
      ...incoming,
      deviceId: s.deviceId,
      settings: { ...base.settings, ...(incoming.settings || {}) },
      days: incoming.days || {},
      workouts: incoming.workouts || [],
      schedule: incoming.schedule || [],
      goals: incoming.goals || [],
      reminders: incoming.reminders || [],
    }));
  }, []);

  // Session reminders (only while the app is open)
  useEffect(() => {
    if (!state.onboarded) return undefined;
    const tick = () => {
      const s = stateRef.current;
      if (!s.onboarded) return;
      const key = dateKey();
      const day = s.days[key];
      if (day?.status === 'rest') return;
      if (day && (day.sessions || []).length > 0 && day.sessions.every((x) => x.completedAt)) return;
      const clock = nowClock();
      const fired = s.firedReminders?.[key] || [];
      const due = (s.reminders || []).filter((r) => r.enabled && r.time === clock && !fired.includes(r.id));
      if (!due.length) return;
      const msg = `${s.name || 'Athlete'}, it's training time!`;
      toast(msg, { description: 'Your Abmashine session is waiting.' });
      playClip('reminder', `Hey ${s.name || 'athlete'}, it's training time!`);
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Abmashine™', { body: msg, icon: '/icon-512.png' });
        }
      } catch (e) { /* notifications blocked */ }
      setState((prev) => ({
        ...prev,
        firedReminders: {
          ...(prev.firedReminders || {}),
          [key]: [...(prev.firedReminders?.[key] || []), ...due.map((d) => d.id)],
        },
      }));
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, [state.onboarded]);

  // Sync the participant summary to the backend (admin list only)
  useEffect(() => {
    if (!state.onboarded) return undefined;
    const timer = setTimeout(() => {
      const stats = computeStats(state);
      base44.functions.invoke('syncParticipant', {
        deviceId: state.deviceId,
        name: state.name,
        startDate: state.startDate,
        challengeLength: state.challengeLength,
        completedDays: stats.completedDays,
      }).catch(() => { /* offline or signed out — local data stays authoritative */ });
    }, 1500);
    return () => clearTimeout(timer);
  }, [state.onboarded, state.deviceId, state.name, state.startDate, state.challengeLength, state.days]);

  const value = useMemo(() => ({
    state, update, setSettings, startChallenge, updateDay, setExerciseProgress,
    markSessionComplete, toggleRestDay, resetChallenge, importState,
  }), [state, update, setSettings, startChallenge, updateDay, setExerciseProgress,
    markSessionComplete, toggleRestDay, resetChallenge, importState]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}