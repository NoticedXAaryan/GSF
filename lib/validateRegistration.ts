export const eventConfig: Record<string, { deadline?: Date; isInviteOnly?: boolean }> = {
  "idea-pitch": { deadline: new Date("2026-08-21T23:59:59Z") },
  "reel-pitch": { deadline: new Date("2026-08-21T23:59:59Z") },
  "masterclass": { deadline: new Date("2026-08-21T23:59:59Z") },
  "ecosystem-connect": { isInviteOnly: true },
};

export function canRegister(eventSlug: string, userRole: string): boolean {
  const config = eventConfig[eventSlug];
  if (!config) return true; // Open event

  if (config.isInviteOnly && userRole !== 'Admin' && userRole !== 'Lead') return false;

  if (config.deadline && new Date() > config.deadline) {
    return false;
  }
  return true;
}

export function getEventSlug(eventName: string): string {
  const lowerName = eventName.toLowerCase();
  if (lowerName.includes("idea pitch")) return "idea-pitch";
  if (lowerName.includes("reel pitch")) return "reel-pitch";
  if (lowerName.includes("masterclass")) return "masterclass";
  if (lowerName.includes("ecosystem connect")) return "ecosystem-connect";
  if (lowerName.includes("signature talks")) return "signature-talks";
  if (lowerName.includes("startup expo")) return "expo";
  if (lowerName.includes("fireside chat")) return "fireside-chat";
  return lowerName.replace(/\s+/g, '-');
}
