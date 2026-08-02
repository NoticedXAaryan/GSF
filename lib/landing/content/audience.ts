import { GraduationCap, Rocket, Landmark, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AudienceGroup {
  id: string;
  title: string;
  description: string;
  outcomes: readonly string[];
  icon: LucideIcon;
  accessibleLabel: string;
}

/**
 * Who the festival is for. Each group states the concrete reason to attend
 * rather than a generic welcome, so visitors can self-select quickly.
 */
export const FESTIVAL_AUDIENCES = [
  {
    id: "students",
    title: "Students",
    description:
      "Turn coursework and side projects into something real, with mentors who have built ventures themselves.",
    outcomes: [
      "Hands-on workshops",
      "Pitch competitions",
      "Mentor office hours",
    ],
    icon: GraduationCap,
    accessibleLabel: "Graduation cap representing students",
  },
  {
    id: "founders",
    title: "Founders",
    description:
      "Pressure-test your model, meet capital, and find the operators and early customers you have been looking for.",
    outcomes: [
      "Showcase your venture",
      "Investor conversations",
      "Peer founder circles",
    ],
    icon: Rocket,
    accessibleLabel: "Rocket representing founders",
  },
  {
    id: "investors",
    title: "Investors & Mentors",
    description:
      "See early-stage ventures from across the region in one place, and back the teams worth backing.",
    outcomes: [
      "Curated startup pipeline",
      "Panel and jury roles",
      "Ecosystem networking",
    ],
    icon: Landmark,
    accessibleLabel: "Institution representing investors and mentors",
  },
  {
    id: "industry",
    title: "Industry & Institutions",
    description:
      "Scout innovation, meet future talent, and build partnerships with academia and the startup ecosystem.",
    outcomes: [
      "Talent discovery",
      "Partnership meetings",
      "Brand presence",
    ],
    icon: Building2,
    accessibleLabel: "Buildings representing industry and institutions",
  },
] as const satisfies readonly AudienceGroup[];
