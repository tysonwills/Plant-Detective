
import React, { useState } from 'react';
import { ChevronLeft, Droplets, Sun, Sprout, Scissors, ShieldAlert, ExternalLink, Heart, Share2, Info, Lightbulb, CheckCircle, Bell, Leaf, Calendar, Plus, Clock, Check, ChevronRight } from 'lucide-react';
import { IdentificationResponse, WikiImage, Reminder } from '../types';

interface PlantResultScreenProps {
  data: IdentificationResponse;
  images: WikiImage[];
  onAddToGarden: (name: string, species: string, img?: string) => void;
  onBack: () => void;
  onAddReminder?: () => void;
  onCompleteTask?: (type: string) => void;
  onSearchSimilar?: (query: string) => void;
  hideAddButton?: boolean;
  reminders?: Reminder[];
  completedTasks?: string[]; // Track which tasks were done today
}

const PlantResultScreen: React.FC<PlantResultScreenProps> = ({ 
  data, 
  images, 
  onAddToGarden, 
  onBack, 
  onAddReminder,
  onCompleteTask,
  onSearchSimilar,
  hideAddButton, 
  reminders = [],
  completedTasks = []
}) => {
  const { identification, care, similarPlants = [] } = data;
  const [activeImg, setActiveImg] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-24 bg-[#F8FAFB]">
      {/* Top Action Bar */}
      <div className="absolute top-12 left-0 right-0 z-20 px-6 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm text-gray-800 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm text-gray-800 active:scale-90 transition-transform"
          >
            <Heart size={24} className={isLiked ? "fill-rose-500 text-rose-500" : ""} />
          </button>
          <button className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm text-gray-800 active:scale-90 transition-transform">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* Hero Image Slider */}
      <div className="relative h-[48vh] bg-gray-200">
        {images.length > 0 ? (
          <>
            <img 
              src={images[activeImg].imageUrl} 
              alt={identification.scientificName} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImg(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeImg === i ? 'w-8 bg-white shadow-md' : 'w-1.5 bg-white/40'}`} 
                />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F8FAFB] to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50">
            <Sprout size={64} className="text-emerald-200 animate-pulse" />
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="px-8 -mt-10 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#00D09C] rounded-full text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle size={12} />
              Botanist Verified
            </div>
            {hideAddButton && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00D09C] text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Leaf size={12} />
                In My Garden
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1 leading-tight">{identification.commonName}</h1>
          <p className="text-[#00D09C] font-semibold italic flex items-center gap-2 text-lg">
            {identification.scientificName}
            {images[activeImg]?.sourcePageUrl && (
              <a href={images[activeImg].sourcePageUrl} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#00D09C] transition-colors">
                <ExternalLink size={16} />
              </a>
            )}
          </p>
        </div>

        {/* Care Schedule Section */}
        {hideAddButton && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-[#00D09C]" size={20} />
              Care Schedule
            </h2>
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
              {reminders.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {reminders.map((rem) => (
                    <div key={rem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#EFFFFB] p-2 rounded-xl text-[#00D09C]">
                          <ReminderIcon type={rem.type} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{rem.type}</p>
                          <p className="text-[10px] text-gray-400">{rem.frequency} @ {rem.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#00D09C]">
                         <Clock size={12} />
                         <span className="text-[10px] font-bold">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 mb-4">
                  <p className="text-gray-400 text-xs italic">No reminders set for this plant yet.</p>
                </div>
              )}
              
              <button 
                onClick={onAddReminder}
                className="w-full bg-[#EFFFFB] text-[#00D09C] py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Plus size={18} />
                Add New Reminder
              </button>
            </div>
          </div>
        )}

        {identification.isToxic && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2.5rem] flex gap-4 mb-8">
            <ShieldAlert className="text-rose-500 flex-shrink-0" size={28} />
            <div>
              <h4 className="text-rose-900 font-bold text-sm">Toxicity Warning</h4>
              <p className="text-rose-700 text-xs mt-1 leading-relaxed font-medium">
                {identification.toxicityWarning || "Harmful to pets and children if ingested. Handle with care."}
              </p>
            </div>
          </div>
        )}

        {/* Vital Stats with Completion Toggle */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex justify-between items-center">
            Vital Stats
            {hideAddButton && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tap icons to complete</span>}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <CareDetailCard 
              icon={<Droplets size={22} />} 
              title="Watering" 
              content={care.watering} 
              color="bg-blue-50 text-blue-600"
              isDone={completedTasks.includes('Watering')}
              onToggle={() => hideAddButton && onCompleteTask?.('Watering')}
            />
            <CareDetailCard 
              icon={<Sun size={22} />} 
              title="Sunlight" 
              content={care.sunlight} 
              color="bg-orange-50 text-orange-600"
              isDone={completedTasks.includes('Sunlight')}
              onToggle={() => hideAddButton && onCompleteTask?.('Sunlight')}
            />
            <CareDetailCard 
              icon={<Sprout size={22} />} 
              title="Soil Type" 
              content={care.soil} 
              color="bg-emerald-50 text-emerald-600"
              isDone={completedTasks.includes('Soil Type')}
              onToggle={() => hideAddButton && onCompleteTask?.('Soil Type')}
            />
            <CareDetailCard 
              icon={<Scissors size={22} />} 
              title="Pruning" 
              content={care.pruning} 
              color="bg-purple-50 text-purple-600"
              isDone={completedTasks.includes('Pruning')}
              onToggle={() => hideAddButton && onCompleteTask?.('Pruning')}
            />
          </div>
        </div>

        {/* Expert Care Hints Section */}
        {care.hints && care.hints.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Lightbulb className="text-amber-500" size={20} />
              Expert Care Hints
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {care.hints.map((hint, i) => (
                <div key={i} className="bg-gradient-to-r from-amber-50 to-white p-5 rounded-[2rem] border border-amber-100/50 flex gap-4 items-start shadow-sm">
                  <div className="bg-amber-100 p-2 rounded-xl mt-0.5">
                    <SparklesIcon className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-sm text-amber-900 font-bold leading-relaxed">{hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Botanical Description</h2>
          <div className="bg-white p-7 rounded-[3rem] shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              {identification.description}
            </p>
          </div>
        </div>

        {/* Similar Plants Section */}
        {similarPlants.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Sprout className="text-[#00D09C]" size={20} />
              Similar Species
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
              {similarPlants.map((plant, i) => (
                <button 
                  key={i}
                  onClick={() => onSearchSimilar?.(plant.scientificName || plant.name)}
                  className="flex-shrink-0 w-48 bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm active:scale-95 transition-all text-left group"
                >
                  <div className="h-32 w-full bg-gray-100 relative">
                    <img 
                      src={`https://picsum.photos/seed/${plant.name}/300/200`} 
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5"></div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{plant.name}</h4>
                    <p className="text-[10px] text-[#00D09C] italic mb-2 truncate">{plant.scientificName}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Explore <ChevronRight size={10} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {!hideAddButton && (
          <button 
            onClick={() => onAddToGarden(identification.commonName, identification.scientificName, images[0]?.imageUrl)}
            className="w-full bg-[#00D09C] py-6 rounded-[2.5rem] text-white font-bold text-lg shadow-xl shadow-[#00D09C44] active:scale-95 transition-transform mb-12"
          >
            Add to My Garden
          </button>
        )}
      </div>
    </div>
  );
};

const ReminderIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'Water': return <Droplets size={14} />;
    case 'Fertilize': return <Leaf size={14} />;
    case 'Prune': return <Scissors size={14} />;
    case 'Mist': return <Calendar size={14} />;
    case 'Repot': return <Sprout size={14} />;
    default: return <Bell size={14} />;
  }
};

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
  </svg>
);

const CareDetailCard = ({ icon, title, content, color, isDone, onToggle }: any) => (
  <div 
    onClick={onToggle}
    className={`bg-white p-6 rounded-[2.5rem] shadow-sm border-2 transition-all cursor-pointer group relative overflow-hidden ${isDone ? 'border-[#00D09C] bg-[#EFFFFB]' : 'border-gray-100 hover:border-[#00D09C]'}`}
  >
    {isDone && (
      <div className="absolute top-3 right-3 bg-[#00D09C] text-white p-1 rounded-full animate-in zoom-in-50 duration-300">
        <Check size={12} strokeWidth={4} />
      </div>
    )}
    <div className={`${isDone ? 'bg-[#00D09C] text-white' : color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500`}>
      {icon}
    </div>
    <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDone ? 'text-[#00D09C]' : 'text-gray-400'}`}>{title}</h4>
    <p className={`text-xs font-bold line-clamp-3 leading-snug ${isDone ? 'text-gray-900' : 'text-gray-800'}`}>{content}</p>
    
    {isDone && (
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00D09C]"></div>
    )}
  </div>
);

export default PlantResultScreen;
