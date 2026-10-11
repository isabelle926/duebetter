export interface CalendaryDayData {
    date: Date;
    isCurrentMonth: boolean;
}

export function getCalendarDays (
    year: number,
    month: number,
): CalendaryDayData[] {
    const firstDayOfMonth = new Date(year, month, 1);

    const startDate = new Date(firstDayOfMonth);

    startDate.setDate(
        firstDayOfMonth.getDate() - firstDayOfMonth.getDay(),
    );

    const days: CalendaryDayData[] = [];

    for (let i = 0; i < 42; i += 1) {
        const date = new Date(startDate);

        date.setDate(startDate.getDate() + i);

        days.push({
            date,
            isCurrentMonth: date.getMonth() === month,
        });
    }

    return days;
}

export function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}