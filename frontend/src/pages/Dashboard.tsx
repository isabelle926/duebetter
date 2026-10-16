import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteList,
  getLists,
} from "../api/lists";
import {
  deleteTask,
  getTasks,
  updateTask,
} from "../api/tasks";
import { Calendar } from "../components/calendar/Calendar";
import { DayModal } from "../components/calendar/DayModal";
import { Header } from "../components/layout/Header";
import { EditListModal } from "../components/lists/EditListModal";
import { ListSidebar } from "../components/lists/ListSidebar";
import { StickerLibraryModal } from "../components/stickers/StickerLibraryModal";
import { CreateTaskModal } from "../components/tasks/CreateTaskModal";
import { EditTaskModal } from "../components/tasks/EditTaskModal";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useStickers } from "../hooks/useStickers";
import type { Task } from "../types/task";
import type { TaskList } from "../types/taskList";

export function Dashboard() {
  const queryClient = useQueryClient();

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<Date | null>(null);

  const [
    createTaskDate,
    setCreateTaskDate,
  ] = useState<Date | null>(null);

  const [
    editingTask,
    setEditingTask,
  ] = useState<Task | null>(null);

  const [
    editingList,
    setEditingList,
  ] = useState<TaskList | null>(null);

  const [
    taskToDelete,
    setTaskToDelete,
  ] = useState<Task | null>(null);

  const [
    listToDelete,
    setListToDelete,
  ] = useState<TaskList | null>(null);

  const [
    isStickerLibraryOpen,
    setIsStickerLibraryOpen,
  ] = useState(false);

  const currentUserQuery = useCurrentUser();

  const stickersQuery = useStickers();

  const listsQuery = useQuery({
    queryKey: ["lists"],
    queryFn: getLists,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      completed,
    }: {
      taskId: string;
      completed: boolean;
    }) =>
      updateTask(taskId, {
        completed,
      }),

    onMutate: async ({
      taskId,
      completed,
    }) => {
      await queryClient.cancelQueries({
        queryKey: ["tasks"],
      });

      const previousTasks =
        queryClient.getQueryData(
          ["tasks"],
        );

      queryClient.setQueryData(
        ["tasks"],
        (
          current:
            | typeof tasksQuery.data
            | undefined,
        ) => {
          if (!current) {
            return current;
          }

          return current.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed,
                }
              : task,
          );
        },
      );

      return {
        previousTasks,
      };
    },

    onError: (
      _error,
      _variables,
      context,
    ) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks"],
          context.previousTasks,
        );
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      setTaskToDelete(null);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: deleteList,

    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["lists"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        }),
      ]);

      setListToDelete(null);
    },
  });

  if (
    currentUserQuery.isPending ||
    listsQuery.isPending ||
    tasksQuery.isPending ||
    stickersQuery.isPending
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading DueBetter...
      </div>
    );
  }

  if (
    currentUserQuery.isError ||
    listsQuery.isError ||
    tasksQuery.isError ||
    stickersQuery.isError
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-red-600">
          Unable to load your DueBetter data.
        </p>
      </div>
    );
  }

  const user = currentUserQuery.data;

  const stickers = stickersQuery.data;

  const lists: TaskList[] =
    listsQuery.data
      .map((list) => ({
        id: list.id,
        name: list.name,
        color: list.color,
        position: list.position,
      }))
      .sort(
        (a, b) =>
          a.position - b.position,
      );

  const tasks: Task[] =
    tasksQuery.data.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      completed: task.completed,
      list_id: task.list_id,
      sticker_id: task.sticker_id,
      position: task.position,
    }));

  function handleToggleTask(
    taskId: string,
  ) {
    const task = tasks.find(
      (candidate) =>
        candidate.id === taskId,
    );

    if (!task) {
      return;
    }

    toggleTaskMutation.mutate({
      taskId,
      completed: !task.completed,
    });
  }

  function handleDeleteTask(
    taskId: string,
  ) {
    const task = tasks.find(
      (candidate) =>
        candidate.id === taskId,
    );

    if (task) {
      setTaskToDelete(task);
    }
  }

  function handleDeleteList(
    listId: string,
  ) {
    const list = lists.find(
      (candidate) =>
        candidate.id === listId,
    );

    if (list) {
      setListToDelete(list);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Header
        user={user}
        onOpenStickers={() =>
          setIsStickerLibraryOpen(true)
        }
      />

      <main className="grid min-h-0 flex-1 grid-cols-[320px_1fr]">
        <ListSidebar
          lists={lists}
          tasks={tasks}
          stickers={stickers}
          onToggleTask={handleToggleTask}
          onEditTask={(task) =>
            setEditingTask(task)
          }
          onDeleteTask={handleDeleteTask}
          onEditList={(list) =>
            setEditingList(list)
          }
          onDeleteList={handleDeleteList}
          onAddTask={() =>
            setCreateTaskDate(new Date())
          }
        />

        <Calendar
          lists={lists}
          tasks={tasks}
          onSelectDate={(date) =>
            setSelectedDate(date)
          }
        />
      </main>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          tasks={tasks}
          lists={lists}
          stickers={stickers}
          onToggleTask={handleToggleTask}
          onEditTask={(task) => {
            setSelectedDate(null);
            setEditingTask(task);
          }}
          onAddTask={() => {
            setCreateTaskDate(
              selectedDate,
            );
            setSelectedDate(null);
          }}
          onClose={() =>
            setSelectedDate(null)
          }
        />
      )}

      {createTaskDate && (
        <CreateTaskModal
          lists={lists}
          initialDate={createTaskDate}
          onClose={() =>
            setCreateTaskDate(null)
          }
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          lists={lists}
          onClose={() =>
            setEditingTask(null)
          }
        />
      )}

      {editingList && (
        <EditListModal
          list={editingList}
          onClose={() =>
            setEditingList(null)
          }
        />
      )}

      {isStickerLibraryOpen && (
        <StickerLibraryModal
          onClose={() =>
            setIsStickerLibraryOpen(
              false,
            )
          }
        />
      )}

      {taskToDelete && (
        <ConfirmModal
          title="Delete task?"
          message={`"${taskToDelete.title}" will be permanently deleted.`}
          isPending={
            deleteTaskMutation.isPending
          }
          onConfirm={() =>
            deleteTaskMutation.mutate(
              taskToDelete.id,
            )
          }
          onClose={() =>
            setTaskToDelete(null)
          }
        />
      )}

      {listToDelete && (
        <ConfirmModal
          title="Delete list?"
          message={`"${listToDelete.name}" and all tasks inside it will be permanently deleted.`}
          isPending={
            deleteListMutation.isPending
          }
          onConfirm={() =>
            deleteListMutation.mutate(
              listToDelete.id,
            )
          }
          onClose={() =>
            setListToDelete(null)
          }
        />
      )}
    </div>
  );
}