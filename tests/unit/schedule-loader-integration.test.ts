import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock server-only (it throws at import time in non-server contexts)
vi.mock("server-only", () => ({}));

// ─── Database mock ─────────────────────────────────────────────────────────────

const mockOrderBy = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: (...args: unknown[]) => {
            mockOrderBy(...args);
            return mockOrderBy.mock.results[mockOrderBy.mock.results.length - 1]
              ?.value;
          },
        }),
      }),
    }),
  },
}));

vi.mock("@/lib/schema", () => ({
  events: {
    id: "events.id",
    name: "events.name",
    day: "events.day",
    startTime: "events.startTime",
    endTime: "events.endTime",
    venue: "events.venue",
    type: "events.type",
    status: "events.status",
    capacity: "events.capacity",
    currentRegistrations: "events.currentRegistrations",
    coordinatorName: "events.coordinatorName",
  },
}));

import { loadPublishedSchedule } from "@/lib/landing/schedule-loader";

// ─── Integration: schedule failure returns usable result ───────────────────────

describe("loadPublishedSchedule — failure resilience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a usable ScheduleLoadResult on database connection failure (doesn't throw)", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOrderBy.mockRejectedValueOnce(new Error("ECONNREFUSED 10.0.0.5:5432"));

    const result = await loadPublishedSchedule();

    // Verify the result is usable — it's a proper discriminated union
    expect(result).toBeDefined();
    expect(result.state).toBe("unavailable");
    expect(result.events).toEqual([]);
    expect("message" in result && result.message).toBe(
      "Event data is temporarily unavailable.",
    );

    // The result can be consumed by ScheduleSection without throwing
    if (result.state === "unavailable") {
      expect(result.message).toBeTruthy();
      expect(Array.isArray(result.events)).toBe(true);
    }

    consoleSpy.mockRestore();
  });

  it("returns a usable result on query timeout", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOrderBy.mockRejectedValueOnce(new Error("Query read timeout"));

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("unavailable");
    expect(result.events).toEqual([]);
    expect("message" in result && result.message).toBe(
      "Event data is temporarily unavailable.",
    );

    consoleSpy.mockRestore();
  });

  it("returns a usable result on unexpected non-Error throw", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOrderBy.mockRejectedValueOnce(undefined);

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("unavailable");
    expect(result.events).toEqual([]);

    consoleSpy.mockRestore();
  });

  it("does not expose database error details in the result message", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const sensitiveError = new Error(
      "FATAL: password authentication failed for user 'admin' at host 10.0.0.5:5432",
    );
    mockOrderBy.mockRejectedValueOnce(sensitiveError);

    const result = await loadPublishedSchedule();

    // The message should be generic and not contain sensitive info
    if (result.state === "unavailable") {
      expect(result.message).not.toContain("password");
      expect(result.message).not.toContain("admin");
      expect(result.message).not.toContain("10.0.0.5");
      expect(result.message).toBe("Event data is temporarily unavailable.");
    }

    consoleSpy.mockRestore();
  });

  it("handles a mixed-status query with tied times correctly", async () => {
    const dbRows = [
      {
        id: "evt-beta",
        name: "Beta Workshop",
        day: 1,
        startTime: "10:00",
        endTime: "11:00",
        venue: "Room A",
        type: "registration",
        status: "published",
        capacity: 30,
        currentRegistrations: 30,
        coordinatorName: "Bob",
      },
      {
        id: "evt-alpha",
        name: "Alpha Talk",
        day: 1,
        startTime: "10:00",
        endTime: "11:30",
        venue: "Main Hall",
        type: "open",
        status: "published",
        capacity: null,
        currentRegistrations: 0,
        coordinatorName: "Alice",
      },
      {
        id: "evt-day2",
        name: "Day 2 Panel",
        day: 2,
        startTime: "09:00",
        endTime: "10:00",
        venue: "Auditorium",
        type: "shortlisted",
        status: "published",
        capacity: 10,
        currentRegistrations: 5,
        coordinatorName: "Charlie",
      },
    ];

    mockOrderBy.mockResolvedValueOnce(dbRows);

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("ready");
    expect(result.events).toHaveLength(3);

    // Tied start times on day 1 sorted by id: alpha < beta
    expect(result.events[0].id).toBe("evt-alpha");
    expect(result.events[1].id).toBe("evt-beta");
    expect(result.events[2].id).toBe("evt-day2");

    // Registration statuses computed
    expect(result.events[0].registrationStatus).toBeNull(); // open type
    expect(result.events[1].registrationStatus).toBe("full"); // at capacity
    expect(result.events[2].registrationStatus).toBe("open"); // shortlisted, below capacity
  });

  it("the result shape works with the ScheduleSection rendering contract", async () => {
    mockOrderBy.mockResolvedValueOnce([]);

    const result = await loadPublishedSchedule();

    // Ready state with empty events should allow rendering "No events for this day"
    expect(result.state).toBe("ready");
    expect(result.events).toEqual([]);

    // Verify the result conforms to the discriminated union
    if (result.state === "ready") {
      expect(Array.isArray(result.events)).toBe(true);
    }
  });
});
