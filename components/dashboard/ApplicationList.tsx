import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
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
      <Card>
        <CardBody>
          <p className="text-center text-gray-500 py-4">
            No applications yet. Browse events to get started.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <Card key={app.id} className={app.status === "accepted" ? "border-green-200 bg-green-50/30" : undefined}>
          <CardBody className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 truncate">
                {app.eventName ?? "Unknown Event"}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                {app.eventDate && <span>{app.eventDate}</span>}
                {app.eventVenue && <span>{app.eventVenue}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
              <Badge variant={app.status}>
                {statusLabel(app.status)}
              </Badge>
              <span className="text-xs text-gray-400">
                Applied {formatDate(app.appliedAt)}
              </span>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
