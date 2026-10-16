import {
    type ChangeEvent,
    type FormEvent,
    useState,
  } from "react";
  import {
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import { uploadSticker } from "../../api/stickers";
  import { ApiError } from "../../api/client";
  import { Modal } from "../ui/Modal";
  
  interface UploadStickerModalProps {
    onClose: () => void;
  }
  
  export function UploadStickerModal({
    onClose,
  }: UploadStickerModalProps) {
    const queryClient = useQueryClient();
  
    const [name, setName] = useState("");
    const [file, setFile] =
      useState<File | null>(null);
  
    const [previewUrl, setPreviewUrl] =
      useState<string | null>(null);
  
    const mutation = useMutation({
      mutationFn: uploadSticker,
  
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ["stickers"],
        });
  
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
  
        onClose();
      },
    });
  
    function handleFileChange(
      event: ChangeEvent<HTMLInputElement>,
    ) {
      const selectedFile =
        event.target.files?.[0] ?? null;
  
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
  
      setFile(selectedFile);
  
      if (selectedFile) {
        setPreviewUrl(
          URL.createObjectURL(selectedFile),
        );
  
        if (!name.trim()) {
          const filename =
            selectedFile.name.replace(
              /\.[^.]+$/,
              "",
            );
  
          setName(filename);
        }
      } else {
        setPreviewUrl(null);
      }
    }
  
    function handleSubmit(
      event: FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      if (!file || !name.trim()) {
        return;
      }
  
      mutation.mutate({
        name: name.trim(),
        file,
      });
    }
  
    const errorMessage =
      mutation.error instanceof ApiError
        ? mutation.error.message
        : mutation.error
          ? "Unable to upload sticker."
          : null;
  
    return (
      <Modal
        title="Upload sticker"
        onClose={onClose}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="sticker-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
  
            <input
              id="sticker-name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Happy cat"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
  
          <div>
            <label
              htmlFor="sticker-file"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Image
            </label>
  
            <input
              id="sticker-file"
              type="file"
              accept="image/png,image/webp"
              required
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
  
            <p className="mt-1.5 text-xs text-slate-400">
              PNG or WebP, up to 2 MB and
              2048×2048.
            </p>
          </div>
  
          {previewUrl && (
            <div className="flex justify-center rounded-xl bg-slate-50 p-4">
              <img
                src={previewUrl}
                alt="Sticker preview"
                className="h-28 w-28 object-contain"
              />
            </div>
          )}
  
          {errorMessage && (
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              {errorMessage}
            </p>
          )}
  
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
  
            <button
              type="submit"
              disabled={
                mutation.isPending ||
                !file ||
                !name.trim()
              }
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {mutation.isPending
                ? "Uploading..."
                : "Upload"}
            </button>
          </div>
        </form>
      </Modal>
    );
  }