import {
  Lightbulb,
  MessagesSquare,
  Mic2,
  Network,
  Presentation,
  Trophy,
} from "lucide-react";

import type { Highlight } from "./contracts";

export const FESTIVAL_HIGHLIGHTS = [
  {
    id: "keynote-speeches",
    title: "Signature Talks",
    description: "Hear inspiring stories from successful entrepreneurs, startup founders, policymakers, and industry leaders as they share real-world experiences, lessons learned, and insights into building impactful businesses.",
    icon: Mic2,
    imageUrl: "/images/highlights/keynote.png",
    accessibleLabel: "Microphone representing signature talks",
  },
  {
    id: "competitions",
    title: "Startup Idea Competition",
    description: "Present your business idea before an expert jury, receive valuable feedback, and compete for exciting cash prizes while showcasing your entrepreneurial vision.",
    icon: Trophy,
    imageUrl: "/images/highlights/competition.png",
    accessibleLabel: "Trophy representing startup idea competition",
  },
  {
    id: "panel-discussions",
    title: "Fireside Chat with Investors & Industry",
    description: "Engage in candid conversations with investors and business leaders as they discuss funding, scaling, market trends, investment readiness, and the realities of building successful ventures.",
    icon: MessagesSquare,
    imageUrl: "/images/highlights/panel.png",
    accessibleLabel: "Conversation bubbles representing fireside chats",
  },
  {
    id: "startup-showcases",
    title: "Startup Expo",
    description: "Discover innovative startups, breakthrough technologies, and emerging businesses while interacting directly with founders, innovators, customers, investors, and ecosystem partners.",
    icon: Presentation,
    imageUrl: "/images/highlights/showcase.png",
    accessibleLabel: "Presentation board representing startup expo",
  },
  {
    id: "workshops",
    title: "Startup Masterclass",
    description: "Learn practical startup frameworks through expert-led sessions covering idea generation, startup lifecycle, design thinking, business models, and venture development.",
    icon: Lightbulb,
    imageUrl: "/images/highlights/workshop.png",
    accessibleLabel: "Light bulb representing masterclasses",
  },
  {
    id: "networking",
    title: "Startup Ecosystem Connect",
    description: "Join a collaborative dialogue featuring government bodies, incubators, educational institutions, investors, mentors, industry leaders, and startup enablers working together to strengthen Goa's entrepreneurial ecosystem.",
    icon: Network,
    imageUrl: "/images/highlights/networking.png",
    accessibleLabel: "Connected nodes representing ecosystem connect",
  },
] as const satisfies readonly Highlight[];
