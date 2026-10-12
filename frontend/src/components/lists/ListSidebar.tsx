import type { Task } from "../../types/task";
import type { TaskList } from "../../types/taskList";
import { TaskList as TaskListSection } from "./TaskList";

interface ListSidebarProps {
  lists: TaskList[];
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

export function ListSidebar({
  lists,
  tasks,
  onToggleTask,
}: ListSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">My Lists</h2>

        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Add list"
        >
          +
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {lists.map((list) => {
          const listTasks = tasks.filter(
            (task) => task.list_id === list.id,
          );

          return (
            <TaskListSection
              key={list.id}
              list={list}
              tasks={listTasks}
              onToggleTask={onToggleTask}
            />
          );
        })}
      </div>

      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          + Add list
        </button>
      </div>
    </aside>
  );
}