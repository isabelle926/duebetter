import type { Task } from "../types/task";
import type { TaskList } from "../types/taskList";

export const mockLists: TaskList[] = [
  {
    id: "school",
    name: "School",
    color: "#6366f1",
  },
  {
    id: "personal",
    name: "Personal",
    color: "#ec4899",
  },
  {
    id: "career",
    name: "Career",
    color: "#22c55e",
  },
];

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Finish algorithms homework",
    dueDate: "2026-10-05",
    completed: false,
    listId: "school",
  },
  {
    id: "task-2",
    title: "Read chapter 6",
    dueDate: "2026-10-05",
    completed: true,
    listId: "school",
  },
  {
    id: "task-3",
    title: "Go to the gym",
    dueDate: "2026-10-07",
    completed: false,
    listId: "personal",
  },
  {
    id: "task-4",
    title: "Buy groceries",
    dueDate: "2026-10-10",
    completed: false,
    listId: "personal",
  },
  {
    id: "task-5",
    title: "Update resume",
    dueDate: "2026-10-14",
    completed: false,
    listId: "career",
  },
  {
    id: "task-6",
    title: "Apply to internships",
    dueDate: "2026-10-14",
    completed: false,
    listId: "career",
  },
  {
    id: "task-7",
    title: "Study for midterm",
    dueDate: "2026-10-18",
    completed: false,
    listId: "school",
  },
];