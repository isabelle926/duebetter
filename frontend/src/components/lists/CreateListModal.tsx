import {
    type FormEvent,
    useState,
  } from "react";
  import {
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import { createList } from "../../api/lists";
  import { Modal } from "../ui/Modal";
  
  interface CreateListModalProps {
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
  
  export function CreateListModal({
    onClose,
  }: CreateListModalProps) {
    const queryClient = useQueryClient();
  
    const [name, setName] = useState("");
    const [color, setColor] = useState(
      COLORS[0],
    );
  
    const mutation = useMutation({
      mutationFn: createList,
  
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
  
      const trimmedName = name.trim();
  
      if (!trimmedName) {
        return;
      }
  
      mutation.mutate({
        name: trimmedName,
        color,
        position: 0,
      });
    }
  
    return (
      <Modal
        title="Create list"
        onClose={onClose}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="list-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
  
            <input
              id="list-name"
              type="text"
              autoFocus
              required
              maxLength={100}
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="School"
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
              Unable to create list.
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
                ? "Creating..."
                : "Create list"}
            </button>
          </div>
        </form>
      </Modal>
    );
  }