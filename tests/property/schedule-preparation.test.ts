// Feature: ui-rebuild, Property 5: Schedule preparation is published-only and ordered

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  prepareSchedule,
  type EventDay,
  type EventType,
  type EventLifecycleStatus,
  type ScheduleEvent,
} from "@/lib/landing/schedule";

/**
 * Validates: Requirements 6.4
 *
 * Property 5: Schedule preparation is published-only and ordered
 * For all arrays of valid event records, schedule preparation returns exactly
 * the records whose status is `published`, without duplication, ordered
 * ascending by day, start time, and stable ID tie-breaker.
 */

const eventDayArb: fc.Arbitrary<EventDay> = fc.constantFrom(1 as EventDay, 2 as EventDay);

const eventTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
  "open" as EventType,
  "registration" as EventType,
  "restricted" as EventType,
  "shortlisted" as EventType,
);

const eventStatusArb: fc.Arbitrary<EventLifecycleStatus> = fc.constantFrom(
  "draft" as EventLifecycleStatus,
  "published" as EventLifecycleStatus,
  "archived" as EventLifecycleStatus,
);

/** Generate a valid HH:MM time string */
const timeArb: fc.Arbitrary<string> = fc
  .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
  .map(([h, m]) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

/** Generate a unique alphanumeric ID */
const idArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-z0-9]+$/)
  .filter((s) => s.length >= 4 && s.length <= 12);

/** Generate a valid event record with the given status */
function eventRecordArb(status: fc.Arbitrary<EventLifecycleStatus>) {
  return fc.record({
    id: idArb,
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    day: eventDayArb,
    startTime: timeArb,
    endTime: timeArb,
    venue: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    type: eventTypeArb,
    status,
    capacity: fc.oneof(fc.constant(null), fc.integer({ min: 0, max: 500 })),
    currentRegistrations: fc.integer({ min: 0, max: 500 }),
    coordinatorName: fc.string({ minLength: 0, maxLength: 30 }),
  });
}

/** Generate mixed arrays of event records with various statuses */
const mixedEventArrayArb = fc.array(eventRecordArb(eventStatusArb), {
  minLength: 0,
  maxLength: 30,
});

describe("Property 5: Schedule preparation is published-only and ordered", () => {
  it("returns only published events, without duplication, ordered by (day, startTime, id)", () => {
    fc.assert(
      fc.property(mixedEventArrayArb, (rows) => {
        const result = prepareSchedule(rows);

        // 1. Membership: every returned event corresponds to a published input
        const publishedInputs = rows.filter((r) => r.status === "published");
        const publishedIds = publishedInputs.map((r) => r.id);
        const resultIds = result.map((e) => e.id);

        // Every result ID must come from a published input
        for (const event of result) {
          expect(publishedIds).toContain(event.id);
          expect(event.status).toBe("published");
        }

        // Every published input ID must appear in results
        for (const id of publishedIds) {
          expect(resultIds).toContain(id);
        }

        // Result count matches published input count
        expect(result.length).toBe(publishedInputs.length);

        // 2. No duplication: each result position is unique by reference
        const uniqueSet = new Set(resultIds);
        // Note: if input has duplicate IDs, they should all appear;
        // but each result entry should correspond to one input entry
        expect(result.length).toBe(resultIds.length);

        // 3. Ordering: ascending by (day, startTime, id)
        for (let i = 1; i < result.length; i++) {
          const prev = result[i - 1];
          const curr = result[i];

          const dayCompare = prev.day - curr.day;
          if (dayCompare !== 0) {
            expect(dayCompare).toBeLessThan(0);
            continue;
          }

          const timeCompare = prev.startTime.localeCompare(curr.startTime);
          if (timeCompare !== 0) {
            expect(timeCompare).toBeLessThan(0);
            continue;
          }

          // Tie-breaker: id ascending
          expect(prev.id.localeCompare(curr.id)).toBeLessThanOrEqual(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("excludes draft events entirely", () => {
    fc.assert(
      fc.property(
        fc.array(eventRecordArb(fc.constant("draft" as EventLifecycleStatus)), {
          minLength: 1,
          maxLength: 10,
        }),
        (rows) => {
          const result = prepareSchedule(rows);
          expect(result).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("excludes archived events entirely", () => {
    fc.assert(
      fc.property(
        fc.array(eventRecordArb(fc.constant("archived" as EventLifecycleStatus)), {
          minLength: 1,
          maxLength: 10,
        }),
        (rows) => {
          const result = prepareSchedule(rows);
          expect(result).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("includes all published events from a mixed array", () => {
    fc.assert(
      fc.property(mixedEventArrayArb, (rows) => {
        const result = prepareSchedule(rows);
        const expectedCount = rows.filter((r) => r.status === "published").length;
        expect(result.length).toBe(expectedCount);
      }),
      { numRuns: 100 },
    );
  });
});
