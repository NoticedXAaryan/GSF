import { REQUIRED_STATISTICS, type Organizer } from "./contracts";

export const ABOUT_DESCRIPTION =
  "Goa Startup Festival 2026 is a two-day entrepreneurship and innovation festival jointly organized by PIERC, Parul University, and PU Goa. It brings students, founders, mentors, investors, and industry leaders together in South Goa to exchange practical knowledge, showcase emerging ventures, build meaningful connections, and ignite the next wave of enterprises.";

export const FESTIVAL_ORGANIZERS = [
  {
    name: "PIERC",
    description:
      "PIERC is Parul University's flagship startup incubator, recognized under MSME, Government of India. It helps student and early-stage entrepreneurs move from ideas to viable ventures through structured incubation, practical mentorship, funding access, workspace, and connections across industry and the wider startup ecosystem.",
  },
  {
    name: "Parul University",
    description:
      "Parul University brings academic depth, research capability, and an established culture of entrepreneurship to the festival. Its faculty, students, alumni, and industry network help create a practical platform for innovation, collaboration, and enterprise development.",
  },
  {
    name: "PU Goa",
    description:
      "PU Goa is Parul University's campus in Betul, South Goa, and the festival's host venue. The campus connects local aspirations with the university's wider academic and entrepreneurial ecosystem, creating an accessible meeting place for students, founders, mentors, and industry leaders.",
  },
] as const satisfies readonly Organizer[];

export const FESTIVAL_STATISTICS = REQUIRED_STATISTICS;
