
import React, { useState } from 'react';
import { ChevronLeft, Droplets, Sun, Sprout, Scissors, ShieldAlert, ExternalLink, Heart, Share2, Info } from 'lucide-react';
import { PlantIdentification, CareGuide, WikiImage } from '../types';

interface PlantResultScreenProps {
  data: { identification: PlantIdentification; care: CareGuide };
  images: WikiImage[];
  onAddToGarden: (name: string, species: string, img?: string) => void;
  onBack: () => void;
}

const PlantResultScreen: React.FC<PlantResultScreenProps> = ({ data, images, onAddToGarden, onBack }) => {
  const { identification, care } = data;
  const [activeImg, setActiveImg] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-12 bg-[#F8FAFB]">
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
      <div className="relative h-[45vh] bg-gray-200">
        {images.length > 0 ? (
          <>
            <img 
              src={images[activeImg].imageUrl} 
              alt={identification.scientificName} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImg(i)}
                  className={`h-1.5 rounded-full transition-all ${activeImg === i ? 'w-6 bg-white shadow-md' : 'w-1.5 bg-white/50'}`} 
                />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F8FAFB] to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50">
            <Sprout size={64} className="text-emerald-200" />
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="px-8 -mt-6 relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#00D09C] rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
            <Info size={12} />
            Plant Identified
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1 leading-tight">{identification.commonName}</h1>
          <p className="text-[#00D09C] font-semibold italic flex items-center gap-2 text-lg">
            {identification.scientificName}
            {images[activeImg]?.sourcePageUrl && (
              <a href={images[activeImg].sourcePageUrl} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-emerald-300 transition-colors">
                <ExternalLink size={16} />
              </a>
            )}
          </p>
        </div>

        {identification.isToxic && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2.5rem] flex gap-4 mb-8">
            <ShieldAlert className="text-rose-500 flex-shrink-0" size={28} />
            <div>
              <h4 className="text-rose-900 font-bold text-sm">Toxicity Warning</h4>
              <p className="text-rose-700 text-xs mt-1 leading-relaxed font-medium">
                {identification.toxicityWarning || "This species is known to be toxic. Keep away from pets and children."}
              </p>
            </div>
          </div>
        )}

        {/* Care Stats Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Care Requirements</h2>
          <div className="grid grid-cols-2 gap-4">
            <CareDetailCard icon={<Droplets size={22} />} title="Water" content={care.watering} color="bg-blue-50 text-blue-600" />
            <CareDetailCard icon={<Sun size={22} />} title="Light" content={care.sunlight} color="bg-orange-50 text-orange-600" />
            <CareDetailCard icon={<Sprout size={22} />} title="Soil" content={care.soil} color="bg-emerald-50 text-emerald-600" />
            <CareDetailCard icon={<Scissors size={22} />} title="Pruning" content={care.pruning} color="bg-purple-50 text-purple-600" />
          </div>
        </div>

        {/* About Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About this species</h2>
          <div className="bg-white p-7 rounded-[3rem] shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              {identification.description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onAddToGarden(identification.commonName, identification.scientificName, images[0]?.imageUrl)}
          className="w-full bg-[#00D09C] py-6 rounded-[2.5rem] text-white font-bold text-lg shadow-xl shadow-[#00D09C44] active:scale-95 transition-transform mb-12"
        >
          Add to My Garden
        </button>
      </div>
    </div>
  );
};

const CareDetailCard = ({ icon, title, content, color }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-[#00D09C] transition-colors cursor-default">
    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</h4>
    <p className="text-xs font-bold text-gray-800 line-clamp-3 leading-snug">{content}</p>
  </div>
);

export default PlantResultScreen;
