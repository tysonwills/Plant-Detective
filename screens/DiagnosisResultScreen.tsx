
import React from 'react';
import { 
  ChevronLeft, ShieldAlert, CheckCircle2, AlertTriangle, Activity, Pill, History, Share2, Info, 
  Settings2, Microscope, ArrowRight, ClipboardCheck, Sparkles, Zap, ShieldCheck, 
  Droplets, Scissors, Shovel, Wind, Sun, Sparkle, FlaskConical 
} from 'lucide-react';
import { DiagnosticResult } from '../types';

interface DiagnosisResultScreenProps {
  result: Omit<DiagnosticResult, 'id' | 'timestamp'> & { imageUrl?: string };
  onBack: () => void;
  onSave?: () => void;
}

const DiagnosisResultScreen: React.FC<DiagnosisResultScreenProps> = ({ result, onBack, onSave }) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'Healthy': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-200 shadow-sm';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Healthy': return <CheckCircle2 size={24} />;
      case 'Warning': return <AlertTriangle size={24} />;
      case 'Critical': return <ShieldAlert size={24} className="text-rose-700" />;
      default: return <Activity size={24} />;
    }
  };

  const getSeverityGlow = (severity: string) => {
    switch (severity) {
      case 'Healthy': return 'shadow-[#00D09C33]';
      case 'Warning': return 'shadow-amber-200';
      case 'Critical': return 'shadow-rose-200';
      default: return 'shadow-gray-200';
    }
  };

  // Helper to assign appropriate icons to treatment steps
  const getStepIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('water') || t.includes('hydrate') || t.includes('moisture')) return <Droplets size={20} />;
    if (t.includes('cut') || t.includes('prune') || t.includes('trim') || t.includes('remove')) return <Scissors size={20} />;
    if (t.includes('soil') || t.includes('repot') || t.includes('potting')) return <Shovel size={20} />;
    if (t.includes('spray') || t.includes('mist') || t.includes('neem') || t.includes('soap')) return <Wind size={20} />;
    if (t.includes('sun') || t.includes('light') || t.includes('shade')) return <Sun size={20} />;
    if (t.includes('fertilize') || t.includes('feed') || t.includes('nutrient')) return <FlaskConical size={20} />;
    if (t.includes('clean') || t.includes('wipe') || t.includes('dust')) return <Sparkle size={20} />;
    return <Zap size={20} />;
  };

  // Helper to parse the advice into steps if it looks like a list
  const recoverySteps = result.advice.split(/(?:\d+[\.\)]|\n|-)\s+/).filter(s => s.trim());

  return (
    <div className="animate-in fade-in slide-in-from-right-10 duration-500 min-h-screen bg-[#F2F4F7] pb-32">
      {/* Neural Scan Header Layer */}
      <div className="absolute top-12 left-0 right-0 z-30 px-6 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/40 text-gray-800 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3">
          <button className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/40 text-gray-800 active:scale-90 transition-transform">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* Hero Image Section with Scan Overlay */}
      <div className="h-[50vh] w-full relative overflow-hidden bg-gray-900">
        <img 
          src={result.imageUrl || 'https://picsum.photos/seed/scan/800/600'} 
          className="w-full h-full object-cover opacity-80" 
          alt="Scanned specimen" 
        />
        
        {/* Scan UI Elements */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute inset-[15%] border-2 border-dashed border-white/20 rounded-[3rem] animate-pulse"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/10 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
           </div>
           
           {/* Top Right Data Labels */}
           <div className="absolute top-32 right-8 text-right space-y-1">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Neural.Scan_Active</p>
              <div className="h-0.5 w-12 bg-[#00D09C] ml-auto"></div>
           </div>

           {/* Bottom Left Status */}
           <div className="absolute bottom-32 left-8 space-y-2">
              <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-[#00D09C] rounded-full animate-pulse" style={{ animationDelay: `${i*200}ms` }}></div>)}
              </div>
              <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Pathology_Locked</p>
           </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#F2F4F7] via-[#F2F4F7]/40 to-transparent"></div>
      </div>

      {/* Diagnostic Report Layer */}
      <div className="px-8 -mt-24 relative z-20">
        <div className="bg-white rounded-[4rem] p-10 shadow-2xl border border-gray-100 mb-10 overflow-hidden relative">
          {/* Subtle Bio-Background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/30 rounded-full blur-3xl -mr-24 -mt-24"></div>
          
          <div className="relative z-10">
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
               <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border-2 text-[10px] font-black uppercase tracking-widest shadow-lg ${getSeverityStyles(result.severity)} ${getSeverityGlow(result.severity)}`}>
                {getSeverityIcon(result.severity)}
                {result.severity} Condition
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                 <Microscope size={14} className="text-[#00D09C]" />
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lab Ref: {Math.floor(Math.random() * 100000)}</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 mb-2 leading-[0.9] tracking-tighter">
              {result.plantName}
            </h1>
            <p className="text-[10px] font-black text-[#00D09C] uppercase tracking-[0.4em] mb-10">Biological Health Assessment</p>
            
            {/* Clinical Insights Split View */}
            <div className="grid grid-cols-1 gap-6 mb-12">
              <div className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-50 p-2.5 rounded-xl text-gray-400">
                    <Info size={18} />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Symptoms</h3>
                </div>
                <p className="text-gray-900 font-bold text-lg leading-snug">
                  {result.issue}
                </p>
              </div>

              <div className="bg-amber-50/30 p-8 rounded-[3rem] border-2 border-amber-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <Zap size={20} className="text-amber-200 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl">
                    <Settings2 size={18} />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">Underlying Etiology (Root Cause)</h3>
                </div>
                <p className="text-amber-900 text-base font-bold leading-relaxed italic border-l-4 border-amber-200 pl-6 py-2">
                  {result.cause}
                </p>
              </div>
            </div>

            {/* THE REMEDY: RE-STYLED TREATMENT PROTOCOL */}
            <div className="bg-gray-900 rounded-[3.5rem] p-1 shadow-2xl shadow-gray-300 relative overflow-hidden group">
               {/* Protocol Aesthetic Header */}
               <div className="bg-emerald-500 rounded-t-[3.2rem] p-8 pt-10 pb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-20"><ClipboardCheck size={120} strokeWidth={1} /></div>
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="bg-white text-emerald-600 p-4 rounded-[1.8rem] shadow-2xl">
                      <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-white text-2xl font-black tracking-tight leading-none mb-1">Recovery Protocol</h3>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.3em] opacity-80 animate-pulse">Execute Sequence</span>
                      </div>
                    </div>
                  </div>
               </div>

               {/* Step Modules Area */}
               <div className="p-4 pt-6 pb-10 space-y-3">
                  {recoverySteps.length > 0 ? (
                    recoverySteps.map((step, idx) => (
                      <div 
                        key={idx} 
                        className="flex gap-5 items-center p-5 rounded-[2.2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group/step animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${idx * 150}ms` }}
                      >
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/step:scale-110 group-hover/step:bg-emerald-500 group-hover/step:text-white transition-all duration-500 shadow-inner">
                           {getStepIcon(step)}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">Step 0{idx + 1}</span>
                              <div className="h-px flex-1 bg-white/5"></div>
                           </div>
                           <p className="text-gray-300 font-bold leading-snug text-sm">
                            {step.trim()}
                           </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-white/5 rounded-[2rem] border border-white/5">
                      <p className="text-white font-bold leading-relaxed text-base italic opacity-90">
                        {result.advice}
                      </p>
                    </div>
                  )}
               </div>

               <div className="px-10 pb-8 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-500">
                     <div className="w-2 h-2 rounded-full bg-current animate-ping"></div>
                     <span className="text-[9px] font-black uppercase tracking-[0.4em]">Biosync Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {[1,2,3].map(dot => <div key={dot} className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>)}
                     <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">v4.2.0</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Post-Diagnostic Actions */}
        <div className="grid grid-cols-1 gap-5">
          <button 
            onClick={onBack}
            className="w-full bg-[#00D09C] py-8 rounded-[3.5rem] text-white font-black text-xl shadow-2xl shadow-[#00D09C44] active:scale-95 transition-transform flex items-center justify-center gap-5 border-b-8 border-emerald-700/20"
          >
            <History size={28} />
            Save to History
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={onBack}
              className="flex-1 bg-white py-6 rounded-[2.5rem] text-gray-400 font-black text-sm uppercase tracking-widest border border-gray-100 active:scale-95 transition-transform flex items-center justify-center gap-3"
            >
               Discard
            </button>
            <button 
              onClick={onBack}
              className="flex-1 bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-3"
            >
               Set Care Reminders
               <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-12 text-center pb-12">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">PlantHound Pathology v2.5</p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResultScreen;
