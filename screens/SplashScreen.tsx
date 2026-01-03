
import React from 'react';
import { Sprout } from 'lucide-react';

/**
 * SplashScreen component displayed during initial app load.
 * Provides a smooth transition and aesthetic brand introduction.
 */
const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#00D09C] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Orbs for background depth */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/5 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="flex flex-col items-center text-white z-10">
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-[3.5rem] mb-8 shadow-2xl border border-white/30 animate-bounce">
          <Sprout size={80} className="text-white" />
        </div>
        
        <div className="text-center">
          <h1 className="text-5xl font-black mb-2 tracking-tighter">FloraID</h1>
          <p className="text-white/80 font-bold uppercase tracking-[0.3em] text-[10px]">Botanical Intelligence</p>
        </div>
      </div>
      
      {/* Subtle loading indicator */}
      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
        </div>
        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Growing your garden...</span>
      </div>
    </div>
  );
};

export default SplashScreen;
