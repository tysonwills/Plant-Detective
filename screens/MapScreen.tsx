
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Phone, Globe, Loader2, AlertCircle, Crosshair, Map as MapIcon, Compass, Info } from 'lucide-react';
import { GardenCenter } from '../types';
import { findNearbyGardenCenters } from '../services/geminiService';

const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [centers, setCenters] = useState<GardenCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const fetchStores = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);
      const realStores = await findNearbyGardenCenters(lat, lng);
      setCenters(realStores);
    } catch (err: any) {
      console.error(err);
      setError("Unable to find real stores. Showing nearby estimates.");
      // Fallback mock if API fails
      setCenters([
        { id: '1', name: 'Local Nursery', latitude: lat + 0.005, longitude: lng + 0.002, address: 'Nearby Garden St.' },
        { id: '2', name: 'Plant Depot', latitude: lat - 0.003, longitude: lng + 0.006, address: 'Botanical Ave.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setPermissionStatus('denied');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setPermissionStatus('granted');
        fetchStores(coords.lat, coords.lng);
      },
      (err) => {
        console.error(err);
        setLoading(false);
        setPermissionStatus('denied');
        if (err.code === 1) {
          setError("Location access denied. Please enable GPS in your device settings.");
        } else {
          setError("Position unavailable. Ensure your GPS is active.");
        }
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    requestGPS();
  }, [requestGPS]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 pt-12 pb-4 bg-white shadow-sm z-30">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Store Finder</h1>
          </div>
          <div className={`p-2 rounded-xl border flex items-center gap-2 ${permissionStatus === 'granted' ? 'bg-emerald-50 border-emerald-100 text-[#00D09C]' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
            <Compass size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {permissionStatus === 'granted' ? 'GPS Active' : 'GPS Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#F1F3F4] relative overflow-hidden">
        {/* Mock Map Visual with dots */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#00D09C 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Radar/Scanning Animation when loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-[#00D09C]/20 rounded-full animate-ping"></div>
            <div className="absolute w-48 h-48 border-2 border-[#00D09C]/40 rounded-full animate-pulse"></div>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          {userLocation ? (
            <div className="relative">
              {/* Pulse at user location */}
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/30 rounded-full animate-ping"></div>
                <div className="w-6 h-6 bg-blue-600 rounded-full shadow-lg border-4 border-white z-10 relative"></div>
              </div>

              {centers.map((center, idx) => (
                <div 
                  key={center.id}
                  className="absolute transition-all duration-1000 group"
                  style={{ 
                    // Projection based on relative offset from user location
                    marginTop: `${(center.latitude - userLocation.lat) * 12000}px`,
                    marginLeft: `${(center.longitude - userLocation.lng) * 12000}px`
                  }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-full flex flex-col items-center">
                     <div className="bg-white px-3 py-1.5 rounded-xl shadow-lg border border-gray-100 mb-1 scale-0 group-hover:scale-100 transition-transform origin-bottom">
                       <p className="text-[9px] font-bold text-gray-900 whitespace-nowrap">{center.name}</p>
                     </div>
                     <MapPin className="text-[#00D09C] drop-shadow-md animate-in slide-in-from-bottom-2 duration-500" size={32} fill="#00D09C" fillOpacity={0.2} />
                  </div>
                </div>
              ))}
            </div>
          ) : !loading && (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 max-w-xs">
                <div className="bg-rose-50 p-6 rounded-[2rem] mb-6 inline-block text-rose-500">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enable GPS</h3>
                <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                  To find local botanical supplies, FloraID needs to know where you're planting.
                </p>
                <button 
                  onClick={requestGPS}
                  className="w-full bg-[#00D09C] text-white py-4 rounded-[1.5rem] font-bold shadow-lg shadow-[#00D09C44] active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Crosshair size={18} /> Enable Location
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-30">
          <button 
            onClick={requestGPS}
            className={`p-4 rounded-full shadow-2xl transition-all active:scale-90 ${loading ? 'bg-gray-100 text-gray-400' : 'bg-[#00D09C] text-white'}`}
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Navigation size={24} />}
          </button>
        </div>
      </div>

      <div className="h-2/5 bg-white rounded-t-[3rem] shadow-2xl z-40 overflow-y-auto px-6 pt-8 pb-10">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
        
        {error && (
          <div className="mb-6 flex items-start gap-3 p-5 bg-rose-50 text-rose-600 rounded-[2rem] border border-rose-100">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block mb-1">GPS Signal Weak</span>
              <p className="text-[10px] font-medium opacity-80">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {centers.map((center, i) => (
            <div key={center.id} className="flex gap-5 group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="bg-emerald-50 p-4 rounded-[1.8rem] group-hover:bg-[#00D09C] group-hover:text-white transition-all duration-300 h-fit">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-[#00D09C] transition-colors leading-tight">{center.name}</h3>
                </div>
                <div className="flex gap-4 mt-2">
                  {center.website && (
                    <a 
                      href={center.website} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1.5 text-[10px] font-black text-white uppercase tracking-[0.15em] py-2.5 px-6 bg-[#00D09C] rounded-xl shadow-md shadow-[#00D09C33] active:scale-95 transition-transform"
                    >
                      <Info size={14} /> Info
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!loading && centers.length === 0 && permissionStatus === 'granted' && (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <MapIcon size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold text-sm mb-1">No garden stores detected.</p>
              <p className="text-[10px] text-gray-400 font-medium">Try moving to a more populated area or refreshing.</p>
              <button onClick={requestGPS} className="mt-6 text-[#00D09C] text-[10px] font-black uppercase tracking-widest border-b-2 border-[#00D09C] pb-1">
                Retry Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapScreen;
