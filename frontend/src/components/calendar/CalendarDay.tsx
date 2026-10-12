import type { Task } from "../../types/task";
import type { TaskList } from "../../types/taskList";

interface CalendarDayProps {
  date: Date;
  today: Date;
  isCurrentMonth: boolean;
  tasks: Task[];
  lists: TaskList[];
}

export function CalendarDay({
  date,
  today,
  isCurrentMonth,
  tasks,
  lists,
}: CalendarDayProps) {
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  return (
    <button
      type="button"
      className={`min-h-24 border-b border-r border-slate-100 p-2 text-left align-top transition hover:bg-slate-50 ${
        isCurrentMonth ? "bg-white" : "bg-slate-50/60"
      }`}
    >
      <div className="mb-2">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
            isToday
              ? "bg-indigo-600 font-semibold text-white"
              : isCurrentMonth
                ? "text-slate-700"
                : "text-slate-300"
          }`}
        >
          {date.getDate()}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {tasks.slice(0, 6).map((task) => {
          const list = lists.find(
            (candidate) => candidate.id === task.list_id,
          );

          return (
            <span
              key={task.id}
              className={`h-2 w-2 rounded-full ${
                task.completed ? "opacity-30" : ""
              }`}
              style={{
                backgroundColor: list?.color ?? "#94a3b8",
              }}
              title={task.title}
            />
          );
        })}

        {tasks.length > 6 && (
          <span className="text-[10px] text-slate-400">
            +{tasks.length - 6}
          </span>
        )}
      </div>
    </button>
  );
}