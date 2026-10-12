import type {
  ApiTask,
  UpdateTaskInput,
} from "../types/api";
import { apiRequest } from "./client";

export function getTasks(): Promise<ApiTask[]> {
  return apiRequest<ApiTask[]>("/tasks");
}

export function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<ApiTask> {
  return apiRequest<ApiTask>(
    `/tasks/${taskId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}