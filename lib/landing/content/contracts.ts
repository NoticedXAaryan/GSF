import type { LucideIcon } from "lucide-react";

export const ORGANIZER_NAMES = ["PIERC", "Parul University Vadodara", "Parul University Goa"] as const;
export type OrganizerName = (typeof ORGANIZER_NAMES)[number];

export const REQUIRED_STATISTICS = [
  { label: "Startups Incubated", value: "300+" },
  { label: "Startup Revenue", value: "₹200+ Crore" },
  { label: "Investments Facilitated", value: "₹40+ Crore" },
  { label: "Employment Opportunities Created", value: "1,600+" },
] as const;
export type FestivalStat = (typeof REQUIRED_STATISTICS)[number];

export const REQUIRED_HIGHLIGHTS = [
  "Signature Talks",
  "Startup Idea Competition",
  "Fireside Chat with Investors & Industry",
  "Startup Expo & Networking",
  "Startup Masterclasses",
  "Startup Ecosystem Connect",
] as const;
export type RequiredHighlightTitle = (typeof REQUIRED_HIGHLIGHTS)[number];

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Organizer {
  name: OrganizerName;
  description: string;
  logoUrl?: string;
}

export interface Highlight {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  imageUrl?: string;
  accessibleLabel: string;
}
export interface Speaker {
  id: string;
  fullName: string;
  title: string;
  organization: string;
  photo: ImageAsset | null;
}

export const SPONSOR_TIER_NAMES = [
  "Title Sponsors",
  "Associate Sponsors",
  "Partners",
] as const;
export type SponsorTierName = (typeof SPONSOR_TIER_NAMES)[number];

export interface Sponsor {
  id: string;
  name: string;
  href?: string;
  logo: ImageAsset;
}

export interface SponsorTier {
  name: SponsorTierName;
  sponsors: readonly Sponsor[];
}

export const REQUIRED_FAQ_TOPICS = [
  "registration",
  "schedule",
  "venue",
  "eligibility",
  "event-registration",
  "prizes",
] as const;
export type FaqTopic = (typeof REQUIRED_FAQ_TOPICS)[number];

export interface FaqItem {
  id: string;
  topic: FaqTopic;
  question: string;
  answer: string;
}

export interface LandingContent {
  aboutDescription: string;
  organizers: readonly Organizer[];
  statistics: readonly FestivalStat[];
  highlights: readonly Highlight[];
  speakers: readonly Speaker[];
  sponsorTiers: readonly SponsorTier[];
  faqs: readonly FaqItem[];
}
