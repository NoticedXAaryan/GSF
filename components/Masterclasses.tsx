"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const services = [
  {
    num: "01",
    title: "IDEA TO STARTUP",
    subtitle: "Understanding the Startup Lifecycle",
  },
  {
    num: "02",
    title: "DISCOVER OPPORTUNITIES",
    subtitle: "The Art of Idea Generation",
  },
  {
    num: "03",
    title: "DESIGN THINKING",
    subtitle: "Think Like an Innovator",
  },
  {
    num: "04",
    title: "BUILD A BUSINESS MODEL",
    subtitle: "Sustainable & Scalable Growth",
  },
];

export default function Masterclasses() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        // Heading reveal
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
            },
          }
        );

        // List items stagger
        gsap.fromTo(
          itemsRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: itemsRef.current[0],
              start: "top 85%",
            },
          }
        );

        // Image slide in
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top 75%",
            },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <section
      id="events"
      ref={sectionRef}
      className="py-24 md:py-40 bg-ink-deep relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="flex flex-col z-10">
            <span className="font-mono text-xs text-accent-pink uppercase tracking-widest mb-6">
              What We Offer
            </span>
            <h2
              ref={headingRef}
              className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-white"
            >
              Shaping the Future <br className="hidden md:block" /> with Masterclasses
            </h2>
            <p className="text-white/50 text-lg mt-6 max-w-xl font-body">
              Tactical, intensive sessions capped at 70 participants. Four expert-led masterclasses designed to take you from concept to reality.
            </p>

            <div className="space-y-6 mt-12 flex flex-col">
              {services.map((service, index) => (
                <div
                  key={service.num}
                  ref={(el) => {
                    itemsRef.current[index] = el;
                  }}
                  className="flex flex-row items-start group cursor-default"
                >
                  <span className="font-display text-4xl md:text-5xl font-bold text-accent-pink mr-6 group-hover:text-white transition-colors duration-300">
                    {service.num}
                  </span>
                  <div className="flex flex-col justify-center mt-1">
                    <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide group-hover:text-accent-pink transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-white/50 text-sm mt-1 font-body group-hover:text-white/80 transition-colors duration-300">
                      {service.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div
            ref={imageRef}
            className="relative w-full aspect-[3/4] overflow-hidden group border border-white/[0.08]"
          >
            <Image
              src="/about-event.png"
              alt="Masterclass Session"
              fill
              className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Subtle pink overlay gradient at the bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-accent-pink-glow/60 via-accent-pink-muted/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
