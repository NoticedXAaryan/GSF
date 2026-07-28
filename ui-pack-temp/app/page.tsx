"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play, Search, Menu, Star, Check, Instagram, Twitter, Linkedin, Facebook, MapPin, Phone, Mail } from 'lucide-react';

const validImages = {
  hero: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=1920',
  portrait: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=1000',
  speaker: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200',
  presentation: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=1200',
  audience: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
  suit: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
  suit2: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
  suit3: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=600'
};

export default function Page() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 300) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20">
      {/* 1. Header */}
      <motion.header 
        initial={{ y: 0 }}
        animate={{ 
          y: isHidden ? -100 : 0,
          backgroundColor: isScrolled ? "rgba(5, 5, 5, 0.95)" : "rgba(5, 5, 5, 0)",
          borderBottomColor: isScrolled ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0)",
          paddingTop: isScrolled ? "1rem" : "1.5rem",
          paddingBottom: isScrolled ? "1rem" : "1.5rem"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 lg:px-24 backdrop-blur-sm"
      >
        <div className="text-2xl font-serif tracking-tight text-white flex items-center cursor-pointer">
          Goa Startup Fest
        </div>
        
        <nav className="hidden lg:flex items-center space-x-10">
          <a href="#" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors relative group">
            About
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors relative group">
            Events
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors relative group">
            Schedule
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors relative group">
            Team
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors relative group">
            FAQ
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="/login" className="text-[0.65rem] uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors relative group">
            Login
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>
        
        <div className="flex items-center space-x-6">
          <Link href="/signup" className="hidden md:flex items-center justify-center border border-white/20 text-white px-6 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300">
            Get Your Pass
          </Link>
          <button className="lg:hidden text-white hover:text-gray-300 transition-colors"><Menu className="w-5 h-5" /></button>
        </div>
      </motion.header>

      {/* 2. Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-[#1a0505]">
        <div className="absolute inset-0 z-0">
          <Image src={validImages.hero} alt="Goa Startup Fest" fill className="object-cover object-top mix-blend-luminosity opacity-[0.35]" priority referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0505] via-[#1a0505]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a0505]/30 to-[#1a0505]" />
          <div className="absolute inset-0 bg-[#350A0A] mix-blend-overlay opacity-50" />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 flex flex-col lg:flex-row justify-between items-start lg:items-center pt-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-8 h-[1px] bg-white/40" />
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/80 font-medium">2 & 3 September 2026 · Parul University Goa Campus</span>
            </div>
            
            <div className="inline-flex items-center space-x-2 px-4 py-2 border border-yellow-500/30 bg-yellow-500/10 rounded-full mb-6">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-yellow-400">Win from a prize pool of ₹15,000+</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-[7rem] leading-[1.05] font-serif text-white mb-8 tracking-tight">
              Got an idea that deserves <br/>
              <span className="italic text-gray-300">the spotlight?</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 font-light max-w-xl mb-12 leading-relaxed">
              Where ideas meet investors, founders, mentors, and opportunities. Two days of learning, networking, pitching, and building what&apos;s next.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center border border-white text-white px-10 py-4 text-xs font-medium uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors">
                Get Your Pass
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-3 text-white text-xs font-medium uppercase tracking-[0.15em] hover:text-gray-300 transition-colors group">
                <span>View Full Schedule</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:flex flex-col space-y-16 text-right border-r border-white/20 pr-10 mt-16 lg:mt-0"
          >
            <div>
              <div className="text-5xl font-serif italic text-white mb-2">300+</div>
              <div className="text-[0.65rem] uppercase tracking-widest text-gray-400">Startups Incubated</div>
            </div>
            <div>
              <div className="text-5xl font-serif italic text-white mb-2">₹200Cr+</div>
              <div className="text-[0.65rem] uppercase tracking-widest text-gray-400">Startup Revenue</div>
            </div>
            <div>
              <div className="text-5xl font-serif italic text-white mb-2">₹40Cr+</div>
              <div className="text-[0.65rem] uppercase tracking-widest text-gray-400">Investment Secured</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-[#350A0A]/40 bg-[#150404] py-5 overflow-hidden relative flex">
        <div className="flex whitespace-nowrap animate-marquee items-center space-x-8 text-[0.65rem] uppercase tracking-[0.2em] text-[#A08A8A]">
          <span>STARTUP ECOSYSTEM CONNECT</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>HANDS-ON MASTERCLASSES</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>SIGNATURE TALKS</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>FIRESIDE CHAT</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>STARTUP EXPO</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>IDEA COMPETITION</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>STARTUP ECOSYSTEM CONNECT</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>HANDS-ON MASTERCLASSES</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
        </div>
        <div className="flex whitespace-nowrap animate-marquee items-center space-x-8 text-[0.65rem] uppercase tracking-[0.2em] text-[#A08A8A] ml-8">
          <span>STARTUP ECOSYSTEM CONNECT</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>HANDS-ON MASTERCLASSES</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>SIGNATURE TALKS</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>FIRESIDE CHAT</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>STARTUP EXPO</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
          <span>IDEA COMPETITION</span> <Star className="w-2.5 h-2.5 text-[#B8860B]" />
        </div>
      </div>

      {/* 3. Proof of Influence -> About the festival */}
      <section className="py-32 bg-[#F9F8F6] text-[#111] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-6 h-[1px] bg-black/30" />
                <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium text-gray-500">About the Festival</span>
              </div>
              <h2 className="text-3xl font-serif leading-tight tracking-tight mb-16 max-w-sm">
                More Than A Festival.<br />It&apos;s a Startup Launchpad.
              </h2>
              
              <div className="relative aspect-[16/10] w-full mt-auto hidden lg:block">
                <Image src={validImages.audience} alt="Audience" fill className="object-cover" referrerPolicy="no-referrer"/>
              </div>
            </div>
            
            <div className="lg:col-span-8 lg:pl-12 border-l border-black/10">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-[4rem] font-serif leading-[1.1] tracking-tight mb-12 max-w-3xl"
              >
                A dynamic platform to foster innovation, entrepreneurship, and <br/>
                <span className="italic font-light">ecosystem collaboration.</span>
              </motion.h2>
              
              <p className="text-sm text-gray-500 max-w-2xl mb-8 leading-relaxed pl-6">
                Goa Startup Festival 2026 is a premier two-day entrepreneurship and innovation festival jointly organized by the Parul Innovation and Entrepreneurship Research Centre (PIERC), Parul University, and Parul University Goa Campus. Scheduled to be held on 2nd and 3rd September 2026, the festival is envisioned as a dynamic platform to foster innovation.
              </p>
              
              <p className="text-sm text-gray-500 max-w-2xl mb-20 leading-relaxed pl-6">
                It serves as a bridge between academia, industry, government, and the startup community, enabling participants to transform innovative ideas into sustainable and scalable business ventures through expert guidance, practical learning, and strategic partnerships.
              </p>

              <div>
                <div className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-8 pb-4">
                  Supported & Organized By
                </div>
                <div className="flex flex-wrap items-center gap-x-16 gap-y-10 text-2xl font-serif text-gray-400">
                  <span className="hover:text-black transition-colors cursor-pointer">Parul University</span>
                  <span className="hover:text-black transition-colors cursor-pointer">PIERC</span>
                  <span className="hover:text-black transition-colors cursor-pointer">Startup India</span>
                  <span className="hover:text-black transition-colors cursor-pointer">MSME</span>
                  <span className="hover:text-black transition-colors cursor-pointer">Startup Gujarat</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative aspect-[16/9] w-full mt-16 lg:hidden">
            <Image src={validImages.audience} alt="Audience" fill className="object-cover" referrerPolicy="no-referrer"/>
          </div>
        </div>
      </section>

      {/* 4. Methodology -> Objectives */}
      <section className="py-32 bg-white text-[#111]">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-6 h-[1px] bg-black/30" />
              <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium text-gray-500">Objectives</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif leading-[1.1] tracking-tight mb-8">
              Building the Ecosystem. <br/><span className="italic">It&apos;s a movement.</span>
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed font-light max-w-sm">
              More than just a festival, Goa Startup Festival 2026 is a collaborative movement aimed at generating tangible outcomes through mentorship, networking, market exposure, ecosystem partnerships, and knowledge exchange.
            </p>
          </div>

          <div className="lg:col-span-8 lg:pl-16 space-y-32">
            {/* I Clarity -> Promote */}
            <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true, margin: "-100px"}} transition={{duration:0.8}}>
              <div className="relative aspect-[21/7] w-full mb-8 overflow-hidden">
                <Image src={validImages.speaker} alt="Promote Entrepreneurship" fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex items-baseline space-x-6">
                <span className="text-[5rem] font-serif italic text-gray-300 leading-none">I</span>
                <h3 className="text-3xl font-serif tracking-tight">Promote Entrepreneurship</h3>
              </div>
              <p className="text-sm text-gray-600 font-light leading-relaxed pl-20 max-w-xl mt-4">
                Inspire students, innovators, and aspiring entrepreneurs to develop entrepreneurial skills and transform innovative ideas into successful ventures.
              </p>
            </motion.div>

            {/* II Connection -> Connect */}
            <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true, margin: "-100px"}} transition={{duration:0.8}}>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="relative aspect-[4/3] overflow-hidden"><Image src={validImages.suit2} alt="Connection 1" fill className="object-cover" referrerPolicy="no-referrer"/></div>
                <div className="relative aspect-[4/3] overflow-hidden"><Image src={validImages.presentation} alt="Connection 2" fill className="object-cover" referrerPolicy="no-referrer"/></div>
                <div className="relative aspect-[4/3] overflow-hidden"><Image src={validImages.suit} alt="Connection 3" fill className="object-cover" referrerPolicy="no-referrer"/></div>
              </div>
              <div className="flex items-baseline space-x-6 mb-6">
                <span className="text-[5rem] font-serif italic text-gray-300 leading-none">II</span>
                <h3 className="text-3xl font-serif tracking-tight">Connect Startups & Industry</h3>
              </div>
              <p className="text-sm text-gray-600 font-light leading-relaxed pl-20 max-w-xl">
                Facilitate meaningful interactions between startups, investors, industry leaders, and business mentors to explore funding, partnerships, and growth opportunities.
              </p>
            </motion.div>

            {/* III Conversion -> Learn */}
            <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true, margin: "-100px"}} transition={{duration:0.8}}>
              <div className="relative aspect-[21/7] w-full mb-8 overflow-hidden">
                <Image src={validImages.audience} alt="Conversion" fill className="object-cover object-top" referrerPolicy="no-referrer"/>
              </div>
              <div className="flex items-baseline space-x-6">
                <span className="text-[5rem] font-serif italic text-gray-300 leading-none">III</span>
                <h3 className="text-3xl font-serif tracking-tight">Enhance Entrepreneurial Learning</h3>
              </div>
              <p className="text-sm text-gray-600 font-light leading-relaxed pl-20 max-w-xl mt-4">
                Equip participants with practical knowledge and skills through expert-led sessions on startup creation, design thinking, business models, and venture development.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Biography / Category -> About PIERC & Parul University */}
      <section className="bg-[#050505] text-white">
        <div className="relative aspect-[16/10] md:aspect-[21/9] lg:aspect-[2.5/1] w-full overflow-hidden">
          <Image src={validImages.portrait} alt="PIERC" fill className="object-cover object-center opacity-80" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24 text-center pb-20">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-6 h-[1px] bg-white/30" />
              <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium text-gray-400">About the Organizers</span>
              <div className="w-6 h-[1px] bg-white/30" />
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight tracking-tight mb-8">
              Goa&apos;s first State Private University. <br/>
              <span className="italic text-gray-300">Building a world-class ecosystem.</span>
            </h2>
            
            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-3xl mx-auto mb-10">
              Parul University Goa is Goa&apos;s first State Private University, established in 2025 with a vision to deliver world-class education through academic excellence, innovation, research, and industry-integrated learning. <br/><br/>
              The Parul Innovation and Entrepreneurship Research Centre (PIERC) is the flagship startup incubator of Parul University, dedicated to fostering innovation, entrepreneurship, and startup growth.
            </p>

            <button className="border border-white/30 text-white px-8 py-3.5 text-xs font-medium uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors rounded-full">
              Learn More About PIERC
            </button>
          </div>
        </div>

        {/* 4 Star Points -> PIERC stats */}
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-20 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.6, delay:0.1}} className="flex flex-col items-center">
            <div className="text-4xl font-serif italic text-white mb-4">300+</div>
            <p className="text-xs text-gray-400 font-light leading-relaxed uppercase tracking-wider">Startups <br/> Incubated</p>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.6, delay:0.2}} className="flex flex-col items-center">
            <div className="text-4xl font-serif italic text-white mb-4">1,600+</div>
            <p className="text-xs text-gray-400 font-light leading-relaxed uppercase tracking-wider">Employment Opportunities <br/> Generated</p>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.6, delay:0.3}} className="flex flex-col items-center">
            <div className="text-4xl font-serif italic text-white mb-4">₹200Cr+</div>
            <p className="text-xs text-gray-400 font-light leading-relaxed uppercase tracking-wider">Cumulative Startup <br/> Revenue</p>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.6, delay:0.4}} className="flex flex-col items-center">
            <div className="text-4xl font-serif italic text-white mb-4">₹40Cr+</div>
            <p className="text-xs text-gray-400 font-light leading-relaxed uppercase tracking-wider">Investment Secured <br/> By Incubated Startups</p>
          </motion.div>
        </div>
      </section>

      {/* 6. Quote */}
      <section className="py-40 bg-white text-black text-center px-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <motion.h2 
            initial={{opacity:0, scale:0.95}} whileInView={{opacity:1, scale:1}} viewport={{once:true}} transition={{duration:0.8}}
            className="text-4xl md:text-5xl lg:text-[4rem] font-serif leading-[1.1] tracking-tight mb-16"
          >
            Because Every Great Startup Starts With <span className="italic font-light">One Conversation.</span>
          </motion.h2>
          
          <div className="flex flex-col items-center">
            <p className="text-gray-500 font-serif text-xl max-w-2xl mb-8 leading-relaxed">
              Meet the people who can challenge your ideas, sharpen your vision, and open doors to new opportunities.
            </p>
            <div className="font-serif text-lg font-semibold uppercase tracking-widest text-black">One festival. Endless possibilities.</div>
          </div>
        </div>
      </section>

      {/* 7. How We Work Together -> Events Hub */}
      <section className="py-32 bg-[#F9F8F6] text-[#111]">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-6 h-[1px] bg-black/30" />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium text-gray-500">Events Hub</span>
            <div className="w-6 h-[1px] bg-black/30" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-center leading-[1.1] tracking-tight mb-24">
            Innovation isn't accidental.<br/>
            <span className="italic font-light">It&apos;s engineered.</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: Masonry Images */}
            <div className="relative h-[600px]">
              <motion.div initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} transition={{duration:0.8, delay: 0.1}} className="absolute top-0 left-0 w-2/3 aspect-video z-20 overflow-hidden shadow-xl">
                <Image src={validImages.presentation} alt="Speaking" fill className="object-cover" referrerPolicy="no-referrer" />
              </motion.div>
              <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{duration:0.8, delay: 0.2}} className="absolute top-1/4 right-0 w-1/2 aspect-square z-10 overflow-hidden shadow-xl">
                <Image src={validImages.speaker} alt="Training" fill className="object-cover" referrerPolicy="no-referrer" />
              </motion.div>
              <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{duration:0.8, delay: 0.3}} className="absolute bottom-0 left-1/4 w-2/3 aspect-[4/3] z-30 overflow-hidden shadow-xl">
                <Image src={validImages.audience} alt="Audience" fill className="object-cover object-top" referrerPolicy="no-referrer" />
              </motion.div>
            </div>

            {/* Right: Accordion -> Event Cards */}
            <div className="space-y-6">
              <div className="border-b border-black/10 pb-6 opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex items-center space-x-6">
                <div className="w-8 h-8 rounded border border-black/20 flex items-center justify-center shrink-0"><Star className="w-4 h-4" /></div>
                <div>
                  <h3 className="text-2xl font-serif">Signature Talks</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Day 1 & 2 · Seminar Hall</p>
                </div>
              </div>
              
              <div className="border-b border-black/10 pb-8">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="w-8 h-8 rounded border border-black flex items-center justify-center shrink-0"><Star className="w-4 h-4" /></div>
                  <div>
                    <h3 className="text-2xl font-serif">Startup Idea Competition</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Day 2, 11:30 AM · Seminar Hall</p>
                  </div>
                </div>
                <ul className="space-y-4 pl-14 text-sm text-gray-600 font-light">
                  <li className="flex items-start space-x-3">
                    <Check className="w-4 h-4 mt-0.5 text-black shrink-0" />
                    <span>First Prize — ₹7,000</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-4 h-4 mt-0.5 text-black shrink-0" />
                    <span>Second Prize — ₹5,000</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-4 h-4 mt-0.5 text-black shrink-0" />
                    <span>Third Prize — ₹3,000</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Check className="w-4 h-4 mt-0.5 text-black shrink-0" />
                    <span>Opportunity to pitch to industry experts</span>
                  </li>
                </ul>
                <div className="pl-14 mt-8">
                  <Link href="/signup" className="inline-flex bg-black text-white px-8 py-3 text-xs uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors items-center space-x-2">
                    <span>Register to Pitch</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="border-b border-black/10 pb-6 opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex items-center space-x-6">
                <div className="w-8 h-8 rounded border border-black/20 flex items-center justify-center shrink-0"><Star className="w-4 h-4" /></div>
                <div>
                  <h3 className="text-2xl font-serif">Fireside Chat with Investors</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Day 1 & 2 · Seminar Hall</p>
                </div>
              </div>

              <div className="border-b border-black/10 pb-6 opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex items-center space-x-6">
                <div className="w-8 h-8 rounded border border-black/20 flex items-center justify-center shrink-0"><Star className="w-4 h-4" /></div>
                <div>
                  <h3 className="text-2xl font-serif">Startup Ecosystem Connect</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Day 1, 11:45 AM · VC Office</p>
                </div>
              </div>

              <div className="pb-6 opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex items-center space-x-6">
                <div className="w-8 h-8 rounded border border-black/20 flex items-center justify-center shrink-0"><Star className="w-4 h-4" /></div>
                <div>
                  <h3 className="text-2xl font-serif">Startup Masterclass Series</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Day 1 & 2 · Room 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Social Proof -> Why Should You Be There */}
      <section className="py-32 bg-white text-black border-t border-black/10">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-6 h-[1px] bg-black/30" />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium text-gray-500">Your Next Big Opportunity</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            <div className="lg:col-span-3">
              <h2 className="text-4xl md:text-5xl font-serif leading-[1.1] tracking-tight mb-12">
                Why should you be at <span className="italic font-light">Goa Startup Fest?</span>
              </h2>
            </div>
            
            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {img: validImages.suit, title: "Pitch your ideas", sub: "To industry experts"},
                {img: validImages.suit2, title: "Connect with investors", sub: "Mentors & founders"},
                {img: validImages.suit3, title: "Learn how startups grow", sub: "Scale & raise funding"}
              ].map((item, idx) => (
                <motion.div key={idx} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.6, delay:idx*0.1}} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] w-full mb-6 overflow-hidden">
                    <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md flex items-center justify-center rounded-full text-white group-hover:bg-white group-hover:text-black transition-all">
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                  <h4 className="text-lg font-serif mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{item.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Blog -> Masterclasses */}
      <section className="py-32 bg-[#050505] text-white">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-6 h-[1px] bg-white/30" />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium text-gray-400">Startup Masterclass Series</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight mb-16">
            The Masterclasses <span className="italic font-light text-gray-400">That Scale</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div className="group cursor-pointer">
              <div className="relative aspect-[16/9] w-full mb-8 overflow-hidden border border-white/10">
                <Image src={validImages.audience} alt="Masterclass" fill className="object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              </div>
              <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-widest text-gray-400 mb-4">
                <span>Session 1 • Day 1, 11:45 AM</span>
              </div>
              <h3 className="text-2xl font-serif leading-tight mb-4 group-hover:text-gray-300 transition-colors">
                From Idea to Startup: Understanding the Startup Lifecycle
              </h3>
              <p className="text-sm text-gray-500 font-light">Gain a comprehensive understanding of the startup journey, from identifying a problem and validating an idea to building a product and achieving sustainable growth.</p>
            </div>

            <div className="flex flex-col justify-between space-y-12">
              {[
                {cat: "Session 2 • Day 1, 2:15 PM", title: "Discover Opportunities: The Art of Idea Generation", img: validImages.speaker, desc: "Learn how to identify real-world problems and uncover market opportunities."},
                {cat: "Session 3 • Day 2, 10:00 AM", title: "Think Like an Innovator: Design Thinking for Startups", img: validImages.presentation, desc: "Explore customer-centric innovation through design thinking methodologies."},
                {cat: "Session 4 • Day 2, 11:30 AM", title: "Build a Winning Business Model", img: validImages.audience, desc: "Understand how to develop a sustainable and scalable business model."}
              ].map((item, idx) => (
                <div key={idx} className="flex gap-8 group cursor-pointer border-b border-white/10 pb-8 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-3">{item.cat}</div>
                    <h3 className="text-xl font-serif leading-tight mb-3 group-hover:text-gray-300 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-500 font-light line-clamp-2">{item.desc}</p>
                  </div>
                  <div className="relative w-32 md:w-48 aspect-video shrink-0 overflow-hidden border border-white/10 hidden sm:block">
                    <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                </div>
              ))}
              
              <div className="pt-4">
                <Link href="/signup" className="inline-flex border border-white/30 text-white px-8 py-3 text-xs uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-colors items-center space-x-2 mx-auto lg:mx-0">
                  <span>Register for Masterclasses</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Podcast / Feature -> Schedule overview */}
      <section className="bg-[#0a0a0a] border-t border-white/10 pt-32 pb-0 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={validImages.portrait} alt="Background" fill className="object-cover object-center opacity-30 mix-blend-luminosity" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50" />
        </div>
        
        <div className="relative z-10 max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-6 h-[1px] bg-white/30" />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium text-gray-400">Full Programme</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-serif leading-[1.1] tracking-tight text-white mb-24 max-w-xl">
            Two days of learning, <br/><span className="italic font-light text-gray-300">networking, and building</span>
          </h2>
          
          {/* Structured 2-Day Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 pb-12">
            
            {/* Day 1 */}
            <div>
              <div className="flex items-center space-x-4 mb-10">
                <div className="text-xl font-serif text-white">Day 1</div>
                <div className="h-[1px] flex-1 bg-white/10" />
                <div className="text-xs text-gray-400 font-medium tracking-widest uppercase">2nd Sept</div>
              </div>

              <div className="space-y-0">
                <div className="group border-l border-white/20 pl-8 pb-10 relative">
                  <div className="absolute w-3 h-3 bg-white rounded-full -left-[6.5px] top-1 group-hover:scale-125 transition-transform" />
                  <div className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-3">10:00 AM</div>
                  <h4 className="text-2xl font-serif text-white mb-3">Inaugural Ceremony & Signature Talk 1</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    <span>Seminar Hall</span>
                  </div>
                </div>

                <div className="group border-l border-white/20 pl-8 pb-10 relative">
                  <div className="absolute w-2 h-2 bg-white/40 rounded-full -left-[4.5px] top-1.5 group-hover:bg-white transition-colors" />
                  <div className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-3">11:45 AM</div>
                  <h4 className="text-2xl font-serif text-white mb-3">Startup Ecosystem Connect & Masterclass 1</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    <span>VC Office / Room 2</span>
                  </div>
                </div>
                
                <div className="group border-l border-white/20 pl-8 pb-2 relative border-transparent">
                  <div className="absolute w-2 h-2 bg-white/40 rounded-full -left-[4.5px] top-1.5 group-hover:bg-white transition-colors" />
                  <div className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-3">2:30 PM</div>
                  <h4 className="text-2xl font-serif text-white mb-3">Fireside Chat with Investors</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    <span>Seminar Hall</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Day 2 */}
            <div>
              <div className="flex items-center space-x-4 mb-10">
                <div className="text-xl font-serif text-white">Day 2</div>
                <div className="h-[1px] flex-1 bg-white/10" />
                <div className="text-xs text-gray-400 font-medium tracking-widest uppercase">3rd Sept</div>
              </div>

              <div className="space-y-0">
                <div className="group border-l border-white/20 pl-8 pb-10 relative">
                  <div className="absolute w-2 h-2 bg-white/40 rounded-full -left-[4.5px] top-1.5 group-hover:bg-white transition-colors" />
                  <div className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-3">10:00 AM</div>
                  <h4 className="text-2xl font-serif text-white mb-3">Masterclass 2 & Signature Talk 2</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    <span>Room 2 / VC Office</span>
                  </div>
                </div>

                <div className="group border-l border-yellow-500/30 pl-8 pb-10 relative">
                  <div className="absolute w-3 h-3 bg-yellow-500 rounded-full -left-[6.5px] top-1 shadow-[0_0_10px_rgba(234,179,8,0.5)] group-hover:scale-125 transition-transform" />
                  <div className="text-xs text-yellow-500/80 font-medium tracking-widest uppercase mb-3">11:30 AM</div>
                  <h4 className="text-2xl font-serif text-white mb-3">Idea Competition Final Pitching</h4>
                  <div className="text-sm text-gray-400 font-light mb-4 leading-relaxed pr-8">The top teams present their ideas to investors for a chance to win from the ₹15,000+ prize pool.</div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    <span>Seminar Hall</span>
                  </div>
                </div>
                
                <div className="group border-l border-white/20 pl-8 pb-2 relative border-transparent">
                  <div className="absolute w-2 h-2 bg-white/40 rounded-full -left-[4.5px] top-1.5 group-hover:bg-white transition-colors" />
                  <div className="text-xs text-gray-400 font-medium tracking-widest uppercase mb-3">3:30 PM</div>
                  <h4 className="text-2xl font-serif text-white mb-3">Valedictory & Prize Distribution</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    <span>Seminar Hall</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 11. Bottom Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <Image src={validImages.hero} alt="Background" fill className="object-cover opacity-[0.25] mix-blend-luminosity" priority referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[#350A0A] mix-blend-overlay opacity-40" />
        </div>
        
        <div className="relative z-10 text-center px-8 w-full max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-8 h-[1px] bg-white/30" />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-gray-400 font-medium">Join the Movement</span>
            <div className="w-8 h-[1px] bg-white/30" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] font-serif text-white mb-16 tracking-tight">
            Pitch Your Big Idea. <br/>
            <span className="italic text-gray-300">Win Big.</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center border border-white/40 text-white px-10 py-3.5 text-xs font-medium uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors rounded-full">
              Get Your Pass
            </Link>
            <button className="w-full sm:w-auto flex items-center justify-center space-x-3 text-white text-xs font-medium uppercase tracking-[0.15em] hover:text-gray-300 transition-colors group">
              <span>Contact Organizers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Huge Name at bottom */}
        <div className="relative z-10 mt-32 w-full px-4 overflow-hidden">
          <motion.h1 
            initial={{y: 50, opacity:0}} whileInView={{y:0, opacity: 0.8}} viewport={{once:true}} transition={{duration: 1}}
            className="text-[13vw] leading-none font-serif text-center text-white tracking-tighter whitespace-nowrap opacity-90 scale-y-[1.1] font-light"
          >
            Goa Startup Fest
          </motion.h1>
        </div>
      </section>

      {/* 12. Footer */}
      <footer className="bg-[#050505] pt-12 pb-12 px-8 md:px-16 lg:px-24 text-white">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-24 relative z-20 -mt-12">
            <p className="text-gray-400 font-light max-w-xl mx-auto text-sm leading-relaxed">
              Jointly organized by the Parul Innovation and Entrepreneurship Research Centre (PIERC), Parul University, and Parul University Goa Campus.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-8">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24 border-t border-white/10 pt-20 mb-20">
            <div>
              <h5 className="font-medium mb-8 text-xs uppercase tracking-widest text-gray-300">Navigate</h5>
              <ul className="space-y-4 text-xs text-gray-500 font-light">
                <li><a href="#" className="hover:text-white transition-colors">About Festival</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Full Schedule</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Organizing Team</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-8 text-xs uppercase tracking-widest text-gray-300">Events</h5>
              <ul className="space-y-4 text-xs text-gray-500 font-light">
                <li><a href="#" className="hover:text-white transition-colors">Signature Talks</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Idea Competition</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fireside Chat</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ecosystem Connect</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Startup Expo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Masterclasses</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-8 text-xs uppercase tracking-widest text-gray-300">Support</h5>
              <ul className="space-y-4 text-xs text-gray-500 font-light">
                <li><a href="#" className="hover:text-white transition-colors">Registration Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Exhibitor Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Entry</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Campus Map</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-8 text-xs uppercase tracking-widest text-gray-300">Contact</h5>
              <ul className="space-y-6 text-xs text-gray-500 font-light">
                <li className="flex items-start space-x-4">
                  <Phone className="w-4 h-4 shrink-0 text-gray-400" />
                  <div>
                    <div className="text-[0.65rem] text-gray-600 mb-1 uppercase tracking-widest">Phone & WhatsApp</div>
                    <a href="#" className="hover:text-white transition-colors">+91 000 000 0000</a>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <Mail className="w-4 h-4 shrink-0 text-gray-400" />
                  <div>
                    <div className="text-[0.65rem] text-gray-600 mb-1 uppercase tracking-widest">Email</div>
                    <a href="#" className="hover:text-white transition-colors">hello@goastartupfest.in</a>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                  <div>
                    <div className="text-[0.65rem] text-gray-600 mb-1 uppercase tracking-widest">Venue</div>
                    <span className="leading-relaxed">Parul University Goa Campus,<br/>Betul, South Goa</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/10 text-[0.65rem] uppercase tracking-widest text-gray-600 font-medium">
            <p>© 2026 Parul University Goa Campus. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Goa Startup Festival 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
