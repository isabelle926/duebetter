import type {
  ApiTask,
  CreateTaskInput,
  UpdateTaskInput,
} from "../types/api";
import { apiRequest } from "./client";

export function getTasks(): Promise<ApiTask[]> {
  return apiRequest<ApiTask[]>("/tasks");
}

export function createTask(
  input: CreateTaskInput,
): Promise<ApiTask> {
  return apiRequest<ApiTask>(
    "/tasks",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
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

export function deleteTask(
  taskId: string,
): Promise<void> {
  return apiRequest<void>(
    `/tasks/${taskId}`,
    {
      method: "DELETE",
    },
  );
}