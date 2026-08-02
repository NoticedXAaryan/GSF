import type { FaqItem } from "./contracts";

export const FESTIVAL_FAQS = [
  {
    id: "festival-registration",
    topic: "registration",
    question: "How do I register for the festival?",
    answer: "Create an account, complete your profile, and register from your dashboard to receive your digital festival pass.",
  },
  {
    id: "festival-schedule",
    topic: "schedule",
    question: "What is the festival schedule?",
    answer: "The festival runs on 2–3 September 2026. The published programme for each day will be available in the Schedule section and may be updated as sessions are confirmed.",
  },
  {
    id: "festival-venue",
    topic: "venue",
    question: "Where is the festival venue?",
    answer: "Goa Startup Festival 2026 takes place at Parul University Goa Campus in Betul, South Goa.",
  },
  {
    id: "participation-eligibility",
    topic: "eligibility",
    question: "Who can participate?",
    answer: "Parul University Goa students can participate in the festival. Individual activities may have additional audience or eligibility requirements shown with their event details.",
  },
  {
    id: "individual-event-registration",
    topic: "event-registration",
    question: "Do I need to register for individual events?",
    answer: "Yes. Selected activities, including masterclasses, idea pitching, the Startup Expo, and ReelPitch, require separate registration through your dashboard.",
  },
  {
    id: "festival-prizes",
    topic: "prizes",
    question: "Are there prizes?",
    answer: "Yes. The Startup Idea Competition awards ₹7,000 for first place, ₹5,000 for second place, and ₹3,000 for third place.",
  },
  {
    id: "what-to-bring",
    topic: "registration",
    question: "What should I bring?",
    answer: "Bring your phone with your digital pass QR code, a notebook, and anything specifically requested in the details for events you have registered to attend.",
  },
] as const satisfies readonly FaqItem[];
