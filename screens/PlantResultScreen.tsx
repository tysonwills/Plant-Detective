
// ... keep imports same ...
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Droplets, Sun, Sprout, ShieldAlert, Heart, Share2, Info, Lightbulb, CheckCircle, Leaf, Plus, Check, ChevronRight, Thermometer, AlertCircle, Sparkles, MapPin, ShoppingBag, Camera, X, RefreshCw, Bell, Clock, Shovel, Scissors, Calendar, Wind, FlaskConical, PartyPopper, Beaker, Mountain, Zap, Activity, Ruler, MoveUp, BarChart3, Waves, Sparkle, Wind as MistIcon, CheckCircle2, Scan, AlertTriangle, Stethoscope, HelpCircle, Copy, ArrowRight, MessageCircle, Twitter, Facebook, Link, Microscope, Search, Fingerprint, Target, ImageIcon, Network, Globe, FileSearch, Image as ImageIconLucide, Mic, MicOff, Volume2, Maximize2, ZoomIn, ZoomOut, Grid3X3 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { IdentificationResponse, WikiImage, Reminder, PlacementAnalysis } from '../types';
import { analyzePlacement } from '../services/geminiService';

// --- Audio Helper Functions for Live API ---
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: arrayBufferToBase64(int16.buffer),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  base64String: string,
  ctx: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> {
  const bytes = base64ToUint8Array(base64String);
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length; 
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}
// ------------------------------------------

interface PlantResultScreenProps {
  data: IdentificationResponse | null;
  loading?: boolean;
  placeholderName?: string;
  images: WikiImage[];
  plantId?: string;
  onAddToGarden: (name: string, species: string, img?: string) => void;
  onBack: () => void;
  onAddReminder?: () => void;
  onCompleteTask?: (type: string) => void;
  onSearchSimilar?: (plant: any) => void;
  onFindStores?: () => void;
  hideAddButton?: boolean;
  reminders?: Reminder[];
  completedTasks?: string[];
}

const PlantResultScreen: React.FC<PlantResultScreenProps> = ({ 
  data, 
  loading = false,
  placeholderName = "",
  images, 
  plantId,
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
  const [activeImg, setActiveImg] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLightChecker, setShowLightChecker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  
  // Gallery State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryZoom, setGalleryZoom] = useState(false);

  useEffect(() => {
    setActiveImg(0);
    setImageLoaded({});
  }, [data?.identification?.scientificName]);

  useEffect(() => {
    if (data?.identification) {
      const favorites = JSON.parse(localStorage.getItem('flora_favorites') || '[]');
      const isFav = favorites.some((f: any) => f.scientificName === data.identification.scientificName);
      setIsLiked(isFav);
    }
  }, [data?.identification?.scientificName]);

  const toggleLike = () => {
    if (!data) return;
    const favorites = JSON.parse(localStorage.getItem('flora_favorites') || '[]');
    let newFavorites;
    
    if (isLiked) {
      newFavorites = favorites.filter((f: any) => f.scientificName !== data.identification.scientificName);
      showToast('Removed from Favorites', 'info');
    } else {
      const newFav = {
        scientificName: data.identification.scientificName,
        commonName: data.identification.commonName,
        image: images[0]?.imageUrl,
        timestamp: new Date().toISOString(),
        fullData: data,
        wikiImages: images
      };
      newFavorites = [newFav, ...favorites];
      showToast('Added to Favorites!', 'success');
    }
    
    localStorage.setItem('flora_favorites', JSON.stringify(newFavorites));
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    if (!data) return;
    if (navigator.share) {
      const shareData = {
        title: `Check out this ${data.identification.commonName}!`,
        text: `I just identified a ${data.identification.commonName} (${data.identification.scientificName}) using PlantHound. Verified via WFO.`,
        url: window.location.href
      };
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!', 'success');
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const showToast = (message: string, type: 'success' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImg((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImg((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  const hasBotanicalData = !!data?.identification;

  if (!hasBotanicalData && (loading || !data)) {
    return (
      <div className="animate-in fade-in duration-500 pb-32 bg-[#F2F4F7] relative min-h-screen">
        <div className="absolute top-12 left-0 right-0 z-20 px-6 flex justify-between items-center">
          <button onClick={onBack} className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm text-gray-800"><ChevronLeft size={24} /></button>
        </div>
        <div className="relative h-[55vh] bg-gray-100 overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
           <div className="relative z-10 flex flex-col items-center gap-4 opacity-40">
              <div className="bg-white/50 p-6 rounded-[2.5rem] shadow-sm animate-pulse">
                <ImageIcon size={48} className="text-gray-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Cross-referencing WFO Backbone</span>
           </div>
        </div>
        <div className="px-8 -mt-12 relative z-10">
          <div className="mb-10 bg-white p-8 rounded-[3rem] shadow-sm border border-emerald-50">
             <div className="w-24 h-5 bg-emerald-50 rounded-full mb-4 animate-pulse"></div>
             <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight tracking-tighter">
                {placeholderName || "Identifying..."}
             </h1>
          </div>
        </div>
      </div>
    );
  }

  const { identification, care, commonProblems = [], similarPlants = [] } = data!;
  const confidenceScore = identification.confidence ? (identification.confidence < 1 ? Math.round(identification.confidence * 100) : identification.confidence) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-32 bg-[#F2F4F7] relative">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border border-white/20 ${toast.type === 'success' ? 'bg-[#00D09C] text-white' : 'bg-gray-800 text-white'}`}>
            {toast.type === 'success' ? <Sparkles size={16} /> : <Info size={16} />}
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Buttons */}
      <div className="absolute top-12 left-0 right-0 z-20 px-6 flex justify-between items-center pointer-events-none">
        <button onClick={onBack} className="pointer-events-auto bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm text-gray-800 active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3 pointer-events-auto">
          <button onClick={toggleLike} className={`bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm active:scale-125 transition-all duration-300 ${isLiked ? 'text-rose-500' : 'text-gray-800'}`}>
            <Heart size={24} className={isLiked ? "fill-rose-500" : ""} />
          </button>
          <button onClick={handleShare} className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm text-gray-800 active:scale-90 transition-transform">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* Main Image Slider */}
      <div className="relative h-[55vh] bg-gray-900 overflow-hidden group">
        {images.length > 0 ? (
          <>
            <div 
               className="absolute inset-0 flex transition-transform duration-700 ease-out cursor-zoom-in" 
               style={{ transform: `translateX(-${activeImg * 100}%)` }}
               onClick={() => setIsGalleryOpen(true)}
            >
              {images.map((img, i) => (
                <div key={i} className="min-w-full h-full relative">
                  <img 
                    src={img.imageUrl} 
                    alt={`${identification.commonName} view ${i + 1}`} 
                    onLoad={() => handleImageLoad(i)} 
                    className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded[i] ? 'opacity-100' : 'opacity-0'}`} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              ))}
            </div>
            
            {/* Gallery Trigger Button */}
            <button 
              onClick={() => setIsGalleryOpen(true)}
              className="absolute top-12 right-28 bg-white/20 backdrop-blur-md text-white p-2.5 rounded-2xl z-20 hover:bg-white/30 transition-colors pointer-events-auto active:scale-95"
            >
               <Maximize2 size={24} />
            </button>
            
            {/* Slider Navigation */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full text-white/90 hover:bg-white/20 active:scale-90 transition-all z-20 border border-white/10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full text-white/90 hover:bg-white/20 active:scale-90 transition-all z-20 border border-white/10"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImg(i)} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${activeImg === i ? 'w-8 bg-white shadow-[0_0_10px_white]' : 'w-2 bg-white/40'}`} 
                />
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F2F4F7] via-[#F2F4F7]/40 to-transparent pointer-events-none"></div>
      </div>

      {/* FULL SCREEN LIGHTBOX GALLERY */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col">
           {/* Gallery Header */}
           <div className="px-6 py-6 flex justify-between items-center relative z-20">
              <div className="flex items-center gap-3 text-white/80">
                 <ImageIcon size={20} />
                 <span className="text-sm font-black uppercase tracking-widest">{activeImg + 1} / {images.length}</span>
              </div>
              <div className="flex gap-4">
                 <button 
                  onClick={() => setGalleryZoom(!galleryZoom)}
                  className={`p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${galleryZoom ? 'text-[#00D09C]' : 'text-white'}`}
                 >
                    {galleryZoom ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                 </button>
                 <button 
                  onClick={() => { setIsGalleryOpen(false); setGalleryZoom(false); }}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>
           </div>

           {/* Gallery Main Image Area */}
           <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <div className={`w-full h-full flex items-center justify-center transition-all duration-500 ${galleryZoom ? 'cursor-move overflow-auto' : ''}`}>
                 <img 
                   src={images[activeImg]?.imageUrl} 
                   alt="Gallery View"
                   className={`transition-all duration-500 ease-out max-h-full ${galleryZoom ? 'scale-150 cursor-grab active:cursor-grabbing' : 'w-full object-contain px-2'}`}
                   style={{ touchAction: galleryZoom ? 'none' : 'auto' }}
                 />
              </div>

              {!galleryZoom && (
                <>
                  <button onClick={handlePrev} className="absolute left-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10">
                    <ChevronLeft size={32} />
                  </button>
                  <button onClick={handleNext} className="absolute right-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10">
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
           </div>

           {/* Gallery Footer Thumbnails */}
           <div className="px-6 py-8 relative z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                 {images.map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => { setActiveImg(i); setGalleryZoom(false); }}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-[#00D09C] scale-110 shadow-[0_0_15px_#00D09C]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                       <img src={img.imageUrl} className="w-full h-full object-cover" alt="thumb" />
                    </button>
                 ))}
              </div>
              <div className="text-center mt-2">
                 <h3 className="text-white font-black text-lg">{identification.commonName}</h3>
                 <p className="text-white/50 text-xs font-bold uppercase tracking-widest">{identification.scientificName}</p>
              </div>
           </div>
        </div>
      )}

      <div className="px-8 -mt-12 relative z-10">
        {/* ... existing content ... */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
             <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#00D09C] text-white rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-lg">
              <CheckCircle size={12} />
              WFO Verified
            </div>
            
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 shadow-sm ${identification.taxonomicStatus === 'Accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <FileSearch size={12} />
              {identification.taxonomicStatus} Name
            </div>

            {identification.isToxic && (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-900 shadow-lg animate-pulse">
                <ShieldAlert size={12} />
                High Toxicity
              </div>
            )}
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-2 leading-[0.9] tracking-tighter">{identification.commonName}</h1>
          <p className="text-[#00D09C] font-bold italic flex items-center gap-2 text-xl opacity-80">
            {identification.scientificName}
          </p>
        </div>

        {/* ... (rest of the component unchanged) ... */}
        {/* Taxonomic Passport Card */}
        <div className="mb-12 bg-white rounded-[3.5rem] p-8 shadow-2xl border-2 border-emerald-50 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Network size={120} strokeWidth={1} />
           </div>
           <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-xl">
                 <Microscope size={28} />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">Taxonomic Passport</h2>
                 <p className="text-[#00D09C] text-[10px] font-black uppercase tracking-[0.3em]">WFO Clinical Baseline</p>
              </div>
           </div>

           {identification.taxonomicStatus === 'Synonym' && identification.acceptedName && (
             <div className="mb-8 p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-100 flex gap-4 items-start animate-in slide-in-from-top-2">
                <AlertTriangle size={24} className="text-amber-500 flex-shrink-0" />
                <div>
                   <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Taxonomic Warning</h4>
                   <p className="text-sm font-bold text-amber-900 leading-relaxed italic">
                    This name is a synonym. The accepted name according to WFO is: <span className="not-italic font-black text-[#00D09C]">{identification.acceptedName}</span>
                   </p>
                </div>
             </div>
           )}

           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">WFO Identifier</span>
                    <span className="text-sm font-black text-gray-900 tracking-tighter">{identification.wfoId}</span>
                 </div>
                 <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 overflow-hidden">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Native Range</span>
                    <span className="text-sm font-black text-gray-900 truncate leading-none flex items-center gap-2">
                       <Globe size={14} className="text-[#00D09C] flex-shrink-0" />
                       <span className="truncate">{identification.nativeRange}</span>
                    </span>
                 </div>
              </div>

              <div className="p-6 bg-white rounded-[2.5rem] border-2 border-gray-50 shadow-inner">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
                    <Network size={14} className="text-[#00D09C]" />
                    Phylogenetic Hierarchy
                 </h4>
                 <div className="space-y-4">
                    <HierarchyStep label="Family" value={identification.hierarchy.family} active />
                    <HierarchyStep label="Genus" value={identification.hierarchy.genus} active />
                    <HierarchyStep label="Species" value={identification.hierarchy.species} active last />
                 </div>
              </div>
           </div>
        </div>

        {/* Removed Neural Analysis Section as requested */}

        {/* Description Section */}
        <div className="mb-12 bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4 flex items-center gap-3">
            <Info size={24} className="text-emerald-500" />
            Botanical Description
          </h2>
          <p className="text-gray-700 font-semibold leading-relaxed">
            {identification.description}
          </p>
        </div>

        {/* Vital Statistics */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8">Vital Statistics</h2>
          <div className="flex flex-col gap-4">
            <VitalStatCard label="Watering Schedule" value={`Every ${care.wateringDaysInterval || 7} Days`} totalSquares={care.wateringDaysInterval || 7} filledSquares={1} icon={<Droplets size={22} />} color="blue" howTo={care.watering} />
            <VitalStatCard label="Fertilizer cycle" value={`${care.fertilizerMonthsActive?.length || 0} Active Months`} totalSquares={12} filledSquares={care.fertilizerMonthsActive || []} icon={<FlaskConical size={22} />} color="amber" howTo={care.fertilizer} />
            <VitalStatCard label="Soil chemistry" value={care.phRange || "Neutral"} totalSquares={14} filledSquares={Math.round(parseFloat(care.phRange || "7"))} icon={<Beaker size={22} />} color="emerald" howTo={care.soil} />
          </div>
        </div>

        {/* Thermal Comfort & Growth Potential */}
        <div className="grid grid-cols-1 gap-6 mb-12">
           <TemperatureRangeCard min={care.minTemp || 15} max={care.maxTemp || 30} descriptive={care.temperature} />
           <HeightScaleCard height={care.estimatedHeight || "1m"} />
        </div>

        {/* Biological Protocol */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Biological Protocol</h2>
          <div className="space-y-6">
            <SunCareCard icon={<Sun size={32} />} title="Light Exposure" content={care.sunlight} onCheck={() => setShowLightChecker(true)} />
            
            <StaticCareCard 
              icon={<Droplets size={26} />} 
              title="Watering Needs" 
              content={care.watering} 
              color="bg-blue-50 text-blue-600"
            >
                {care.seasonalCare && (
                    <div>
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Seasonal Adjustment</h5>
                        <p className="text-sm font-medium text-gray-600 italic">{care.seasonalCare}</p>
                    </div>
                )}
            </StaticCareCard>
            
            <StaticCareCard icon={<Wind size={26} />} title="Environmental Humidity" content={care.humidity} color="bg-cyan-50 text-cyan-600" />
          </div>
        </div>

        {/* Common Challenges Section */}
        {commonProblems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
               <div className="bg-amber-50 p-2 rounded-xl text-amber-500"><AlertCircle size={20} /></div>
               Common Challenges
            </h2>
            <div className="space-y-4">
              {commonProblems.map((prob, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4">
                   <div className="flex items-start gap-4">
                      <div className="bg-amber-50 p-3 rounded-2xl text-amber-500 flex-shrink-0">
                          <AlertTriangle size={20} />
                      </div>
                      <div>
                          <h4 className="font-black text-gray-900 text-lg leading-tight mb-1">{prob.problem}</h4>
                          <p className="text-[11px] text-gray-500 font-bold italic">{prob.description}</p>
                      </div>
                   </div>
                   <div className="bg-emerald-50/50 p-4 rounded-[1.5rem] border border-emerald-100/50">
                      <p className="text-[9px] font-black text-[#00D09C] uppercase tracking-widest mb-1 flex items-center gap-1">
                        <CheckCircle size={10} /> Clinical Remedy
                      </p>
                      <p className="text-[11px] font-bold text-gray-600 leading-tight">{prob.solution}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botanical Composition */}
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
              
              <div className="mt-6 pt-6 border-t border-emerald-50 grid grid-cols-2 gap-4 relative z-10">
                 <div>
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">pH Balance</h5>
                    <p className="text-sm font-bold text-gray-700">{care.phRange || "Neutral (6.0-7.0)"}</p>
                 </div>
                 <div>
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">Propagation</h5>
                    <p className="text-sm font-bold text-gray-700 truncate">{care.propagation || "Stem Cuttings"}</p>
                 </div>
              </div>
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
              
              <div className="mt-6 pt-6 border-t border-amber-50 relative z-10">
                 <div className="flex items-center gap-3 bg-amber-50/50 p-4 rounded-2xl">
                    <Globe size={16} className="text-amber-500" />
                    <div>
                        <h5 className="text-[8px] font-black uppercase tracking-widest text-amber-400 mb-0.5">Native Region</h5>
                        <p className="text-xs font-bold text-gray-700">{care.nativeRegion || "Tropical Regions"}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toxicity Section - Expanded */}
        {identification.isToxic && (
          <div className="bg-rose-100 p-7 rounded-[2.5rem] flex flex-col gap-5 mb-12 border-2 border-rose-200 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-200/50 rounded-full blur-2xl"></div>
            
            <div className="flex gap-4 items-center relative z-10">
              <div className="bg-rose-700 text-white p-3 rounded-2xl shadow-lg"><ShieldAlert size={24} /></div>
              <div>
                <h4 className="text-rose-950 font-black text-lg tracking-tight leading-none mb-1">Safety Notice</h4>
                <p className="text-rose-800 text-[11px] font-black uppercase tracking-wider">Clinical Grade Warning</p>
              </div>
            </div>
            
            <div className="bg-white rounded-[2rem] p-6 border border-rose-200 shadow-sm relative z-10">
              <p className="text-rose-950 text-sm font-black leading-relaxed mb-4">
                {identification.toxicityWarning}
              </p>
              
              {identification.toxicityAdvice && (
                 <div className="border-t-2 border-rose-50 pt-4 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                       <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Emergency Protocol</h5>
                    </div>
                    <p className="text-rose-800 text-xs font-bold leading-relaxed italic">
                       {identification.toxicityAdvice}
                    </p>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* Genetic Relatives */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
            <div className="bg-[#00D09C] p-2 rounded-xl text-white shadow-lg"><Microscope size={20} /></div>
            Genetic Relatives
          </h2>
          <div className="grid grid-cols-2 gap-5">
            {similarPlants.slice(0, 4).map((plant, i) => (
              <button 
                key={i}
                onClick={() => onSearchSimilar?.(plant)}
                className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm active:scale-[0.97] transition-all text-left group h-full relative ring-1 ring-gray-100 hover:ring-[#00D09C]/40 animate-in fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[4/5] w-full bg-gray-100 relative overflow-hidden">
                  <img 
                    src={plant.imageUrl || `https://picsum.photos/seed/${plant.name}/400/300`} 
                    alt={plant.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-800/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center">
                     <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl mb-3 shadow-xl ring-1 ring-white/30">
                        <Search className="text-white" size={24} />
                     </div>
                     <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] leading-tight">View Full Care Profile</span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1 bg-white relative z-10">
                  <h4 className="font-black text-gray-900 text-[13px] truncate mb-0.5 leading-tight group-hover:text-[#00D09C] transition-colors">{plant.name}</h4>
                  <p className="text-[9px] text-gray-400 font-bold italic mb-4 truncate tracking-tight">{plant.scientificName}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                     <div className="flex items-center gap-1.5 text-[#00D09C]">
                        <Activity size={10} strokeWidth={3} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Profile Available</span>
                     </div>
                     <div className="text-[#00D09C] group-hover:translate-x-1 transition-transform">
                       <ChevronRight size={14} strokeWidth={3} />
                     </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-6 mb-12">
          {!hideAddButton && (
            <button onClick={() => onAddToGarden(identification.commonName, identification.scientificName, images[0]?.imageUrl)} className="w-full bg-[#00D09C] py-8 rounded-[3.5rem] text-white font-black text-xl shadow-2xl shadow-[#00D09C44] active:scale-95 transition-transform flex items-center justify-center gap-5 border-b-8 border-emerald-700/20">
              <Plus size={30} strokeWidth={4} />
              Add to My Garden
            </button>
          )}
          <button 
            onClick={onFindStores}
            className="w-full bg-white py-8 rounded-[3.5rem] text-[#00D09C] font-black text-xl border-4 border-[#00D09C] shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-5"
          >
            <ShoppingBag size={30} strokeWidth={4} />
            Where to buy
          </button>
        </div>
      </div>
      
      {showLightChecker && (
        <PlacementAnalysisModal 
          plantName={identification.commonName} 
          targetLight={care.sunlight}
          onClose={() => setShowLightChecker(false)} 
          onComplete={() => {
             setShowLightChecker(false);
             showToast("Location Verified: Optimal Light", "success");
             onCompleteTask?.("Light Check");
          }}
        />
      )}

      {showShareModal && (
        <ShareModal 
          plantName={identification.commonName} 
          scientificName={identification.scientificName}
          onClose={() => setShowShareModal(false)}
          onToast={showToast}
        />
      )}
      
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { animation: shimmer 2.5s infinite linear; }
      `}</style>
    </div>
  );
};

// ... (existing sub-components: HierarchyStep, VitalStatCard, StaticCareCard, SunCareCard, TemperatureRangeCard, HeightScaleCard) ...
// (These components are unchanged but included to maintain file integrity as requested)
const HierarchyStep = ({ label, value, active, last }: { label: string, value: string, active?: boolean, last?: boolean }) => (
  <div className="flex gap-4 items-start group">
     <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border-2 transition-colors duration-500 ${active ? 'bg-[#00D09C] border-[#00D09C]' : 'bg-white border-gray-200'}`}></div>
        {!last && <div className={`w-0.5 h-10 transition-colors duration-500 ${active ? 'bg-[#00D09C]/30' : 'bg-gray-100'}`}></div>}
     </div>
     <div className="flex-1 pb-4">
        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest block mb-0.5">{label}</span>
        <span className={`text-sm font-black tracking-tight ${active ? 'text-gray-900' : 'text-gray-300'}`}>{value}</span>
     </div>
  </div>
);

const VitalStatCard = ({ label, value, totalSquares, filledSquares, icon, color, howTo }: any) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-500', bar: 'bg-blue-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500', bar: 'bg-amber-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', bar: 'bg-emerald-500' },
  };
  const theme = colorMap[color as keyof typeof colorMap];
  const isFilled = (i: number) => Array.isArray(filledSquares) ? filledSquares.includes(i) : i < filledSquares;

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm group w-full flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`${theme.bg} ${theme.text} p-3 rounded-2xl shadow-inner`}>{icon}</div>
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</h4>
            <p className="text-sm font-black text-gray-900">{value}</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end max-w-[120px]">
          {[...Array(totalSquares)].map((_, i) => <div key={i} className={`h-2 w-2 rounded-[2px] ${isFilled(i) ? theme.bar : 'bg-gray-100'}`} />)}
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

const StaticCareCard: React.FC<{ icon: React.ReactNode, title: string, content: string, color: string, children?: React.ReactNode }> = ({ icon, title, content, color, children }) => (
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
    {children && <div className="mt-6 pt-6 border-t border-gray-50">{children}</div>}
  </div>
);

const SunCareCard = ({ icon, title, content, onCheck }: any) => (
  <div className="bg-gradient-to-br from-white to-amber-50/30 p-8 rounded-[3.5rem] shadow-lg border-2 border-amber-100 group relative overflow-hidden">
    <div className="flex items-center gap-6 mb-6">
      <div className="bg-amber-100 text-amber-600 w-20 h-20 rounded-[2.2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">{title}</h4>
        <p className="text-xl font-black text-gray-900 leading-none">Biological Requirement</p>
      </div>
    </div>
    <p className="text-lg font-semibold leading-relaxed text-gray-700 mb-8 border-l-4 border-amber-200 pl-6 py-2">{content}</p>
    <button onClick={onCheck} className="w-full bg-amber-500 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3"><Scan size={20} strokeWidth={3} /> Measure Light Intensity</button>
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

// ... (PlacementAnalysisModal remains unchanged) ...
const PlacementAnalysisModal = ({ plantName, targetLight, onClose, onComplete }: { plantName: string, targetLight: string, onClose: () => void, onComplete?: () => void }) => {
  // ... existing implementation ...
  const [status, setStatus] = useState<'live' | 'analyzing' | 'result'>('live');
  const [isAiActive, setIsAiActive] = useState(false);
  const [result, setResult] = useState<PlacementAnalysis | null>(null);
  const [realtimeLux, setRealtimeLux] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [targetRange, setTargetRange] = useState<{min: number, max: number}>({min: 0, max: 100});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // Audio & Live API Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const t = targetLight.toLowerCase();
    if (t.includes('low') || t.includes('shade') || t.includes('shadow')) {
      setTargetRange({min: 5, max: 35});
    } else if (t.includes('direct') || t.includes('full sun')) {
      setTargetRange({min: 75, max: 100});
    } else if (t.includes('bright') || t.includes('indirect')) {
      setTargetRange({min: 40, max: 80});
    } else {
      setTargetRange({min: 25, max: 65});
    }
  }, [targetLight]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(processFrame);
      }
    } catch (err) {
      setError("Access required to measure light.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const processFrame = () => {
    if (videoRef.current && canvasRef.current && status === 'live') {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          total += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avg = total / (data.length / 4);
        const normalized = Math.min(100, Math.round((avg / 255) * 100));
        setRealtimeLux(normalized);

        if (isAiActive && sessionRef.current) {
           canvas.toBlob(async (blob) => {
             if (blob) {
                const reader = new FileReader();
                reader.onload = () => {
                   const base64 = (reader.result as string).split(',')[1];
                   sessionRef.current?.sendRealtimeInput({
                      media: { mimeType: 'image/jpeg', data: base64 }
                   });
                };
                reader.readAsDataURL(blob);
             }
           }, 'image/jpeg', 0.5);
        }
      }
      animationRef.current = requestAnimationFrame(processFrame);
    }
  };

  const startAiSession = async () => {
    try {
      setIsAiActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputAudioContextRef.current.createMediaStreamSource(stream);
      const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
         const inputData = e.inputBuffer.getChannelData(0);
         const pcmBlob = createBlob(inputData);
         if (sessionRef.current) {
            sessionRef.current.sendRealtimeInput({ media: pcmBlob });
         }
      };
      source.connect(processor);
      processor.connect(inputAudioContextRef.current.destination);

      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      gainNodeRef.current = outputAudioContextRef.current.createGain();
      gainNodeRef.current.connect(outputAudioContextRef.current.destination);

      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `You are a Real-Time Botanical Vision Agent...` 
        },
        callbacks: {
          onopen: () => { console.log("Live Session Open"); },
          onmessage: async (msg: LiveServerMessage) => {
             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData && outputAudioContextRef.current) {
                setIsSpeaking(true);
                const buffer = await decodeAudioData(audioData, outputAudioContextRef.current);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(gainNodeRef.current!);
                
                const now = outputAudioContextRef.current.currentTime;
                const start = Math.max(now, nextStartTimeRef.current);
                source.start(start);
                nextStartTimeRef.current = start + buffer.duration;
                
                source.onended = () => {
                   sourcesRef.current.delete(source);
                   if (sourcesRef.current.size === 0) setIsSpeaking(false);
                };
                sourcesRef.current.add(source);
             }
          },
          onclose: () => { console.log("Live Session Closed"); setIsAiActive(false); },
          onerror: (e) => { console.error("Live Session Error", e); setError("AI Connection Lost"); setIsAiActive(false); }
        }
      });
      
      sessionRef.current = session;

    } catch (err) {
      console.error(err);
      setError("Failed to start AI session.");
      setIsAiActive(false);
    }
  };

  const stopAiSession = () => {
    if (sessionRef.current) {
       sessionRef.current.close();
       sessionRef.current = null;
    }
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    setIsAiActive(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (status === 'live') {
      startCamera();
    } else {
      cancelAnimationFrame(animationRef.current);
      stopCamera();
      stopAiSession();
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
      stopCamera();
      stopAiSession();
    };
  }, [status]);

  const captureAndAnalyze = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      
      const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
      setStatus('analyzing');
      
      try {
        const data = await analyzePlacement(base64, plantName, realtimeLux);
        setResult(data);
        setStatus('result');
      } catch (error) {
        console.error(error);
        setStatus('live');
      }
    }
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict === 'Optimal') return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (verdict === 'Too Bright') return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  const getLightLevelLabel = (val: number) => {
    if (val < 20) return "Low Light";
    if (val < 50) return "Medium Light";
    if (val < 80) return "Bright Indirect";
    return "Direct Sun";
  };

  const isLuxOptimal = realtimeLux >= targetRange.min && realtimeLux <= targetRange.max;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[4rem] p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {status === 'live' && (
          <div className="text-center relative h-full flex flex-col">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-4 leading-none">Environmental Scan</h2>
            
            <div className={`relative flex-1 rounded-[3rem] overflow-hidden bg-black mb-6 shadow-2xl border-4 transition-colors duration-500 ${isAiActive ? 'border-amber-400' : 'border-white'}`}>
               <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
               <canvas ref={canvasRef} className="hidden" />
               
               <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
                  {isAiActive ? (
                    <div className="bg-amber-500/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-300 flex items-center gap-2 shadow-lg animate-in slide-in-from-top-4">
                       <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-white animate-pulse' : 'bg-amber-200'}`}></div>
                       <span className="text-white text-[9px] font-black uppercase tracking-[0.2em]">{isSpeaking ? 'Expert Speaking...' : 'AI Listening'}</span>
                    </div>
                  ) : (
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-[#00D09C]"></div>
                       <span className="text-white text-[9px] font-black uppercase tracking-[0.2em]">Standard Meter</span>
                    </div>
                  )}
               </div>

               {isLuxOptimal && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in duration-300">
                    <div className="bg-[#00D09C]/90 backdrop-blur-md p-6 rounded-[2.5rem] text-center border-2 border-white shadow-2xl">
                       <CheckCircle2 size={48} className="text-white mx-auto mb-2 animate-bounce" />
                       <h3 className="text-white font-black text-xl leading-none mb-1">Perfect Match</h3>
                       <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Ideal Condition Detected</p>
                    </div>
                 </div>
               )}

               <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center">
                  <div className="text-white text-5xl font-black tracking-tighter mb-1 drop-shadow-lg">{realtimeLux}%</div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                     {getLightLevelLabel(realtimeLux)}
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                     <div 
                       className="absolute top-0 bottom-0 bg-emerald-500/50" 
                       style={{ left: `${targetRange.min}%`, width: `${targetRange.max - targetRange.min}%` }}
                     ></div>
                     <div className="absolute top-0 bottom-0 w-1 bg-white" style={{ left: `${targetRange.min}%` }}></div>
                     <div className="absolute top-0 bottom-0 w-1 bg-white" style={{ left: `${targetRange.max}%` }}></div>
                     <div className={`h-full transition-all duration-300 ease-out shadow-[0_0_10px_#00D09C] relative z-10 ${isLuxOptimal ? 'bg-[#00D09C]' : 'bg-white'}`} style={{ width: `${realtimeLux}%` }}></div>
                  </div>
               </div>
            </div>

            <div className="bg-gray-50 rounded-[2rem] p-4 mb-4 border border-gray-100">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Requirement</p>
               <p className="text-sm font-bold text-gray-900 leading-tight">{targetLight} ({targetRange.min}-{targetRange.max}%)</p>
            </div>

            {error ? (
               <p className="text-rose-500 font-bold text-xs">{error}</p>
            ) : (
               <div className="flex gap-3">
                 <button 
                   onClick={isAiActive ? stopAiSession : startAiSession}
                   className={`flex-1 py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-2 ${
                     isAiActive 
                       ? 'bg-amber-50 text-amber-600 border-amber-200' 
                       : 'bg-gray-900 text-white border-gray-900'
                   }`}
                 >
                   {isAiActive ? (
                     <> <MicOff size={18} /> End Call </>
                   ) : (
                     <> <Mic size={18} /> Consult Expert </>
                   )}
                 </button>
                 
                 {!isAiActive && (
                   <button 
                     onClick={captureAndAnalyze}
                     className={`flex-1 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3 ${isLuxOptimal ? 'bg-[#00D09C] shadow-emerald-200 animate-pulse' : 'bg-gray-900 shadow-gray-200'}`}
                   >
                     <Scan size={18} /> {isLuxOptimal ? 'Verify Now' : 'Snapshot'}
                   </button>
                 )}
               </div>
            )}
            <button onClick={onClose} className="mt-4 text-gray-400 font-bold text-xs uppercase tracking-widest">Close</button>
          </div>
        )}

        {status === 'analyzing' && (
          <div className="text-center py-12 flex flex-col items-center justify-center h-full">
             <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#00D09C] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Sun size={40} className="text-amber-400 animate-pulse" />
                </div>
             </div>
             <h3 className="text-xl font-black text-gray-900 mb-2">Analyzing Light Spectrum</h3>
             <p className="text-[#00D09C] text-[10px] font-black uppercase tracking-[0.4em]">Calibrating Sensors</p>
          </div>
        )}

        {status === 'result' && result && (
          <div className="flex flex-col h-full">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Placement Report</span>
                   <h2 className="text-2xl font-black text-gray-900 leading-none tracking-tight">{result.plantName}</h2>
                </div>
                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getVerdictColor(result.verdict)}`}>
                   {result.verdict}
                </div>
             </div>

             <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide pb-6">
                <div className="bg-gray-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden">
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                         <span className="text-3xl font-black">{result.score}</span>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Light Score</p>
                         <p className="font-bold text-sm leading-tight text-white/90">{result.verdict}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="bg-gray-50 p-5 rounded-[2rem]">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Sun size={12} /> Ideal Conditions
                      </h4>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed">{result.idealLight}</p>
                   </div>

                   <div className="bg-gray-50 p-5 rounded-[2rem]">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Camera size={12} /> Current Assessment
                      </h4>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed">{result.currentAssessment}</p>
                   </div>

                   <div className="bg-[#EFFFFB] p-5 rounded-[2rem] border border-[#00D09C]/20">
                      <h4 className="text-[10px] font-black text-[#00D09C] uppercase tracking-widest mb-2 flex items-center gap-2">
                         <CheckCircle size={12} /> Expert Recommendation
                      </h4>
                      <p className="text-xs font-bold text-gray-800 leading-relaxed italic">
                         "{result.recommendation}"
                      </p>
                   </div>
                </div>
             </div>

             <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => setStatus('live')} className="flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest bg-gray-50 text-gray-500 hover:bg-gray-100">
                   New Scan
                </button>
                {result.verdict?.toLowerCase().includes('optimal') ? (
                   <button 
                     onClick={() => {
                        if (onComplete) onComplete();
                        else onClose();
                     }} 
                     className="flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest bg-[#00D09C] text-white shadow-lg shadow-emerald-100 animate-pulse"
                   >
                      Confirm Spot
                   </button>
                ) : (
                   <button onClick={onClose} className="flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest bg-gray-900 text-white shadow-lg">
                      Close
                   </button>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ShareModal = ({ plantName, onClose, onToast }: any) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-end justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-t-[3.5rem] p-10 pb-16 shadow-2xl relative z-10 text-center">
        <h3 className="text-2xl font-black mb-6">Share {plantName}</h3>
        <div className="grid grid-cols-4 gap-4 mb-8">
           <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><Twitter /></div>
           <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Facebook /></div>
           <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><MessageCircle /></div>
           <div className="bg-gray-50 p-4 rounded-2xl text-gray-600" onClick={() => { onToast('Copied!', 'success'); onClose(); }}><Link /></div>
        </div>
        <button onClick={onClose} className="w-full bg-gray-100 py-5 rounded-[2rem] font-black uppercase">Close</button>
      </div>
    </div>
  );
};

export default PlantResultScreen;
