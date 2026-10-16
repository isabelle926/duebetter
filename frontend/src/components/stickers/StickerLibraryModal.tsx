import { useState } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { deleteSticker } from "../../api/stickers";
import { useStickers } from "../../hooks/useStickers";
import { ConfirmModal } from "../ui/ConfirmModal";
import { Modal } from "../ui/Modal";
import { UploadStickerModal } from "./UploadStickerModal";

interface StickerLibraryModalProps {
  onClose: () => void;
}

export function StickerLibraryModal({
  onClose,
}: StickerLibraryModalProps) {
  const queryClient = useQueryClient();

  const stickersQuery = useStickers();

  const [
    isUploadOpen,
    setIsUploadOpen,
  ] = useState(false);

  const [
    stickerToDelete,
    setStickerToDelete,
  ] = useState<
    | {
        id: string;
        name: string;
      }
    | null
  >(null);

  const deleteMutation = useMutation({
    mutationFn: deleteSticker,

    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["stickers"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        }),
      ]);

      setStickerToDelete(null);
    },
  });

  return (
    <>
      <Modal
        title="My stickers"
        onClose={onClose}
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() =>
              setIsUploadOpen(true)
            }
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Upload sticker
          </button>
        </div>

        {stickersQuery.isPending && (
          <p className="py-6 text-center text-sm text-slate-400">
            Loading stickers...
          </p>
        )}

        {stickersQuery.isError && (
          <p className="py-6 text-center text-sm text-red-600">
            Unable to load stickers.
          </p>
        )}

        {stickersQuery.data &&
          stickersQuery.data.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">
              You haven't uploaded any
              stickers yet.
            </p>
          )}

        {stickersQuery.data && (
          <div className="grid grid-cols-3 gap-3">
            {stickersQuery.data.map(
              (sticker) => (
                <div
                  key={sticker.id}
                  className="group relative rounded-xl border border-slate-200 p-3"
                >
                  <img
                    src={sticker.image_url}
                    alt={sticker.name}
                    className="mx-auto h-20 w-20 object-contain"
                    loading="lazy"
                  />

                  <p className="mt-2 truncate text-center text-xs text-slate-600">
                    {sticker.name}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setStickerToDelete({
                        id: sticker.id,
                        name: sticker.name,
                      })
                    }
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm hover:text-red-600"
                    aria-label={`Delete ${sticker.name}`}
                  >
                    ×
                  </button>
                </div>
              ),
            )}
          </div>
        )}
      </Modal>

      {isUploadOpen && (
        <UploadStickerModal
          onClose={() =>
            setIsUploadOpen(false)
          }
        />
      )}

      {stickerToDelete && (
        <ConfirmModal
          title="Delete sticker?"
          message={`"${stickerToDelete.name}" will be removed from your sticker library and from any tasks using it.`}
          isPending={
            deleteMutation.isPending
          }
          onConfirm={() =>
            deleteMutation.mutate(
              stickerToDelete.id,
            )
          }
          onClose={() =>
            setStickerToDelete(null)
          }
        />
      )}
    </>
  );
}