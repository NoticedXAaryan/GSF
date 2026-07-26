'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Lightbulb, PenTool, LayoutDashboard } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const MASTERCLASSES = [
  {
    id: 1,
    title: 'From Idea to Startup',
    subtitle: 'Understanding the Startup Lifecycle',
    icon: <BookOpen className="w-6 h-6 text-ink-navy" />,
    desc: 'Gain a comprehensive understanding of the startup journey, from identifying a problem and validating an idea to building a product, entering the market, scaling the business, and achieving sustainable growth.'
  },
  {
    id: 2,
    title: 'Discover Opportunities',
    subtitle: 'The Art of Idea Generation',
    icon: <Lightbulb className="w-6 h-6 text-ink-navy" />,
    desc: 'Learn how to identify real-world problems, uncover market opportunities, and generate innovative business ideas using proven creativity and opportunity recognition techniques.'
  },
  {
    id: 3,
    title: 'Think Like an Innovator',
    subtitle: 'Design Thinking for Startups',
    icon: <PenTool className="w-6 h-6 text-ink-navy" />,
    desc: 'Explore customer-centric innovation through design thinking methodologies, including empathy mapping, ideation, prototyping, and solution validation.'
  },
  {
    id: 4,
    title: 'Build a Winning Business Model',
    subtitle: 'Sustainable & Scalable Growth',
    icon: <LayoutDashboard className="w-6 h-6 text-ink-navy" />,
    desc: 'Understand how to develop a sustainable and scalable business model by defining value propositions, customer segments, revenue streams, and growth strategies.'
  },
];

export default function Masterclasses() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.mc-header', {
        scrollTrigger: {
          trigger: '.mc-section',
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out'
      });

      gsap.from('.mc-card', {
        scrollTrigger: {
          trigger: '.mc-grid',
          start: 'top 75%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="masterclasses" className="mc-section py-32 md:py-48 relative bg-ink-deep border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <span className="mc-header font-mono text-hyper-cyan font-bold uppercase tracking-widest text-sm mb-6 block border border-hyper-cyan/20 inline-block px-4 py-2 bg-hyper-cyan/5">
            Expert-Led Training
          </span>
          <h2 className="mc-header font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
            Startup Masterclass Series
          </h2>
          <p className="mc-header text-xl md:text-2xl text-white/60 font-body">
            Practical startup frameworks, real-world case studies, and hands-on entrepreneurial learning limited to 70 participants per session.
          </p>
        </div>

        <div className="mc-grid grid md:grid-cols-2 gap-6">
          {MASTERCLASSES.map((mc, idx) => (
            <div
              key={mc.id}
              className="mc-card p-10 bg-ink-navy border border-white/5 flex flex-col group hover:border-hyper-cyan/30 transition-colors"
            >
              <div className="w-14 h-14 bg-hyper-cyan flex items-center justify-center mb-8 transform -rotate-3 group-hover:rotate-0 transition-transform">
                {mc.icon}
              </div>
              <h3 className="font-display text-3xl font-bold text-white mb-3">{mc.title}</h3>
              <p className="font-mono text-sm uppercase tracking-wider text-hyper-cyan mb-6">{mc.subtitle}</p>
              <p className="text-white/60 leading-relaxed text-lg flex-1">
                {mc.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
