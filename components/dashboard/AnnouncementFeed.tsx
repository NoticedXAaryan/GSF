import { Eyebrow, IconChip } from "@/components/ui/bento";
import { Megaphone } from "lucide-react";
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

/**
 * High-priority items get a full neon fill so they dominate the feed;
 * everything else stays on a panel surface with an accent rail.
 */
const priorityChrome: Record<
  AnnouncementPriority,
  { card: string; label: string; rail: string; tone: 'magenta' | 'panel' }
> = {
  high: {
    card: "bg-magenta text-void",
    label: "text-void/60",
    rail: "",
    tone: "magenta",
  },
  normal: {
    card: "bg-panel text-fg border border-line",
    label: "text-fg-dim",
    rail: "bg-lime",
    tone: "panel",
  },
  low: {
    card: "bg-panel text-fg border border-line",
    label: "text-fg-dim",
    rail: "bg-fg-dim/30",
    tone: "panel",
  },
};

function formatTimestamp(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
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

import DOMPurify from 'isomorphic-dompurify';

/**
 * Renders announcement bodies as rich text with a conservative tag allowlist.
 * Using isomorphic-dompurify ensures robust XSS protection on both client and server.
 */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 's', 'p', 'br', 'ul', 'ol', 'li', 'span', 'a', 'code'],
    ALLOWED_ATTR: ['href', 'rel', 'target'],
  });
}

export function AnnouncementFeed({ announcements }: AnnouncementFeedProps) {
  if (!announcements || announcements.length === 0) {
    return (
      <div className="rounded-bento border border-line bg-panel p-10 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-panel-alt">
          <Megaphone className="h-6 w-6 text-fg-dim" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold tracking-tight text-fg">All quiet</h2>
        <p className="mt-1 text-sm text-fg-dim">
          No announcements right now. Check back during the festival.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement, i) => {
        const chrome = priorityChrome[announcement.priority] ?? priorityChrome.normal;
        const isHigh = announcement.priority === "high";

        return (
          <article
            key={announcement.id}
            className={`relative animate-tile-in overflow-hidden rounded-bento p-5 ${chrome.card}`}
            style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
          >
            {/* Accent rail for non-filled cards */}
            {!isHigh && (
              <span
                className={`absolute inset-y-4 left-0 w-1 rounded-r-full ${chrome.rail}`}
                aria-hidden="true"
              />
            )}

            <div className={!isHigh ? "pl-4" : undefined}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Eyebrow tone={chrome.tone}>
                    {isHigh ? "Priority" : announcement.priority}
                  </Eyebrow>
                  <h3 className="mt-1.5 text-lg font-bold leading-tight tracking-tight text-current">
                    {announcement.title}
                  </h3>
                </div>
                {isHigh && (
                  <IconChip tone="magenta">
                    <Megaphone className="h-4 w-4" aria-hidden="true" />
                  </IconChip>
                )}
              </div>

              <div
                className={`mt-2 text-sm leading-relaxed [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_p]:mt-2 [&_p:first-child]:mt-0 ${
                  isHigh ? "text-void/75" : "text-fg-dim"
                }`}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.body) }}
              />

              <p className={`mt-3 text-[11px] font-semibold tracking-tight ${chrome.label}`}>
                {formatTimestamp(announcement.createdAt)}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
