import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ScheduleEvent } from "@/lib/landing/schedule";
import type { ScheduleLoadResult } from "@/lib/landing/schedule-loader";
import { ScheduleSection } from "@/components/landing/ScheduleSection";
import { ScheduleExplorer } from "@/components/landing/ScheduleExplorer";
import { EventCard } from "@/components/landing/EventCard";
import { projectEventCard } from "@/lib/landing/schedule";

// ─── Test helpers ──────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
  return {
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
    coordinatorName: "Dr. Sharma",
    registrationStatus: null,
    ...overrides,
  };
}

// ─── ScheduleExplorer component tests ──────────────────────────────────────────

describe("ScheduleExplorer", () => {
  it("shows Day 1 events by default", () => {
    const events: ScheduleEvent[] = [
      makeEvent({ id: "d1-1", day: 1, name: "Day 1 Event" }),
      makeEvent({ id: "d2-1", day: 2, name: "Day 2 Event" }),
    ];

    render(<ScheduleExplorer events={events} />);

    expect(screen.getByText("Day 1 Event")).toBeInTheDocument();
    expect(screen.queryByText("Day 2 Event")).not.toBeInTheDocument();
  });

  it("shows Day 2 events when Day 2 button is clicked", () => {
    const events: ScheduleEvent[] = [
      makeEvent({ id: "d1-1", day: 1, name: "Day 1 Only" }),
      makeEvent({ id: "d2-1", day: 2, name: "Day 2 Only" }),
    ];

    render(<ScheduleExplorer events={events} />);

    const day2Btn = screen.getByRole("button", { name: /day 2/i });
    fireEvent.click(day2Btn);

    expect(screen.getByText("Day 2 Only")).toBeInTheDocument();
    expect(screen.queryByText("Day 1 Only")).not.toBeInTheDocument();
  });

  it("shows exact empty message when no events for selected day", () => {
    const events: ScheduleEvent[] = [
      makeEvent({ id: "d2-1", day: 2, name: "Day 2 Event" }),
    ];

    render(<ScheduleExplorer events={events} />);

    // Day 1 is default, but no Day 1 events exist
    expect(
      screen.getByText("No events scheduled for this day."),
    ).toBeInTheDocument();
  });

  it("shows empty message when switching to a day with no events", () => {
    const events: ScheduleEvent[] = [
      makeEvent({ id: "d1-1", day: 1, name: "Day 1 Event" }),
    ];

    render(<ScheduleExplorer events={events} />);

    const day2Btn = screen.getByRole("button", { name: /day 2/i });
    fireEvent.click(day2Btn);

    expect(
      screen.getByText("No events scheduled for this day."),
    ).toBeInTheDocument();
  });

  it("marks Day 1 button as pressed by default", () => {
    render(<ScheduleExplorer events={[makeEvent()]} />);

    const day1Btn = screen.getByRole("button", { name: /day 1/i });
    const day2Btn = screen.getByRole("button", { name: /day 2/i });

    expect(day1Btn).toHaveAttribute("aria-pressed", "true");
    expect(day2Btn).toHaveAttribute("aria-pressed", "false");
  });

  it("updates aria-pressed when switching days", () => {
    render(<ScheduleExplorer events={[makeEvent()]} />);

    const day2Btn = screen.getByRole("button", { name: /day 2/i });
    fireEvent.click(day2Btn);

    const day1Btn = screen.getByRole("button", { name: /day 1/i });
    expect(day1Btn).toHaveAttribute("aria-pressed", "false");
    expect(day2Btn).toHaveAttribute("aria-pressed", "true");
  });
});

// ─── ScheduleSection component tests ───────────────────────────────────────────

describe("ScheduleSection", () => {
  it("renders unavailable message when schedule state is unavailable", () => {
    const schedule: ScheduleLoadResult = {
      state: "unavailable",
      events: [],
      message: "Event data is temporarily unavailable.",
    };

    render(<ScheduleSection schedule={schedule} />);

    expect(
      screen.getByText("Event data is temporarily unavailable."),
    ).toBeInTheDocument();
  });

  it("renders ScheduleExplorer when schedule state is ready", () => {
    const schedule: ScheduleLoadResult = {
      state: "ready",
      events: [makeEvent()],
    };

    render(<ScheduleSection schedule={schedule} />);

    expect(screen.getByText("Opening Keynote")).toBeInTheDocument();
  });

  it("renders the section heading", () => {
    const schedule: ScheduleLoadResult = {
      state: "ready",
      events: [],
    };

    render(<ScheduleSection schedule={schedule} />);

    expect(
      screen.getByRole("heading", { name: /programme schedule/i }),
    ).toBeInTheDocument();
  });
});

// ─── EventCard component tests ─────────────────────────────────────────────────

describe("EventCard", () => {
  it("renders all required fields: name, time range, venue, type badge, coordinator", () => {
    const event = makeEvent({
      name: "AI Workshop",
      startTime: "14:00",
      endTime: "16:00",
      venue: "Tech Lab",
      type: "open",
      coordinatorName: "Prof. Kapoor",
    });
    const viewModel = projectEventCard(event);

    render(<EventCard event={viewModel} />);

    expect(screen.getByText("AI Workshop")).toBeInTheDocument();
    expect(screen.getByText("14:00 – 16:00")).toBeInTheDocument();
    expect(screen.getByText("Tech Lab")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Prof. Kapoor")).toBeInTheDocument();
  });

  it("shows registration badge for registration type events with open status", () => {
    const event = makeEvent({
      type: "registration",
      capacity: 50,
      currentRegistrations: 30,
      registrationStatus: "open",
    });
    const viewModel = projectEventCard(event);

    render(<EventCard event={viewModel} />);

    expect(screen.getByText("Registration")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("shows registration badge for shortlisted type events", () => {
    const event = makeEvent({
      type: "shortlisted",
      capacity: 20,
      currentRegistrations: 15,
      registrationStatus: "open",
    });
    const viewModel = projectEventCard(event);

    render(<EventCard event={viewModel} />);

    expect(screen.getByText("Shortlisted")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("does not show registration badge for open or restricted events", () => {
    const openEvent = makeEvent({ type: "open", registrationStatus: null });
    const openViewModel = projectEventCard(openEvent);

    const { container } = render(<EventCard event={openViewModel} />);

    // Only one badge (type badge), no registration badge
    const badges = container.querySelectorAll('[class*="rounded-pill"]');
    expect(badges).toHaveLength(1);
  });

  it("capacity boundary: shows Open when below capacity", () => {
    const event = makeEvent({
      type: "registration",
      capacity: 100,
      currentRegistrations: 99,
      registrationStatus: "open",
    });
    const viewModel = projectEventCard(event);

    render(<EventCard event={viewModel} />);

    // The second badge should show "Open" (registration status)
    const badges = screen.getAllByText("Open");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("capacity boundary: shows Full when at capacity", () => {
    const event = makeEvent({
      type: "registration",
      capacity: 100,
      currentRegistrations: 100,
      registrationStatus: "full",
    });
    const viewModel = projectEventCard(event);

    render(<EventCard event={viewModel} />);

    expect(screen.getByText("Full")).toBeInTheDocument();
  });

  it("capacity boundary: shows Full when above capacity", () => {
    const event = makeEvent({
      type: "registration",
      capacity: 100,
      currentRegistrations: 150,
      registrationStatus: "full",
    });
    const viewModel = projectEventCard(event);

    render(<EventCard event={viewModel} />);

    expect(screen.getByText("Full")).toBeInTheDocument();
  });

  it("capacity boundary: shows Open for unlimited capacity (null)", () => {
    const event = makeEvent({
      type: "registration",
      capacity: null,
      currentRegistrations: 500,
      registrationStatus: "open",
    });
    const viewModel = projectEventCard(event);

    render(<EventCard event={viewModel} />);

    const badges = screen.getAllByText("Open");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
