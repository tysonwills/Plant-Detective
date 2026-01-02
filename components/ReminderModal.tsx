
import React, { useState } from 'react';
import { X, Clock, Calendar, Droplets, Scissors, Shovel, Wind, Sparkles } from 'lucide-react';
import { Reminder } from '../types';

interface ReminderModalProps {
  plantId: string;
  plantName: string;
  onClose: () => void;
  onSave: (reminder: Omit<Reminder, 'id'>) => void;
}

const CARE_TYPES = [
  { id: 'Water', icon: <Droplets size={20} />, color: 'bg-blue-50 text-blue-500' },
  { id: 'Fertilize', icon: <Sparkles size={20} />, color: 'bg-amber-50 text-amber-500' },
  { id: 'Prune', icon: <Scissors size={20} />, color: 'bg-purple-50 text-purple-500' },
  { id: 'Mist', icon: <Wind size={20} />, color: 'bg-cyan-50 text-cyan-500' },
  { id: 'Repot', icon: <Shovel size={20} />, color: 'bg-orange-50 text-orange-500' },
];

const FREQUENCIES = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'];

const ReminderModal: React.FC<ReminderModalProps> = ({ plantId, plantName, onClose, onSave }) => {
  const [type, setType] = useState<any>('Water');
  const [frequency, setFrequency] = useState<any>('Weekly');
  const [time, setTime] = useState('09:00');

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Set Reminder</h2>
            <p className="text-gray-400 text-sm">For your {plantName}</p>
          </div>
          <button onClick={onClose} className="bg-gray-50 p-3 rounded-2xl text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Care Type */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Action Type</label>
            <div className="flex flex-wrap gap-3">
              {CARE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2 ${
                    type === t.id ? 'border-[#00D09C] bg-[#EFFFFB]' : 'border-transparent bg-gray-50'
                  }`}
                >
                  <div className={`${t.color} p-2 rounded-xl`}>{t.icon}</div>
                  <span className="text-[10px] font-bold text-gray-600">{t.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Repeat Frequency</label>
            <div className="grid grid-cols-2 gap-3">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`py-4 px-6 rounded-2xl font-bold text-sm transition-all border-2 ${
                    frequency === f ? 'border-[#00D09C] bg-[#EFFFFB] text-[#00D09C]' : 'border-transparent bg-gray-50 text-gray-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Reminder Time</label>
            <div className="relative">
              <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00D09C]" size={20} />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-gray-50 border-none py-5 pl-14 pr-6 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-[#00D09C]"
              />
            </div>
          </div>

          <button
            onClick={() => onSave({ plantId, type, frequency, time })}
            className="w-full bg-[#00D09C] py-6 rounded-[2.5rem] text-white font-bold text-lg shadow-xl shadow-[#00D09C44] active:scale-95 transition-transform mt-4"
          >
            Save Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
