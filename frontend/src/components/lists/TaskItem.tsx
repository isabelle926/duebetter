import { useState } from "react";

import type { Sticker } from "../../types/api";
import type { Task } from "../../types/task";
import {
  formatTaskDueDate,
  getDueDateStatus,
} from "../../utils/dueDate";

interface TaskItemProps {
  task: Task;
  sticker?: Sticker;
  onToggle: (
    taskId: string,
  ) => void;
  onEdit: (task: Task) => void;
  onDelete: (
    taskId: string,
  ) => void;
}

export function TaskItem({
  task,
  sticker,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [today] = useState(
    () => new Date(),
  );

  const dueDateStatus =
    getDueDateStatus(
      task.due_date,
      today,
    );

  const dueDateLabel =
    formatTaskDueDate(
      task.due_date,
      today,
    );

  const dueDateClassName = {
    overdue:
      "font-medium text-red-600",
    today:
      "font-medium text-orange-600",
    soon:
      "font-medium text-amber-600",
    normal:
      "text-slate-400",
  }[dueDateStatus];

  return (
    <div className="group flex items-start gap-2 rounded-lg px-2 py-2 transition hover:bg-slate-50">
      <button
        type="button"
        onClick={() =>
          onToggle(task.id)
        }
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
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

      {sticker && (
        <img
          src={sticker.image_url}
          alt=""
          className="h-8 w-8 shrink-0 object-contain"
          loading="lazy"
        />
      )}

      <button
        type="button"
        onClick={() =>
          onEdit(task)
        }
        aria-label={`Edit ${task.title}`}
        className="min-w-0 flex-1 text-left"
      >
        <span
          className={`block truncate text-sm ${
            task.completed
              ? "text-slate-400 line-through"
              : "text-slate-700"
          }`}
        >
          {task.title}
        </span>

        <span
          className={`mt-0.5 block text-xs ${dueDateClassName}`}
        >
          {dueDateLabel}
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          onDelete(task.id)
        }
        className="invisible flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-red-50 hover:text-red-600 group-hover:visible focus:visible"
        aria-label={
          `Delete ${task.title}`
        }
        title="Delete task"
      >
        ×
      </button>
    </div>
  );
}