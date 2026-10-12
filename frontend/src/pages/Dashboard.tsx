import {
    useMutation,
    useQuery,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import { getLists } from "../api/lists";
  import {
    getTasks,
    updateTask,
  } from "../api/tasks";
  import { Calendar } from "../components/calendar/Calendar";
  import { Header } from "../components/layout/Header";
  import { ListSidebar } from "../components/lists/ListSidebar";
  import { useCurrentUser } from "../hooks/useCurrentUser";
  import type { Task } from "../types/task";
  import type { TaskList } from "../types/taskList";
  
  export function Dashboard() {
    const queryClient = useQueryClient();
  
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
        (candidate) => candidate.id === taskId,
      );
  
      if (!task) {
        return;
      }
  
      toggleTaskMutation.mutate({
        taskId,
        completed: !task.completed,
      });
    }
  
    return (
      <div className="flex h-screen flex-col bg-slate-50">
        <Header user={user} />
  
        <main className="grid min-h-0 flex-1 grid-cols-[320px_1fr]">
          <ListSidebar
            lists={lists}
            tasks={tasks}
            onToggleTask={handleToggleTask}
          />
  
          <Calendar
            lists={lists}
            tasks={tasks}
          />
        </main>
      </div>
    );
  }