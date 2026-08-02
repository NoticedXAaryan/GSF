/**
 * Decorative rocket imprints — thin outline strokes scattered behind the hero
 * copy. Purely ornamental: aria-hidden, pointer-events-none, and low opacity so
 * they read as a watermark rather than content.
 */

function Rocket({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Body */}
      <path d="M32 4c7.2 6.6 11 15.3 11 24.6 0 5.4-1.3 10.6-3.7 15.2H24.7A33.6 33.6 0 0 1 21 28.6C21 19.3 24.8 10.6 32 4Z" />
      {/* Window */}
      <circle cx="32" cy="24" r="4.6" />
      {/* Fins */}
      <path d="M24.7 33.4c-4.6 2-7.6 6.4-7.6 11.4l7.6-3.4M39.3 33.4c4.6 2 7.6 6.4 7.6 11.4l-7.6-3.4" />
      {/* Exhaust */}
      <path d="M28.4 48.2c1.2 4 2.4 7.4 3.6 10.2 1.2-2.8 2.4-6.2 3.6-10.2" />
    </svg>
  );
}

export function RocketImprints() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden text-ink/5"
    >
      <Rocket className="absolute -left-4 top-[12%] h-28 w-28 rotate-[18deg] opacity-[0.07] tablet:h-40 tablet:w-40" />
      <Rocket className="absolute right-[6%] top-[8%] h-20 w-20 -rotate-[24deg] opacity-[0.06] tablet:h-28 tablet:w-28" />
      <Rocket className="absolute left-[18%] bottom-[14%] h-16 w-16 rotate-[42deg] opacity-[0.05] tablet:h-24 tablet:w-24" />
      <Rocket className="absolute right-[14%] bottom-[22%] h-24 w-24 rotate-[8deg] opacity-[0.05] tablet:h-32 tablet:w-32" />
      <Rocket className="hidden desktop:block absolute left-[46%] top-[4%] h-20 w-20 -rotate-[12deg] opacity-[0.04]" />
    </div>
  );
}
