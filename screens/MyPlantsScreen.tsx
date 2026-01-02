
import React from 'react';
import { Leaf, Droplets, Plus, Camera } from 'lucide-react';

interface MyPlantsScreenProps {
  plants: any[];
  onAddClick: () => void;
}

const MyPlantsScreen: React.FC<MyPlantsScreenProps> = ({ plants, onAddClick }) => {
  return (
    <div className="px-6 pt-12 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">My Garden</h1>
        <p className="text-gray-500 font-medium">{plants.length} plants in total</p>
      </div>

      {/* Add New Plant Card - Re-styled to match Diagnostics style */}
      <button 
        onClick={onAddClick}
        className="w-full bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 mb-10 flex flex-col items-center text-center group active:scale-[0.98] transition-all"
      >
        <div className="bg-[#EFFFFB] p-6 rounded-[2.5rem] mb-6 group-hover:scale-110 transition-transform duration-500">
          <Camera size={48} className="text-[#00D09C]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Grow Your Garden</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
          Identify a new plant and add it to your collection for care tracking.
        </p>
        <div className="mt-6 bg-[#00D09C] text-white py-3 px-8 rounded-2xl font-bold text-sm shadow-lg shadow-[#00D09C44] flex items-center gap-2">
          Identify Plant <Plus size={18} />
        </div>
      </button>

      <div className="grid grid-cols-2 gap-5">
        {plants.map((plant) => (
          <div key={plant.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group cursor-pointer active:scale-[0.98] transition-all">
            <div className="relative h-48">
              <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${plant.statusColor} backdrop-blur-md bg-opacity-90`}>
                {plant.status}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-base mb-0.5 truncate">{plant.name}</h3>
              <p className="text-gray-400 text-[10px] font-medium italic mb-3 truncate">{plant.species}</p>
              
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <Droplets size={12} className="text-blue-400" />
                <span>Last: {plant.lastWatered}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {plants.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
           <Leaf size={48} className="mb-4" />
           <p className="font-bold">Your garden is empty</p>
        </div>
      )}
    </div>
  );
};

export default MyPlantsScreen;
