
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Globe } from 'lucide-react';
import { GardenCenter } from '../types';

const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [centers, setCenters] = useState<GardenCenter[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        
        // Mocking nearby garden centers based on user location
        setCenters([
          { 
            id: '1', 
            name: 'Botanical Gardens Supply', 
            latitude: pos.coords.latitude + 0.005, 
            longitude: pos.coords.longitude + 0.002,
            address: '123 Flora Way, Central Park'
          },
          { 
            id: '2', 
            name: 'The Green Leaf Nursery', 
            latitude: pos.coords.latitude - 0.003, 
            longitude: pos.coords.longitude + 0.006,
            address: '88 Bloom Blvd, Riverside'
          },
          { 
            id: '3', 
            name: 'Eco Gardeners Hub', 
            latitude: pos.coords.latitude + 0.008, 
            longitude: pos.coords.longitude - 0.004,
            address: '42 Organic Dr, West Side'
          }
        ]);
      },
      (err) => console.error(err)
    );
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-12 pb-4 bg-white shadow-sm z-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Nearby Stores</h1>
        <p className="text-gray-500 text-sm">Find garden centers and nurseries near you</p>
      </div>

      {/* Mock Map Visual */}
      <div className="flex-1 bg-gray-100 relative overflow-hidden">
        {/* Simple visual representation of a map */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#00D09C 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
        
        {/* Map UI simulation */}
        <div className="absolute inset-0 flex items-center justify-center">
          {userLocation && (
            <div className="relative">
              {/* User location dot */}
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg border-2 border-white"></div>
              </div>

              {/* Center Pins */}
              {centers.map(center => (
                <div 
                  key={center.id}
                  className="absolute"
                  style={{ 
                    top: `${(center.latitude - userLocation.lat) * 5000}px`,
                    left: `${(center.longitude - userLocation.lng) * 5000}px`
                  }}
                >
                  <MapPin className="text-[#00D09C] drop-shadow-md" size={32} fill="#00D09C" fillOpacity={0.2} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating current location button */}
        <button className="absolute bottom-6 right-6 bg-white p-3 rounded-full shadow-lg text-gray-700 active:scale-90 transition-transform">
          <Navigation size={22} />
        </button>
      </div>

      {/* List of centers */}
      <div className="h-2/5 bg-white rounded-t-[3rem] shadow-2xl z-20 overflow-y-auto px-6 pt-8">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <div className="space-y-6">
          {centers.map(center => (
            <div key={center.id} className="flex gap-4 group cursor-pointer">
              <div className="bg-emerald-50 p-3 rounded-[1.5rem] group-hover:bg-emerald-100 transition-colors">
                <MapPin className="text-[#00D09C]" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 group-hover:text-[#00D09C] transition-colors">{center.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{center.address}</p>
                <div className="flex gap-4">
                  <button className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900">
                    <Phone size={14} /> Call
                  </button>
                  <button className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900">
                    <Globe size={14} /> Website
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default MapScreen;
