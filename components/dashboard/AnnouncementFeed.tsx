import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { AnnouncementPriority } from "@/lib/types";

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  createdAt: number;
}

interface AnnouncementFeedProps {
  announcements: AnnouncementItem[];
}

const priorityStyles: Record<AnnouncementPriority, string> = {
  high: "border-l-4 border-l-red-500",
  normal: "border-l-4 border-l-blue-500",
  low: "border-l-4 border-l-gray-400",
};

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export function AnnouncementFeed({ announcements }: AnnouncementFeedProps) {
  if (!announcements || announcements.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">
          No announcements right now.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <Card
          key={announcement.id}
          className={cn("overflow-hidden", priorityStyles[announcement.priority])}
        >
          <CardBody className="py-3 px-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-sm">
                {announcement.title}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTimestamp(announcement.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{announcement.body}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
