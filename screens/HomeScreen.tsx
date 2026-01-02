
import React, { useState, useMemo } from 'react';
import { Search, Bell, ChevronRight, Info, ClipboardList, Leaf, MapPin, BookOpen, X, Sparkles, Plus } from 'lucide-react';

interface HomeScreenProps {
  onNavigate?: (tab: string) => void;
  onSearch?: (query: string) => void;
  onAddToGarden?: (name: string, species: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onSearch, onAddToGarden }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Keep this for search filtering logic, but we won't show it as "Featured" on home
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

  const tools = [
    { 
      id: 'diagnose', 
      label: 'Plant Doctor', 
      desc: 'Diagnose health', 
      icon: <ClipboardList size={24} />, 
      color: 'bg-rose-50 text-rose-500', 
      tab: 'diagnose' 
    },
    { 
      id: 'garden', 
      label: 'My Garden', 
      desc: 'Track care', 
      icon: <Leaf size={24} />, 
      color: 'bg-emerald-50 text-emerald-500', 
      tab: 'my-plants' 
    },
    { 
      id: 'stores', 
      label: 'Nearby Stores', 
      desc: 'Find supplies', 
      icon: <MapPin size={24} />, 
      color: 'bg-blue-50 text-blue-500', 
      tab: 'stores' 
    },
    { 
      id: 'care', 
      label: 'Care Guide', 
      desc: 'Expert tips', 
      icon: <BookOpen size={24} />, 
      color: 'bg-amber-50 text-amber-500', 
      tab: 'home' 
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="px-6 pt-12 pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">FloraID</h1>
          <p className="text-gray-500 font-medium">Identify. Heal. Grow.</p>
        </div>
        <button className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100">
          <Bell className="text-gray-400" size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for plants..." 
          className="w-full bg-white border-none py-4 pl-12 pr-12 rounded-3xl shadow-sm focus:ring-2 focus:ring-[#00D09C] transition-shadow text-sm"
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

      {/* AI Search Suggestion */}
      {searchQuery.trim() && (
        <button 
          onClick={() => onSearch?.(searchQuery)}
          className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-3xl mb-8 flex items-center justify-between text-emerald-700 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-[#00D09C]" />
            <span className="text-sm font-bold">Search "{searchQuery}" with AI</span>
          </div>
          <ChevronRight size={18} />
        </button>
      )}

      {/* Tools Section */}
      {!searchQuery && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Plant Tools</h2>
          <div className="grid grid-cols-2 gap-4">
            {tools.map((tool) => (
              <button 
                key={tool.id}
                onClick={() => onNavigate?.(tool.tab)}
                className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-start text-left active:scale-[0.97] transition-all"
              >
                <div className={`${tool.color} p-3 rounded-2xl mb-3`}>
                  {tool.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{tool.label}</h3>
                <p className="text-[10px] text-gray-400 font-medium">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results (Featured removed from default view) */}
      {searchQuery && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Search Results</h2>
          
          {filteredPlants.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredPlants.map(plant => (
                <div 
                  key={plant.id} 
                  className="w-full flex items-center gap-4 p-3 bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 text-left relative"
                >
                  <button onClick={() => onSearch?.(plant.name)} className="flex items-center w-full text-left">
                    <img src={plant.img} alt={plant.name} className="w-16 h-16 object-cover rounded-[1.5rem]" />
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
            <div className="bg-white p-8 rounded-[2.5rem] text-center border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">No plants found matching "{searchQuery}"</p>
              <button 
                onClick={() => onSearch?.(searchQuery)}
                className="text-[#00D09C] text-xs font-bold mt-2 underline"
              >
                Try AI Identification
              </button>
            </div>
          )}
        </div>
      )}

      {/* Did You Know Feed */}
      {!searchQuery && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Did You Know?</h2>
          <div className="space-y-4">
            {facts.map((fact, i) => (
              <div key={i} className="bg-[#EFFFFB] p-5 rounded-[2rem] border border-[#D9F9F0] flex gap-4">
                <div className="bg-[#00D09C] text-white p-2.5 h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Info size={18} />
                </div>
                <p className="text-gray-700 text-sm font-medium leading-relaxed">{fact}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
