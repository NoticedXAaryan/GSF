import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock server-only (it throws at import time in non-server contexts)
vi.mock("server-only", () => ({}));

// Mock the database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return {
        from: (...fArgs: unknown[]) => {
          mockFrom(...fArgs);
          return {
            where: (...wArgs: unknown[]) => {
              mockWhere(...wArgs);
              return {
                orderBy: (...oArgs: unknown[]) => {
                  mockOrderBy(...oArgs);
                  return mockOrderBy.mock.results[
                    mockOrderBy.mock.results.length - 1
                  ]?.value;
                },
              };
            },
          };
        },
      };
    },
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

import { loadPublishedSchedule } from "./schedule-loader";

describe("loadPublishedSchedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ready state with normalized events on successful query", async () => {
    const dbRows = [
      {
        id: "evt-1",
        name: "Opening Keynote",
        day: 1,
        startTime: "09:00",
        endTime: "10:00",
        venue: "Main Hall",
        type: "open",
        status: "published",
        capacity: null,
        currentRegistrations: 0,
        coordinatorName: "Alice",
      },
      {
        id: "evt-2",
        name: "Workshop A",
        day: 1,
        startTime: "10:30",
        endTime: "12:00",
        venue: "Room B",
        type: "registration",
        status: "published",
        capacity: 50,
        currentRegistrations: 30,
        coordinatorName: "Bob",
      },
    ];

    mockOrderBy.mockResolvedValueOnce(dbRows);

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("ready");
    expect(result.events).toHaveLength(2);
    expect(result.events[0].id).toBe("evt-1");
    expect(result.events[0].status).toBe("published");
    expect(result.events[0].registrationStatus).toBeNull(); // open type
    expect(result.events[1].registrationStatus).toBe("open"); // registration type, below capacity
  });

  it("returns ready state with empty events when no published events exist", async () => {
    mockOrderBy.mockResolvedValueOnce([]);

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("ready");
    expect(result.events).toEqual([]);
  });

  it("returns unavailable state when query throws an error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOrderBy.mockRejectedValueOnce(
      new Error("connection refused to 10.0.0.5:5432"),
    );

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("unavailable");
    expect(result.events).toEqual([]);
    expect((result as { message?: string }).message).toBe("Event data is temporarily unavailable.");
    // Verify error was logged but sanitized (no raw DB connection details in response)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[schedule-loader]"),
    );
    consoleSpy.mockRestore();
  });

  it("returns unavailable state when a non-Error is thrown", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOrderBy.mockRejectedValueOnce("string error");

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("unavailable");
    expect(result.events).toEqual([]);
    expect((result as { message?: string }).message).toBe("Event data is temporarily unavailable.");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unknown schedule query error"),
    );
    consoleSpy.mockRestore();
  });

  it("quarantines malformed rows and returns only valid published events", async () => {
    const dbRows = [
      {
        id: "evt-good",
        name: "Valid Event",
        day: 1,
        startTime: "09:00",
        endTime: "10:00",
        venue: "Main Hall",
        type: "open",
        status: "published",
        capacity: null,
        currentRegistrations: 0,
        coordinatorName: "Alice",
      },
      {
        id: "evt-bad",
        name: "Bad Event",
        day: 3, // invalid day
        startTime: "25:00", // invalid time
        endTime: "10:00",
        venue: "Room A",
        type: "open",
        status: "published",
        capacity: null,
        currentRegistrations: 0,
        coordinatorName: "Bob",
      },
    ];

    mockOrderBy.mockResolvedValueOnce(dbRows);

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("ready");
    expect(result.events).toHaveLength(1);
    expect(result.events[0].id).toBe("evt-good");
  });

  it("normalizes nullable coordinatorName to empty string", async () => {
    const dbRows = [
      {
        id: "evt-1",
        name: "Session",
        day: 2,
        startTime: "14:00",
        endTime: "15:00",
        venue: "Auditorium",
        type: "restricted",
        status: "published",
        capacity: 100,
        currentRegistrations: 0,
        coordinatorName: null,
      },
    ];

    mockOrderBy.mockResolvedValueOnce(dbRows);

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("ready");
    expect(result.events).toHaveLength(1);
    expect(result.events[0].coordinatorName).toBe("");
  });

  it("derives registration status correctly for full-capacity events", async () => {
    const dbRows = [
      {
        id: "evt-full",
        name: "Full Workshop",
        day: 1,
        startTime: "10:00",
        endTime: "12:00",
        venue: "Lab",
        type: "registration",
        status: "published",
        capacity: 20,
        currentRegistrations: 20,
        coordinatorName: "Charlie",
      },
    ];

    mockOrderBy.mockResolvedValueOnce(dbRows);

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("ready");
    expect(result.events[0].registrationStatus).toBe("full");
  });

  it("sorts events deterministically by day, startTime, and id", async () => {
    const dbRows = [
      {
        id: "evt-b",
        name: "Event B",
        day: 1,
        startTime: "09:00",
        endTime: "10:00",
        venue: "Hall",
        type: "open",
        status: "published",
        capacity: null,
        currentRegistrations: 0,
        coordinatorName: "",
      },
      {
        id: "evt-a",
        name: "Event A",
        day: 1,
        startTime: "09:00",
        endTime: "10:00",
        venue: "Hall",
        type: "open",
        status: "published",
        capacity: null,
        currentRegistrations: 0,
        coordinatorName: "",
      },
      {
        id: "evt-c",
        name: "Day 2 Event",
        day: 2,
        startTime: "08:00",
        endTime: "09:00",
        venue: "Hall",
        type: "open",
        status: "published",
        capacity: null,
        currentRegistrations: 0,
        coordinatorName: "",
      },
    ];

    mockOrderBy.mockResolvedValueOnce(dbRows);

    const result = await loadPublishedSchedule();

    expect(result.state).toBe("ready");
    expect(result.events.map((e) => e.id)).toEqual([
      "evt-a",
      "evt-b",
      "evt-c",
    ]);
  });
});
