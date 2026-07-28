'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  gridClasses: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 'startup-fest',
    title: 'STARTUP FEST',
    category: 'Flagship',
    image: '/hero-bg.png',
    description: 'Two days of innovation, networking, and startup energy. The Goa Startup Festival brings together founders, investors, and innovators.',
    gridClasses: 'col-span-2 md:col-span-2 md:row-span-2 min-h-[300px] md:min-h-[500px]',
  },
  {
    id: 'networking',
    title: 'NETWORKING',
    category: 'Connect',
    image: '/gallery-networking.png',
    description: 'Connect with fellow founders, investors, and mentors. Build relationships that will shape your startup journey.',
    gridClasses: 'col-span-1 md:col-span-1 md:row-span-1 min-h-[200px] md:min-h-[250px]',
  },
  {
    id: 'masterclass',
    title: 'MASTERCLASS',
    category: 'Learn',
    image: '/gallery-workshop.png',
    description: 'Hands-on workshops led by industry experts. Limited to 70 participants per session for maximum impact.',
    gridClasses: 'col-span-1 md:col-span-1 md:row-span-1 min-h-[200px] md:min-h-[250px]',
  },
  {
    id: 'expo',
    title: 'STARTUP EXPO',
    category: 'Showcase',
    image: '/gallery-expo.png',
    description: 'A one-day exhibition for shortlisted startups to showcase products, gather feedback, and attract potential partners.',
    gridClasses: 'col-span-1 md:col-span-1 md:row-span-1 min-h-[200px] md:min-h-[250px]',
  },
  {
    id: 'pitch-day',
    title: 'PITCH DAY',
    category: 'Compete',
    image: '/about-event.png',
    description: 'Top 10-15 shortlisted teams pitch live to investors and industry experts. Prize pool of ₹7,000.',
    gridClasses: 'col-span-1 md:col-span-1 md:row-span-1 min-h-[200px] md:min-h-[250px]',
  },
  {
    id: 'goa-culture',
    title: 'GOA CULTURE',
    category: 'Experience',
    image: '/epic/media__1785085841375.jpg',
    description: 'Experience the vibrant culture of Goa while building your startup dream. Where innovation meets inspiration.',
    gridClasses: 'col-span-2 md:col-span-4 md:row-span-1 min-h-[300px] md:min-h-[400px]',
  },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        // Heading reveal
        gsap.from(headingRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
          },
        });

        // Grid items stagger
        if (gridRef.current) {
          const items = gridRef.current.querySelectorAll('.gallery-item');
          gsap.from(items, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
            },
          });
        }
      }, sectionRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <section 
      id="gallery" 
      ref={sectionRef}
      className="py-24 md:py-40 bg-ink-navy relative"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div ref={headingRef} className="text-center mb-16">
          <p className="font-mono text-xs text-accent-pink uppercase tracking-widest mb-4">
            A Glimpse
          </p>
          <h2 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight text-white">
            A GLIMPSE INTO THE EVENTS WE BRING TO LIFE
          </h2>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {galleryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`gallery-item relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2 focus:ring-offset-ink-navy ${item.gridClasses}`}
              aria-label={`View details for ${item.title}`}
            >
              {/* Background Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
              
              {/* Category Badge */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <span className="font-mono text-[10px] uppercase bg-accent-pink/80 text-white px-2 py-1">
                  {item.category}
                </span>
              </div>
              
              {/* Title */}
              <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 text-left">
                <h3 className="font-display text-xl md:text-2xl font-bold uppercase text-white tracking-wide">
                  {item.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
              aria-hidden="true"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-3xl bg-ink-card border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-2xl z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 text-white/60 hover:text-white bg-black/50 hover:bg-accent-pink p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-pink"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Image */}
              <div className="relative w-full md:w-1/2 min-h-[250px] md:min-h-[400px]">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="font-mono text-xs uppercase bg-accent-pink text-white px-3 py-1">
                    {selectedItem.category}
                  </span>
                </div>
              </div>

              {/* Modal Text Content */}
              <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-ink-deep">
                <h3 className="font-display text-3xl md:text-4xl font-bold uppercase text-white mb-6 leading-none">
                  {selectedItem.title}
                </h3>
                <p className="font-body text-cloud-white/80 text-base md:text-lg mb-8 leading-relaxed">
                  {selectedItem.description}
                </p>
                <div className="mt-auto pt-6 border-t border-white/10 flex flex-wrap gap-4">
                  <Link 
                    href="/register" 
                    className="inline-block bg-accent-pink text-white font-mono text-sm uppercase tracking-wider px-6 py-3 hover:bg-white hover:text-accent-pink transition-colors focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2 focus:ring-offset-ink-deep"
                    onClick={() => setSelectedItem(null)}
                  >
                    Register Now
                  </Link>
                  <Link 
                    href="/#schedule" 
                    className="inline-block border border-white/20 text-white font-mono text-sm uppercase tracking-wider px-6 py-3 hover:border-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink-deep"
                    onClick={() => setSelectedItem(null)}
                  >
                    View Schedule
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
