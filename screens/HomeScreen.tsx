
import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Info, ClipboardList, Leaf, MapPin, BookOpen, X, Sparkles, Plus, Crown, Camera, Lightbulb, Droplets, Zap, Shovel } from 'lucide-react';

interface HomeScreenProps {
  onNavigate?: (tab: string) => void;
  onSearch?: (query: string) => void;
  onAddToGarden?: (name: string, species: string) => void;
  onScanClick?: () => void;
  isSubscribed?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onSearch, onAddToGarden, onScanClick, isSubscribed }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const databasePlants = [
    { id: 1, name: 'Monstera Deliciosa', img: 'https://picsum.photos/seed/monstera/400/600', care: 'Easy' },
    { id: 2, name: 'Snake Plant', img: 'https://picsum.photos/seed/snake/400/600', care: 'Low' },
    { id: 3, name: 'Fiddle Leaf Fig', img: 'https://picsum.photos/seed/fiddle/400/600', care: 'Hard' },
    { id: 4, name: 'Aloe Vera', img: 'https://picsum.photos/seed/aloe/400/600', care: 'Low' },
    { id: 5, name: 'Peace Lily', img: 'https://picsum.photos/seed/peace/400/600', care: 'Medium' },
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
      id: 'diagnose', 
      label: 'Plant Doctor', 
      desc: 'Diagnose health', 
      icon: <ClipboardList size={20} />, 
      color: 'bg-rose-50 text-rose-500', 
      tab: 'diagnose',
      isPro: true
    },
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
      label: 'Care Guide', 
      desc: 'Expert tips', 
      icon: <BookOpen size={20} />, 
      color: 'bg-amber-50 text-amber-500', 
      tab: 'home',
      isPro: false
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
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

      {/* Large Featured Add/Scan Card */}
      {!searchQuery && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <button 
            onClick={onScanClick}
            className="w-full bg-gradient-to-br from-[#00D09C] to-[#00A87E] rounded-[2.5rem] p-8 text-left relative overflow-hidden shadow-xl shadow-[#00D09C44] group active:scale-[0.98] transition-all"
          >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-8 -mb-8"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-12">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30">
                  <Camera size={32} className="text-white" />
                </div>
                {!isSubscribed && (
                  <div className="bg-[#FFF9E6]/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 text-white text-[9px] font-black uppercase tracking-wider border border-white/20">
                    <Crown size={10} fill="currentColor" className="text-[#D4AF37]" />
                    AI Powered
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Identify Any Plant</h2>
                <p className="text-white/80 text-xs font-bold leading-relaxed max-w-[200px] mb-6">
                  Snap a photo to get instant names, care guides, and expert diagnosis.
                </p>
                
                <div className="inline-flex items-center gap-2 bg-white text-[#00D09C] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
                  Start Scanning <Plus size={16} strokeWidth={3} />
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {searchQuery.trim() && (
        <button 
          onClick={() => onSearch?.(searchQuery)}
          className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-[1.5rem] mb-8 flex items-center justify-between text-emerald-700 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-[#00D09C]" />
            <span className="text-sm font-bold">Search "{searchQuery}" with AI</span>
          </div>
          <ChevronRight size={18} />
        </button>
      )}

      {!searchQuery && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex justify-between items-center px-1">
            Care Toolbox
            <span className="text-[10px] font-bold text-[#00D09C] uppercase tracking-widest">Manage</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {tools.map((tool) => (
              <button 
                key={tool.id}
                onClick={() => onNavigate?.(tool.tab)}
                className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-start text-left active:scale-[0.97] transition-all group relative"
              >
                {tool.isPro && !isSubscribed && (
                  <div className="absolute top-5 right-5 text-[#D4AF37]">
                    <Crown size={14} fill="currentColor" />
                  </div>
                )}
                <div className={`${tool.color} p-3 rounded-2xl mb-3 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-[13px] leading-tight">{tool.label}</h3>
                <p className="text-[9px] text-gray-400 font-medium">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {searchQuery && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Results for "{searchQuery}"</h2>
          
          {filteredPlants.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredPlants.map(plant => (
                <div 
                  key={plant.id} 
                  className="w-full flex items-center gap-4 p-3 bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 text-left relative group"
                >
                  <button onClick={() => onSearch?.(plant.name)} className="flex items-center w-full text-left">
                    <img src={plant.img} alt={plant.name} className="w-16 h-16 object-cover rounded-2xl group-hover:scale-105 transition-transform" />
                    <div className="flex-1 pl-4 pr-12">
                      <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight truncate">{plant.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-emerald-50 text-[#00D09C] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{plant.care} Care</span>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => onAddToGarden?.(plant.name, plant.name)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#00D09C] text-white p-2.5 rounded-2xl shadow-lg active:scale-90 transition-transform"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[3rem] text-center border border-dashed border-gray-200">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium">No botanical matches found.</p>
              <button 
                onClick={() => onSearch?.(searchQuery)}
                className="text-[#00D09C] text-xs font-bold mt-4 px-6 py-2 bg-[#EFFFFB] rounded-full active:scale-95 transition-transform"
              >
                Try AI Identification
              </button>
            </div>
          )}
        </div>
      )}

      {!searchQuery && (
        <>
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 px-1">
              <Lightbulb size={18} className="text-amber-500" />
              Gardening Tricks & Tips
            </h2>
            <div className="flex flex-col gap-4">
              {tricks.map((trick, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex gap-5 shadow-sm active:scale-[0.99] transition-all group">
                  <div className={`${trick.color} p-3.5 h-12 w-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {trick.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px] mb-1 leading-tight">{trick.title}</h3>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed">{trick.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 px-1">
              <Info size={18} className="text-[#00D09C]" />
              Did You Know?
            </h2>
            <div className="space-y-4">
              {facts.map((fact, i) => (
                <div key={i} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex gap-4 shadow-sm group">
                  <div className="bg-emerald-50 text-[#00D09C] p-2.5 h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D09C] group-hover:text-white transition-colors">
                    <Sparkles size={18} />
                  </div>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">{fact}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeScreen;
