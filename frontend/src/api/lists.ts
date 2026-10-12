import type { ApiTaskList } from "../types/api";
import { apiRequest } from "./client";

export function getLists(): Promise<ApiTaskList[]> {
  return apiRequest<ApiTaskList[]>("/lists");
}