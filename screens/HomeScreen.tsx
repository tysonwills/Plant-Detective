
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, MapPin, BookOpen, X, Sparkles, Plus, Crown, Camera, Lightbulb, Droplets, Zap, Shovel, MessageSquare, Scan, Aperture, Fingerprint, Microscope, Beaker, Activity, Dna, Layers, Target, Cpu, TrendingUp, History, Filter, Sparkle, BookOpenCheck, Wand2, Scissors, Wind, FlaskConical, Thermometer, ArrowRight, Leaf, Stethoscope } from 'lucide-react';

interface HomeScreenProps {
  onNavigate?: (tab: string) => void;
  onSearch?: (query: string) => void;
  onAddToGarden?: (name: string, species: string) => void;
  onScanClick?: () => void;
  onShowTerms?: () => void;
  isSubscribed?: boolean;
}

interface PlantTip {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tag: string;
}

const BOTANICAL_TIPS: PlantTip[] = [
  { id: '1', title: 'Cinnamon Shield', desc: 'Dust cinnamon on soil to act as a natural antifungal for seedlings.', icon: <FlaskConical size={18} />, tag: 'Fungal' },
  { id: '2', title: 'Banana Boost', desc: 'Soak banana peels in water for 24h to create a potassium-rich tonic.', icon: <Zap size={18} />, tag: 'Nutrient' },
  { id: '3', title: 'Humidity Hub', desc: 'Group plants together to create a micro-climate with higher humidity.', icon: <Wind size={18} />, tag: 'Climate' },
  { id: '4', title: 'Bottom Hydration', desc: 'Place pots in water for 20 mins to encourage deeper root growth.', icon: <Droplets size={18} />, tag: 'Watering' },
  { id: '5', title: 'Leaf Polishing', desc: 'Wipe leaves with diluted milk to remove dust and add a natural shine.', icon: <Sparkle size={18} />, tag: 'Maintenance' },
  { id: '6', title: 'Coffee Acid', desc: 'Add used coffee grounds to acid-loving plants like Azaleas for a nitrogen lift.', icon: <Beaker size={18} />, tag: 'Soil' },
  { id: '7', title: 'Pest Detection', desc: 'Shake leaves over white paper to easily spot tiny spider mites.', icon: <Microscope size={18} />, tag: 'Pathology' },
  { id: '8', title: 'Calcium Fortify', desc: 'Crush eggshells into soil to slowly release vital calcium over time.', icon: <Dna size={18} />, tag: 'Nutrient' },
  { id: '9', title: 'Pruning Pulse', desc: 'Always cut 45° above a node to stimulate rapid new growth points.', icon: <Scissors size={18} />, tag: 'Pruning' },
  { id: '10', title: 'Morning Cycle', desc: 'Water at dawn to allow foliage to dry, preventing fungal pathogens.', icon: <Thermometer size={18} />, tag: 'Watering' }
];

const getFuzzyScore = (target: string, query: string): number => {
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90 + (q.length / t.length) * 10;
  if (t.includes(q)) return 70 + (q.length / t.length) * 20;
  const tChars = new Set(t.split(''));
  const qChars = q.split('');
  const intersection = qChars.filter(char => tChars.has(char)).length;
  return Math.round((intersection / Math.max(t.length, q.length)) * 100);
};

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onSearch, onAddToGarden, onScanClick, onShowTerms, isSubscribed }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Randomize 4 tips on component initialization
  const randomizedTips = useMemo(() => {
    return [...BOTANICAL_TIPS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('flora_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const databasePlants = [
    { id: 1, name: 'Monstera Deliciosa', scientific: 'Monstera deliciosa', img: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=400&h=600&auto=format&fit=crop', care: 'Easy' },
    { id: 2, name: 'Snake Plant', scientific: 'Dracaena trifasciata', img: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?q=80&w=400&h=600&auto=format&fit=crop', care: 'Low' },
    { id: 3, name: 'Fiddle Leaf Fig', scientific: 'Ficus lyrata', img: 'https://images.unsplash.com/photo-1520412099551-6296b0db5c04?q=80&w=400&h=600&auto=format&fit=crop', care: 'Hard' },
    { id: 4, name: 'Aloe Vera', scientific: 'Aloe barbadensis Miller', img: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=400&h=600&auto=format&fit=crop', care: 'Low' },
    { id: 5, name: 'Peace Lily', scientific: 'Spathiphyllum', img: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?q=80&w=400&h=600&auto=format&fit=crop', care: 'Medium' },
    { id: 6, name: 'Pothos', scientific: 'Epipremnum aureum', img: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=400&h=600&auto=format&fit=crop', care: 'Very Easy' },
    { id: 7, name: 'Calathea', scientific: 'Goeppertia insignis', img: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=400&h=600&auto=format&fit=crop', care: 'Medium' },
  ];

  const filteredPlants = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return databasePlants
      .map(p => ({ ...p, fuzzyScore: getFuzzyScore(p.name, searchQuery) }))
      .filter(p => p.fuzzyScore > 25)
      .sort((a, b) => b.fuzzyScore - a.fuzzyScore);
  }, [searchQuery]);

  const tools = [
    { id: 'garden', label: 'My Garden', desc: 'Track care', icon: <Leaf size={20} />, color: 'bg-emerald-50 text-emerald-500', tab: 'my-plants', isPro: true },
    { id: 'diagnose', label: 'Plant Doctor', desc: 'Diagnose health', icon: <Stethoscope size={20} />, color: 'bg-rose-50 text-rose-500', tab: 'diagnose', isPro: true },
    { id: 'stores', label: 'Nearby Stores', desc: 'Find supplies', icon: <MapPin size={20} />, color: 'bg-blue-50 text-blue-500', tab: 'stores', isPro: true },
    { id: 'care', label: 'Ask an Expert', desc: 'Personalized help', icon: <MessageSquare size={20} />, color: 'bg-amber-50 text-amber-500', tab: 'chat', isPro: true },
  ];

  const handleSearchSubmit = (query: string) => {
    if (!query.trim() || !onSearch) return;
    const history = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(history);
    localStorage.setItem('flora_recent_searches', JSON.stringify(history));
    onSearch(query);
  };

  const handleScanInteraction = () => {
    if (isSubscribed) onScanClick?.();
    else onNavigate?.('upsell');
  };

  return (
    <div className="px-6 pt-4 pb-8">
      {!searchQuery && (
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 leading-none mb-1 tracking-tight">Identify & Discover</h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Botanical Intelligence Engine</p>
        </div>
      )}

      {/* ENHANCED SEARCH BAR */}
      <div className={`relative mb-10 transition-all duration-500 ${searchQuery ? 'mt-4' : ''}`}>
        <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(searchQuery); }} className="relative group">
          <div className={`absolute -inset-1 bg-gradient-to-r from-[#00D09C] to-emerald-400 rounded-[2rem] blur opacity-20 transition duration-500 ${isFocused ? 'opacity-40 scale-[1.02]' : 'group-hover:opacity-30'}`}></div>
          <div className={`relative flex items-center bg-white border-2 rounded-[1.8rem] transition-all duration-300 ${isFocused ? 'border-[#00D09C] shadow-lg shadow-emerald-100' : 'border-transparent shadow-sm'}`}>
            <Search className={`ml-5 transition-colors duration-300 ${isFocused ? 'text-[#00D09C]' : 'text-gray-400'}`} size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search species, care info, or name..." 
              className="w-full py-5 pl-4 pr-12 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none rounded-r-[1.8rem] bg-transparent"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-5 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {searchQuery.trim() ? (
        <div className="space-y-6 mb-8 animate-in fade-in duration-300">
           {filteredPlants.length > 0 && (
             <div>
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Local Archives</h3>
               <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
                 {filteredPlants.map(plant => (
                   <button 
                    key={plant.id}
                    onClick={() => handleSearchSubmit(plant.name)}
                    className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                   >
                     <div className="relative">
                       <img src={plant.img} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                       {plant.fuzzyScore < 100 && (
                         <div className="absolute -bottom-1 -right-1 bg-[#00D09C] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                           {plant.fuzzyScore}%
                         </div>
                       )}
                     </div>
                     <div className="flex-1">
                       <p className="text-sm font-black text-gray-900">{plant.name}</p>
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{plant.care} Protocol</p>
                     </div>
                     <ChevronRight size={16} className="text-gray-300" />
                   </button>
                 ))}
               </div>
             </div>
           )}
           <button onClick={() => handleSearchSubmit(searchQuery)} className="w-full bg-[#00D09C] p-6 rounded-[2.5rem] flex items-center justify-between text-white active:scale-[0.98] transition-all shadow-xl shadow-[#00D09C33]">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-xl"><Microscope size={20} className="text-white" /></div>
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-80 block mb-0.5">Neural Audit</span>
                  <span className="text-sm font-black uppercase tracking-wider">Deep Search "{searchQuery}"</span>
                </div>
              </div>
              <ChevronRight size={20} strokeWidth={3} />
            </button>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          
          {/* PROMINENT SCANNER CARD */}
          <div className="mb-12">
            <button onClick={handleScanInteraction} className="w-full bg-white rounded-[3.5rem] p-8 text-left relative overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,208,156,0.3)] border-[4px] border-[#00D09C] group active:scale-[0.98] transition-all">
              
              {/* Background glow effects */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-100/40 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00D09C]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#00D09C]/10 transition-colors"></div>

              <div className="flex flex-col gap-10 relative z-10">
                <div className="flex justify-between items-center">
                  {!isSubscribed ? (
                    <div className="bg-amber-100/50 text-amber-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-amber-200 shadow-sm"><Crown size={12} fill="currentColor" /> PRO LAB</div>
                  ) : (
                    <div className="bg-emerald-50 text-[#00D09C] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-emerald-100 shadow-sm"><Activity size={12} /> SYSTEM READY</div>
                  )}
                  <div className="text-gray-300 group-hover:text-emerald-300 transition-colors"><Cpu size={20} /></div>
                </div>

                <div className="relative w-full aspect-square max-w-[220px] mx-auto flex items-center justify-center">
                  {/* Rotating Rings */}
                  <div className="absolute inset-0 border-2 border-dashed border-[#00D09C]/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-4 border border-[#00D09C]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                  
                  {/* Pulse Ring */}
                  <div className="absolute inset-0 border-[3px] border-[#00D09C]/10 rounded-full animate-ping opacity-20"></div>

                  {/* Core Lens */}
                  <div className="w-48 h-48 bg-gradient-to-br from-emerald-50 to-white rounded-full flex items-center justify-center relative border-2 border-emerald-100 shadow-[inset_0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
                    {/* Scanning Beam Animation */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#00D09C]/10 to-transparent animate-[scan_3s_ease-in-out_infinite] z-0"></div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00D09C]/40 shadow-[0_0_15px_#00D09C] animate-[scan_3s_ease-in-out_infinite] z-0"></div>

                    {/* Icon Container */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-2xl relative ring-8 ring-[#00D09C]/5 border border-gray-100 flex items-center justify-center z-10 group-hover:scale-105 transition-transform duration-500">
                      <Camera size={64} className="text-[#00D09C] drop-shadow-sm" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Tech Markers */}
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                     <div className="w-1.5 h-1.5 bg-[#00D09C] rounded-full animate-pulse"></div>
                     <div className="w-1.5 h-1.5 bg-[#00D09C]/40 rounded-full"></div>
                     <div className="w-1.5 h-1.5 bg-[#00D09C]/20 rounded-full"></div>
                  </div>
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                     <div className="w-1.5 h-1.5 bg-[#00D09C] rounded-full animate-pulse"></div>
                     <div className="w-1.5 h-1.5 bg-[#00D09C]/40 rounded-full"></div>
                     <div className="w-1.5 h-1.5 bg-[#00D09C]/20 rounded-full"></div>
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 leading-none uppercase italic">Tap to Identify</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">AI-Powered Specimen Analysis</p>
                  
                  <div className="w-full py-6 rounded-[2.5rem] bg-[#00D09C] text-white font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 group-hover:shadow-emerald-300 group-hover:translate-y-[-2px] transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    Activate Lens <ChevronRight size={18} strokeWidth={4} />
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Tool Suite */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                 <div className="bg-emerald-50 p-2 rounded-xl text-[#00D09C]"><Layers size={18} /></div>
                 Botanical Suite
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {tools.map((tool) => (
                <button key={tool.id} onClick={() => onNavigate?.(tool.tab)} className={`bg-white p-6 rounded-[3rem] shadow-sm flex flex-col items-start text-left active:scale-[0.97] transition-all group relative border-2 ${tool.isPro && !isSubscribed ? 'border-amber-100' : 'border-gray-50'}`}>
                  {tool.isPro && !isSubscribed && <div className="absolute top-5 right-5 bg-amber-100 text-amber-700 p-2 rounded-xl flex items-center gap-1.5 shadow-sm"><Crown size={12} fill="currentColor" /></div>}
                  <div className={`${tool.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-sm`}>{tool.icon}</div>
                  <h3 className="font-black text-gray-900 text-sm leading-tight mb-1">{tool.label}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{tool.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* RANDOMIZED PLANT TRICKS AND TIPS SECTION */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-[#00D09C] to-emerald-600 rounded-[3.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-100 group">
              <div className="absolute top-0 right-0 p-6 opacity-20"><Wand2 size={80} strokeWidth={1} /></div>
              <div className="relative z-10">
                <div className="bg-white/20 w-fit p-3 rounded-2xl mb-4 backdrop-blur-md"><Sparkle size={20} /></div>
                <div className="flex justify-between items-end mb-8">
                   <div>
                     <h3 className="text-2xl font-black mb-1 tracking-tight italic uppercase">Plant Tricks & Tips</h3>
                     <p className="text-emerald-50 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Professional Lab Notes</p>
                   </div>
                   <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-white/40 rounded-full"></div>)}
                   </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {randomizedTips.map((tip) => (
                    <div key={tip.id} className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[2rem] flex items-center gap-5 hover:bg-white/20 transition-all cursor-default">
                       <div className="bg-white text-[#00D09C] p-3 rounded-2xl shadow-lg flex-shrink-0">
                          {tip.icon}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                             <h4 className="font-black text-xs uppercase tracking-wider truncate">{tip.title}</h4>
                             <span className="text-[7px] font-black bg-white/20 px-2 py-0.5 rounded-lg uppercase tracking-widest">{tip.tag}</span>
                          </div>
                          <p className="text-emerald-50 text-[11px] font-medium leading-tight opacity-90 line-clamp-2 italic">
                            {tip.desc}
                          </p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PLANT DID YOU KNOW? */}
          <div className="mb-12">
            <div className="bg-white border-2 border-emerald-50 rounded-[3rem] p-8 relative group shadow-sm">
               <div className="flex items-start gap-6">
                  <div className="bg-amber-50 text-amber-500 p-4 rounded-2xl shadow-inner"><Lightbulb size={24} fill="currentColor" /></div>
                  <div>
                    <span className="text-[10px] font-black text-[#00D09C] uppercase tracking-[0.3em] mb-1 block">Flora Trivia</span>
                    <h3 className="text-lg font-black text-gray-900 leading-tight mb-3">Did You Know?</h3>
                    <p className="text-gray-500 text-xs font-bold leading-relaxed italic border-l-4 border-emerald-100 pl-4 py-1">
                      Some specimens like the "Monstera" actually develop holes in their leaves to survive high-velocity winds in tropical rain forests.
                    </p>
                  </div>
               </div>
               <div className="absolute -bottom-2 -right-2 bg-emerald-50 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><BookOpenCheck size={16} className="text-[#00D09C]" /></div>
            </div>
          </div>

          {/* TRENDING PLANTS (NOW AT BOTTOM WITH DETAILS) */}
          <div className="mb-8">
             <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-2">
                   <TrendingUp size={16} className="text-rose-500" />
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trending Specimens</h3>
                </div>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Live Updates</span>
             </div>
             <div className="space-y-4">
                {databasePlants.slice(0, 4).map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSearchSubmit(p.name)} 
                    className="w-full bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 group active:scale-[0.98] transition-all text-left"
                  >
                     <div className="relative w-20 h-20 flex-shrink-0">
                        <img src={p.img} className="w-full h-full rounded-[1.8rem] object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                        <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl shadow-md text-[#00D09C]">
                           <Sparkle size={12} fill="currentColor" />
                        </div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-base font-black text-gray-900 truncate tracking-tight mb-0.5">{p.name}</h4>
                        <p className="text-[9px] text-gray-400 font-bold italic truncate mb-2">{p.scientific}</p>
                        <div className="flex items-center gap-3">
                           <span className="text-[8px] font-black text-[#00D09C] bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                             {p.care} Care
                           </span>
                           <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                              View Details <ChevronRight size={10} strokeWidth={4} />
                           </span>
                        </div>
                     </div>
                  </button>
                ))}
             </div>
          </div>

        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-50px); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translateY(50px); opacity: 1; }
          80% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;
