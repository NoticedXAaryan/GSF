import { describe, expect, it } from "vitest";

import {
  prepareSchedule,
  prepareScheduleWithQuarantine,
  selectScheduleDay,
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

// ─── Malformed-row quarantine ──────────────────────────────────────────────────

describe("prepareSchedule — malformed-row quarantine", () => {
  it("quarantines null values passed as rows", () => {
    const result = prepareScheduleWithQuarantine([null, eventRow()]);

    expect(result.events).toHaveLength(1);
    expect(result.quarantined).toHaveLength(1);
    expect(result.quarantined[0].index).toBe(0);
    expect(result.quarantined[0].reasons).toContain(
      "event row must be an object",
    );
  });

  it("quarantines rows with invalid day values", () => {
    const result = prepareScheduleWithQuarantine([
      eventRow({ id: "bad-day", day: 3 }),
      eventRow({ id: "good" }),
    ]);

    expect(result.events.map(({ id }) => id)).toEqual(["good"]);
    expect(result.quarantined[0].reasons).toContain("day must be 1 or 2");
  });

  it("quarantines rows with malformed startTime", () => {
    const result = prepareScheduleWithQuarantine([
      eventRow({ id: "bad-time", startTime: "9:30" }),
    ]);

    expect(result.events).toHaveLength(0);
    expect(result.quarantined[0].reasons).toContain(
      "startTime must use valid HH:MM time",
    );
  });

  it("quarantines rows with out-of-range time (25:00)", () => {
    const result = prepareScheduleWithQuarantine([
      eventRow({ id: "invalid-hour", startTime: "25:00" }),
    ]);

    expect(result.events).toHaveLength(0);
    expect(result.quarantined[0].reasons).toContain(
      "startTime must use valid HH:MM time",
    );
  });

  it("quarantines rows with invalid event type", () => {
    const result = prepareScheduleWithQuarantine([
      eventRow({ id: "bad-type", type: "invite-only" }),
    ]);

    expect(result.events).toHaveLength(0);
    expect(result.quarantined[0].reasons).toContain(
      "type must be a supported public event type",
    );
  });

  it("quarantines rows with missing id", () => {
    const result = prepareScheduleWithQuarantine([
      eventRow({ id: "" }),
    ]);

    expect(result.events).toHaveLength(0);
    expect(result.quarantined[0].reasons).toContain(
      "id must be a non-empty string",
    );
  });

  it("quarantines rows with negative capacity", () => {
    const result = prepareScheduleWithQuarantine([
      eventRow({ id: "neg-cap", capacity: -5 }),
    ]);

    expect(result.events).toHaveLength(0);
    expect(result.quarantined[0].reasons).toContain(
      "capacity must be a non-negative integer or null",
    );
  });

  it("quarantines multiple malformed rows and reports all reasons", () => {
    const result = prepareScheduleWithQuarantine([
      eventRow({ id: "multi-bad", day: 0, startTime: "abc", type: "unknown" }),
    ]);

    expect(result.quarantined).toHaveLength(1);
    expect(result.quarantined[0].reasons.length).toBeGreaterThanOrEqual(3);
  });

  it("preserves valid events alongside quarantined rows", () => {
    const result = prepareScheduleWithQuarantine([
      eventRow({ id: "valid-1" }),
      eventRow({ id: "bad", day: 99 }),
      eventRow({ id: "valid-2" }),
    ]);

    expect(result.events.map(({ id }) => id)).toEqual(["valid-1", "valid-2"]);
    expect(result.quarantined.map(({ index }) => index)).toEqual([1]);
  });
});

// ─── Tied start times sorted by ID ────────────────────────────────────────────

describe("prepareSchedule — tied start times sorted by ID", () => {
  it("sorts events with same day and startTime by id ascending", () => {
    const events = prepareSchedule([
      eventRow({ id: "z-event", day: 1, startTime: "10:00" }),
      eventRow({ id: "a-event", day: 1, startTime: "10:00" }),
      eventRow({ id: "m-event", day: 1, startTime: "10:00" }),
    ]);

    expect(events.map(({ id }) => id)).toEqual([
      "a-event",
      "m-event",
      "z-event",
    ]);
  });

  it("sorts events by day first, then startTime, then id", () => {
    const events = prepareSchedule([
      eventRow({ id: "c", day: 2, startTime: "09:00" }),
      eventRow({ id: "b", day: 1, startTime: "14:00" }),
      eventRow({ id: "a", day: 1, startTime: "14:00" }),
      eventRow({ id: "d", day: 1, startTime: "09:00" }),
    ]);

    expect(events.map(({ id }) => id)).toEqual(["d", "a", "b", "c"]);
  });

  it("maintains stable sort for events that differ only by id", () => {
    const events = prepareSchedule([
      eventRow({ id: "event-3", day: 1, startTime: "10:00" }),
      eventRow({ id: "event-1", day: 1, startTime: "10:00" }),
      eventRow({ id: "event-2", day: 1, startTime: "10:00" }),
    ]);

    expect(events.map(({ id }) => id)).toEqual([
      "event-1",
      "event-2",
      "event-3",
    ]);
  });
});

// ─── Mixed statuses ────────────────────────────────────────────────────────────

describe("prepareSchedule — mixed statuses and tied times", () => {
  it("filters out draft/archived events and sorts remaining published with tied times by id", () => {
    const rows = [
      eventRow({ id: "pub-b", day: 1, startTime: "10:00", status: "published" }),
      eventRow({ id: "draft-1", day: 1, startTime: "10:00", status: "draft" }),
      eventRow({ id: "arch-1", day: 1, startTime: "10:00", status: "archived" }),
      eventRow({ id: "pub-a", day: 1, startTime: "10:00", status: "published" }),
      eventRow({ id: "pub-c", day: 2, startTime: "08:00", status: "published" }),
      eventRow({ id: "draft-2", day: 2, startTime: "08:00", status: "draft" }),
    ];

    const events = prepareSchedule(rows);

    // Only published events are returned
    expect(events).toHaveLength(3);
    expect(events.every((e) => e.status === "published")).toBe(true);

    // Sorted: day 1 first, then tied startTime sorted by id, then day 2
    expect(events.map(({ id }) => id)).toEqual(["pub-a", "pub-b", "pub-c"]);
  });
});
