import Link from 'next/link';
import Image from 'next/image';
import { ArrowDownRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#111111] text-[#EBEBEB] pt-16 pb-12 overflow-hidden font-sans border-t border-white/10">
      
      {/* Background Faded Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/footer_image.jpg" 
          alt="Background" 
          fill 
          className="object-cover opacity-[0.10] grayscale mix-blend-overlay"
        />
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[100vw] mx-auto px-6 md:px-12 flex flex-col justify-between min-h-[70vh]">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-8 w-full">
          {/* Left: Logo/Title */}
          <div className="font-black italic text-2xl tracking-tight">
            STARTUP FEST<span className="text-[10px] align-super ml-1">®</span>
          </div>

          {/* Center: Event Links */}
          <div className="flex justify-start text-[11px] font-bold tracking-widest uppercase">
            <div className="flex gap-4">
              <span className="text-white/40 mt-0.5">[</span>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center justify-between w-48">
                  <Link href="/#masterclasses" className="hover:text-[#D5FF00] transition-colors">MASTERCLASSES</Link>
                  <span className="text-white/40">]</span>
                </li>
                <li><Link href="/#arena" className="hover:text-[#D5FF00] transition-colors">IDEA COMPETITION</Link></li>
                <li><Link href="/#network" className="hover:text-[#D5FF00] transition-colors">SIGNATURE TALKS</Link></li>
                <li><Link href="/#network" className="hover:text-[#D5FF00] transition-colors">FIRESIDE CHAT</Link></li>
                <li><Link href="/#network" className="hover:text-[#D5FF00] transition-colors">STARTUP EXPO</Link></li>
              </ul>
            </div>
          </div>

          {/* Right: Newsletter */}
          <div className="flex flex-col items-start lg:items-end gap-6 w-full lg:w-auto">
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-black text-2xl tracking-tighter uppercase whitespace-nowrap">
              <span>SIGN UP</span>
              <span>TO OUR</span>
              <span>NEWSLETTER</span>
            </div>
            <div className="relative w-full lg:w-[320px]">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="w-full bg-[#D5FF00] text-black font-bold text-xs placeholder-black/60 rounded-full py-4 pl-6 pr-16 focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#111] rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                <ArrowDownRight className="w-4 h-4 text-[#D5FF00]" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section: Massive Typography */}
        <div className="w-full flex justify-center items-center py-20 overflow-hidden select-none">
           <h1 
             className="font-black italic text-[#EBEBEB] whitespace-nowrap"
             style={{ 
               fontSize: 'clamp(5rem, 19vw, 30rem)', 
               lineHeight: '0.8', 
               letterSpacing: '-0.06em',
               transform: 'scaleY(1.5) scaleX(0.9)',
               transformOrigin: 'center'
             }}
           >
             STARTUP FEST
           </h1>
        </div>

        {/* Bottom Section: Footer Links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-[10px] font-bold tracking-widest uppercase text-[#EBEBEB] mt-12 w-full pt-8">
          <div className="leading-relaxed">
             © STARTUP FESTIVAL /<br/>
             ALL RIGHTS RESERVED
          </div>
          <div className="leading-relaxed">
             <Link href="/terms" className="hover:text-[#D5FF00] block transition-colors mb-1">TERMS & CONDITIONS</Link>
             <Link href="/privacy" className="hover:text-[#D5FF00] block transition-colors mb-1">PRIVACY POLICY</Link>
             <Link href="/guidelines" className="hover:text-[#D5FF00] block transition-colors">PUBLIC OFFER</Link>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 text-[#D5FF00]">
             <Link href="#" className="hover:text-white transition-colors">FACEBOOK</Link>
             <Link href="#" className="hover:text-white transition-colors">INSTAGRAM</Link>
             <Link href="#" className="hover:text-white transition-colors">LINKEDIN</Link>
          </div>
          <div className="text-left lg:text-right leading-relaxed">
             DESIGN BY<br/>
             <span className="text-[#EBEBEB]">PIERC TEAM</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
