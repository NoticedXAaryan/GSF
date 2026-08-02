import { Eyebrow } from "@/components/ui/bento";
import { FileText, MapPin, CalendarDays } from "lucide-react";
import type { ApplicationStatus, EventType } from "@/lib/types";

interface ApplicationItem {
  id: string;
  subEventId: string;
  status: ApplicationStatus;
  appliedAt: number;
  eventName: string | null;
  eventDate: string | null;
  eventVenue: string | null;
  eventType: EventType | null;
}

interface ApplicationListProps {
  applications: ApplicationItem[];
}

/** Accepted applications get the lime fill; the rest read as panels. */
const statusChrome: Record<
  ApplicationStatus,
  { card: string; chip: string; tone: "lime" | "panel" }
> = {
  accepted: {
    card: "bg-lime text-void",
    chip: "bg-void text-lime",
    tone: "lime",
  },
  pending: {
    card: "bg-panel text-fg border border-line",
    chip: "bg-volt text-void",
    tone: "panel",
  },
  waitlisted: {
    card: "bg-panel text-fg border border-line",
    chip: "bg-azure text-void",
    tone: "panel",
  },
  rejected: {
    card: "bg-panel text-fg border border-line",
    chip: "bg-panel-alt text-fg-dim",
    tone: "panel",
  },
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: ApplicationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ApplicationList({ applications }: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-bento border border-line bg-panel p-10 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-panel-alt">
          <FileText className="h-6 w-6 text-fg-dim" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold tracking-tight">No applications yet</h2>
        <p className="mt-1 text-sm text-fg-dim">
          Browse the schedule and apply to sub-events to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status legend */}
      <div className="flex flex-wrap gap-3 rounded-tile border border-line bg-panel p-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-volt" />
          <span className="text-xs font-medium text-fg-dim">Pending — Being reviewed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-lime" />
          <span className="text-xs font-medium text-fg-dim">Accepted — You&apos;re in!</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-azure" />
          <span className="text-xs font-medium text-fg-dim">Waitlisted — On the backup list</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-panel-alt border border-line" />
          <span className="text-xs font-medium text-fg-dim">Rejected — Not selected</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {applications.map((app, i) => {
          const chrome = statusChrome[app.status] ?? statusChrome.pending;
          const isAccepted = app.status === "accepted";

          return (
            <article
              key={app.id}
              className={`flex animate-tile-in flex-col justify-between rounded-bento p-5 ${chrome.card}`}
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <Eyebrow tone={chrome.tone}>
                    {app.eventType ?? "Sub-event"}
                  </Eyebrow>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight ${chrome.chip}`}
                  >
                    {statusLabel(app.status)}
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold leading-tight tracking-tight">
                  {app.eventName ?? "Unknown event"}
                </h3>
              </div>

              <div
                className={`mt-4 space-y-1.5 text-xs font-medium ${
                  isAccepted ? "text-void/70" : "text-fg-dim"
                }`}
              >
                {app.eventDate && (
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {app.eventDate}
                  </p>
                )}
                {app.eventVenue && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {app.eventVenue}
                  </p>
                )}
                <p className={isAccepted ? "text-void/50" : "text-fg-dim/70"}>
                  Applied {formatDate(app.appliedAt)}
                </p>

                {/* Status helper text */}
                <p className={`mt-1 text-[11px] italic ${isAccepted ? "text-void/60" : "text-fg-dim/60"}`}>
                  {app.status === "pending" && "Your application is under review. You'll be notified once a decision is made."}
                  {app.status === "accepted" && "Congratulations! You can attend this event. Show your QR pass at check-in."}
                  {app.status === "waitlisted" && "You're on the backup list. You'll be notified if a spot opens up."}
                  {app.status === "rejected" && "Unfortunately your application was not selected for this event."}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
