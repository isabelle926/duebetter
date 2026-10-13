import type { Task } from "../../types/task";
import type { TaskList } from "../../types/taskList";
import { Modal } from "../ui/Modal";
import { formatDateKey } from "./calendarUtils";

interface DayModalProps {
  date: Date;
  tasks: Task[];
  lists: TaskList[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onClose: () => void;
}

export function DayModal({
  date,
  tasks,
  lists,
  onAddTask,
  onEditTask,
  onToggleTask,
  onClose,
}: DayModalProps) {
  const dateKey = formatDateKey(date);

  const dayTasks = tasks
    .filter(
      (task) =>
        task.due_date === dateKey,
    )
    .sort(
      (a, b) =>
        a.position - b.position,
    );

  const title = date.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <Modal
      title={title}
      onClose={onClose}
    >
      <div className="space-y-2">
        {dayTasks.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            No tasks for this day.
          </p>
        ) : (
          dayTasks.map((task) => {
            const list = lists.find(
              (candidate) =>
                candidate.id === task.list_id,
            );

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() =>
                    onToggleTask(task.id)
                  }
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
                  {task.completed
                    ? "✓"
                    : ""}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onEditTask(task)
                  }
                  className="min-w-0 flex-1 text-left"
                >
                  <p
                    className={`truncate text-sm ${
                      task.completed
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                    }`}
                  >
                    {task.title}
                  </p>

                  {list && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            list.color,
                        }}
                      />

                      <span className="text-xs text-slate-400">
                        {list.name}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={onAddTask}
        className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        + Add task
      </button>
    </Modal>
  );
}