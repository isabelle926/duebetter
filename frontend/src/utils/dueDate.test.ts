import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    formatTaskDueDate,
    getDueDateStatus,
  } from "./dueDate";
  
  const today = new Date(
    2026,
    9,
    20,
  );
  
  describe(
    "getDueDateStatus",
    () => {
      it(
        "marks past tasks overdue",
        () => {
          expect(
            getDueDateStatus(
              "2026-10-19",
              today,
            ),
          ).toBe("overdue");
        },
      );
  
      it(
        "marks today's tasks as today",
        () => {
          expect(
            getDueDateStatus(
              "2026-10-20",
              today,
            ),
          ).toBe("today");
        },
      );
  
      it(
        "marks tasks within one week as soon",
        () => {
          expect(
            getDueDateStatus(
              "2026-10-27",
              today,
            ),
          ).toBe("soon");
        },
      );
  
      it(
        "marks later tasks as normal",
        () => {
          expect(
            getDueDateStatus(
              "2026-10-28",
              today,
            ),
          ).toBe("normal");
        },
      );
    },
  );
  
  describe(
    "formatTaskDueDate",
    () => {
      it(
        "formats overdue tasks",
        () => {
          expect(
            formatTaskDueDate(
              "2026-10-18",
              today,
            ),
          ).toBe(
            "2 days overdue",
          );
        },
      );
  
      it(
        "formats today's tasks",
        () => {
          expect(
            formatTaskDueDate(
              "2026-10-20",
              today,
            ),
          ).toBe("Today");
        },
      );
  
      it(
        "formats tomorrow",
        () => {
          expect(
            formatTaskDueDate(
              "2026-10-21",
              today,
            ),
          ).toBe("Tomorrow");
        },
      );
  
      it(
        "formats upcoming tasks",
        () => {
          expect(
            formatTaskDueDate(
              "2026-10-24",
              today,
            ),
          ).toBe("In 4 days");
        },
      );
    },
  );