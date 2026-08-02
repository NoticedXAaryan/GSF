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
    title: "Keynote Speeches",
    description: "Hear founders and leaders share practical lessons on building resilient, high-impact enterprises.",
    icon: Mic2,
    accessibleLabel: "Microphone representing keynote speeches",
  },
  {
    id: "panel-discussions",
    title: "Panel Discussions",
    description: "Explore candid perspectives on capital, markets, technology, talent, and the future of entrepreneurship.",
    icon: MessagesSquare,
    accessibleLabel: "Conversation bubbles representing panel discussions",
  },
  {
    id: "workshops",
    title: "Workshops",
    description: "Build practical skills through focused, hands-on sessions guided by experienced practitioners.",
    icon: Lightbulb,
    accessibleLabel: "Light bulb representing practical workshops",
  },
  {
    id: "startup-showcases",
    title: "Startup Showcases",
    description: "Discover emerging ventures, meet their teams, and see promising ideas demonstrated in person.",
    icon: Presentation,
    accessibleLabel: "Presentation board representing startup showcases",
  },
  {
    id: "competitions",
    title: "Competitions",
    description: "Watch aspiring founders test their ideas, sharpen their pitches, and compete for festival prizes.",
    icon: Trophy,
    accessibleLabel: "Trophy representing startup competitions",
  },
  {
    id: "networking",
    title: "Networking",
    description: "Create meaningful connections with students, founders, mentors, investors, and industry leaders.",
    icon: Network,
    accessibleLabel: "Connected nodes representing networking",
  },
] as const satisfies readonly Highlight[];
