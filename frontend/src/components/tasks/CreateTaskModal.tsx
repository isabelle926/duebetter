import {
    type FormEvent,
    useState,
  } from "react";
  import {
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import { createTask } from "../../api/tasks";
  import type { TaskList } from "../../types/taskList";
  import { formatDateKey } from "../calendar/calendarUtils";
  import { Modal } from "../ui/Modal";
  
  interface CreateTaskModalProps {
    lists: TaskList[];
    initialDate: Date;
    onClose: () => void;
  }
  
  export function CreateTaskModal({
    lists,
    initialDate,
    onClose,
  }: CreateTaskModalProps) {
    const queryClient = useQueryClient();
  
    const [title, setTitle] = useState("");
    const [description, setDescription] =
      useState("");
  
    const [listId, setListId] = useState(
      lists[0]?.id ?? "",
    );
  
    const [dueDate, setDueDate] = useState(
      formatDateKey(initialDate),
    );
  
    const mutation = useMutation({
      mutationFn: createTask,
  
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });
  
        onClose();
      },
    });
  
    function handleSubmit(
      event: FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      const trimmedTitle = title.trim();
  
      if (!trimmedTitle || !listId) {
        return;
      }
  
      mutation.mutate({
        title: trimmedTitle,
        description:
          description.trim() || null,
        list_id: listId,
        due_date: dueDate,
        position: 0,
      });
    }
  
    return (
      <Modal
        title="Create task"
        onClose={onClose}
      >
        {lists.length === 0 ? (
          <div>
            <p className="text-sm text-slate-600">
              Create a list before adding
              tasks.
            </p>
  
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="task-title"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Task
              </label>
  
              <input
                id="task-title"
                type="text"
                autoFocus
                required
                maxLength={255}
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Finish algorithms homework"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
  
            <div>
              <label
                htmlFor="task-list"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                List
              </label>
  
              <select
                id="task-list"
                value={listId}
                onChange={(event) =>
                  setListId(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {lists.map((list) => (
                  <option
                    key={list.id}
                    value={list.id}
                  >
                    {list.name}
                  </option>
                ))}
              </select>
            </div>
  
            <div>
              <label
                htmlFor="task-date"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Due date
              </label>
  
              <input
                id="task-date"
                type="date"
                required
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
  
            <div>
              <label
                htmlFor="task-description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
  
              <textarea
                id="task-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
  
            {mutation.isError && (
              <p
                role="alert"
                className="text-sm text-red-600"
              >
                Unable to create task.
              </p>
            )}
  
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
  
              <button
                type="submit"
                disabled={
                  mutation.isPending ||
                  !title.trim() ||
                  !listId
                }
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {mutation.isPending
                  ? "Creating..."
                  : "Create task"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    );
  }