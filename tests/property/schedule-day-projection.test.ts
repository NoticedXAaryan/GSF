// Feature: ui-rebuild, Property 6: Selected-day projection is exact

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  selectScheduleDay,
  type EventDay,
  type EventType,
  type ScheduleEvent,
  type RegistrationStatus,
} from "@/lib/landing/schedule";

/**
 * Validates: Requirements 6.2
 *
 * Property 6: Selected-day projection is exact
 * For all prepared schedule arrays and either selected day, the visible event
 * collection contains every and only event whose `day` equals the selected day,
 * preserving prepared order.
 */

const eventDayArb: fc.Arbitrary<EventDay> = fc.constantFrom(1 as EventDay, 2 as EventDay);

const eventTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
  "open" as EventType,
  "registration" as EventType,
  "restricted" as EventType,
  "shortlisted" as EventType,
);

const registrationStatusArb: fc.Arbitrary<RegistrationStatus | null> = fc.constantFrom(
  null,
  "open" as RegistrationStatus,
  "full" as RegistrationStatus,
  "closed" as RegistrationStatus,
);

/** Generate a valid HH:MM time string */
const timeArb: fc.Arbitrary<string> = fc
  .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
  .map(([h, m]) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

/** Generate a unique alphanumeric ID */
const idArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-z0-9]+$/)
  .filter((s) => s.length >= 4 && s.length <= 12);

/** Generate a prepared ScheduleEvent (already published) */
const preparedEventArb: fc.Arbitrary<ScheduleEvent> = fc.record({
  id: idArb,
  name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  day: eventDayArb,
  startTime: timeArb,
  endTime: timeArb,
  venue: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
  type: eventTypeArb,
  status: fc.constant("published" as const),
  capacity: fc.oneof(fc.constant(null), fc.integer({ min: 0, max: 500 })),
  currentRegistrations: fc.integer({ min: 0, max: 500 }),
  coordinatorName: fc.string({ minLength: 0, maxLength: 30 }),
  registrationStatus: registrationStatusArb,
});

/**
 * Generate a prepared schedule array sorted by (day, startTime, id).
 * This simulates the output of prepareSchedule — already filtered and ordered.
 */
const preparedScheduleArb: fc.Arbitrary<ScheduleEvent[]> = fc
  .array(preparedEventArb, { minLength: 0, maxLength: 30 })
  .map((events) =>
    [...events].sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    }),
  );

describe("Property 6: Selected-day projection is exact", () => {
  it("contains every and only event whose day matches the selected day, preserving prepared order", () => {
    fc.assert(
      fc.property(preparedScheduleArb, eventDayArb, (preparedEvents, selectedDay) => {
        const result = selectScheduleDay(preparedEvents, selectedDay);

        // 1. Exactness: result contains only events with the selected day
        for (const event of result) {
          expect(event.day).toBe(selectedDay);
        }

        // 2. Completeness: every event with the selected day appears in the result
        const expectedEvents = preparedEvents.filter((e) => e.day === selectedDay);
        expect(result.length).toBe(expectedEvents.length);

        // 3. Identity: exact same event objects (no mutation/transformation)
        for (let i = 0; i < result.length; i++) {
          expect(result[i]).toBe(expectedEvents[i]);
        }

        // 4. Order preservation: result maintains the prepared order
        // Since we already verified identity with expectedEvents (which is a
        // subsequence of preparedEvents in order), order is preserved.
        for (let i = 1; i < result.length; i++) {
          const prev = result[i - 1];
          const curr = result[i];
          // Within the same day, startTime order is maintained
          const timeCompare = prev.startTime.localeCompare(curr.startTime);
          if (timeCompare !== 0) {
            expect(timeCompare).toBeLessThanOrEqual(0);
          } else {
            // Tie-breaker: id ascending
            expect(prev.id.localeCompare(curr.id)).toBeLessThanOrEqual(0);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("returns an empty array when no events match the selected day", () => {
    fc.assert(
      fc.property(preparedScheduleArb, eventDayArb, (preparedEvents, selectedDay) => {
        // Filter out all events for the selected day to guarantee none match
        const eventsWithoutSelectedDay = preparedEvents.filter(
          (e) => e.day !== selectedDay,
        );
        const result = selectScheduleDay(eventsWithoutSelectedDay, selectedDay);
        expect(result).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  it("returns all events when every event matches the selected day", () => {
    fc.assert(
      fc.property(eventDayArb, (selectedDay) => {
        // Generate events all with the same day
        const singleDayEventArb = preparedEventArb.map((e) => ({
          ...e,
          day: selectedDay,
        }));

        return fc.assert(
          fc.property(
            fc.array(singleDayEventArb, { minLength: 1, maxLength: 15 }).map((events) =>
              [...events].sort((a, b) => {
                if (a.startTime < b.startTime) return -1;
                if (a.startTime > b.startTime) return 1;
                if (a.id < b.id) return -1;
                if (a.id > b.id) return 1;
                return 0;
              }),
            ),
            (allSameDayEvents) => {
              const result = selectScheduleDay(allSameDayEvents, selectedDay);
              expect(result.length).toBe(allSameDayEvents.length);
              for (let i = 0; i < result.length; i++) {
                expect(result[i]).toBe(allSameDayEvents[i]);
              }
            },
          ),
          { numRuns: 10 },
        );
      }),
      { numRuns: 10 },
    );
  });
});
