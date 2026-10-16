import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    formatDateKey,
    getCalendarDays,
  } from "./calendarUtils";
  
  
  describe("formatDateKey", () => {
    it("formats a date as YYYY-MM-DD", () => {
      const date = new Date(
        2026,
        9,
        5,
      );
  
      expect(
        formatDateKey(date),
      ).toBe(
        "2026-10-05",
      );
    });
  });
  
  
  describe("getCalendarDays", () => {
    it("returns 42 calendar cells", () => {
      const days = getCalendarDays(
        2026,
        9,
      );
  
      expect(days).toHaveLength(42);
    });
  
  
    it("marks October dates as current month", () => {
      const days = getCalendarDays(
        2026,
        9,
      );
  
      const octoberFifth =
        days.find(
          ({ date }) =>
            date.getFullYear() ===
              2026 &&
            date.getMonth() === 9 &&
            date.getDate() === 5,
        );
  
      expect(
        octoberFifth?.isCurrentMonth,
      ).toBe(true);
    });
  });