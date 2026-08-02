// Feature: ui-rebuild, Property 8: Registration status follows lifecycle and capacity

import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  deriveRegistrationStatus,
  type EventType,
  type EventLifecycleStatus,
} from "@/lib/landing/schedule";

/**
 * Validates: Requirements 6.6
 *
 * Property 8: Registration status follows lifecycle and capacity
 * For all event types, lifecycle statuses, non-negative registration counts, and
 * nullable non-negative capacities, status derivation returns `null` for
 * non-registration/non-shortlisted types; otherwise it returns `closed` for
 * archived events, `open` for unlimited or below-capacity events, and `full`
 * when registrations meet or exceed finite capacity.
 */

const eventTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
  "open" as EventType,
  "registration" as EventType,
  "restricted" as EventType,
  "shortlisted" as EventType,
);

const lifecycleStatusArb: fc.Arbitrary<EventLifecycleStatus> = fc.constantFrom(
  "draft" as EventLifecycleStatus,
  "published" as EventLifecycleStatus,
  "archived" as EventLifecycleStatus,
);

/** Nullable non-negative capacity: null means unlimited, otherwise >= 0 */
const capacityArb: fc.Arbitrary<number | null> = fc.oneof(
  fc.constant(null),
  fc.integer({ min: 0, max: 1000 }),
);

/** Non-negative registration count */
const registrationCountArb: fc.Arbitrary<number> = fc.integer({ min: 0, max: 1000 });

describe("Property 8: Registration status follows lifecycle and capacity", () => {
  it("returns null for non-registration and non-shortlisted event types", () => {
    const nonRegistrationTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
      "open" as EventType,
      "restricted" as EventType,
    );

    fc.assert(
      fc.property(
        nonRegistrationTypeArb,
        lifecycleStatusArb,
        capacityArb,
        registrationCountArb,
        (type, status, capacity, currentRegistrations) => {
          const result = deriveRegistrationStatus({
            type,
            status,
            capacity,
            currentRegistrations,
          });
          expect(result).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("returns closed for archived registration/shortlisted events regardless of capacity", () => {
    const registrationTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
      "registration" as EventType,
      "shortlisted" as EventType,
    );

    fc.assert(
      fc.property(
        registrationTypeArb,
        capacityArb,
        registrationCountArb,
        (type, capacity, currentRegistrations) => {
          const result = deriveRegistrationStatus({
            type,
            status: "archived",
            capacity,
            currentRegistrations,
          });
          expect(result).toBe("closed");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("returns open for unlimited capacity (null) on non-archived registration/shortlisted events", () => {
    const registrationTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
      "registration" as EventType,
      "shortlisted" as EventType,
    );
    const nonArchivedStatusArb: fc.Arbitrary<EventLifecycleStatus> = fc.constantFrom(
      "draft" as EventLifecycleStatus,
      "published" as EventLifecycleStatus,
    );

    fc.assert(
      fc.property(
        registrationTypeArb,
        nonArchivedStatusArb,
        registrationCountArb,
        (type, status, currentRegistrations) => {
          const result = deriveRegistrationStatus({
            type,
            status,
            capacity: null,
            currentRegistrations,
          });
          expect(result).toBe("open");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("returns open when registrations are below finite capacity on non-archived registration/shortlisted events", () => {
    const registrationTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
      "registration" as EventType,
      "shortlisted" as EventType,
    );
    const nonArchivedStatusArb: fc.Arbitrary<EventLifecycleStatus> = fc.constantFrom(
      "draft" as EventLifecycleStatus,
      "published" as EventLifecycleStatus,
    );

    // Generate capacity > 0 and registrations strictly below capacity
    const belowCapacityArb = fc
      .integer({ min: 1, max: 1000 })
      .chain((cap) =>
        fc.tuple(fc.constant(cap), fc.integer({ min: 0, max: cap - 1 })),
      );

    fc.assert(
      fc.property(
        registrationTypeArb,
        nonArchivedStatusArb,
        belowCapacityArb,
        (type, status, [capacity, currentRegistrations]) => {
          const result = deriveRegistrationStatus({
            type,
            status,
            capacity,
            currentRegistrations,
          });
          expect(result).toBe("open");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("returns full when registrations equal finite capacity on non-archived registration/shortlisted events", () => {
    const registrationTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
      "registration" as EventType,
      "shortlisted" as EventType,
    );
    const nonArchivedStatusArb: fc.Arbitrary<EventLifecycleStatus> = fc.constantFrom(
      "draft" as EventLifecycleStatus,
      "published" as EventLifecycleStatus,
    );

    fc.assert(
      fc.property(
        registrationTypeArb,
        nonArchivedStatusArb,
        fc.integer({ min: 0, max: 1000 }),
        (type, status, capacity) => {
          const result = deriveRegistrationStatus({
            type,
            status,
            capacity,
            currentRegistrations: capacity, // equal to capacity
          });
          expect(result).toBe("full");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("returns full when registrations exceed finite capacity on non-archived registration/shortlisted events", () => {
    const registrationTypeArb: fc.Arbitrary<EventType> = fc.constantFrom(
      "registration" as EventType,
      "shortlisted" as EventType,
    );
    const nonArchivedStatusArb: fc.Arbitrary<EventLifecycleStatus> = fc.constantFrom(
      "draft" as EventLifecycleStatus,
      "published" as EventLifecycleStatus,
    );

    // Generate capacity and registrations > capacity
    const exceedsCapacityArb = fc
      .integer({ min: 0, max: 999 })
      .chain((cap) =>
        fc.tuple(fc.constant(cap), fc.integer({ min: cap + 1, max: cap + 500 })),
      );

    fc.assert(
      fc.property(
        registrationTypeArb,
        nonArchivedStatusArb,
        exceedsCapacityArb,
        (type, status, [capacity, currentRegistrations]) => {
          const result = deriveRegistrationStatus({
            type,
            status,
            capacity,
            currentRegistrations,
          });
          expect(result).toBe("full");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("covers the complete decision space for all types, statuses, capacities, and counts", () => {
    fc.assert(
      fc.property(
        eventTypeArb,
        lifecycleStatusArb,
        capacityArb,
        registrationCountArb,
        (type, status, capacity, currentRegistrations) => {
          const result = deriveRegistrationStatus({
            type,
            status,
            capacity,
            currentRegistrations,
          });

          // Non-registration/non-shortlisted types always return null
          if (type !== "registration" && type !== "shortlisted") {
            expect(result).toBeNull();
            return;
          }

          // Archived always returns closed
          if (status === "archived") {
            expect(result).toBe("closed");
            return;
          }

          // Unlimited capacity returns open
          if (capacity === null) {
            expect(result).toBe("open");
            return;
          }

          // Below capacity returns open
          if (currentRegistrations < capacity) {
            expect(result).toBe("open");
            return;
          }

          // At or above capacity returns full
          expect(result).toBe("full");
        },
      ),
      { numRuns: 200 },
    );
  });
});
