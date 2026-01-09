
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Clock, Camera, Plus, ChevronRight, Stethoscope, Cpu, Activity, Zap, HeartPulse, Search, Fingerprint, Layers, Microscope, Bug, Droplets, Sun, FlaskConical, Filter, X, Aperture, Info, ShieldCheck, Sparkles, Thermometer, Wind, Beaker } from 'lucide-react';
import { DiagnosticResult } from '../types.ts';

interface DiagnosticsScreenProps {
  onStartDiagnosis?: () => void;
  onHistoryItemClick?: (result: DiagnosticResult) => void;
}

interface Symptom {
  id: string;
  name: string;
  category: 'Pests' | 'Fungal' | 'Nutrient' | 'Environmental';
  description: string;
  protocol: string;
  prevention: string;
  icon: React.ReactNode;
  color: string;
  severity: 'Warning' | 'Critical';
}

const COMMON_SYMPTOMS: Symptom[] = [
  { id: '1', name: 'Aphids', category: 'Pests', description: 'Small green or black insects on stems/leaves.', protocol: 'Spray with neem oil or a mixture of water and mild dish soap. Repeat every 3 days until colony is eradicated.', prevention: 'Avoid excessive nitrogen fertilization which attracts new growth and aphids.', icon: <Bug size={18} />, color: 'bg-amber-50 text-amber-600', severity: 'Warning' },
  { id: '2', name: 'Mealybugs', category: 'Pests', description: 'White cotton-like spots on leaf axils.', protocol: 'Dab individual bugs with a cotton swab dipped in rubbing alcohol. For large infestations, use horticultural oil.', prevention: 'Inspect new plants before introducing them to your garden.', icon: <Bug size={18} />, color: 'bg-amber-50 text-amber-600', severity: 'Warning' },
  { id: '3', name: 'Root Rot', category: 'Fungal', description: 'Mushy brown stems and yellowing leaves.', protocol: 'Remove plant from soil, trim mushy black roots, and repot in fresh, well-draining soil with a clean pot.', prevention: 'Ensure pots have drainage holes and use a moisture meter before watering.', icon: <Droplets size={18} />, color: 'bg-rose-50 text-rose-600', severity: 'Critical' },
  { id: '4', name: 'Powdery Mildew', category: 'Fungal', description: 'White flour-like coating on leaf surfaces.', protocol: 'Spray with a mixture of baking soda, water, and non-detergent soap. Remove heavily infected leaves.', prevention: 'Improve air circulation around the plant and keep leaves dry.', icon: <Activity size={18} />, color: 'bg-indigo-50 text-indigo-600', severity: 'Warning' },
  { id: '5', name: 'Nitrogen Deficiency', category: 'Nutrient', description: 'Oldest leaves turning uniform pale yellow.', protocol: 'Apply a balanced liquid fertilizer or nitrogen-rich organic amendment like blood meal.', prevention: 'Maintain a regular fertilization schedule during the active growing season.', icon: <FlaskConical size={18} />, color: 'bg-emerald-50 text-emerald-600', severity: 'Warning' },
  { id: '6', name: 'Leaf Burn', category: 'Environmental', description: 'Brown, crispy edges from direct sun or low humidity.', protocol: 'Relocate plant to a spot with filtered light. Increase humidity using a pebble tray or humidifier.', prevention: 'Research the specific light requirements of your specimen before placement.', icon: <Sun size={18} />, color: 'bg-orange-50 text-orange-600', severity: 'Warning' },
  { id: '7', name: 'Spider Mites', category: 'Pests', description: 'Fine webbing and tiny yellow speckles on leaves.', protocol: 'Blast with a strong stream of water, then treat with miticide or insecticidal soap.', prevention: 'Maintain higher humidity levels, as mites thrive in dry environments.', icon: <Bug size={18} />, color: 'bg-amber-50 text-amber-600', severity: 'Critical' },
  { id: '8', name: 'Iron Chlorosis', category: 'Nutrient', description: 'Yellow leaves with prominent green veins.', protocol: 'Apply chelated iron fertilizer to the soil or as a foliar spray.', prevention: 'Check soil pH; high pH can lock up iron, making it unavailable to the plant.', icon: <FlaskConical size={18} />, color: 'bg-emerald-50 text-emerald-600', severity: 'Warning' },
  { id: '9', name: 'Scale Insects', category: 'Pests', description: 'Hard, bumpy brown shells on stems.', protocol: 'Scrape off manually with a fingernail or brush, then treat with horticultural oil.', prevention: 'Regularly wipe stems and leaves to check for early signs of bumps.', icon: <Bug size={18} />, color: 'bg-rose-50 text-rose-600', severity: 'Critical' },
  { id: '10', name: 'Fungus Gnats', category: 'Pests', description: 'Tiny black flies hovering over the soil.', protocol: 'Let soil dry completely. Use yellow sticky traps and water with a diluted hydrogen peroxide solution.', prevention: 'Avoid overwatering and top-dress soil with sand or decorative pebbles.', icon: <Bug size={18} />, color: 'bg-amber-50 text-amber-600', severity: 'Warning' },
  { id: '11', name: 'Botrytis (Gray Mold)', category: 'Fungal', description: 'Gray, fuzzy mold on flowers or fruit.', protocol: 'Prune away all infected tissue and dispose of it away from other plants. Use a fungicide.', prevention: 'Avoid overhead watering and ensure space between plants for airflow.', icon: <Activity size={18} />, color: 'bg-rose-50 text-rose-600', severity: 'Critical' },
  { id: '12', name: 'Thrips', category: 'Pests', description: 'Silvery streaks or black specks on leaves.', protocol: 'Shake leaves over paper to identify, then use blue sticky traps and Spinosad sprays.', prevention: 'Remove weeds near indoor plants which can host thrip colonies.', icon: <Bug size={18} />, color: 'bg-rose-50 text-rose-600', severity: 'Critical' },
  { id: '13', name: 'Edema', category: 'Environmental', description: 'Cork-like bumps on the underside of leaves.', protocol: 'Reduce watering frequency and improve air drainage. This is not a disease, but a water imbalance.', prevention: 'Monitor soil moisture carefully, especially in humid or cool conditions.', icon: <Droplets size={18} />, color: 'bg-blue-50 text-blue-600', severity: 'Warning' },
  { id: '14', name: 'Desiccation', category: 'Environmental', description: 'Wilting and drooping with dry, brittle soil.', protocol: 'Slowly soak the plant in a basin of water for 30 minutes. Trim any dead, dried-out foliage.', prevention: 'Set watering reminders or use self-watering pots for thirsty species.', icon: <Sun size={18} />, color: 'bg-orange-50 text-orange-600', severity: 'Warning' },
  { id: '15', name: 'Heat Stress', category: 'Environmental', description: 'Temporary wilting during the hottest part of day.', protocol: 'Provide temporary shade and increase hydration. Mist leaves lightly with cool water.', prevention: 'Move sensitive plants away from direct afternoon sun or heat sources.', icon: <Thermometer size={18} />, color: 'bg-orange-50 text-orange-600', severity: 'Warning' },
  { id: '16', name: 'Salt Buildup', category: 'Nutrient', description: 'White, crusty residue on soil or pot rim.', protocol: 'Flush the soil with large amounts of distilled water until it runs clear from the bottom.', prevention: 'Use filtered or rain water instead of tap water high in mineral salts.', icon: <FlaskConical size={18} />, color: 'bg-gray-50 text-gray-600', severity: 'Warning' },
];

const DiagnosticsScreen: React.FC<DiagnosticsScreenProps> = ({ onStartDiagnosis, onHistoryItemClick }) => {
  const [history, setHistory] = useState<DiagnosticResult[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);

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
          cause: 'Excessive soil moisture and root suffocation.',
          severity: 'Warning',
          advice: 'The leaves are likely yellowing due to overwatering. Let the soil dry out completely between waterings.',
          imageUrl: 'https://picsum.photos/seed/aloe/400'
        }
      ];
      setHistory(mockHistory);
    }
  }, []);

  const filteredSymptoms = useMemo(() => {
    return COMMON_SYMPTOMS.filter(s => {
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const getSeverityStyles = (severity: string) => {
    switch(severity) {
      case 'Healthy': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Critical': return 'bg-rose-50 text-rose-600 border-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.1)]';
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
    <div className="px-6 pt-12 pb-24 relative min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Plant Doctor</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D09C] animate-pulse"></div>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Diagnostic Laboratory</p>
        </div>
      </div>

      {/* HEALTH CHECK CARD */}
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <button 
          onClick={onStartDiagnosis}
          className="w-full bg-white rounded-[3.5rem] p-8 text-left relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,208,156,0.2)] border-[3px] border-[#00D09C] group active:scale-[0.98] transition-all"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100/30 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-50/40 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col gap-8 relative z-10">
            <div className="flex justify-between items-center">
              <div className="bg-emerald-50 text-[#00D09C] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-emerald-100 shadow-sm">
                <Activity size={12} className="animate-pulse" />
                DOCTOR MODE
              </div>
              <div className="text-gray-300 group-hover:text-emerald-300 transition-colors">
                <Cpu size={20} />
              </div>
            </div>

            <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-dashed border-emerald-200 rounded-full animate-[spin_12s_linear_infinite]"></div>
              <div className="absolute -inset-4 border border-emerald-100 rounded-full"></div>
              
              <div className="w-40 h-40 bg-gradient-to-br from-emerald-50 to-white rounded-full flex items-center justify-center relative shadow-[inset_0_2px_10px_rgba(0,208,156,0.05)] border border-emerald-50">
                <div className="absolute inset-0 rounded-full border border-emerald-100/50 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-100 animate-ping opacity-20"></div>
                
                <div className="bg-white p-7 rounded-[2.5rem] shadow-xl relative group-hover:rotate-[-12deg] transition-transform duration-500 ring-4 ring-[#00D09C]/5 border border-gray-50">
                  <Aperture size={44} className="text-[#00D09C] animate-[pulse_2s_ease-in-out_infinite]" />
                  <div className="absolute -top-2 -right-2 bg-[#00D09C] p-2 rounded-xl text-white shadow-lg">
                    <HeartPulse size={16} fill="currentColor" className="animate-pulse" />
                  </div>
                </div>
              </div>

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

            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 leading-none">Analyze Health</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Initiate neural pathological scan</p>
              
              <div className="w-full py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all bg-[#00D09C] text-white shadow-xl shadow-emerald-100 group-hover:bg-emerald-500">
                Scan for Pathogens
                <ChevronRight size={18} strokeWidth={4} className="group-hover:translate-x-3 transition-transform" />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* SYMPTOM LIBRARY */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
             <Filter size={16} className="text-[#00D09C]" />
             Symptom Library
          </h2>
          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Verifying database...</span>
        </div>

        <div className="relative mb-6 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#00D09C] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search symptoms or issues..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-none py-4 pl-14 pr-6 rounded-3xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#00D09C] transition-all outline-none placeholder-gray-300"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {['All', 'Pests', 'Fungal', 'Nutrient', 'Environmental'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-[#00D09C] text-white shadow-lg shadow-emerald-100 scale-105' 
                  : 'bg-white text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 mt-2">
          {filteredSymptoms.length > 0 ? filteredSymptoms.map((symptom) => (
            <button 
              key={symptom.id}
              onClick={() => setSelectedSymptom(symptom)}
              className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center gap-5 text-left active:scale-[0.98] transition-all hover:border-[#00D09C]/30 shadow-sm group"
            >
              <div className={`${symptom.color} p-4 rounded-2xl shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform`}>
                {symptom.icon}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-gray-900 text-sm tracking-tight truncate">{symptom.name}</h4>
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${symptom.severity === 'Critical' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                    {symptom.severity}
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-500 leading-tight line-clamp-1">{symptom.description}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#00D09C] transition-colors" />
            </button>
          )) : (
            <div className="py-12 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
               <Search size={32} className="text-gray-200 mx-auto mb-3" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching symptoms found</p>
            </div>
          )}
        </div>
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
              <div 
                key={item.id} 
                onClick={() => onHistoryItemClick?.(item)}
                className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-100 overflow-hidden relative active:scale-[0.98] transition-all cursor-pointer group"
              >
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

      {/* SYMPTOM DETAIL MODAL */}
      {selectedSymptom && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-end justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedSymptom(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-t-[3.5rem] p-8 shadow-2xl relative z-10 animate-in slide-in-from-bottom-full duration-500 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8"></div>
            
            <div className="flex items-center justify-between mb-8">
              <div className={`${selectedSymptom.color} p-5 rounded-[2rem] shadow-sm`}>
                {React.cloneElement(selectedSymptom.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getSeverityStyles(selectedSymptom.severity)}`}>
                  {getIcon(selectedSymptom.severity)}
                  {selectedSymptom.severity} Threat
                </span>
                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2">ID: {selectedSymptom.id} / Sector {selectedSymptom.category}</p>
              </div>
            </div>

            <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 leading-none">{selectedSymptom.name}</h3>
            <p className="text-[#00D09C] text-[10px] font-black uppercase tracking-[0.4em] mb-8">Clinical Profile & Protocol</p>

            <div className="space-y-8">
               <div className="bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={14} className="text-gray-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Biological Description</h4>
                  </div>
                  <p className="text-gray-700 text-sm font-bold leading-relaxed">{selectedSymptom.description}</p>
               </div>

               <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-50 text-[#00D09C] p-2 rounded-xl">
                       <ShieldCheck size={18} />
                    </div>
                    <h4 className="text-base font-black text-gray-900 tracking-tight">Recovery Protocol</h4>
                 </div>
                 <div className="bg-white p-6 rounded-[2.5rem] border-2 border-emerald-50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                       <Sparkles size={16} className="text-emerald-100 group-hover:scale-125 transition-transform" />
                    </div>
                    <p className="text-gray-700 text-sm font-bold leading-relaxed">
                      {selectedSymptom.protocol}
                    </p>
                 </div>
               </div>

               <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="bg-amber-50 text-amber-500 p-2 rounded-xl">
                       <Beaker size={18} />
                    </div>
                    <h4 className="text-base font-black text-gray-900 tracking-tight">Prevention Strategy</h4>
                 </div>
                 <div className="bg-amber-50/30 p-6 rounded-[2.5rem] border-2 border-amber-100 shadow-sm italic">
                    <p className="text-amber-900 text-sm font-bold leading-relaxed">
                      {selectedSymptom.prevention}
                    </p>
                 </div>
               </div>
            </div>

            <button 
              onClick={() => setSelectedSymptom(null)}
              className="w-full mt-10 bg-gray-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
            >
              Close Diagnostic
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsScreen;
