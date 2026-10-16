import { useQuery } from "@tanstack/react-query";

import { getStickers } from "../api/stickers";

export function useStickers() {
  return useQuery({
    queryKey: ["stickers"],
    queryFn: getStickers,
  });
}