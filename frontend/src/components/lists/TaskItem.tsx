import type { Task } from "../../types/task";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemProps) {
  return (
    <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
          task.completed
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-slate-300 bg-white"
        }`}
        aria-label={
          task.completed
            ? `Mark ${task.title} incomplete`
            : `Mark ${task.title} complete`
        }
      >
        {task.completed ? "✓" : ""}
      </button>

      <button
        type="button"
        onClick={() => onEdit(task)}
        className={`min-w-0 flex-1 truncate text-left text-sm ${
          task.completed
            ? "text-slate-400 line-through"
            : "text-slate-700"
        }`}
      >
        {task.title}
      </button>

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="invisible flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-red-50 hover:text-red-600 group-hover:visible"
        aria-label={`Delete ${task.title}`}
        title="Delete task"
      >
        ×
      </button>
    </div>
  );
}