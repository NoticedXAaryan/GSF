import type { ScheduleLoadResult } from "@/lib/landing/schedule-loader";
import { ScheduleExplorer } from "./ScheduleExplorer";

interface ScheduleSectionProps {
  schedule: ScheduleLoadResult;
}

export function ScheduleSection({ schedule }: ScheduleSectionProps) {
  return (
    <section
      id="schedule"
      aria-labelledby="schedule-title"
      className="bg-[#0d0d0f] bg-noise section-padding"
    >
      <div className="site-container">
        <header className="max-w-3xl">
          <p className="mb-2 font-semibold uppercase tracking-widest text-accent">
            Plan your days
          </p>
          <h2 id="schedule-title" className="font-bold text-white">
            Programme Schedule
          </h2>
          <div aria-hidden="true" className="brand-rule mt-6 w-20 text-accent/40" />
          <p className="mt-6 text-lg text-white/60">
            Two days of innovation, learning, and networking. Toggle between days
            to explore the full programme.
          </p>
        </header>

        <div className="mt-12">
          {schedule.state === "ready" ? (
            <ScheduleExplorer events={schedule.events} />
          ) : (
            <p className="text-center text-white/50">
              Event data is temporarily unavailable.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
