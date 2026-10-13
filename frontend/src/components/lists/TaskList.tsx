import type { Task } from "../../types/task";
import type { TaskList as TaskListType } from "../../types/taskList";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  list: TaskListType;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditList: (list: TaskListType) => void;
  onDeleteList: (listId: string) => void;
}

export function TaskList({
  list,
  tasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onEditList,
  onDeleteList,
}: TaskListProps) {
  const incompleteTaskCount = tasks.filter(
    (task) => !task.completed,
  ).length;

  return (
    <section>
      <div className="mb-2 flex items-center gap-2 px-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: list.color,
          }}
        />

        <button
          type="button"
          onClick={() => onEditList(list)}
          className="min-w-0 truncate text-left text-sm font-semibold text-slate-800 transition hover:text-indigo-600"
          title={`Edit ${list.name}`}
        >
          {list.name}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span
            className="text-xs text-slate-400"
            title={`${incompleteTaskCount} incomplete tasks`}
          >
            {incompleteTaskCount}
          </span>

          <button
            type="button"
            onClick={() => onDeleteList(list.id)}
            className="flex h-6 w-6 items-center justify-center rounded text-xs text-slate-300 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${list.name}`}
            title="Delete list"
          >
            ×
          </button>
        </div>
      </div>

      <div className="space-y-0.5">
        {tasks.length === 0 ? (
          <p className="px-2 py-1 text-xs text-slate-400">
            No open tasks
          </p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </section>
  );
}