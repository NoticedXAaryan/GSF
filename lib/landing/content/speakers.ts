import type { ImageAsset, Speaker } from "./contracts";

export const SPEAKER_PLACEHOLDER_IMAGE = {
  src: "/images/speaker-placeholder.svg",
  width: 512,
  height: 512,
  alt: "Generic avatar for a speaker whose photograph has not been announced",
} as const satisfies ImageAsset;

export const FESTIVAL_SPEAKERS = [
  {
    id: "keynote-speaker-tba",
    fullName: "Keynote Speaker — To Be Announced",
    title: "Featured Keynote Speaker",
    organization: "Organization to be announced",
    photo: { ...SPEAKER_PLACEHOLDER_IMAGE, alt: "Profile placeholder for the festival keynote speaker" },
  },
  {
    id: "founder-speaker-tba",
    fullName: "Founder Speaker — To Be Announced",
    title: "Startup Founder",
    organization: "Organization to be announced",
    photo: { ...SPEAKER_PLACEHOLDER_IMAGE, alt: "Profile placeholder for the featured startup founder" },
  },
  {
    id: "innovation-speaker-tba",
    fullName: "Innovation Speaker — To Be Announced",
    title: "Innovation and Industry Leader",
    organization: "Organization to be announced",
    photo: { ...SPEAKER_PLACEHOLDER_IMAGE, alt: "Profile placeholder for the innovation and industry speaker" },
  },
  {
    id: "ecosystem-guest-tba",
    fullName: "Ecosystem Guest — To Be Announced",
    title: "Startup Ecosystem Guest",
    organization: "Organization to be announced",
    photo: { ...SPEAKER_PLACEHOLDER_IMAGE, alt: "Profile placeholder for the startup ecosystem guest" },
  },
] as const satisfies readonly Speaker[];
