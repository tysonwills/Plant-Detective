
import React, { useState } from 'react';
import { Leaf, Droplets, Plus, Camera, Bell, Calendar, ChevronRight, Trash2, X, AlertCircle } from 'lucide-react';
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

  return (
    <div className="px-6 pt-12 pb-24 relative min-h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">My Garden</h1>
          <p className="text-gray-500 font-medium">{plants.length} species growing</p>
        </div>
        <div className="bg-[#EFFFFB] p-2 rounded-xl">
           <Leaf className="text-[#00D09C]" size={20} />
        </div>
      </div>

      {/* Add New Plant Card */}
      <button 
        onClick={onAddClick}
        className="w-full bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 mb-10 flex flex-col items-center text-center group active:scale-[0.98] transition-all relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EFFFFB] rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="bg-[#EFFFFB] p-6 rounded-[2.5rem] mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10">
          <Camera size={48} className="text-[#00D09C]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Grow Your Garden</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[200px] relative z-10">
          Identify a new plant and start tracking its health today.
        </p>
        <div className="mt-6 bg-[#00D09C] text-white py-3 px-8 rounded-2xl font-bold text-sm shadow-lg shadow-[#00D09C44] flex items-center gap-2 relative z-10">
          Identify Plant <Plus size={18} />
        </div>
      </button>

      <div className="grid grid-cols-2 gap-5">
        {plants.map((plant) => {
          const plantReminders = reminders.filter(r => r.plantId === plant.id);
          
          return (
            <div 
              key={plant.id} 
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group relative active:scale-[0.97] transition-all duration-300"
              onClick={() => onPlantClick(plant)}
            >
              <div className="relative h-44 cursor-pointer">
                <img src={plant.image} alt={plant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${plant.statusColor} backdrop-blur-md bg-opacity-90 shadow-sm`}>
                  {plant.status}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col cursor-pointer">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-gray-900 text-base truncate">{plant.name}</h3>
                  <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-gray-400 text-[10px] font-medium italic truncate mb-4">{plant.species}</p>
                
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
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 px-1">
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

      {plants.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
           <Leaf size={48} className="mb-4 text-gray-300" />
           <p className="font-bold text-gray-400">Your garden is empty</p>
           <p className="text-xs text-gray-400">Start by identifying a plant!</p>
        </div>
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
              This will permanently delete all care history and active reminders.
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
