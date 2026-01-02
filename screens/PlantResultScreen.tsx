
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Droplets, Sun, Sprout, ShieldAlert, ExternalLink, Heart, Share2, Info, Lightbulb, CheckCircle, Leaf, Plus, Check, ChevronRight, Thermometer, AlertCircle, Sparkles, MapPin, ShoppingBag, Camera, X, RefreshCw } from 'lucide-react';
import { IdentificationResponse, WikiImage, Reminder } from '../types';

interface PlantResultScreenProps {
  data: IdentificationResponse;
  images: WikiImage[];
  onAddToGarden: (name: string, species: string, img?: string) => void;
  onBack: () => void;
  onAddReminder?: () => void;
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
          </p>
        </div>

        {/* Light Level Checker Section */}
        <div className="mb-10 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="bg-amber-100 p-4 rounded-[1.5rem] text-amber-600 shadow-sm">
                <Sun size={24} />
              </div>
              <div className="text-right">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-1">Target Intensity</h3>
                <p className="text-sm font-black text-gray-900 leading-tight truncate max-w-[150px]">{care.sunlight}</p>
              </div>
           </div>

           <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6 relative z-10">
             Not sure if your spot has the right light? Use our AI Light Meter to check the current position.
           </p>

           <button 
             onClick={() => setShowLightChecker(true)}
             className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-amber-200 active:scale-95 transition-all flex items-center justify-center gap-2 relative z-10"
           >
             <Camera size={18} /> Test Lighting Here
           </button>
        </div>

        {/* Best Placement Section */}
        {care.bestPlacement && (
          <div className="mb-10 bg-gradient-to-br from-white to-emerald-50/30 p-8 rounded-[3rem] shadow-sm border border-emerald-100 flex gap-5 items-start">
            <div className="bg-[#00D09C] p-4 rounded-[1.5rem] text-white shadow-lg shadow-[#00D09C33]">
              <MapPin size={24} fill="currentColor" fillOpacity={0.2} />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00D09C] mb-1">Ideal Placement</h3>
              <p className="text-sm font-bold text-gray-900 leading-relaxed">
                {care.bestPlacement}
              </p>
            </div>
          </div>
        )}

        {/* Vital Stats Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex justify-between items-center">
            Vital Stats
            {hideAddButton && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tap to complete today</span>}
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
              icon={<Thermometer size={22} />} 
              title="Temperature" 
              content={care.temperature} 
              color="bg-rose-50 text-rose-600"
              isDone={completedTasks.includes('Temperature')}
              onToggle={() => hideAddButton && onCompleteTask?.('Temperature')}
            />
            <CareDetailCard 
              icon={<Sprout size={22} />} 
              title="Foundation" 
              content={care.soil} 
              color="bg-emerald-50 text-emerald-600"
              isDone={completedTasks.includes('Foundation')}
              onToggle={() => hideAddButton && onCompleteTask?.('Foundation')}
            />
          </div>
        </div>

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
                  <div className="bg-amber-100 p-2 rounded-xl mt-0.5 text-amber-600">
                    <Sparkles size={16} strokeWidth={2.5} />
                  </div>
                  <p className="text-sm text-amber-900 font-bold leading-relaxed">{hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 mb-12">
          {!hideAddButton && (
            <button 
              onClick={() => onAddToGarden(identification.commonName, identification.scientificName, images[0]?.imageUrl)}
              className="w-full bg-[#00D09C] py-6 rounded-[2.5rem] text-white font-bold text-lg shadow-xl shadow-[#00D09C44] active:scale-95 transition-transform flex items-center justify-center gap-3"
            >
              <Plus size={22} strokeWidth={2.5} />
              Add to My Garden
            </button>
          )}
          
          <button 
            onClick={onFindStores}
            className="w-full bg-white py-6 rounded-[2.5rem] text-[#00D09C] font-bold text-lg border-2 border-[#00D09C] shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <ShoppingBag size={22} strokeWidth={2.5} />
            Where to Buy
          </button>
        </div>
      </div>

      {/* Light Checker Modal Overlay */}
      {showLightChecker && (
        <LightMeterModal 
          targetLight={care.sunlight} 
          onClose={() => setShowLightChecker(false)} 
        />
      )}
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
      setError("Camera access is needed to measure light levels.");
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

        // Map brightness to levels
        let currentLevel: 'Low' | 'Medium' | 'Bright' | 'Direct' = 'Low';
        if (normalized < 25) currentLevel = 'Low';
        else if (normalized < 55) currentLevel = 'Medium';
        else if (normalized < 80) currentLevel = 'Bright';
        else currentLevel = 'Direct';
        setLevel(currentLevel);

        // Simplified match logic
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
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 bg-gray-100 p-2 rounded-xl text-gray-500 active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Environment Check</h2>
          <p className="text-gray-400 text-xs font-medium italic">Target: {targetLight}</p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
            <p className="text-gray-900 font-bold mb-6">{error}</p>
            <button onClick={onClose} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold">Close</button>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-black">
                <video ref={videoRef} className="w-full h-full object-cover opacity-70" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border-2 border-amber-400">
                      <span className="text-2xl font-black text-gray-900">{Math.round(brightness)}%</span>
                   </div>
                   <div className="mt-4 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-white/20">
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">{level} Light Detected</p>
                   </div>
                </div>
             </div>

             <div className={`p-6 rounded-[2rem] border-2 flex flex-col items-center text-center transition-all duration-500 ${
                matchStatus === 'Perfect' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                matchStatus === 'Checking' ? 'bg-gray-50 border-gray-100 text-gray-400' :
                'bg-amber-50 border-amber-200 text-amber-700'
             }`}>
                {matchStatus === 'Perfect' ? (
                  <>
                    <CheckCircle size={32} className="mb-2" />
                    <h4 className="font-black text-lg">Perfect Match!</h4>
                    <p className="text-[11px] font-medium opacity-80 leading-relaxed">This spot provides exactly the lighting your plant craves.</p>
                  </>
                ) : (
                  <>
                    <AlertCircle size={32} className="mb-2" />
                    <h4 className="font-black text-lg">{matchStatus}...</h4>
                    <p className="text-[11px] font-medium opacity-80 leading-relaxed">
                      {matchStatus === 'Too Low' ? "This spot might be too dim. Try closer to a window." : "This spot is too bright. Move it back a few feet."}
                    </p>
                  </>
                )}
             </div>

             <div className="flex gap-3">
               <button 
                onClick={onClose}
                className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-transform"
               >
                 I'm Done
               </button>
               <button 
                onClick={() => window.location.reload()}
                className="bg-gray-100 p-4 rounded-2xl text-gray-400 active:rotate-180 transition-transform duration-500"
               >
                 <RefreshCw size={20} />
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
