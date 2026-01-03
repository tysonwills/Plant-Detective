import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Droplets, Sun, Sprout, ShieldAlert, Heart, Share2, Info, Lightbulb, CheckCircle, Leaf, Plus, Check, ChevronRight, Thermometer, AlertCircle, Sparkles, MapPin, ShoppingBag, Camera, X, RefreshCw, Bell, Clock, Shovel, Scissors, Calendar, Wind, FlaskConical, PartyPopper, Beaker, Mountain, Zap, Activity, Ruler, MoveUp, BarChart3, Waves, Sparkle, Wind as MistIcon, CheckCircle2, Scan, AlertTriangle, Stethoscope, HelpCircle, Copy } from 'lucide-react';
import { IdentificationResponse, WikiImage, Reminder } from '../types';

interface PlantResultScreenProps {
  data: IdentificationResponse;
  images: WikiImage[];
  onAddToGarden: (name: string, species: string, img?: string) => void;
  onBack: () => void;
  onAddReminder?: void;
  onCompleteTask?: (type: string) => void;
  onSearchSimilar?: (query: string) => void;
  onFindStores?: () => void;
  hideAddButton?: boolean;
  reminders?: Reminder[];
  completedTasks?: string[];
}

const PlantResultScreen: React.FC<PlantResultScreenProps> = ({ 
  data, 
  images, 
  onAddToGarden, 
  onBack, 
  onAddReminder,
  onCompleteTask,
  onSearchSimilar,
  onFindStores,
  hideAddButton, 
  reminders = [],
  completedTasks = []
}) => {
  const { identification, care, commonProblems = [], similarPlants = [] } = data;
  const [activeImg, setActiveImg] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLightChecker, setShowLightChecker] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Load and persist "Liked" state
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('flora_favorites') || '[]');
    const isFav = favorites.some((f: any) => f.scientificName === identification.scientificName);
    setIsLiked(isFav);
  }, [identification.scientificName]);

  const toggleLike = () => {
    const favorites = JSON.parse(localStorage.getItem('flora_favorites') || '[]');
    let newFavorites;
    
    if (isLiked) {
      newFavorites = favorites.filter((f: any) => f.scientificName !== identification.scientificName);
      showToast('Removed from Favorites', 'info');
    } else {
      const newFav = {
        scientificName: identification.scientificName,
        commonName: identification.commonName,
        image: images[0]?.imageUrl,
        timestamp: new Date().toISOString()
      };
      newFavorites = [newFav, ...favorites];
      showToast('Added to Favorites!', 'success');
    }
    
    localStorage.setItem('flora_favorites', JSON.stringify(newFavorites));
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Check out this ${identification.commonName}!`,
      text: `I just identified a ${identification.commonName} (${identification.scientificName}) using FloraID. It's a beautiful ${identification.genus} plant!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!', 'success');
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      // Fallback: Copy to clipboard
      const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(textToCopy);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const showToast = (message: string, type: 'success' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNext = () => {
    setActiveImg((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveImg((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-32 bg-[#F8FAFB] relative">
      {/* Aesthetic Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border border-white/20 ${
            toast.type === 'success' ? 'bg-[#00D09C] text-white' : 'bg-gray-800 text-white'
          }`}>
            {toast.type === 'success' ? <Sparkles size={16} /> : <Info size={16} />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

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
            onClick={toggleLike}
            className={`bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm active:scale-125 transition-all duration-300 ${isLiked ? 'text-rose-500' : 'text-gray-800'}`}
          >
            <Heart size={24} className={isLiked ? "fill-rose-500" : ""} />
          </button>
          <button 
            onClick={handleShare}
            className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm text-gray-800 active:scale-90 transition-transform"
          >
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* Hero Image Slider */}
      <div className="relative h-[55vh] bg-gray-900 group/slider overflow-hidden">
        {images.length > 0 ? (
          <>
            <div className="absolute inset-0 flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeImg * 100}%)` }}>
              {images.map((img, i) => (
                <div key={i} className="min-w-full h-full">
                  <img 
                    src={img.imageUrl} 
                    alt={`${identification.commonName} view ${i + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover/slider:opacity-100 transition-opacity active:scale-90"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover/slider:opacity-100 transition-opacity active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImg(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${activeImg === i ? 'w-10 bg-[#00D09C] shadow-lg shadow-[#00D09C44]' : 'w-2 bg-white/40'}`} 
                />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F8FAFB] via-[#F8FAFB]/40 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50">
            <Sprout size={64} className="text-emerald-200 animate-pulse" />
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="px-8 -mt-12 relative z-10">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
             <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-[#00D09C] rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
              <CheckCircle size={12} />
              Botanist Verified
            </div>
            {identification.isToxic && (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100/50">
                <ShieldAlert size={12} />
                Toxic Specimen
              </div>
            )}
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-2 leading-[0.9] tracking-tighter">{identification.commonName}</h1>
          <p className="text-[#00D09C] font-bold italic flex items-center gap-2 text-xl opacity-80">
            {identification.scientificName}
          </p>
        </div>

        {/* Unified Vital Statistics Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Vital Statistics</h2>
          <div className="flex flex-col gap-4">
            <VitalStatCard 
              label="Watering Schedule" 
              value={`Every ${care.wateringDaysInterval || 7} Days`} 
              totalSquares={care.wateringDaysInterval || 7}
              filledSquares={1} // Day 1 of the cycle
              icon={<Droplets size={22} />} 
              color="blue"
              howTo={`Drench the soil thoroughly until water escapes the drainage holes. ${care.watering}`}
            />
            <VitalStatCard 
              label="Fertilizer cycle" 
              value={`${care.fertilizerMonthsActive?.length || 0} Active Months`} 
              totalSquares={12}
              filledSquares={care.fertilizerMonthsActive || []}
              icon={<FlaskConical size={22} />} 
              color="amber"
              howTo={`Apply fertilizer during the specified months to promote robust cellular growth. ${care.fertilizer}`}
            />
            <VitalStatCard 
              label="Leaf cleaning" 
              value={`Weekly Hygiene`} 
              totalSquares={Math.ceil((care.cleaningDaysInterval || 14) / 7)}
              filledSquares={1}
              icon={<Sparkle size={22} />} 
              color="emerald"
              howTo={`Wipe leaf surfaces with a soft, damp cloth every week to remove dust and maximize photosynthesis efficiency.`}
            />
          </div>
        </div>

        {/* Biological Protocol Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Biological Protocol</h2>
          <div className="space-y-6">
            <SunCareCard 
              icon={<Sun size={32} />} 
              title="Light Exposure" 
              content={care.sunlight} 
              onCheck={() => setShowLightChecker(true)}
            />
            <div className="grid grid-cols-1 gap-6">
              <StaticCareCard 
                icon={<Droplets size={26} />} 
                title="Watering Needs" 
                content={care.watering} 
                color="bg-blue-50 text-blue-600"
              />
              <StaticCareCard 
                icon={<Wind size={26} />} 
                title="Environmental Humidity" 
                content={care.humidity} 
                color="bg-cyan-50 text-cyan-600"
              />
            </div>
          </div>
        </div>

        {/* Toxicity Alert - Repositioned and made less prominent */}
        {identification.isToxic && (
          <div className="bg-rose-50/50 p-7 rounded-[2.5rem] flex flex-col gap-5 mb-12 border-2 border-rose-100/50">
            <div className="flex gap-4 items-center">
              <div className="bg-rose-100 text-rose-500 p-3 rounded-2xl">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="text-rose-900 font-black text-lg tracking-tight leading-none mb-1">Safety Notice</h4>
                <p className="text-rose-700/70 text-[11px] font-bold uppercase tracking-wider">
                  Toxic to ingestion
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-[2rem] p-5 border border-rose-100/50 shadow-sm">
              <p className="text-gray-800 text-sm font-semibold leading-relaxed mb-4">
                {identification.toxicityWarning || "Harmful if ingested. Keep away from pets and children."}
              </p>
              
              {identification.toxicityAdvice && (
                <div className="bg-rose-50/50 rounded-2xl p-4 border-l-4 border-rose-400">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-rose-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Emergency Protocol</span>
                  </div>
                  <p className="text-rose-800 text-xs font-bold leading-relaxed">
                    {identification.toxicityAdvice}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thermal Comfort & Growth Scale Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6">
          <TemperatureRangeCard min={care.minTemp || 15} max={care.maxTemp || 30} descriptive={care.temperature} />
          <HeightScaleCard height={care.estimatedHeight || "1m"} />
        </div>

        {/* Common Problems Section */}
        {commonProblems.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
              <div className="bg-[#00D09C] p-2 rounded-xl text-white shadow-lg"><Stethoscope size={20} /></div>
              Common Challenges
            </h2>
            <div className="space-y-6">
              {commonProblems.map((problem, i) => (
                <div key={i} className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 group">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="bg-amber-50 text-amber-500 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                      <HelpCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 leading-tight mb-1">{problem.problem}</h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Diagnosis</p>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50/20 rounded-[2.5rem] p-6 border border-emerald-50/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-6 h-6 bg-[#00D09C] text-white rounded-full flex items-center justify-center">
                        <Check size={14} strokeWidth={4} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">Expert Solution</span>
                    </div>
                    <div className="space-y-3">
                      {problem.solution.split('\n').map((step, si) => (
                        <p key={si} className="text-gray-700 text-sm font-semibold leading-relaxed pl-3 border-l-2 border-[#00D09C]/30">
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botanical Composition / Growth Essentials */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
            <div className="bg-[#00D09C] p-2 rounded-xl text-white shadow-lg"><Beaker size={20} /></div>
            Botanical Composition
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border-2 border-emerald-50 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-50/50 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              <div className="flex items-center gap-6 mb-6 relative z-10">
                <div className="bg-emerald-50 text-emerald-600 w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner">
                  <Mountain size={28} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Substrate Recommendation</h4>
                  <p className="text-sm font-black text-gray-900">Premium Soil Mix</p>
                </div>
              </div>
              <p className="text-base font-semibold leading-relaxed text-gray-700 relative z-10">
                {care.soil}
              </p>
            </div>
            
             <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border-2 border-amber-50 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-50/50 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              <div className="flex items-center gap-6 mb-6 relative z-10">
                <div className="bg-amber-50 text-amber-600 w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner">
                  <Sun size={26} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Light Orientation</h4>
                  <p className="text-sm font-black text-gray-900">Best Placement</p>
                </div>
              </div>
              <p className="text-base font-semibold leading-relaxed text-gray-700 relative z-10">
                {care.bestPlacement}
              </p>
            </div>
          </div>
        </div>

        {/* Genetic Relatives Section */}
        {similarPlants.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
              <div className="bg-[#00D09C] p-2 rounded-xl text-white shadow-lg"><Sprout size={20} /></div>
              Genetic Relatives
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-8 -mx-8 px-8 scrollbar-hide">
              {similarPlants.map((plant, i) => (
                <button 
                  key={i}
                  onClick={() => onSearchSimilar?.(plant.scientificName || plant.name)}
                  className="flex-shrink-0 w-64 bg-white rounded-[4rem] overflow-hidden border border-gray-100 shadow-sm active:scale-95 transition-all text-left group"
                >
                  <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                    <img 
                      src={plant.imageUrl || `https://picsum.photos/seed/${plant.name}/400/300`} 
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  </div>
                  <div className="p-8">
                    <h4 className="font-black text-gray-900 text-lg truncate mb-1 leading-tight">{plant.name}</h4>
                    <p className="text-xs text-[#00D09C] font-bold italic mb-6 truncate opacity-70 tracking-tight">{plant.scientificName}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-hover:text-[#00D09C] transition-colors">
                      Discover <ChevronRight size={14} strokeWidth={3} className="text-[#00D09C]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Final Action Buttons */}
        <div className="flex flex-col gap-6 mb-12">
          {!hideAddButton && (
            <button 
              onClick={() => onAddToGarden(identification.commonName, identification.scientificName, images[0]?.imageUrl)}
              className="w-full bg-[#00D09C] py-8 rounded-[3.5rem] text-white font-black text-xl shadow-2xl shadow-[#00D09C44] active:scale-95 transition-transform flex items-center justify-center gap-5 border-b-8 border-emerald-700/20"
            >
              <Plus size={30} strokeWidth={4} />
              Add to My Garden
            </button>
          )}
          <button 
            onClick={onFindStores}
            className="w-full bg-white py-8 rounded-[3.5rem] text-[#00D09C] font-black text-xl border-4 border-[#00D09C] shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-5"
          >
            <ShoppingBag size={30} strokeWidth={4} />
            Find Local Supplies
          </button>
        </div>
      </div>

      {showLightChecker && (
        <LightMeterModal 
          targetLight={care.sunlight} 
          onClose={() => setShowLightChecker(false)} 
        />
      )}
    </div>
  );
};

interface VitalStatCardProps {
  label: string;
  value: string;
  totalSquares: number;
  filledSquares: number | number[]; 
  icon: React.ReactNode;
  color: 'blue' | 'amber' | 'emerald';
  howTo: string;
}

const VitalStatCard: React.FC<VitalStatCardProps> = ({ label, value, totalSquares, filledSquares, icon, color, howTo }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-500', bar: 'bg-blue-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500', bar: 'bg-amber-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', bar: 'bg-emerald-500' },
  };
  const theme = colorMap[color];

  const isSquareFilled = (index: number) => {
    if (Array.isArray(filledSquares)) {
      return filledSquares.includes(index);
    }
    return index < filledSquares;
  };

  return (
    <div className={`bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm group transition-all active:scale-[0.98] w-full flex flex-col gap-4 overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`${theme.bg} ${theme.text} p-3 rounded-2xl shadow-inner group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">{label}</h4>
            <p className="text-sm font-black text-gray-900 leading-none">{value}</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end max-w-[150px]">
          {[...Array(totalSquares)].map((_, i) => (
            <div 
              key={i} 
              className={`h-2.5 w-2.5 rounded-[3px] transition-all duration-700 ${
                isSquareFilled(i) ? theme.bar : 'bg-gray-100'
              }`} 
              style={{ transitionDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
      </div>
      <div className="bg-gray-50/50 p-4 rounded-[1.5rem] border border-gray-100/50">
        <p className="text-[11px] font-semibold text-gray-600 leading-tight italic">
          "{howTo.length > 100 ? howTo.substring(0, 97) + '...' : howTo}"
        </p>
      </div>
    </div>
  );
};

const StaticCareCard: React.FC<{ icon: React.ReactNode, title: string, content: string, color: string }> = ({ icon, title, content, color }) => (
  <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border-2 border-gray-100 group relative overflow-hidden">
    <div className="flex items-center gap-6 mb-6">
      <div className={`${color} w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">{title}</h4>
      </div>
    </div>
    <p className="text-base font-semibold leading-relaxed text-gray-700">
      {content}
    </p>
  </div>
);

const SunCareCard: React.FC<{ icon: React.ReactNode, title: string, content: string, onCheck: () => void }> = ({ icon, title, content, onCheck }) => (
  <div className="bg-gradient-to-br from-white to-amber-50/30 p-8 rounded-[3.5rem] shadow-lg border-2 border-amber-100 group relative overflow-hidden ring-4 ring-amber-500/5">
    <div className="absolute top-0 right-0 p-4">
      <div className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
        <Sparkles size={10} fill="currentColor" />
        Interactive Tool
      </div>
    </div>
    <div className="flex items-center gap-6 mb-6">
      <div className="bg-amber-100 text-amber-600 w-20 h-20 rounded-[2.2rem] flex items-center justify-center shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">{title}</h4>
        <p className="text-xl font-black text-gray-900 leading-none">Biological Requirement</p>
      </div>
    </div>
    <p className="text-lg font-semibold leading-relaxed text-gray-700 mb-8 border-l-4 border-amber-200 pl-6 py-2">
      {content}
    </p>
    <button 
      onClick={onCheck}
      className="w-full bg-amber-500 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn"
    >
      <Scan size={20} strokeWidth={3} className="group-hover/btn:rotate-12 transition-transform" />
      Measure Light Intensity
    </button>
  </div>
);

const TemperatureRangeCard: React.FC<{ min: number, max: number, descriptive: string }> = ({ min, max, descriptive }) => {
  const left = Math.max(0, Math.min(100, (min / 50) * 100));
  const rangeWidth = max - min;
  const width = Math.max(10, Math.min(100, (rangeWidth / 50) * 100));
  return (
    <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border-2 border-rose-50 overflow-hidden group">
      <div className="flex items-center gap-6 mb-8">
        <div className="bg-rose-50 text-rose-500 w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner flex-shrink-0 group-hover:rotate-12 transition-transform">
          <Thermometer size={26} />
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Thermal Comfort</h4>
          <p className="text-lg font-black text-gray-900 leading-none mt-1">{min}°C — {max}°C</p>
        </div>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-emerald-400 to-orange-400 opacity-20"></div>
        <div 
          className="absolute top-0 h-full bg-[#00D09C] rounded-full shadow-[0_0_12px_rgba(0,208,156,0.5)] border-2 border-white"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
      <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest px-1">
        <span>0°C</span>
        <span>25°C</span>
        <span>50°C</span>
      </div>
      <p className="mt-6 text-sm font-semibold leading-relaxed text-gray-600 italic">
        {descriptive}
      </p>
    </div>
  );
};

const HeightScaleCard: React.FC<{ height: string }> = ({ height }) => {
  return (
    <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border-2 border-emerald-50 overflow-hidden group">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-6">
          <div className="bg-emerald-50 text-[#00D09C] w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-inner flex-shrink-0 group-hover:-translate-y-1 transition-transform">
            <Ruler size={26} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Growth Potential</h4>
            <p className="text-lg font-black text-gray-900 leading-none mt-1">~{height}</p>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-2xl text-gray-300">
           <MoveUp size={20} />
        </div>
      </div>
      <div className="flex items-end gap-2 h-20 px-2">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`flex-1 rounded-t-full bg-emerald-100 transition-all duration-700 ${
            i < 8 ? 'bg-emerald-400' : 'bg-gray-100'
          }`} style={{ height: `${(i + 1) * 8}%` }} />
        ))}
        <div className="flex-none w-10 h-full flex flex-col justify-end items-center pb-2">
           <Sprout size={32} className="text-[#00D09C] animate-bounce" />
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-50">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Estimated Mature Height</p>
      </div>
    </div>
  );
};

interface LightMeterModalProps {
  targetLight: string;
  onClose: () => void;
}

const LightMeterModal: React.FC<LightMeterModalProps> = ({ targetLight, onClose }) => {
  const [brightness, setBrightness] = useState(0);
  const [level, setLevel] = useState<'Low' | 'Medium' | 'Bright' | 'Direct'>('Low');
  const [matchStatus, setMatchStatus] = useState<'Checking' | 'Too Low' | 'Perfect' | 'Too Bright'>('Checking');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        animationRef.current = requestAnimationFrame(processFrame);
      }
    } catch (err) {
      setError("Camera access is needed for environmental analysis.");
    }
  };

  const processFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let totalR = 0, totalG = 0, totalB = 0;
        for (let i = 0; i < data.length; i += 4) {
          totalR += data[i];
          totalG += data[i + 1];
          totalB += data[i + 2];
        }
        const avgBrightness = (totalR + totalG + totalB) / (data.length / 4 * 3);
        const normalized = Math.min(100, (avgBrightness / 255) * 100);
        setBrightness(normalized);
        let currentLevel: 'Low' | 'Medium' | 'Bright' | 'Direct' = 'Low';
        if (normalized < 25) currentLevel = 'Low';
        else if (normalized < 55) currentLevel = 'Medium';
        else if (normalized < 80) currentLevel = 'Bright';
        else currentLevel = 'Direct';
        setLevel(currentLevel);
        const target = targetLight.toLowerCase();
        let targetLvl: 'Low' | 'Medium' | 'Bright' | 'Direct' = 'Medium';
        if (target.includes('direct') || target.includes('full sun')) targetLvl = 'Direct';
        else if (target.includes('bright') || target.includes('high')) targetLvl = 'Bright';
        else if (target.includes('medium') || target.includes('partial')) targetLvl = 'Medium';
        else if (target.includes('low') || target.includes('shade')) targetLvl = 'Low';
        const levelWeights = { 'Low': 0, 'Medium': 1, 'Bright': 2, 'Direct': 3 };
        const currentWeight = levelWeights[currentLevel];
        const targetWeight = levelWeights[targetLvl];
        if (currentWeight === targetWeight) setMatchStatus('Perfect');
        else if (currentWeight < targetWeight) setMatchStatus('Too Low');
        else setMatchStatus('Too Bright');
      }
    }
    animationRef.current = requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    startCamera();
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[4rem] p-10 shadow-2xl relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-20 bg-gray-100 p-3 rounded-2xl text-gray-500 active:scale-90 transition-transform"
        >
          <X size={24} />
        </button>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
            <Zap size={12} fill="currentColor" />
            Calibration Mode
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1 leading-tight tracking-tight">Environmental Scan</h2>
          <p className="text-gray-400 text-xs font-bold italic">Requirement: {targetLight}</p>
        </div>
        {error ? (
          <div className="text-center py-12">
            <AlertCircle size={56} className="text-rose-500 mx-auto mb-6" />
            <p className="text-gray-900 font-bold mb-8 px-6 leading-relaxed">{error}</p>
            <button onClick={onClose} className="bg-gray-900 text-white px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl">Close Session</button>
          </div>
        ) : (
          <div className="space-y-8">
             <div className={`relative aspect-square rounded-[3.5rem] overflow-hidden border-8 shadow-2xl bg-black transition-all duration-700 ${
               matchStatus === 'Perfect' ? 'border-[#00D09C] ring-12 ring-[#00D09C]/10 scale-[1.05]' : 'border-white'
             }`}>
                <video ref={videoRef} className="w-full h-full object-cover opacity-80" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className={`bg-white/95 backdrop-blur-md px-10 py-4 rounded-[2rem] shadow-2xl border-4 transition-colors duration-500 ${
                     matchStatus === 'Perfect' ? 'border-[#00D09C]' : 'border-amber-400'
                   }`}>
                      <span className="text-4xl font-black text-gray-900 leading-none">{Math.round(brightness)}%</span>
                   </div>
                   <div className="mt-6 bg-black/50 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/20">
                      <p className="text-[11px] font-black text-white uppercase tracking-[0.3em]">{level} detected</p>
                   </div>
                </div>
             </div>
             <div className={`p-8 rounded-[3rem] border-4 flex flex-col items-center text-center transition-all duration-500 ${
                matchStatus === 'Perfect' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                matchStatus === 'Checking' ? 'bg-gray-50 border-gray-100 text-gray-400' :
                'bg-amber-50 border-amber-200 text-amber-700'
             }`}>
                {matchStatus === 'Perfect' ? (
                  <>
                    <div className="bg-[#00D09C] text-white p-3 rounded-full mb-4 shadow-lg animate-bounce">
                      <Check size={32} strokeWidth={4} />
                    </div>
                    <h4 className="font-black text-2xl tracking-tight text-[#00D09C] leading-tight">OPTIMAL POSITION</h4>
                    <p className="text-[11px] font-bold opacity-80 leading-relaxed mt-2 px-4">Luminosity match confirmed. This coordinate is perfect for biological growth.</p>
                  </>
                ) : (
                  <>
                    <AlertCircle size={48} className="mb-4" />
                    <h4 className="font-black text-xl leading-tight">{matchStatus === 'Checking' ? 'Initializing...' : matchStatus}</h4>
                    <p className="text-[11px] font-bold opacity-80 leading-relaxed mt-2 px-4">
                      {matchStatus === 'Too Low' ? "Insufficient photon intensity. Relocate toward natural apertures." : 
                       matchStatus === 'Too Bright' ? "Extreme intensity detected. Diffuse or withdraw from direct beams." :
                       "Analyzing photon flux and atmospheric luminosity..."}
                    </p>
                  </>
                )}
             </div>
             <div className="flex gap-4">
               <button 
                onClick={onClose}
                className="flex-1 bg-gray-900 text-white py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-black/20 active:scale-95 transition-transform"
               >
                 End Session
               </button>
               <button 
                onClick={() => window.location.reload()}
                className="bg-gray-100 p-6 rounded-[2rem] text-gray-400 active:rotate-180 transition-transform duration-700"
               >
                 <RefreshCw size={24} />
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantResultScreen;