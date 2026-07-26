import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="pt-32 pb-12 border-t border-white/10 relative">
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <div className="w-full flex justify-between items-center mb-16">
          <h2 className="font-display font-bold text-6xl md:text-[8rem] leading-none tracking-tighter text-cloud-white">WE</h2>
          <div className="flex-1 max-w-xs mx-auto border-t border-b border-white/20 py-4 font-mono text-[8px] md:text-[10px] uppercase tracking-widest text-center text-white/50 space-y-2">
            <div>{"// STARTUPS"}</div>
            <div>{"// INVESTORS"}</div>
            <div>{"// ECOSYSTEM"}</div>
          </div>
          <h2 className="font-display font-bold text-6xl md:text-[8rem] leading-none tracking-tighter text-cloud-white">DO</h2>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-4 text-left">
           <div>
             <div className="h-16 w-full bg-white/5 mb-2 relative"></div>
             <div className="font-mono text-[8px] uppercase tracking-widest text-white/40">/Organizer</div>
             <div className="font-mono text-[10px] uppercase tracking-widest">PIERC</div>
           </div>
           <div>
             <div className="h-16 w-full bg-white/5 mb-2 relative"></div>
             <div className="font-mono text-[8px] uppercase tracking-widest text-white/40">/Location</div>
             <div className="font-mono text-[10px] uppercase tracking-widest">Parul Univ Goa</div>
           </div>
           <div>
             <div className="h-16 w-full bg-white/5 mb-2 relative"></div>
             <div className="font-mono text-[8px] uppercase tracking-widest text-white/40">/Dates</div>
             <div className="font-mono text-[10px] uppercase tracking-widest">Sept 2-3 2026</div>
           </div>
           <div>
             <div className="h-16 w-full bg-white/5 mb-2 relative flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
               <Link href="/register" className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-runway-gold">
                 GET PASS
               </Link>
             </div>
             <div className="font-mono text-[8px] uppercase tracking-widest text-white/40">/Action</div>
             <div className="font-mono text-[10px] uppercase tracking-widest">Register Now</div>
           </div>
        </div>

        <div className="w-full mt-24 border border-white/10 bg-white/5 relative flex items-center justify-center overflow-hidden rounded-sm">
          <div className="w-full relative grayscale hover:grayscale-0 transition-all duration-700 opacity-80 hover:opacity-100 flex justify-center py-4">
             <Image src="/parul-university.png" alt="Parul University" width={1920} height={800} className="w-full h-auto object-cover max-h-[60vh] mix-blend-screen" referrerPolicy="no-referrer" />
          </div>
        </div>

      </div>
    </footer>
  );
}