import { describe, expect, it } from "vitest";

import { formatCalendarDate } from "./dates";

describe("formatCalendarDate", () => {
  it("formats a calendar date without shifting the day", () => {
    expect(formatCalendarDate("2026-11-16")).toBe("16 de noviembre de 2026");
    expect(formatCalendarDate("2026-01-01")).toBe("1 de enero de 2026");
    expect(formatCalendarDate("2026-11-16T00:00:00Z")).toBe("2026-11-16T00:00:00Z");
  });
});
