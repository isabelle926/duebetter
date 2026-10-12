import { useMemo, useState } from "react";

import type { Task } from "../../types/task";
import type { TaskList } from "../../types/taskList";
import { CalendarDay } from "./CalendarDay";
import { CalendarHeader } from "./CalendarHeader";
import {
    formatDateKey,
    getCalendarDays,
} from "./calendarUtils";

interface CalendarProps {
    tasks: Task[];
    lists: TaskList[];
}

const WEEKDAYS = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
];

export function Calendar({ tasks, lists }: CalendarProps) {
    const [today] = useState(() => new Date());

    const [currentDate, setCurrentDate] = useState(
        () => today,
    );

    const calendarDays = useMemo(
        () =>
            getCalendarDays(
                currentDate.getFullYear(),
                currentDate.getMonth(),
            ),
        [currentDate],
    );

    function handlePreviousMonth() {
        setCurrentDate(
            (date) => 
                new Date(
                    date.getFullYear(),
                    date.getMonth() - 1,
                    1,
                ),
        );
    }

    function handleNextMonth() {
        setCurrentDate(
            (date) =>
                new Date(
                    date.getFullYear(),
                    date.getMonth() + 1,
                    1,
                ),
        );
    }

    function handleToday() {
        setCurrentDate(new Date());
    }

    return (
        <section className="flex min-w-0 flex-1 flex-col bg-white">
            <CalendarHeader
                currentDate={currentDate}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
                onToday={handleToday}
            />

            <div className="grid grid-cols-7 border-b border-slate-200">
                {WEEKDAYS.map((weekday) => (
                    <div
                        key={weekday}
                        className="border-r border-slate-100 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                        {weekday}
                    </div>
                ))}
            </div>

            <div className="grid flex-1 grid-cols-7 grid-rows-6">
                {calendarDays.map(({ date, isCurrentMonth }) => {
                    const dateKey = formatDateKey(date);

                    const tasksForDay = tasks.filter(
                        (task) => task.due_date === dateKey,
                    );

                    return (
                        <CalendarDay
                            key={dateKey}
                            date={date}
                            today={today}
                            isCurrentMonth={isCurrentMonth}
                            tasks={tasksForDay}
                            lists={lists}
                        />
                    );
                })}
            </div>
        </section>
    )
}