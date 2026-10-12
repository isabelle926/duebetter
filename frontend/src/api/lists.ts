import type {
  ApiTaskList,
  CreateListInput,
  UpdateListInput,
} from "../types/api";
import { apiRequest } from "./client";

export function getLists(): Promise<ApiTaskList[]> {
  return apiRequest<ApiTaskList[]>("/lists");
}

export function createList(
  input: CreateListInput,
): Promise<ApiTaskList> {
  return apiRequest<ApiTaskList>(
    "/lists",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function updateList(
  listId: string,
  input: UpdateListInput,
): Promise<ApiTaskList> {
  return apiRequest<ApiTaskList>(
    `/lists/${listId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export function deleteList(
  listId: string,
): Promise<void> {
  return apiRequest<void>(
    `/lists/${listId}`,
    {
      method: "DELETE",
    },
  );
}