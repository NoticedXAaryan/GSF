import { describe, expect, it } from "vitest";

import {
  deriveRegistrationStatus,
  formatEventTimeRange,
  formatEventType,
  prepareSchedule,
  prepareScheduleWithQuarantine,
  projectEventCard,
  selectScheduleDay,
  type EventLifecycleStatus,
  type EventType,
  type ScheduleEvent,
} from "@/lib/landing/schedule";

function eventRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "event-1",
    name: "Opening Session",
    day: 1,
    startTime: "09:30",
    endTime: "10:15",
    venue: "Main Hall",
    type: "open",
    status: "published",
    capacity: null,
    currentRegistrations: 0,
    coordinatorName: "Asha Naik",
    ...overrides,
  };
}

function preparedEvent(overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
  return prepareSchedule([eventRow(overrides)])[0];
}

describe("schedule preparation", () => {
  it("normalizes nullable public fields and filters unpublished rows", () => {
    const events = prepareSchedule([
      eventRow({ coordinatorName: null, currentRegistrations: null }),
      eventRow({ id: "draft", status: "draft" }),
      eventRow({ id: "archived", status: "archived" }),
    ]);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: "event-1",
      coordinatorName: "",
      currentRegistrations: 0,
      status: "published",
    });
  });

  it("quarantines malformed rows without preventing valid rows from rendering", () => {
    const malformed = eventRow({
      id: "bad",
      day: 3,
      startTime: "9:30",
      type: "invite-only",
      capacity: -1,
    });
    const result = prepareScheduleWithQuarantine([
      null,
      malformed,
      eventRow({ id: "good" }),
    ]);

    expect(result.events.map(({ id }) => id)).toEqual(["good"]);
    expect(result.quarantined.map(({ index }) => index)).toEqual([0, 1]);
    expect(result.quarantined[1].reasons).toEqual(
      expect.arrayContaining([
        "day must be 1 or 2",
        "startTime must use valid HH:MM time",
        "type must be a supported public event type",
        "capacity must be a non-negative integer or null",
      ]),
    );
  });

  it("sorts deterministically by day, start time, then id without mutating input", () => {
    const rows = [
      eventRow({ id: "z", day: 2, startTime: "08:00" }),
      eventRow({ id: "b", day: 1, startTime: "10:00" }),
      eventRow({ id: "a", day: 1, startTime: "10:00" }),
      eventRow({ id: "early", day: 1, startTime: "09:00" }),
    ];
    const originalOrder = rows.map(({ id }) => id);

    expect(prepareSchedule(rows).map(({ id }) => id)).toEqual([
      "early",
      "a",
      "b",
      "z",
    ]);
    expect(rows.map(({ id }) => id)).toEqual(originalOrder);
  });

  it("selects exactly one day while preserving prepared order", () => {
    const prepared = prepareSchedule([
      eventRow({ id: "day-2", day: 2 }),
      eventRow({ id: "day-1-b", startTime: "11:00" }),
      eventRow({ id: "day-1-a", startTime: "08:00" }),
    ]);

    expect(selectScheduleDay(prepared, 1).map(({ id }) => id)).toEqual([
      "day-1-a",
      "day-1-b",
    ]);
    expect(selectScheduleDay(prepared, 2).map(({ id }) => id)).toEqual(["day-2"]);
  });
});

describe("registration status", () => {
  const statusFor = (
    type: EventType,
    status: EventLifecycleStatus,
    capacity: number | null,
    currentRegistrations: number,
  ) => deriveRegistrationStatus({ type, status, capacity, currentRegistrations });

  it("returns no status for event types without registration", () => {
    expect(statusFor("open", "archived", 0, 0)).toBeNull();
    expect(statusFor("restricted", "published", 10, 10)).toBeNull();
  });

  it.each(["registration", "shortlisted"] as const)(
    "handles archived, unlimited, below-capacity, and full %s events",
    (type) => {
      expect(statusFor(type, "archived", null, 0)).toBe("closed");
      expect(statusFor(type, "published", null, 500)).toBe("open");
      expect(statusFor(type, "published", 10, 9)).toBe("open");
      expect(statusFor(type, "published", 10, 10)).toBe("full");
      expect(statusFor(type, "published", 10, 11)).toBe("full");
    },
  );
});

describe("event-card projection", () => {
  it.each([
    ["open", "Open"],
    ["registration", "Registration"],
    ["restricted", "Restricted"],
    ["shortlisted", "Shortlisted"],
  ] as const)("formats %s as %s", (type, label) => {
    expect(formatEventType(type)).toBe(label);
  });

  it("preserves required fields and formats a canonical time range", () => {
    const event = preparedEvent({
      type: "registration",
      capacity: 10,
      currentRegistrations: 10,
    });

    expect(projectEventCard(event)).toEqual({
      id: "event-1",
      name: "Opening Session",
      timeRange: "09:30 – 10:15",
      venue: "Main Hall",
      typeLabel: "Registration",
      coordinatorName: "Asha Naik",
      registrationStatus: "full",
    });
  });

  it("rejects non-canonical times at the formatting boundary", () => {
    expect(() => formatEventTimeRange("9:30", "10:15")).toThrow(RangeError);
  });
});
