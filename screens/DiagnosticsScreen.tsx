
import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Clock, Camera, Plus, ChevronRight, Stethoscope, Cpu, Activity, Zap, HeartPulse, Search, Fingerprint, Layers, Microscope } from 'lucide-react';
import { DiagnosticResult } from '../types';

interface DiagnosticsScreenProps {
  onStartDiagnosis?: () => void;
}

const DiagnosticsScreen: React.FC<DiagnosticsScreenProps> = ({ onStartDiagnosis }) => {
  const [history, setHistory] = useState<DiagnosticResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('flora_diag_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    } else {
      const mockHistory: DiagnosticResult[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          plantName: 'Aloe Vera',
          issue: 'Yellowing leaves',
          severity: 'Warning',
          advice: 'The leaves are likely yellowing due to overwatering. Let the soil dry out completely between waterings.',
          imageUrl: 'https://picsum.photos/seed/aloe/400'
        }
      ];
      setHistory(mockHistory);
    }
  }, []);

  const getSeverityStyles = (severity: string) => {
    switch(severity) {
      case 'Healthy': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Critical': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getIcon = (severity: string) => {
    switch(severity) {
      case 'Healthy': return <CheckCircle2 size={16} />;
      case 'Warning': return <AlertTriangle size={16} />;
      case 'Critical': return <ShieldAlert size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="px-6 pt-12 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Plant Doctor</h1>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Diagnostic Laboratory</p>
      </div>

      {/* RESTYLED HEALTH CHECK CARD - CRYSTAL BIO-INTERFACE */}
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <button 
          onClick={onStartDiagnosis}
          className="w-full bg-white rounded-[3.5rem] p-8 text-left relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,208,156,0.2)] border-[3px] border-[#00D09C] group active:scale-[0.98] transition-all"
        >
          {/* Ambient Soft Glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100/30 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-50/40 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col gap-8 relative z-10">
            {/* Header: Status Tag & Lab Branding */}
            <div className="flex justify-between items-center">
              <div className="bg-emerald-50 text-[#00D09C] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-emerald-100 shadow-sm">
                <Activity size={12} className="animate-pulse" />
                DOCTOR MODE
              </div>
              <div className="text-gray-300 group-hover:text-emerald-300 transition-colors">
                <Cpu size={20} />
              </div>
            </div>

            {/* Central Circular Aperture with Stethoscope */}
            <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center">
              {/* Rotating Focus Ring */}
              <div className="absolute inset-0 border-2 border-dashed border-emerald-200 rounded-full animate-[spin_12s_linear_infinite]"></div>
              
              {/* Static Brackets */}
              <div className="absolute -inset-4 border border-emerald-100 rounded-full"></div>
              
              {/* Luminous Inner Core */}
              <div className="w-40 h-40 bg-gradient-to-br from-emerald-50 to-white rounded-full flex items-center justify-center relative shadow-[inset_0_2px_10px_rgba(0,208,156,0.05)] border border-emerald-50">
                <div className="absolute inset-0 rounded-full border border-emerald-100/50 group-hover:scale-110 transition-transform duration-700"></div>
                
                {/* Pulse Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-100 animate-ping opacity-20"></div>
                
                {/* Main Icon pod with Stethoscope Animation */}
                <div className="bg-white p-7 rounded-[2.5rem] shadow-xl relative group-hover:rotate-[-12deg] transition-transform duration-500 ring-4 ring-[#00D09C]/5 border border-gray-50">
                  <Stethoscope size={44} className="text-[#00D09C] animate-[pulse_2s_ease-in-out_infinite]" />
                  <div className="absolute -top-2 -right-2 bg-[#00D09C] p-2 rounded-xl text-white shadow-lg">
                    <HeartPulse size={16} fill="currentColor" className="animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Micro Metadata Labels */}
              <div className="absolute top-0 right-0 translate-x-4 -translate-y-2 flex flex-col items-start gap-1">
                 <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">PATH.SCAN</span>
                 <div className="w-8 h-[2px] bg-emerald-100"></div>
              </div>
              <div className="absolute bottom-4 left-0 -translate-x-6 flex flex-col items-end gap-1">
                 <div className="flex gap-0.5">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-[#00D09C] rounded-full"></div>)}
                 </div>
                 <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">HLTH.READ</span>
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 leading-none">Analyze Health</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Initiate neural pathological scan</p>
              
              <div className="w-full py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all bg-[#00D09C] text-white shadow-xl shadow-emerald-100">
                Scan for Pathogens
                <ChevronRight size={18} strokeWidth={4} className="group-hover:translate-x-3 transition-transform" />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* History Section */}
      <div>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
             <Clock size={16} className="text-[#00D09C]" />
             Diagnosis History
          </h2>
          <span className="text-[10px] font-bold text-[#00D09C] bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
            {history.length} Scans
          </span>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="bg-gray-50 p-6 rounded-[2rem] mb-4">
               <Microscope className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Archives Empty</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map(item => (
              <div key={item.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-100 overflow-hidden relative active:scale-[0.98] transition-all cursor-pointer group">
                <div className="flex gap-5">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img src={item.imageUrl} alt={item.plantName} className="w-full h-full rounded-[1.8rem] object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-gray-900 text-base tracking-tight">{item.plantName}</h3>
                        <ChevronRight className="text-gray-300 group-hover:text-[#00D09C] transition-colors" size={18} />
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider mb-2 ${getSeverityStyles(item.severity)}`}>
                        {getIcon(item.severity)}
                        {item.severity}
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight line-clamp-1">{item.issue}</p>
                    </div>
                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-2">
                      {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsScreen;
