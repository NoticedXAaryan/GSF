"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  projectAnimation,
  DEFAULT_REVEAL_ANIMATION,
  REVEAL_INTERSECTION_THRESHOLD,
} from "@/lib/landing/motion";

interface RevealProps {
  children: ReactNode;
  /** Optional custom className for the wrapper */
  className?: string;
  /** Optional HTML tag for the wrapper element (defaults to div) */
  as?: "div" | "section" | "article" | "aside" | "li";
}

/**
 * Reveal client island: applies a one-time fade-in with upward translate
 * when 20% of the element scrolls into the viewport.
 *
 * Behavior:
 * - Uses IntersectionObserver via motion's viewport prop with once: true, amount: 0.2
 * - Fade-in + translate-y (max 24px), 300-600ms, ease-out
 * - One-time animation: never re-triggers after first reveal
 * - When prefers-reduced-motion is active: renders final state immediately (no transition)
 * - When IntersectionObserver is unavailable: renders final state immediately
 *   (motion's viewport prop gracefully degrades)
 */
export function Reveal({ children, className, as = "div" }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  // When reduced motion is active OR IntersectionObserver is unavailable,
  // render in the final visible state immediately with no animation
  const reducedMotion = shouldReduceMotion ?? !supportsIntersectionObserver();

  const projection = projectAnimation(DEFAULT_REVEAL_ANIMATION, reducedMotion);

  const MotionComponent = motion[as];

  // Spread initial/animate as plain objects with opacity and y for motion compatibility
  const initial = { opacity: projection.initial.opacity, y: projection.initial.y };
  const animate = { opacity: projection.animate.opacity, y: projection.animate.y };
  const transition = projection.transition
    ? { duration: projection.transition.duration, ease: projection.transition.ease }
    : undefined;

  return (
    <MotionComponent
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: REVEAL_INTERSECTION_THRESHOLD }}
      transition={transition}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * Check whether IntersectionObserver is available in the current environment.
 * Returns false during SSR or in browsers that don't support it.
 */
function supportsIntersectionObserver(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.IntersectionObserver !== "undefined"
  );
}
