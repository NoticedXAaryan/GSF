// Feature: ui-rebuild, Property 7: Event-card projection preserves required public information

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  projectEventCard,
  type EventDay,
  type EventType,
  type RegistrationStatus,
  type ScheduleEvent,
} from "@/lib/landing/schedule";

/**
 * **Validates: Requirements 6.3**
 *
 * Property 7: Event-card projection preserves required public information
 *
 * For all valid public schedule events, the event-card view model contains
 * the original event name, venue, and coordinator; a `HH:MM – HH:MM` time
 * range; and exactly one allowed display type (`Open`, `Registration`,
 * `Restricted`, or `Shortlisted`).
 */

const ALLOWED_DISPLAY_TYPES = ["Open", "Registration", "Restricted", "Shortlisted"] as const;
const TIME_RANGE_PATTERN = /^\d{2}:\d{2} – \d{2}:\d{2}$/;

const eventDayArb: fc.Arbitrary<EventDay> = fc.constantFrom(1 as EventDay, 2 as EventDay);

const eventTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
  "open" as EventType,
  "registration" as EventType,
  "restricted" as EventType,
  "shortlisted" as EventType,
);

/** Generate a valid HH:MM time string */
const timeArb: fc.Arbitrary<string> = fc
  .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
  .map(([h, m]) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

/** Generate a non-empty trimmed string for name/venue/coordinator */
const nonEmptyStringArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0)
  .map((s) => s.trim());

/** Generate a valid registration status or null */
const registrationStatusArb: fc.Arbitrary<RegistrationStatus | null> = fc.constantFrom(
  null,
  "open" as RegistrationStatus,
  "full" as RegistrationStatus,
  "closed" as RegistrationStatus,
);

/** Generate a valid published ScheduleEvent */
const scheduleEventArb: fc.Arbitrary<ScheduleEvent> = fc.record({
  id: fc.stringMatching(/^[a-z0-9]+$/).filter((s) => s.length >= 4 && s.length <= 12),
  name: nonEmptyStringArb,
  day: eventDayArb,
  startTime: timeArb,
  endTime: timeArb,
  venue: nonEmptyStringArb,
  type: eventTypeArb,
  status: fc.constant("published" as const),
  capacity: fc.oneof(fc.constant(null), fc.integer({ min: 0, max: 500 })),
  currentRegistrations: fc.integer({ min: 0, max: 500 }),
  coordinatorName: fc.string({ minLength: 0, maxLength: 40 }),
  registrationStatus: registrationStatusArb,
});

describe("Property 7: Event-card projection preserves required public information", () => {
  it("preserves original name, venue, and coordinatorName in the view model", () => {
    fc.assert(
      fc.property(scheduleEventArb, (event) => {
        const card = projectEventCard(event);

        expect(card.name).toBe(event.name);
        expect(card.venue).toBe(event.venue);
        expect(card.coordinatorName).toBe(event.coordinatorName);
      }),
      { numRuns: 100 },
    );
  });

  it("produces a canonical HH:MM – HH:MM time range from startTime and endTime", () => {
    fc.assert(
      fc.property(scheduleEventArb, (event) => {
        const card = projectEventCard(event);

        // Time range matches the expected pattern
        expect(card.timeRange).toMatch(TIME_RANGE_PATTERN);

        // Time range is composed of the original startTime and endTime
        const expectedTimeRange = `${event.startTime} – ${event.endTime}`;
        expect(card.timeRange).toBe(expectedTimeRange);
      }),
      { numRuns: 100 },
    );
  });

  it("produces exactly one allowed display type from the set {Open, Registration, Restricted, Shortlisted}", () => {
    fc.assert(
      fc.property(scheduleEventArb, (event) => {
        const card = projectEventCard(event);

        // typeLabel is one of the allowed display types
        expect(ALLOWED_DISPLAY_TYPES).toContain(card.typeLabel);

        // Exactly one display type (it's a single string value, not an array)
        expect(typeof card.typeLabel).toBe("string");
        expect(card.typeLabel.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it("maps each event type to its corresponding display type correctly", () => {
    fc.assert(
      fc.property(scheduleEventArb, (event) => {
        const card = projectEventCard(event);

        const expectedMapping: Record<EventType, string> = {
          open: "Open",
          registration: "Registration",
          restricted: "Restricted",
          shortlisted: "Shortlisted",
        };

        expect(card.typeLabel).toBe(expectedMapping[event.type]);
      }),
      { numRuns: 100 },
    );
  });
});
