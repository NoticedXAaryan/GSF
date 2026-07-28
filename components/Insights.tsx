'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const articles = [
  {
    image: '/gallery-networking.png',
    category: 'FUNDRAISING',
    title: 'HOW TO PITCH YOUR STARTUP TO INVESTORS',
    excerpt: 'Master the art of the perfect pitch. Learn what investors actually look for and how to tell your startup story in under 5 minutes.'
  },
  {
    image: '/gallery-workshop.png',
    category: 'GROWTH',
    title: 'SCALING FROM ZERO TO ONE: LESSONS LEARNED',
    excerpt: 'Real stories from founders who built successful products from scratch. The mistakes, the wins, and the frameworks that actually work.'
  },
  {
    image: '/gallery-expo.png',
    category: 'INNOVATION',
    title: 'DESIGN THINKING FOR EARLY-STAGE STARTUPS',
    excerpt: 'Why customer-centric innovation matters more than ever. How to use empathy mapping and prototyping to validate your idea fast.'
  }
];

export default function Insights() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          cardsRef.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
            }
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-40 bg-ink-deep">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight text-white text-center mb-16">
          INSIGHTS AND IDEAS FOR YOUR STARTUP
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {articles.map((article, idx) => (
            <div 
              key={idx}
              ref={el => {
                if (el) cardsRef.current[idx] = el;
              }}
              className="bg-ink-navy border border-white/[0.06] overflow-hidden group flex flex-col"
            >
              <div className="aspect-[16/9] relative overflow-hidden bg-ink-card">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-4 left-4 font-mono text-[10px] uppercase bg-accent-pink text-white px-3 py-1 z-10">
                  {article.category}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-display text-xl font-bold uppercase text-white mb-3 group-hover:text-accent-pink transition-colors">
                  {article.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                  {article.excerpt}
                </p>
                <Link href="#" className="text-accent-pink text-sm font-bold mt-auto inline-block hover:underline w-fit">
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
