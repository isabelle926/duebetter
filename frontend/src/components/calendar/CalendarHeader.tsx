interface CalendarHeaderProps {
    currentDate: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

export function CalendarHeader({
    currentDate,
    onPreviousMonth,
    onNextMonth,
    onToday,
}: CalendarHeaderProps) {
    const monthName = currentDate.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
                <h2 className="text-x1 font-semibold text-slate-900">
                    {monthName}
                </h2>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onToday}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                    Today
                </button>

                <button 
                    type="button"
                    onClick={onPreviousMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    aria-label="Previous month"
                >
                    ‹
                </button>

                <button
                    type="button"
                    onClick={onNextMonth}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    aria-label="Next month"
                >
                    ›
                </button>
            </div>
        </div>
    );
}