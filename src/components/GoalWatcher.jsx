import { useEffect } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/lib/AppStateContext';
import { computeStats, goalsWithProgress, GOAL_LABELS } from '@/lib/stats';
import { playClip } from '@/lib/voice';

export default function GoalWatcher() {
  const { state, update } = useApp();

  useEffect(() => {
    if (!state.onboarded || !(state.goals || []).length) return;
    const celebrated = state.celebratedGoals || [];
    const stats = computeStats(state);
    const reached = goalsWithProgress(state, stats).filter((g) => g.done && !celebrated.includes(g.id));
    if (!reached.length) return;

    update({ celebratedGoals: [...celebrated, ...reached.map((g) => g.id)] });
    const goal = reached[0];
    const label = goal.type === 'custom' ? goal.label : `${GOAL_LABELS[goal.type]} · ${goal.target}`;
    playClip('goal_reached', 'Goal reached! You are unstoppable!');
    toast.success('Goal reached!', { description: label });
  }, [state.days, state.goals, state.onboarded]);

  return null;
}