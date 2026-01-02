
import React, { useState, useEffect } from 'react';
import { Leaf, Droplets, Plus, Camera, Bell, BellOff, Calendar, ChevronRight, Trash2, X, AlertCircle, Search } from 'lucide-react';
import { Reminder } from '../types';

interface MyPlantsScreenProps {
  plants: any[];
  reminders: Reminder[];
  onAddClick: () => void;
  onManageReminders: (id: string, name: string) => void;
  onPlantClick: (plant: any) => void;
  onRemovePlant: (id: string) => void;
}

const MyPlantsScreen: React.FC<MyPlantsScreenProps> = ({ plants, reminders, onAddClick, onManageReminders, onPlantClick, onRemovePlant }) => {
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleDeleteRequest = (e: React.MouseEvent, plant: any) => {
    e.stopPropagation();
    setConfirmDelete(plant);
  };

  const executeDelete = () => {
    if (confirmDelete) {
      onRemovePlant(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  const requestPermission = async () => {
    const res = await Notification.requestPermission();
    setNotificationPermission(res);
  };

  return (
    <div className="px-6 pt-4 pb-24 relative min-h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">My Garden</h2>
          <p className="text-gray-500 font-medium text-sm">{plants.length} species thriving</p>
        </div>
        {notificationPermission !== 'granted' && reminders.length > 0 && (
          <button 
            onClick={requestPermission}
            className="bg-amber-50 text-amber-600 p-2.5 rounded-2xl animate-pulse"
          >
            <BellOff size={18} />
          </button>
        )}
      </div>

      {/* Add New Plant Card */}
      {plants.length === 0 && (
        <button 
          onClick={onAddClick}
          className="w-full bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 mb-10 flex flex-col items-center text-center group active:scale-[0.98] transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EFFFFB] rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="bg-[#EFFFFB] p-6 rounded-[2.5rem] mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10">
            <Camera size={48} className="text-[#00D09C]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Grow Your Collection</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-[220px] relative z-10">
            Identify a new plant and we'll help you keep it healthy.
          </p>
          <div className="mt-8 bg-[#00D09C] text-white py-4 px-10 rounded-[1.5rem] font-bold text-sm shadow-lg shadow-[#00D09C44] flex items-center gap-2 relative z-10">
            Start Identifying <Plus size={18} />
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 gap-5">
        {plants.map((plant) => {
          const plantReminders = reminders.filter(r => r.plantId === plant.id);
          
          return (
            <div 
              key={plant.id} 
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group relative active:scale-[0.97] transition-all duration-300"
              onClick={() => onPlantClick(plant)}
            >
              <div className="relative h-44 cursor-pointer overflow-hidden">
                <img src={plant.image} alt={plant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${plant.statusColor} backdrop-blur-md bg-opacity-90 shadow-sm`}>
                  {plant.status}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col cursor-pointer">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-gray-900 text-base truncate">{plant.name}</h3>
                </div>
                <p className="text-gray-400 text-[10px] font-bold italic truncate mb-4">{plant.species}</p>
                
                <div className="mt-auto">
                  {plantReminders.length > 0 ? (
                    <div className="space-y-1">
                      {plantReminders.slice(0, 1).map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-[9px] text-[#00D09C] bg-[#EFFFFB] p-2 rounded-xl">
                          <Calendar size={10} />
                          <span className="font-bold uppercase tracking-tighter">{r.type} @ {r.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 px-1 font-bold">
                      <Droplets size={12} className="text-blue-300" />
                      <span>{plant.lastWatered}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Icons Bar */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onManageReminders(plant.id, plant.name);
                  }}
                  className="bg-white/90 backdrop-blur-md p-2 rounded-xl text-[#00D09C] shadow-sm active:scale-90 transition-transform hover:bg-[#00D09C] hover:text-white"
                >
                  <Bell size={16} />
                </button>
                <button 
                  onClick={(e) => handleDeleteRequest(e, plant)}
                  className="bg-white/90 backdrop-blur-md p-2 rounded-xl text-rose-400 shadow-sm active:scale-90 transition-transform hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {plants.length > 0 && (
        <button 
          onClick={onAddClick}
          className="w-full mt-10 py-5 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm flex items-center justify-center gap-2 active:bg-gray-50 transition-colors"
        >
          <Plus size={18} /> Add Another Plant
        </button>
      )}

      {/* Confirmation Modal Overlay */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-rose-500">
              <AlertCircle size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Remove Plant?</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Are you sure you want to remove <span className="font-bold text-gray-900">{confirmDelete.name}</span>? 
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete}
                className="w-full bg-rose-500 text-white py-5 rounded-[2rem] font-bold text-lg shadow-lg shadow-rose-200 active:scale-95 transition-transform"
              >
                Yes, Remove it
              </button>
              <button 
                onClick={() => setConfirmDelete(null)}
                className="w-full bg-gray-50 text-gray-400 py-5 rounded-[2rem] font-bold text-lg active:scale-95 transition-transform"
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlantsScreen;
