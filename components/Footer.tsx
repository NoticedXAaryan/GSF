'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 90%',
            },
          }
        );

        if (textRef.current) {
          gsap.fromTo(
            textRef.current,
            { opacity: 0, scale: 0.9 },
            {
              opacity: 1,
              scale: 1,
              duration: 1.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: textRef.current,
                start: 'top 85%',
              },
            }
          );
        }
      }, footerRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <footer ref={footerRef} className="relative bg-ink-navy pt-24 pb-8 overflow-hidden">
      {/* Background Image & Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image
          src="/footer_image.jpg"
          alt="Footer Background"
          fill
          className="object-cover opacity-[0.08] grayscale"
        />
        <div className="absolute inset-0 pink-dots opacity-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        {/* Pre-footer CTA */}
        <h2 
          ref={titleRef}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-white text-center max-w-5xl mx-auto mb-20"
        >
          LET&apos;S MAKE YOUR STARTUP JOURNEY UNFORGETTABLE.
        </h2>

        <div className="border-t border-white/[0.08] mb-12"></div>

        {/* Top Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8">
          {/* Left: Brand */}
          <div className="w-full lg:w-1/3">
            <span className="font-display font-bold text-2xl uppercase tracking-tight text-white">
              STARTUP FEST®
            </span>
          </div>

          {/* Center: Links */}
          <div className="w-full lg:w-1/3 flex lg:justify-center">
            <ul className="flex flex-col gap-3 font-mono text-[11px] uppercase tracking-widest text-white/60">
              <li className="flex items-center group">
                <span className="text-accent-pink mr-3">[</span>
                <Link href="#" className="group-hover:text-accent-pink transition-colors">
                  MASTERCLASSES
                </Link>
                <span className="text-accent-pink ml-3">]</span>
              </li>
              <li>
                <Link href="#" className="hover:text-accent-pink transition-colors ml-5">
                  IDEA COMPETITION
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent-pink transition-colors ml-5">
                  SIGNATURE TALKS
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent-pink transition-colors ml-5">
                  FIRESIDE CHAT
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent-pink transition-colors ml-5">
                  STARTUP EXPO
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: Newsletter */}
          <div className="w-full lg:w-1/3 lg:flex lg:justify-end">
            <div className="w-full max-w-md">
              <h3 className="font-display font-bold text-xl md:text-2xl uppercase tracking-tight text-white mb-6">
                SIGN UP TO OUR NEWSLETTER
              </h3>
              <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL" 
                  className="w-full bg-accent-pink text-white font-bold text-xs placeholder-white/60 rounded-full py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  required
                />
                <button 
                  type="submit" 
                  className="absolute right-2 w-9 h-9 bg-ink-deep rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  aria-label="Subscribe"
                >
                  <ArrowDownRight className="w-4 h-4 text-accent-pink" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Massive Brand Text */}
        <div 
          ref={textRef}
          className="py-16 md:py-20 flex justify-center w-full overflow-hidden"
        >
          <div 
            className="font-display font-bold text-white/90 whitespace-nowrap select-none origin-center"
            style={{ 
              fontSize: 'clamp(4rem, 15vw, 20rem)',
              transform: 'scaleY(1.3) scaleX(0.95)',
              lineHeight: 1
            }}
          >
            GOA STARTUP FEST
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center border-t border-white/[0.08] pt-8">
          <div className="font-mono text-[10px] uppercase text-white/40">
            © STARTUP FESTIVAL / ALL RIGHTS RESERVED
          </div>
          
          <div className="flex gap-4 font-mono text-[10px] uppercase">
            <Link href="#" className="text-white/40 hover:text-accent-pink transition-colors">
              TERMS & CONDITIONS
            </Link>
            <Link href="#" className="text-white/40 hover:text-accent-pink transition-colors">
              PRIVACY POLICY
            </Link>
            <Link href="#" className="text-white/40 hover:text-accent-pink transition-colors">
              PUBLIC OFFER
            </Link>
          </div>
          
          <div className="flex gap-6 font-mono text-[10px] uppercase lg:justify-center">
            <Link href="#" className="text-accent-pink hover:text-white transition-colors">
              FACEBOOK
            </Link>
            <Link href="#" className="text-accent-pink hover:text-white transition-colors">
              INSTAGRAM
            </Link>
            <Link href="#" className="text-accent-pink hover:text-white transition-colors">
              LINKEDIN
            </Link>
          </div>
          
          <div className="font-mono text-[10px] uppercase text-white/40 lg:text-right">
            DESIGN BY / PIERC TEAM
          </div>
        </div>
      </div>
    </footer>
  );
}
