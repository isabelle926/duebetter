import type { Sticker } from "../../types/api";

interface StickerPickerProps {
  stickers: Sticker[];
  selectedStickerId: string | null;
  onSelect: (
    stickerId: string | null,
  ) => void;
  onUpload: () => void;
}

export function StickerPicker({
  stickers,
  selectedStickerId,
  onSelect,
  onUpload,
}: StickerPickerProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Sticker
        </span>

        <button
          type="button"
          onClick={onUpload}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          + Upload
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex aspect-square items-center justify-center rounded-xl border text-xs ${
            selectedStickerId === null
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
              : "border-slate-200 text-slate-400 hover:bg-slate-50"
          }`}
          title="No sticker"
        >
          None
        </button>

        {stickers.map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            onClick={() =>
              onSelect(sticker.id)
            }
            className={`aspect-square overflow-hidden rounded-xl border p-1.5 transition ${
              selectedStickerId ===
              sticker.id
                ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                : "border-slate-200 hover:bg-slate-50"
            }`}
            title={sticker.name}
          >
            <img
              src={sticker.image_url}
              alt={sticker.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {stickers.length === 0 && (
        <p className="mt-2 text-xs text-slate-400">
          You haven't uploaded any stickers
          yet.
        </p>
      )}
    </div>
  );
}