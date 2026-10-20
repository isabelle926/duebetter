export type DueDateStatus =
  | "overdue"
  | "today"
  | "soon"
  | "normal";

function startOfDay(
  date: Date,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

export function parseDateKey(
  dateKey: string,
): Date {
  const [
    year,
    month,
    day,
  ] = dateKey
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

export function getDueDateStatus(
  dueDate: string,
  today: Date = new Date(),
): DueDateStatus {
  const due = startOfDay(
    parseDateKey(dueDate),
  );

  const current = startOfDay(today);

  const differenceMs =
    due.getTime() -
    current.getTime();

  const differenceDays =
    Math.round(
      differenceMs /
        (1000 * 60 * 60 * 24),
    );

  if (differenceDays < 0) {
    return "overdue";
  }

  if (differenceDays === 0) {
    return "today";
  }

  if (differenceDays <= 7) {
    return "soon";
  }

  return "normal";
}

export function formatTaskDueDate(
  dueDate: string,
  today: Date = new Date(),
): string {
  const due = parseDateKey(
    dueDate,
  );

  const current = startOfDay(today);

  const differenceDays =
    Math.round(
      (
        startOfDay(due).getTime() -
        current.getTime()
      ) /
        (1000 * 60 * 60 * 24),
    );

  if (differenceDays < 0) {
    const days = Math.abs(
      differenceDays,
    );

    return days === 1
      ? "1 day overdue"
      : `${days} days overdue`;
  }

  if (differenceDays === 0) {
    return "Today";
  }

  if (differenceDays === 1) {
    return "Tomorrow";
  }

  if (differenceDays <= 7) {
    return `In ${differenceDays} days`;
  }

  return due.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  );
}