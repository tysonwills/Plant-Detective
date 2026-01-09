
import React, { useState, useEffect } from 'react';
import { Heart, Search, Sprout, ArrowRight, Trash2, Leaf, Sparkles } from 'lucide-react';
import { IdentificationResponse, WikiImage } from '../types.ts';

interface FavoriteItem {
  scientificName: string;
  commonName: string;
  image: string;
  timestamp: string;
  fullData?: IdentificationResponse; // Cached data
  wikiImages?: WikiImage[]; // Cached wiki assets
}

interface FavoritesScreenProps {
  onPlantClick: (item: FavoriteItem) => void;
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ onPlantClick }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('flora_favorites') || '[]');
    setFavorites(saved);
  }, []);

  const removeFavorite = (e: React.MouseEvent, scientificName: string) => {
    e.stopPropagation();
    const updated = favorites.filter(f => f.scientificName !== scientificName);
    setFavorites(updated);
    localStorage.setItem('flora_favorites', JSON.stringify(updated));
  };

  const filteredFavorites = favorites.filter(f => 
    f.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-6 pt-4 pb-24 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">My Favourites</h2>
        <p className="text-gray-400 font-bold text-sm italic">{favorites.length} specimens curated</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Filter your collection..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-none py-4 pl-12 pr-6 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-[#00D09C] transition-shadow text-sm font-medium"
        />
      </div>

      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredFavorites.map((fav, i) => (
            <button 
              key={fav.scientificName}
              onClick={() => onPlantClick(fav)}
              className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm active:scale-[0.97] transition-all text-left group h-full animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="aspect-square w-full bg-gray-100 relative overflow-hidden">
                <img 
                  src={fav.image || `https://picsum.photos/seed/${fav.scientificName}/400/300`} 
                  alt={fav.commonName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <button 
                  onClick={(e) => removeFavorite(e, fav.scientificName)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-xl text-rose-500 shadow-lg active:scale-90 transition-transform"
                >
                  <Heart size={14} fill="currentColor" />
                </button>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h4 className="font-black text-gray-900 text-sm truncate mb-0.5 leading-tight group-hover:text-[#00D09C] transition-colors">{fav.commonName}</h4>
                <p className="text-[9px] text-gray-400 font-bold italic mb-4 truncate tracking-tight">{fav.scientificName}</p>
                
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-1 text-[#00D09C]">
                     <Sparkles size={10} />
                     <span className="text-[8px] font-black uppercase tracking-widest">Saved Info</span>
                   </div>
                   <div className="text-[#00D09C]">
                     <ArrowRight size={12} strokeWidth={3} />
                   </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-emerald-50 w-24 h-24 rounded-[3rem] flex items-center justify-center mb-6">
            <Leaf size={40} className="text-emerald-200" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No Favourites Yet</h3>
          <p className="text-gray-400 text-xs font-bold px-12 leading-relaxed italic">
            Tap the heart icon on any plant to save it to your private collection.
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoritesScreen;
