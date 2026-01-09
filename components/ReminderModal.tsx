
import React, { useState } from 'react';
import { X, Clock, Calendar, Droplets, Scissors, Shovel, Wind, Sparkles, Sparkle } from 'lucide-react';
import { Reminder } from '../types';

interface ReminderModalProps {
  plantId: string;
  plantName: string;
  onClose: () => void;
  onSave: (reminder: Omit<Reminder, 'id'>) => void;
}

const CARE_TYPES = [
  { id: 'Water', icon: <Droplets size={18} />, color: 'bg-blue-50 text-blue-500' },
  { id: 'Fertilize', icon: <Sparkles size={18} />, color: 'bg-amber-50 text-amber-500' },
  { id: 'Prune', icon: <Scissors size={18} />, color: 'bg-purple-50 text-purple-500' },
  { id: 'Mist', icon: <Wind size={18} />, color: 'bg-cyan-50 text-cyan-500' },
  { id: 'Clean', icon: <Sparkle size={18} />, color: 'bg-emerald-50 text-emerald-500' },
  { id: 'Repot', icon: <Shovel size={18} />, color: 'bg-orange-50 text-orange-500' },
];

const FREQUENCIES = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'];

const ReminderModal: React.FC<ReminderModalProps> = ({ plantId, plantName, onClose, onSave }) => {
  const [type, setType] = useState<any>('Water');
  const [frequency, setFrequency] = useState<any>('Weekly');
  const [time, setTime] = useState('09:00');

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] p-8 sm:p-10 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 mb-safe overflow-hidden border-4 border-white">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">Configure Alert</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Target Specimen: {plantName}</p>
          </div>
          <button onClick={onClose} className="bg-gray-100 p-3 rounded-2xl text-gray-400 active:scale-90 transition-transform">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Action Type */}
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">Care Protocol</label>
            <div className="grid grid-cols-3 gap-3">
              {CARE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2 ${
                    type === t.id ? 'border-[#00D09C] bg-[#EFFFFB]' : 'border-transparent bg-gray-50'
                  }`}
                >
                  <div className={`${t.color} p-2 rounded-xl`}>{t.icon}</div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${type === t.id ? 'text-[#00D09C]' : 'text-gray-400'}`}>{t.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Cycle */}
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">Recurrence Period</label>
            <div className="grid grid-cols-2 gap-3">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                    frequency === f ? 'border-[#00D09C] bg-[#EFFFFB] text-[#00D09C]' : 'border-transparent bg-gray-50 text-gray-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selector */}
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">Notification Timestamp</label>
            <div className="relative">
              <div className={`absolute left-5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${time ? 'text-[#00D09C] bg-emerald-50' : 'text-gray-300 bg-gray-100'}`}>
                <Clock size={18} />
              </div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent py-5 pl-16 pr-8 rounded-3xl text-sm font-black text-gray-900 focus:bg-white focus:border-[#00D09C] focus:ring-0 transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onSave({ 
                plantId, 
                type, 
                frequency, 
                time, 
                lastNotificationDate: '',
                lastCompleted: '' 
              })}
              className="w-full bg-[#00D09C] py-6 rounded-[2rem] text-white font-black text-base uppercase tracking-[0.2em] shadow-2xl shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Commit Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
