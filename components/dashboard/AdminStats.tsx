import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface EventCapacity {
  eventId: string;
  eventName: string;
  capacity: number | null;
  currentRegistrations: number;
}

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalEvents: number;
    totalApplications: number;
    applicationsByStatus: {
      pending: number;
      accepted: number;
      waitlisted: number;
      rejected: number;
    };
    checkInsLast24h: number;
    newUsersLast7d: number;
    eventsCapacity: EventCapacity[];
  };
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardBody className="text-center">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </CardBody>
    </Card>
  );
}

function StatusBadge({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "pending" | "accepted" | "waitlisted" | "rejected";
}) {
  const colors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    accepted: "bg-green-50 text-green-700 border-green-200",
    waitlisted: "bg-blue-50 text-blue-700 border-blue-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border px-4 py-3",
        colors[variant]
      )}
    >
      <span className="text-sm font-medium capitalize">{label}</span>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
}

function CapacityBar({ event }: { event: EventCapacity }) {
  const capacity = event.capacity ?? 0;
  const percentage =
    capacity > 0
      ? Math.min(Math.round((event.currentRegistrations / capacity) * 100), 100)
      : 0;

  const barColor =
    percentage >= 90
      ? "bg-red-500"
      : percentage >= 70
        ? "bg-yellow-500"
        : "bg-green-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 truncate max-w-[200px]">
          {event.eventName}
        </span>
        <span className="text-gray-500">
          {event.currentRegistrations}/{capacity}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={event.currentRegistrations}
          aria-valuemin={0}
          aria-valuemax={capacity}
          aria-label={`${event.eventName}: ${event.currentRegistrations} of ${capacity} registrations`}
        />
      </div>
    </div>
  );
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="space-y-6">
      {/* Top row: overview stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Events" value={stats.totalEvents} />
        <StatCard label="Total Applications" value={stats.totalApplications} />
        <StatCard label="Check-ins (24h)" value={stats.checkInsLast24h} />
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New Users (7d)" value={stats.newUsersLast7d} />
      </div>

      {/* Applications by status */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-900">
            Applications by Status
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusBadge
              label="Pending"
              count={stats.applicationsByStatus.pending}
              variant="pending"
            />
            <StatusBadge
              label="Accepted"
              count={stats.applicationsByStatus.accepted}
              variant="accepted"
            />
            <StatusBadge
              label="Waitlisted"
              count={stats.applicationsByStatus.waitlisted}
              variant="waitlisted"
            />
            <StatusBadge
              label="Rejected"
              count={stats.applicationsByStatus.rejected}
              variant="rejected"
            />
          </div>
        </CardBody>
      </Card>

      {/* Capacity utilization */}
      {stats.eventsCapacity.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-gray-900">
              Event Capacity Utilization
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {stats.eventsCapacity.map((event) => (
                <CapacityBar key={event.eventId} event={event} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
