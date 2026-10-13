import {
  type FormEvent,
  useState,
} from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateList } from "../../api/lists";
import type { TaskList } from "../../types/taskList";
import { Modal } from "../ui/Modal";

interface EditListModalProps {
  list: TaskList;
  onClose: () => void;
}

const COLORS = [
  "#6366F1",
  "#EC4899",
  "#22C55E",
  "#F59E0B",
  "#06B6D4",
  "#8B5CF6",
];

export function EditListModal({
  list,
  onClose,
}: EditListModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(
    list.name,
  );

  const [color, setColor] = useState(
    list.color,
  );

  const mutation = useMutation({
    mutationFn: () =>
      updateList(list.id, {
        name: name.trim(),
        color,
      }),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["lists"],
      });

      onClose();
    },
  });

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    mutation.mutate();
  }

  return (
    <Modal
      title="Edit list"
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="edit-list-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Name
          </label>

          <input
            id="edit-list-name"
            type="text"
            autoFocus
            required
            maxLength={100}
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">
            Color
          </legend>

          <div className="flex flex-wrap gap-3">
            {COLORS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setColor(option)
                }
                className={`h-8 w-8 rounded-full transition ${
                  color === option
                    ? "ring-2 ring-indigo-500 ring-offset-2"
                    : ""
                }`}
                style={{
                  backgroundColor: option,
                }}
                aria-label={`Select color ${option}`}
              />
            ))}
          </div>
        </fieldset>

        {mutation.isError && (
          <p
            role="alert"
            className="text-sm text-red-600"
          >
            Unable to update list.
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
              !name.trim()
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
  );
}