import { useState } from "react";

import type { Task } from "../../types/task";
import type { TaskList } from "../../types/taskList";
import type { Sticker } from "../../types/api";
import { CreateListModal } from "./CreateListModal";
import { TaskList as TaskListSection } from "./TaskList";

interface ListSidebarProps {
  lists: TaskList[];
  tasks: Task[];
  stickers: Sticker[];
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditList: (list: TaskList) => void;
  onDeleteList: (listId: string) => void;
  onAddTask: () => void;
}

export function ListSidebar({
  lists,
  tasks,
  stickers,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onEditList,
  onDeleteList,
  onAddTask,
}: ListSidebarProps) {
  const [isCreateListOpen, setIsCreateListOpen] =
    useState(false);

  return (
    <>
      <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            My Lists
          </h2>

          <button
            type="button"
            onClick={() =>
              setIsCreateListOpen(true)
            }
            className="flex h-7 w-7 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Add list"
          >
            +
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {lists.map((list) => {
            const listTasks = tasks
              .filter(
                (task) =>
                  task.list_id === list.id &&
                  !task.completed,
              )
              .sort((a, b) =>
                a.due_date.localeCompare(
                  b.due_date,
                ),
              );

            return (
              <TaskListSection
                key={list.id}
                list={list}
                tasks={listTasks}
                stickers={stickers}
                onToggleTask={onToggleTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onEditList={onEditList}
                onDeleteList={onDeleteList}
              />
            );
          })}

          {lists.length === 0 && (
            <div className="px-2 py-4 text-center">
              <p className="text-sm text-slate-500">
                You don't have any lists yet.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Create a list to start organizing
                your tasks.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onAddTask}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            + Add task
          </button>

          <button
            type="button"
            onClick={() =>
              setIsCreateListOpen(true)
            }
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            + Add list
          </button>
        </div>
      </aside>

      {isCreateListOpen && (
        <CreateListModal
          onClose={() =>
            setIsCreateListOpen(false)
          }
        />
      )}
    </>
  );
}