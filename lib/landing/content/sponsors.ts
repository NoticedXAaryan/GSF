import type { SponsorTier } from "./contracts";

export const FESTIVAL_SPONSOR_TIERS = [
  {
    name: "Title Sponsors",
    sponsors: [],
  },
  {
    name: "Associate Sponsors",
    sponsors: [],
  },
  {
    name: "Partners",
    sponsors: [
      {
        id: "festival-organizers",
        name: "PIERC, Parul University and PU Goa",
        logo: {
          src: "/logo.png",
          width: 1109,
          height: 421,
          alt: "Goa Startup Festival organizers: PIERC, Parul University and PU Goa",
        },
      },
    ],
  },
] as const satisfies readonly SponsorTier[];
