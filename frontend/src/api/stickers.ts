import type { Sticker } from "../types/api";
import { apiRequest } from "./client";

interface UploadStickerInput {
  name: string;
  file: File;
}

export function getStickers(): Promise<
  Sticker[]
> {
  return apiRequest<Sticker[]>(
    "/stickers",
  );
}

export function uploadSticker({
  name,
  file,
}: UploadStickerInput): Promise<Sticker> {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("file", file);

  return apiRequest<Sticker>(
    "/stickers",
    {
      method: "POST",
      body: formData,
    },
  );
}

export function deleteSticker(
  stickerId: string,
): Promise<void> {
  return apiRequest<void>(
    `/stickers/${stickerId}`,
    {
      method: "DELETE",
    },
  );
}