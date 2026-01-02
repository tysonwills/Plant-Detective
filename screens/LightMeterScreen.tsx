
import React, { useState, useEffect, useRef } from 'react';
import { Sun, RefreshCw, AlertCircle, Info, Lightbulb, Camera } from 'lucide-react';

const LightMeterScreen: React.FC = () => {
  const [brightness, setBrightness] = useState(0);
  const [level, setLevel] = useState<'Low' | 'Medium' | 'Bright' | 'Direct'>('Low');
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

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
      setError("Camera access is required for the Light Meter.");
      console.error(err);
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
        if (normalized < 30) {
          setLevel('Low');
          setAdvice('Suitable for low-light plants like Snake Plants or Pothos.');
        } else if (normalized < 60) {
          setLevel('Medium');
          setAdvice('Great for most indoor plants like Monsteras and Calatheas.');
        } else if (normalized < 85) {
          setLevel('Bright');
          setAdvice('Ideal for flowering plants and succulents near windows.');
        } else {
          setLevel('Direct');
          setAdvice('Perfect for sun-loving plants like Cacti and Bird of Paradise.');
        }
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
    <div className="px-6 pt-12 pb-24 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Light Meter</h1>
        <p className="text-gray-500 font-medium">Measure the light for your plants</p>
      </div>

      {error ? (
        <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 text-center">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <p className="text-rose-900 font-bold mb-6">{error}</p>
          <button 
            onClick={startCamera}
            className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Retry Access
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Camera View */}
          <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-black">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover opacity-60" 
              playsInline 
              muted 
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay UI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-full border-4 border-[#00D09C] shadow-2xl">
                <Sun 
                  size={48} 
                  className="text-amber-500 animate-pulse" 
                  style={{ opacity: 0.5 + (brightness / 200) }} 
                />
              </div>
              <div className="mt-6 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg">
                <span className="text-2xl font-black text-gray-900">{Math.round(brightness)}%</span>
              </div>
            </div>
          </div>

          {/* Reading Card */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Current Intensity</h3>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                level === 'Low' ? 'bg-gray-50 text-gray-400 border-gray-100' :
                level === 'Medium' ? 'bg-emerald-50 text-[#00D09C] border-emerald-100' :
                level === 'Bright' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-orange-50 text-orange-600 border-orange-100'
              }`}>
                {level} Light
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed font-medium mb-6">
              {advice}
            </p>

            <div className="bg-gray-50 p-6 rounded-[2rem] flex gap-4 items-start">
              <div className="bg-white p-2 rounded-xl text-[#00D09C] shadow-sm">
                <Lightbulb size={20} />
              </div>
              <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                <span className="text-gray-900 block mb-0.5">Pro Tip</span>
                Place your phone where your plant's leaves would be, facing the light source.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-[#00D09C] transition-colors"
            >
              <RefreshCw size={14} /> Reset Meter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightMeterScreen;
