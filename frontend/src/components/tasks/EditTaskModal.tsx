import {
  type FormEvent,
  useState,
} from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateTask } from "../../api/tasks";
import { useStickers } from "../../hooks/useStickers";
import type { Task } from "../../types/task";
import type { TaskList } from "../../types/taskList";
import { StickerPicker } from "../stickers/StickerPicker";
import { UploadStickerModal } from "../stickers/UploadStickerModal";
import { Modal } from "../ui/Modal";

interface EditTaskModalProps {
  task: Task;
  lists: TaskList[];
  onClose: () => void;
}

export function EditTaskModal({
  task,
  lists,
  onClose,
}: EditTaskModalProps) {
  const queryClient = useQueryClient();

  const stickersQuery = useStickers();

  const [title, setTitle] = useState(
    task.title,
  );

  const [description, setDescription] =
    useState(task.description ?? "");

  const [listId, setListId] = useState(
    task.list_id,
  );

  const [dueDate, setDueDate] = useState(
    task.due_date,
  );

  const [
    stickerId,
    setStickerId,
  ] = useState<string | null>(
    task.sticker_id,
  );

  const [
    isUploadOpen,
    setIsUploadOpen,
  ] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      updateTask(task.id, {
        title: title.trim(),
        description:
          description.trim() || null,
        list_id: listId,
        due_date: dueDate,
        sticker_id: stickerId,
      }),

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

    if (!title.trim()) {
      return;
    }

    mutation.mutate();
  }

  return (
    <>
      <Modal
        title="Edit task"
        onClose={onClose}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="edit-task-title"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Task
            </label>

            <input
              id="edit-task-title"
              type="text"
              autoFocus
              required
              maxLength={255}
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-task-list"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              List
            </label>

            <select
              id="edit-task-list"
              value={listId}
              onChange={(event) =>
                setListId(
                  event.target.value,
                )
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
              htmlFor="edit-task-date"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Due date
            </label>

            <input
              id="edit-task-date"
              type="date"
              required
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-task-description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="edit-task-description"
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {stickersQuery.isPending && (
            <p className="text-sm text-slate-400">
              Loading stickers...
            </p>
          )}

          {stickersQuery.isError && (
            <p className="text-sm text-red-600">
              Unable to load stickers.
            </p>
          )}

          {stickersQuery.data && (
            <StickerPicker
              stickers={
                stickersQuery.data
              }
              selectedStickerId={
                stickerId
              }
              onSelect={setStickerId}
              onUpload={() =>
                setIsUploadOpen(true)
              }
            />
          )}

          {mutation.isError && (
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              Unable to update task.
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
                !title.trim()
              }
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {mutation.isPending
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>

      {isUploadOpen && (
        <UploadStickerModal
          onClose={() =>
            setIsUploadOpen(false)
          }
        />
      )}
    </>
  );
}