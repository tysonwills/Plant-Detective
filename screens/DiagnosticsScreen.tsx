
import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Clock, Camera, Plus, ChevronRight } from 'lucide-react';
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
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Doctor</h1>
        <p className="text-gray-500 font-medium">Scan your plants for health checkups</p>
      </div>

      {/* Main CTA */}
      <button 
        onClick={onStartDiagnosis}
        className="w-full bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 mb-10 flex flex-col items-center text-center group active:scale-[0.98] transition-all"
      >
        <div className="bg-[#EFFFFB] p-6 rounded-[2.5rem] mb-6 group-hover:scale-110 transition-transform duration-500">
          <Camera size={48} className="text-[#00D09C]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Start Health Check</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
          Take a photo of leaves or stems to detect pests and diseases.
        </p>
        <div className="mt-6 bg-[#00D09C] text-white py-3 px-8 rounded-2xl font-bold text-sm shadow-lg shadow-[#00D09C44] flex items-center gap-2">
          Open Camera <Plus size={18} />
        </div>
      </button>

      {/* History Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Diagnosis History</h2>
          <span className="text-[10px] bg-gray-100 text-gray-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {history.length} Scans
          </span>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
            <ShieldAlert className="text-gray-300 mb-3" size={32} />
            <p className="text-gray-400 text-xs font-medium">No previous scans recorded.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map(item => (
              <div key={item.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-100 overflow-hidden relative active:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex gap-5">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img src={item.imageUrl} alt={item.plantName} className="w-full h-full rounded-[1.5rem] object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-base">{item.plantName}</h3>
                        <ChevronRight className="text-gray-300 group-hover:text-[#00D09C] transition-colors" size={18} />
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider mb-2 ${getSeverityStyles(item.severity)}`}>
                        {getIcon(item.severity)}
                        {item.severity}
                      </div>
                      <p className="text-[11px] font-bold text-gray-700 line-clamp-1">{item.issue}</p>
                    </div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">
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
