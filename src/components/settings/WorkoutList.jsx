import { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Copy, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/AppStateContext';
import { refreshDayRecord, sessionSeconds } from '@/lib/stats';
import { dateKey } from '@/lib/dates';
import { uid } from '@/lib/storage';
import WorkoutEditor from '@/components/settings/WorkoutEditor';
import ConfirmDialog from '@/components/settings/ConfirmDialog';

export default function WorkoutList() {
  const { state, update } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const today = dateKey();

  const persist = (workouts) => {
    const patch = { workouts };
    if (state.days[today]) {
      patch.days = { ...state.days, [today]: refreshDayRecord({ ...state, workouts }, today) };
    }
    update(patch);
  };

  const openNew = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (workout) => { setEditing(workout); setEditorOpen(true); };

  const saveWorkout = (workout) => {
    const exists = state.workouts.some((w) => w.id === workout.id);
    persist(exists
      ? state.workouts.map((w) => (w.id === workout.id ? workout : w))
      : [...state.workouts, workout]);
    setEditorOpen(false);
  };

  const duplicate = (workout) => {
    const copy = {
      ...workout,
      id: uid(),
      name: `${workout.name} copy`,
      exercises: (workout.exercises || []).map((ex) => ({ ...ex, id: uid() })),
    };
    persist([...state.workouts, copy]);
  };

  const remove = () => {
    const id = toDelete?.id;
    update({
      workouts: state.workouts.filter((w) => w.id !== id),
      schedule: state.schedule.map((s) => (s.workoutId === id ? { ...s, workoutId: null } : s)),
    });
    setToDelete(null);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(state.workouts);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    persist(items);
  };

  return (
    <div className="space-y-2.5">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="workouts">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {state.workouts.map((workout, index) => (
                <Draggable key={workout.id} draggableId={workout.id} index={index}>
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className="rounded-[20px] border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span {...dragProvided.dragHandleProps}
                          className="flex h-8 w-6 shrink-0 items-center justify-center text-muted-foreground/60">
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <span className="text-lg">{workout.emoji || '💪'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{workout.name}</p>
                          <p className="numeric text-[11px] text-muted-foreground">
                            {workout.exercises.length} exercises · ~
                            {Math.max(1, Math.round(
                              workout.exercises.reduce((s, ex) => s + sessionSeconds(ex, workout, 1), 0) / 60,
                            ))} min
                          </p>
                        </div>
                        <button type="button" onClick={() => openEdit(workout)} aria-label="Edit workout"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => duplicate(workout)} aria-label="Duplicate workout"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => setToDelete(workout)} aria-label="Delete workout"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {state.workouts.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/15 p-4 text-center text-xs text-muted-foreground">
          No workouts yet. Create your first one.
        </p>
      )}

      <button type="button" onClick={openNew}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 text-sm font-bold text-muted-foreground">
        <Plus className="h-4 w-4" /> New workout
      </button>

      <WorkoutEditor
        open={editorOpen}
        workout={editing}
        defaultRest={state.settings.defaultRest}
        defaultBetween={state.settings.defaultRestBetweenSets}
        onOpenChange={setEditorOpen}
        onSave={saveWorkout}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete ${toDelete?.name || 'workout'}?`}
        description="Sessions using it will be left without a workout."
        confirmLabel="Delete"
        onOpenChange={(open) => { if (!open) setToDelete(null); }}
        onConfirm={remove}
      />
    </div>
  );
}