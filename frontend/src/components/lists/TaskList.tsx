import type { Task } from "../../types/task";
import type { TaskList as TaskListType } from "../../types/taskList";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  list: TaskListType;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

export function TaskList({
  list,
  tasks,
  onToggleTask,
}: TaskListProps) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 px-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: list.color }}
        />

        <h3 className="text-sm font-semibold text-slate-800">
          {list.name}
        </h3>

        <span className="ml-auto text-xs text-slate-400">
          {tasks.filter((task) => !task.completed).length}
        </span>
      </div>

      <div className="space-y-0.5">
        {tasks.length === 0 ? (
          <p className="px-2 py-1 text-xs text-slate-400">
            No tasks
          </p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
            />
          ))
        )}
      </div>
    </section>
  );
}