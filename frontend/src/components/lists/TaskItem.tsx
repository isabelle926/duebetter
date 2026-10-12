import type { Task } from "../../types/task";

interface TaskItemProps {
    task: Task;
    onToggle: (taskId: string) => void;
    onDelete: (taskId: string) => void;
  }

  export function TaskItem({
    task,
    onToggle,
    onDelete,
  }: TaskItemProps) {
    return (
        <div className="group flex items-start gap-1 rounded-lg px-2 py-1.5 transition hover:bg-slate-50">
          <button
            type="button"
            onClick={() => onToggle(task.id)}
            className="flex min-w-0 flex-1 items-start gap-2 text-left"
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                task.completed
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white"
              }`}
            >
              {task.completed ? "✓" : ""}
            </span>
      
            <span
              className={`truncate text-sm ${
                task.completed
                  ? "text-slate-400 line-through"
                  : "text-slate-700"
              }`}
            >
              {task.title}
            </span>
          </button>
      
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="invisible flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600 group-hover:visible"
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            ×
          </button>
        </div>
      );
}