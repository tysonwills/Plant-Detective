
import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Info, ClipboardList, Leaf, MapPin, BookOpen, X, Sparkles, Plus, Crown, Camera, Lightbulb, Droplets, Zap, Shovel, MessageSquare, Scan, Aperture, Fingerprint, Microscope, Beaker, Activity, Dna, Layers, Target, Cpu } from 'lucide-react';

interface HomeScreenProps {
  onNavigate?: (tab: string) => void;
  onSearch?: (query: string) => void;
  onAddToGarden?: (name: string, species: string) => void;
  onScanClick?: () => void;
  onShowTerms?: () => void;
  isSubscribed?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onSearch, onAddToGarden, onScanClick, onShowTerms, isSubscribed }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const databasePlants = [
    { id: 1, name: 'Monstera Deliciosa', img: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=400&h=600&auto=format&fit=crop', care: 'Easy' },
    { id: 2, name: 'Snake Plant', img: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?q=80&w=400&h=600&auto=format&fit=crop', care: 'Low' },
    { id: 3, name: 'Fiddle Leaf Fig', img: 'https://images.unsplash.com/photo-1520412099551-6296b0db5c04?q=80&w=400&h=600&auto=format&fit=crop', care: 'Hard' },
    { id: 4, name: 'Aloe Vera', img: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=400&h=600&auto=format&fit=crop', care: 'Low' },
    { id: 5, name: 'Peace Lily', img: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?q=80&w=400&h=600&auto=format&fit=crop', care: 'Medium' },
  ];

  const filteredPlants = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return databasePlants.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const facts = [
    "Some plants, like the Bamboo, can grow up to 3 feet in a single day!",
    "The world's largest flower, the Rafflesia arnoldii, can grow to 3 feet across.",
    "Sunflowers aren't just one flower; they're made of thousands of tiny flowers.",
    "A tree can absorb as much as 48 pounds of carbon dioxide per year."
  ];

  const tricks = [
    {
      title: "The Cinnamon Trick",
      desc: "Dust a little cinnamon on the soil of seedlings to prevent 'damping off' disease and fungal growth.",
      icon: <Sparkles size={18} />,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Banana Peel Boost",
      desc: "Bury dried banana peels in the soil for a natural potassium boost that flowers love.",
      icon: <Zap size={18} />,
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      title: "Self-Watering Hack",
      desc: "Fill a wine bottle with water and flip it quickly into the soil for a slow-release watering system.",
      icon: <Droplets size={18} />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Pencil Moisture Test",
      desc: "Stick a wooden pencil 2 inches into the soil. If it comes out clean, it's time to water.",
      icon: <Shovel size={18} />,
      color: "bg-emerald-50 text-emerald-600"
    }
  ];

  const tools = [
    { 
      id: 'garden', 
      label: 'My Garden', 
      desc: 'Track care', 
      icon: <Leaf size={20} />, 
      color: 'bg-emerald-50 text-emerald-500', 
      tab: 'my-plants',
      isPro: true
    },
    { 
      id: 'diagnose', 
      label: 'Plant Doctor', 
      desc: 'Diagnose health', 
      icon: <ClipboardList size={20} />, 
      color: 'bg-rose-50 text-rose-500', 
      tab: 'diagnose',
      isPro: true
    },
    { 
      id: 'stores', 
      label: 'Nearby Stores', 
      desc: 'Find supplies', 
      icon: <MapPin size={20} />, 
      color: 'bg-blue-50 text-blue-500', 
      tab: 'stores',
      isPro: true
    },
    { 
      id: 'care', 
      label: 'Ask an Expert', 
      desc: 'Personalized help', 
      icon: <MessageSquare size={20} />, 
      color: 'bg-amber-50 text-amber-500', 
      tab: 'chat',
      isPro: true
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleScanInteraction = () => {
    if (isSubscribed) {
      onScanClick?.();
    } else {
      onNavigate?.('upsell');
    }
  };

  return (
    <div className="px-6 pt-4 pb-8">
      {!searchQuery && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">Identify, Heal & Grow</h2>
          <p className="text-gray-500 font-medium text-sm">Welcome back to your botanical journey.</p>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className={`relative mb-6 transition-all duration-500 ${searchQuery ? 'mt-4' : ''}`}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for plants..." 
          className="w-full bg-white border-none py-4 pl-12 pr-12 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-[#00D09C] transition-shadow text-sm"
        />
        {searchQuery && (
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {searchQuery.trim() && (
        <div className="space-y-4 mb-8 animate-in fade-in duration-300">
           {filteredPlants.length > 0 && (
             <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
               {filteredPlants.map(plant => (
                 <button 
                  key={plant.id}
                  onClick={() => onSearch?.(plant.name)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                 >
                   <img src={plant.img} className="w-12 h-12 rounded-xl object-cover" alt="" />
                   <div className="flex-1">
                     <p className="text-sm font-bold text-gray-900">{plant.name}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{plant.care} Care</p>
                   </div>
                   <ChevronRight size={16} className="text-gray-300" />
                 </button>
               ))}
             </div>
           )}
           
           <button 
              onClick={() => onSearch?.(searchQuery)}
              className="w-full bg-[#00D09C] border border-[#00D09C] p-5 rounded-[2rem] flex items-center justify-between text-white active:scale-[0.98] transition-all shadow-lg shadow-[#00D09C33]"
            >
              <div className="flex items-center gap-4">
                <Sparkles size={20} className="text-white" />
                <span className="text-sm font-bold uppercase tracking-wider">Analyze "{searchQuery}" with AI</span>
              </div>
              <ChevronRight size={20} />
            </button>
        </div>
      )}

      {/* CRYSTAL BIO-INTERFACE Identification Card with App Green Border */}
      {!searchQuery && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <button 
            onClick={handleScanInteraction}
            className="w-full bg-white rounded-[3.5rem] p-8 text-left relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,208,156,0.2)] border-[3px] border-[#00D09C] group active:scale-[0.98] transition-all"
          >
            {/* Ambient Soft Glows */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100/30 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-50/40 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col gap-8 relative z-10">
              {/* Header: Pro Tag & Branding */}
              <div className="flex justify-between items-center">
                {!isSubscribed ? (
                  <div className="bg-amber-100/50 text-amber-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-amber-200 shadow-sm">
                    <Crown size={12} fill="currentColor" />
                    PRO SCANNER
                  </div>
                ) : (
                  <div className="bg-emerald-50 text-[#00D09C] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-emerald-100 shadow-sm">
                    <Activity size={12} />
                    SYSTEM LIVE
                  </div>
                )}
                <div className="text-gray-300 group-hover:text-emerald-300 transition-colors">
                  <Cpu size={20} />
                </div>
              </div>

              {/* Central Circular Aperture (Lighter) */}
              <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center">
                {/* Rotating Focus Ring */}
                <div className="absolute inset-0 border-2 border-dashed border-emerald-200 rounded-full animate-[spin_12s_linear_infinite]"></div>
                
                {/* Static Brackets */}
                <div className="absolute -inset-4 border border-emerald-100 rounded-full"></div>
                
                {/* Luminous Inner Core (Lighter) */}
                <div className="w-40 h-40 bg-gradient-to-br from-emerald-50 to-white rounded-full flex items-center justify-center relative shadow-[inset_0_2px_10px_rgba(0,208,156,0.05)] border border-emerald-50">
                  <div className="absolute inset-0 rounded-full border border-emerald-100/50 group-hover:scale-110 transition-transform duration-700"></div>
                  
                  {/* Pulse Rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-100 animate-ping opacity-20"></div>
                  
                  {/* Main Icon pod */}
                  <div className="bg-white p-7 rounded-[2.5rem] shadow-xl relative group-hover:rotate-12 transition-transform duration-500 ring-4 ring-[#00D09C]/5 border border-gray-50">
                    <Camera size={44} className="text-[#00D09C]" />
                    <div className="absolute -top-2 -right-2 bg-[#00D09C] p-2 rounded-xl text-white shadow-lg">
                      <Leaf size={16} fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Micro Metadata Labels */}
                <div className="absolute top-0 right-0 translate-x-4 -translate-y-2 flex flex-col items-start gap-1">
                   <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">LENS.CALIB</span>
                   <div className="w-8 h-[2px] bg-emerald-100"></div>
                </div>
                <div className="absolute bottom-4 left-0 -translate-x-6 flex flex-col items-end gap-1">
                   <div className="flex gap-0.5">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-emerald-300 rounded-full"></div>)}
                   </div>
                   <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">BIO.READ</span>
                </div>
              </div>

              {/* Bottom Content Area */}
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 leading-none">Identify Specimen</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Initiate neural botanical scan</p>
                
                <div className={`w-full py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${
                  !isSubscribed ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-[#00D09C] text-white shadow-xl shadow-emerald-100'
                }`}>
                  {isSubscribed ? 'Analyze Specimen' : 'Access Bio-Labs'}
                  <ChevronRight size={18} strokeWidth={4} className="group-hover:translate-x-3 transition-transform" />
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Toolbox Section */}
      {!searchQuery && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
               <div className="bg-emerald-50 p-2 rounded-xl text-[#00D09C]"><Layers size={18} /></div>
               Botanical Suite
            </h2>
            <span className="text-[10px] font-bold text-[#00D09C] uppercase tracking-[0.2em]">Management</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {tools.map((tool) => (
              <button 
                key={tool.id}
                onClick={() => onNavigate?.(tool.tab)}
                className={`bg-white p-6 rounded-[3rem] shadow-sm flex flex-col items-start text-left active:scale-[0.97] transition-all group relative border-2 ${tool.isPro && !isSubscribed ? 'border-amber-100' : 'border-gray-50'}`}
              >
                {tool.isPro && !isSubscribed && (
                  <div className="absolute top-5 right-5 bg-amber-100 text-amber-700 p-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Crown size={12} fill="currentColor" />
                    <span className="text-[8px] font-black uppercase">PRO</span>
                  </div>
                )}
                <div className={`${tool.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  {tool.icon}
                </div>
                <h3 className="font-black text-gray-900 text-sm leading-tight mb-1">{tool.label}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Area with Tips & Facts */}
      {!searchQuery && (
        <>
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3 px-1">
              <Lightbulb size={20} className="text-amber-500" />
              Cultivation Secrets
            </h2>
            <div className="flex flex-col gap-5">
              {tricks.map((trick, i) => (
                <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-100 flex gap-6 shadow-sm active:scale-[0.99] transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/30 rounded-full -mr-8 -mt-8"></div>
                  <div className={`${trick.color} p-4 h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner`}>
                    {trick.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-base mb-1 leading-tight tracking-tight">{trick.title}</h3>
                    <p className="text-gray-500 text-xs font-bold leading-relaxed">{trick.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3 px-1">
              <Info size={20} className="text-[#00D09C]" />
              Botanical Trivia
            </h2>
            <div className="space-y-5">
              {facts.map((fact, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex gap-5 shadow-sm group">
                  <div className="bg-emerald-50 text-[#00D09C] p-3.5 h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D09C] group-hover:text-white transition-all duration-500">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-gray-600 text-sm font-bold leading-relaxed">{fact}</p>
                </div>
              ))}
            </div>
          </div>

          <footer className="text-center py-12 border-t border-gray-100">
            <div className="inline-flex bg-emerald-50 p-2 rounded-xl text-[#00D09C] mb-4">
              <Leaf size={24} />
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">
              FLORAID ECOSYSTEM
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <button onClick={onShowTerms} className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b-2 border-transparent hover:border-gray-200 pb-1">Terms</button>
              <button onClick={onShowTerms} className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b-2 border-transparent hover:border-gray-200 pb-1">Privacy</button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default HomeScreen;
