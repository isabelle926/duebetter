import { useState } from "react";

import { Calendar } from "../components/calendar/Calendar";
import { Header } from "../components/layout/Header";
import { ListSidebar } from "../components/lists/ListSidebar";
import {
    mockLists,
    mockTasks,
} from "../data/mockData";
import type { Task } from "../types/task";

export function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>(mockTasks);

    function handleToggleTask(taskId: string) {
        setTasks((currentTasks) =>
        currentTasks.map((task) =>
            task.id === taskId
            ? {
                ...task,
                completed: !task.completed,
                }
            : task,
        ),
        );
    }

    return (
        <div className="flex h-screen flex-col bg-slate-50">
        <Header />

        <main className="grid min-h-0 flex-1 grid-cols-[320px_1fr]">
            <ListSidebar
            lists={mockLists}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            />

            <Calendar
            lists={mockLists}
            tasks={tasks}
            />
        </main>
        </div>
    );
}