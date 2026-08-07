'use client';

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

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
    <Card className={cn("animate-tile-in", className)}>
      <CardBody className="text-center">
        <p className="text-2xl font-bold text-fg">{value}</p>
        <p className="mt-1 text-sm text-fg-dim">{label}</p>
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
    pending: "bg-volt text-void",
    accepted: "bg-lime text-void",
    waitlisted: "bg-azure text-void",
    rejected: "bg-panel-alt text-fg-dim",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-tile px-4 py-3",
        colors[variant]
      )}
    >
      <span className="text-sm font-medium capitalize">{label}</span>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
}

export function AdminStats({ stats }: AdminStatsProps) {
  const pieData = [
    { name: 'Pending', value: stats.applicationsByStatus.pending, color: '#f59e0b' },
    { name: 'Accepted', value: stats.applicationsByStatus.accepted, color: '#10b981' },
    { name: 'Waitlisted', value: stats.applicationsByStatus.waitlisted, color: '#3b82f6' },
    { name: 'Rejected', value: stats.applicationsByStatus.rejected, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const barData = stats.eventsCapacity.map(event => ({
    name: event.eventName,
    registrations: event.currentRegistrations,
    capacity: event.capacity || 0,
    utilization: event.capacity ? Math.round((event.currentRegistrations / event.capacity) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Top row: overview stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Events" value={stats.totalEvents} />
        <StatCard label="Total Applications" value={stats.totalApplications} />
        <StatCard label="Check-ins (24h)" value={stats.checkInsLast24h} />
      </div>

      {/* Applications by status & Capacity utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-fg">
              Applications by Status
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3 mb-6">
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
            {pieData.length > 0 && (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Capacity utilization */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-fg">
              Event Capacity Utilization
            </h3>
          </CardHeader>
          <CardBody>
            {stats.eventsCapacity.length > 0 ? (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                    <Bar dataKey="utilization" fill="#10b981" radius={[0, 4, 4, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.utilization >= 90 ? '#ef4444' : entry.utilization >= 70 ? '#f59e0b' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-fg-dim">
                No capacity tracking
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
