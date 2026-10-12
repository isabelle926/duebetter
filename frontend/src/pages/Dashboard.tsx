import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTasks,
  updateTask,
  deleteTask,
} from "../api/tasks";
import { Calendar } from "../components/calendar/Calendar";
import { Header } from "../components/layout/Header";
import { ListSidebar } from "../components/lists/ListSidebar";
import { CreateTaskModal } from "../components/tasks/CreateTaskModal";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { Task } from "../types/task";
import type { TaskList } from "../types/taskList";
import { deleteList, getLists } from "../api/lists";

export function Dashboard() {
  const queryClient = useQueryClient();

  const [
    selectedTaskDate,
    setSelectedTaskDate,
  ] = useState<Date | null>(null);

  const currentUserQuery = useCurrentUser();

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
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
  
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  if (
    currentUserQuery.isPending ||
    listsQuery.isPending ||
    tasksQuery.isPending
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
    tasksQuery.isError
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

  const lists: TaskList[] =
    listsQuery.data.map((list) => ({
      id: list.id,
      name: list.name,
      color: list.color,
      position: list.position,
    }));

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
    const confirmed = window.confirm(
      "Delete this task?",
    );
  
    if (!confirmed) {
      return;
    }
  
    deleteTaskMutation.mutate(taskId);
  }

  function handleDeleteList(
    listId: string,
  ) {
    const list = lists.find(
      (candidate) =>
        candidate.id === listId,
    );
  
    if (!list) {
      return;
    }
  
    const confirmed = window.confirm(
      `Delete "${list.name}" and all of its tasks?`,
    );
  
    if (!confirmed) {
      return;
    }
  
    deleteListMutation.mutate(listId);
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Header user={user} />

      <main className="grid min-h-0 flex-1 grid-cols-[320px_1fr]">
      <ListSidebar
        lists={lists}
        tasks={tasks}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onAddTask={() =>
          setSelectedTaskDate(new Date())
        }
        onDeleteList={handleDeleteList}
      />

        <Calendar
          lists={lists}
          tasks={tasks}
          onSelectDate={(date) =>
            setSelectedTaskDate(date)
          }
        />
      </main>

      {selectedTaskDate && (
        <CreateTaskModal
          lists={lists}
          initialDate={selectedTaskDate}
          onClose={() =>
            setSelectedTaskDate(null)
          }
        />
      )}
    </div>
  );
}