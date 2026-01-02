
import React from 'react';
import { ChevronLeft, ShieldAlert, CheckCircle2, AlertTriangle, Activity, Pill, History, Share2 } from 'lucide-react';
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
      case 'Critical': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Healthy': return <CheckCircle2 size={24} />;
      case 'Warning': return <AlertTriangle size={24} />;
      case 'Critical': return <ShieldAlert size={24} />;
      default: return <Activity size={24} />;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-500 min-h-screen bg-[#F8FAFB] pb-20">
      {/* Header */}
      <div className="absolute top-12 left-0 right-0 z-20 px-6 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm text-gray-800 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <button className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm text-gray-800">
          <Share2 size={24} />
        </button>
      </div>

      {/* Scanned Image */}
      <div className="h-[40vh] w-full relative">
        <img 
          src={result.imageUrl || 'https://picsum.photos/seed/scan/800/600'} 
          className="w-full h-full object-cover" 
          alt="Scanned plant" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFB] to-transparent"></div>
      </div>

      {/* Diagnostic Card */}
      <div className="px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-gray-100 mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest mb-4 ${getSeverityStyles(result.severity)}`}>
            {getSeverityIcon(result.severity)}
            {result.severity} Status
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
            {result.plantName}
          </h1>
          <p className="text-gray-500 font-medium mb-6 flex items-center gap-2">
            <ShieldAlert size={18} className="text-gray-400" />
            Detected Issue: <span className="text-gray-900 font-bold">{result.issue}</span>
          </p>

          <div className="h-px bg-gray-100 w-full mb-6"></div>

          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Pill size={20} className="text-[#00D09C]" />
            Recommended Remedy
          </h3>
          <p className="text-gray-600 leading-relaxed font-medium bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-50">
            {result.advice}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="w-full bg-[#00D09C] py-6 rounded-[2.5rem] text-white font-bold text-lg shadow-xl shadow-[#00D09C44] active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <History size={20} />
            Go to History
          </button>
          <button 
            onClick={onBack}
            className="w-full bg-white py-6 rounded-[2.5rem] text-gray-400 font-bold text-lg border border-gray-100 active:scale-95 transition-transform"
          >
            Discard Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResultScreen;
