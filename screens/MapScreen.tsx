
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Navigation, Phone, Globe, Loader2, AlertCircle, Crosshair, Map as MapIcon, Compass, Info, Star, Clock, ExternalLink, ChevronRight, Filter, Search, Shovel, Leaf, Cpu, Activity, Zap, Satellite, Target, Radio, Store, RefreshCw } from 'lucide-react';
import { GardenCenter } from '../types';
import { findNearbyGardenCenters } from '../services/geminiService';

const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [centers, setCenters] = useState<GardenCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchStores = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);
      const realStores = await findNearbyGardenCenters(lat, lng);
      setCenters(realStores);
    } catch (err: any) {
      console.error(err);
      setError("Botanical logistics error: " + (err.message || "Connection failed."));
    } finally {
      setLoading(false);
    }
  };

  const requestGPS = useCallback((silent: boolean = false) => {
    if (!navigator.geolocation) {
      setError("Biological geolocation unavailable in this browser.");
      setPermissionStatus('denied');
      return;
    }

    if (!silent) setLoading(true);
    setError(null);

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setPermissionStatus('granted');
        if (!silent) fetchStores(coords.lat, coords.lng);
      },
      (err) => {
        setLoading(false);
        setPermissionStatus('denied');
        console.warn('Geolocation error:', err);
        
        if (err.code === 1) {
          setError("Location access denied. Please enable GPS in your device settings.");
        } else if (err.code === 2) {
          setError("Location unavailable. Check your network or GPS signal.");
        } else if (err.code === 3) {
          setError("GPS request timed out. Please try again in an open area.");
        } else {
          setError("GPS Signal Lost.");
        }
      },
      geoOptions
    );
  }, []);

  useEffect(() => {
    requestGPS();
  }, [requestGPS]);

  const filteredCenters = useMemo(() => {
    if (activeFilter === 'All') return centers;
    return centers.filter(c => c.tags?.includes(activeFilter));
  }, [centers, activeFilter]);

  const allTags = useMemo(() => {
    const tags = new Set(['All']);
    centers.forEach(c => c.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [centers]);

  return (
    <div className="h-full flex flex-col bg-[#F2F4F7]">
      {/* Premium Header */}
      <div className="px-6 pt-12 pb-6 bg-white z-30 shadow-sm border-b border-gray-50">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight leading-none">Store Finder</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Botanical Logistics</p>
          </div>
          <button 
            onClick={() => requestGPS()}
            disabled={loading}
            className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all active:scale-95 ${
              permissionStatus === 'granted' 
                ? 'bg-emerald-50 border-emerald-100 text-[#00D09C]' 
                : 'bg-rose-50 border-rose-100 text-rose-500'
            }`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              {loading ? 'Scanning...' : (permissionStatus === 'granted' ? 'Sync Live' : 'Link Lost')}
            </span>
          </button>
        </div>

        {centers.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`flex-shrink-0 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === tag 
                    ? 'bg-[#00D09C] text-white shadow-lg shadow-emerald-100 scale-105' 
                    : 'bg-gray-50 text-gray-400 border border-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Visual Map / Radar Area */}
      <div className="flex-1 bg-[#F9FAFB] relative overflow-hidden">
        {/* Subtle Map Grid / Topographic Feel */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#00D09C 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{ backgroundImage: 'linear-gradient(#000 0.5px, transparent 0.5px), linear-gradient(90deg, #000 0.5px, transparent 0.5px)', backgroundSize: '100px 100px' }}></div>
        
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 bg-white/40 backdrop-blur-[2px]">
            <div className="relative">
              <div className="w-80 h-80 border-4 border-[#00D09C]/10 rounded-full animate-ping"></div>
              <div className="absolute inset-0 m-auto w-64 h-64 border-2 border-[#00D09C]/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 m-auto w-40 h-40 border-2 border-[#00D09C]/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-[#00D09C]">
                  <Loader2 className="animate-spin text-[#00D09C]" size={32} />
                </div>
              </div>
            </div>
            <p className="mt-8 text-[10px] font-black text-[#00D09C] uppercase tracking-[0.4em] animate-pulse">Establishing Geodesic Link</p>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          {userLocation ? (
            <div className="relative w-full h-full">
              {/* User Location Marker */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="absolute -inset-10 bg-blue-500/10 rounded-full animate-ping"></div>
                <div className="absolute -inset-6 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div className="w-10 h-10 bg-blue-600 rounded-full shadow-2xl border-4 border-white flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100 shadow-sm whitespace-nowrap">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">My Position</span>
                </div>
              </div>

              {/* Store Markers */}
              {filteredCenters.map((center, idx) => (
                <div 
                  key={center.id}
                  className="absolute transition-all duration-1000 group cursor-pointer"
                  style={{ 
                    top: `calc(50% + ${(center.latitude - userLocation.lat) * 20000}px)`,
                    left: `calc(50% + ${(center.longitude - userLocation.lng) * 20000}px)`
                  }}
                  onClick={() => {
                    const el = document.getElementById(`store-card-${center.id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-[90%] flex flex-col items-center">
                     {/* Hover Label */}
                     <div className="bg-white px-4 py-2 rounded-[1.2rem] shadow-2xl border border-gray-100 mb-3 scale-0 group-hover:scale-100 transition-transform origin-bottom z-50 pointer-events-none min-w-[120px]">
                       <p className="text-[11px] font-black text-gray-900 whitespace-nowrap leading-tight mb-0.5">{center.name}</p>
                       <div className="flex items-center justify-between">
                         <p className="text-[8px] text-[#00D09C] font-black uppercase tracking-tighter">{center.distance}</p>
                         <div className="flex items-center gap-0.5">
                            <Star size={8} fill="#F59E0B" className="text-amber-500" />
                            <span className="text-[8px] font-black text-gray-400">{center.rating}</span>
                         </div>
                       </div>
                     </div>

                     {/* Custom Teardrop Pin */}
                     <div className="relative group-active:scale-90 transition-transform">
                        <div className="absolute -inset-2 bg-[#00D09C]/20 rounded-full blur-md group-hover:bg-[#00D09C]/40 transition-colors"></div>
                        <div className="w-12 h-14 bg-[#00D09C] rounded-t-full rounded-bl-full rounded-br-[4px] rotate-45 shadow-xl border-4 border-white flex items-center justify-center relative overflow-hidden group-hover:bg-emerald-500 transition-colors">
                            <div className="-rotate-45 flex items-center justify-center text-white">
                                <Leaf size={22} fill="white" className="opacity-90" />
                            </div>
                        </div>
                        {/* Pin Stem Shadow */}
                        <div className="w-2 h-2 bg-gray-900/10 rounded-full blur-[2px] mt-1 mx-auto"></div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !loading && (
            <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
               {/* SATELLITE LINK INITIALIZATION CARD */}
               <div className="w-full max-w-sm bg-white rounded-[3.5rem] p-8 text-left relative overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] border-[3px] border-gray-100 group">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50/50 rounded-full blur-[60px] pointer-events-none"></div>
                  
                  <div className="flex flex-col gap-8 relative z-10">
                    <div className="flex justify-between items-center">
                      <div className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-amber-100 shadow-sm">
                        <Radio size={12} className="animate-pulse" />
                        GEO.SYNC REQUIRED
                      </div>
                      <div className="text-gray-300">
                        <Cpu size={20} />
                      </div>
                    </div>

                    <div className="relative w-full aspect-square max-w-[180px] mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-full animate-[spin_20s_linear_infinite]"></div>
                      <div className="absolute -inset-4 border border-gray-50 rounded-full"></div>
                      
                      <div className="w-36 h-36 bg-gradient-to-br from-gray-50 to-white rounded-full flex items-center justify-center relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                        <div className="bg-white p-6 rounded-[2.2rem] shadow-xl relative group-hover:rotate-[-12deg] transition-transform duration-500 ring-4 ring-gray-50">
                          <Satellite size={40} className="text-[#00D09C] animate-pulse" />
                          <div className="absolute -top-2 -right-2 bg-amber-500 p-2 rounded-xl text-white shadow-lg">
                            <Target size={14} fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 translate-x-4 -translate-y-2 flex flex-col items-start gap-1">
                         <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">SAT.LINK</span>
                         <div className="w-8 h-[1.5px] bg-emerald-100"></div>
                      </div>
                      <div className="absolute bottom-4 left-0 -translate-x-6 flex flex-col items-end gap-1">
                         <div className="flex gap-0.5">
                            {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-amber-300 rounded-full"></div>)}
                         </div>
                         <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">LOC.INIT</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 leading-none">Initialize Link</h2>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 px-4 leading-relaxed">
                        Authorize geospatial coordinates to localize nearby botanical assets.
                      </p>
                      
                      {error && (
                        <div className="mb-6 bg-rose-50 p-4 rounded-2xl flex items-start gap-3 text-left border border-rose-100">
                          <AlertCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] font-bold text-rose-700 leading-tight">
                            {error}
                          </p>
                        </div>
                      )}

                      <button 
                        onClick={() => requestGPS()}
                        className="w-full bg-[#00D09C] text-white py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-100 active:scale-95 group-hover:bg-emerald-500"
                      >
                        <Zap size={18} fill="currentColor" /> Re-sync Link
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {userLocation && (
          <div className="absolute bottom-10 right-8 flex flex-col gap-4 z-30 items-end">
            <button 
              onClick={() => requestGPS(true)} // Silent re-center
              className="bg-white p-4 rounded-[1.5rem] shadow-2xl border border-gray-100 text-gray-400 active:scale-90 transition-all hover:text-[#00D09C] hover:border-emerald-100"
              title="Re-center"
            >
              <Crosshair size={24} />
            </button>
            <button 
              onClick={() => requestGPS()}
              className={`p-5 rounded-[1.8rem] shadow-2xl transition-all active:scale-90 border-4 border-white ${loading ? 'bg-gray-100 text-gray-300' : 'bg-[#00D09C] text-white shadow-emerald-200'}`}
              title="Scan Nearby"
            >
              {loading ? <Loader2 className="animate-spin" size={28} /> : <Navigation size={28} />}
            </button>
          </div>
        )}
      </div>

      {/* Results Drawer */}
      <div className="h-[45%] bg-white rounded-t-[3.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-40 overflow-hidden flex flex-col">
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto my-6 flex-shrink-0"></div>
        
        <div className="flex-1 overflow-y-auto px-6 pb-12 scrollbar-hide">
          <div className="space-y-6">
            {filteredCenters.map((center, i) => (
              <div 
                key={center.id} 
                id={`store-card-${center.id}`}
                className="bg-white border-2 border-gray-50 p-6 rounded-[2.8rem] shadow-sm hover:border-[#00D09C]/20 transition-all duration-300 group animate-in slide-in-from-bottom-6 fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-[#00D09C] transition-colors">{center.name}</h3>
                      {center.isOpen && (
                        <div className="bg-emerald-50 text-emerald-500 p-1 rounded-lg">
                          <Clock size={12} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <div className="flex items-center gap-1 text-amber-500">
                         <Star size={12} fill="currentColor" />
                         <span>{center.rating}</span>
                       </div>
                       <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                       <span>{center.distance} away</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${center.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {center.isOpen ? 'Open Now' : 'Closed'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {center.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[8px] font-black uppercase tracking-wider border border-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a 
                    href={center.website || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#00D09C] text-white py-5 rounded-[2rem] flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
                  >
                    <Store size={16} /> View Store Profile
                  </a>
                </div>
              </div>
            ))}

            {!loading && filteredCenters.length === 0 && permissionStatus === 'granted' && (
              <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-6 inline-block text-gray-300">
                  <Shovel size={40} />
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-2 leading-none uppercase tracking-tight">Sector Empty</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-12 leading-relaxed">
                  No verified botanical assets detected within this coordinate range.
                </p>
                <button onClick={() => requestGPS()} className="mt-8 text-[#00D09C] font-black text-[10px] uppercase tracking-[0.3em] border-b-4 border-[#00D09C]/20 pb-1">
                  Re-scan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;
