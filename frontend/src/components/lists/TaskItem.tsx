import type { Task } from "../../types/task";

interface TaskItemProps {
    task: Task;
    onToggle: (taskId: string) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
    return (
        <button
            type="button"
            onClick={() => onToggle(task.id)}
            className="group flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50"
        >
            <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                    task.completed
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white"
                }`}
            >
                {task.completed ? "✓" : ""}
            </span>

            <span
                className={`text-sm ${
                    task.completed
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                }`}
            >
                {task.title}
            </span>
        </button>
    );
}