import React, { useState, useEffect, useMemo } from 'react';
import { Leaf, Droplets, Plus, Camera, Bell, BellOff, Calendar, ChevronRight, Trash2, X, AlertCircle, Search, History, CheckCircle2, FlaskConical, Scissors, Wind, Clock, Check, BarChart3, Activity, Sparkle, Shovel, Zap } from 'lucide-react';
import { Reminder } from '../types';

interface MyPlantsScreenProps {
  plants: any[];
  reminders: Reminder[];
  completions?: Record<string, Array<{type: string, timestamp: string}>>;
  onAddClick: () => void;
  onManageReminders: (id: string, name: string) => void;
  onPlantClick: (plant: any) => void;
  onRemovePlant: (id: string) => void;
  onCompleteTask?: (plantId: string, taskType: string) => void;
}

const MyPlantsScreen: React.FC<MyPlantsScreenProps> = ({ 
  plants, 
  reminders, 
  completions = {}, 
  onAddClick, 
  onManageReminders, 
  onPlantClick, 
  onRemovePlant,
  onCompleteTask 
}) => {
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [showLogId, setShowLogId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(window.Notification.permission);
    }
  }, []);

  const todayStr = useMemo(() => new Date().toDateString(), []);

  // Filter tasks that are due today and not yet completed
  const dailyTasks = useMemo(() => {
    return reminders.filter(r => r.lastNotificationDate !== todayStr).map(reminder => {
      const plant = plants.find(p => p.id === reminder.plantId);
      return { ...reminder, plantName: plant?.name || 'Plant', plantImage: plant?.image };
    });
  }, [reminders, plants, todayStr]);

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
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await window.Notification.requestPermission();
      setNotificationPermission(res);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const getTaskIcon = (type: string) => {
    if (type.includes('Water')) return <Droplets size={12} />;
    if (type.includes('Fertil')) return <FlaskConical size={12} />;
    if (type.includes('Prun')) return <Scissors size={12} />;
    if (type.includes('Mist')) return <Wind size={12} />;
    if (type.includes('Clean')) return <Sparkle size={12} />;
    if (type.includes('Repot')) return <Shovel size={12} />;
    return <CheckCircle2 size={12} />;
  };

  const getTaskColor = (type: string) => {
    if (type.includes('Water')) return 'bg-blue-500';
    if (type.includes('Fertil')) return 'bg-amber-500';
    if (type.includes('Prun')) return 'bg-purple-500';
    if (type.includes('Mist')) return 'bg-cyan-500';
    if (type.includes('Clean')) return 'bg-emerald-500';
    if (type.includes('Repot')) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const getTaskLightColor = (type: string) => {
    if (type.includes('Water')) return 'bg-blue-50 text-blue-500';
    if (type.includes('Fertil')) return 'bg-amber-50 text-amber-500';
    if (type.includes('Prun')) return 'bg-purple-50 text-purple-500';
    if (type.includes('Mist')) return 'bg-cyan-50 text-cyan-500';
    if (type.includes('Clean')) return 'bg-emerald-50 text-emerald-600';
    if (type.includes('Repot')) return 'bg-orange-50 text-orange-600';
    return 'bg-emerald-50 text-[#00D09C]';
  };

  const getLastCareText = (plant: any, taskType: string) => {
    // Lookup the timestamp for the specific task category
    const lastTime = plant.lastCare?.[taskType];
    if (!lastTime) return null;
    
    const date = new Date(lastTime);
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const renderHistoryGrid = (plantId: string) => {
    const history = completions[plantId] || [];
    const squares = [];
    const now = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toDateString();
      
      const tasksOnDay = history.filter(h => new Date(h.timestamp).toDateString() === dateStr);
      
      squares.push(
        <div 
          key={i} 
          className={`h-2.5 w-2.5 rounded-[3px] transition-all duration-700 ${
            tasksOnDay.length > 0 ? getTaskColor(tasksOnDay[0].type) : 'bg-gray-100'
          }`}
          title={tasksOnDay.length > 0 ? `${tasksOnDay.length} task(s) on ${dateStr}` : `No activity on ${dateStr}`}
        />
      );
    }
    return squares;
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

      {/* Global "Today's Routine" Task Board */}
      {dailyTasks.length > 0 && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={16} className="text-[#00D09C]" />
              Today's Routine
            </h3>
            <span className="text-[10px] font-bold text-[#00D09C] bg-[#EFFFFB] px-2.5 py-1 rounded-full uppercase tracking-widest">
              {dailyTasks.length} Pending
            </span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
            {dailyTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => onCompleteTask?.(task.plantId, task.type)}
                className="flex-shrink-0 w-48 bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col gap-3 group active:scale-[0.97] transition-all cursor-pointer hover:border-[#00D09C]/30"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <img src={task.plantImage} className="w-full h-full object-cover rounded-xl" alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-[#00D09C] text-white p-1 rounded-lg border-2 border-white">
                      {React.cloneElement(getTaskIcon(task.type) as React.ReactElement, { size: 10 })}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-gray-900 truncate leading-tight uppercase tracking-tighter">{task.plantName}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{task.time}</p>
                  </div>
                </div>
                <div className="bg-[#EFFFFB] text-[#00D09C] py-2.5 rounded-xl flex items-center justify-center gap-1.5 group-hover:bg-[#00D09C] group-hover:text-white transition-all">
                  <Check size={12} strokeWidth={3} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Done</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="flex flex-col gap-8">
        {plants.map((plant) => {
          const plantReminders = reminders.filter(r => r.plantId === plant.id);
          const history = completions[plant.id] || [];
          const isLogVisible = showLogId === plant.id;
          
          return (
            <div 
              key={plant.id} 
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group relative active:scale-[0.99] transition-all duration-300"
              onClick={() => onPlantClick(plant)}
            >
              {/* Care Activity Dashboard (Grid & Logs) */}
              <div className="bg-gray-50/50 border-b border-gray-100 p-5 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                   <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-1.5">
                      <BarChart3 size={10} className="text-[#00D09C]" /> 
                      Growth Cycle (14d)
                   </div>
                   <div className="flex gap-1.5">
                      {renderHistoryGrid(plant.id)}
                   </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLogId(isLogVisible ? null : plant.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-[1.2rem] border transition-all ${isLogVisible ? 'bg-[#00D09C] text-white border-[#00D09C] shadow-lg shadow-emerald-100' : 'bg-white text-gray-400 border-gray-200 shadow-sm'}`}
                >
                  <span className="text-[9px] font-black uppercase tracking-wider">Activity</span>
                  <History size={14} />
                </button>
              </div>

              {/* Collapsible Care History */}
              {isLogVisible && (
                <div className="bg-white border-b border-gray-100 p-6 max-h-[300px] overflow-y-auto animate-in slide-in-from-top-4 duration-500 scrollbar-hide">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Clock size={12} /> Care Records
                    </h4>
                    <span className="text-[9px] font-bold text-[#00D09C] bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{history.length} Actions</span>
                  </div>
                  
                  <div className="space-y-4">
                    {history.length > 0 ? (
                      history.map((log, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-none last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className={`${getTaskLightColor(log.type)} p-2.5 rounded-[1rem] shadow-sm`}>
                              {React.cloneElement(getTaskIcon(log.type) as React.ReactElement, { size: 16 })}
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-gray-900 uppercase tracking-tighter leading-tight">{log.type}</p>
                               <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5 opacity-80">Logged</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-gray-800 leading-none mb-1">{formatDate(log.timestamp)}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{formatTime(log.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center py-10 opacity-30">
                         <Activity size={40} className="mb-3 text-gray-300" />
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Database Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info & Scheduling Section */}
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-56 sm:h-auto sm:w-1/3 cursor-pointer overflow-hidden">
                  <img src={plant.image} alt={plant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider ${plant.statusColor} backdrop-blur-md bg-opacity-90 shadow-lg border border-white/20`}>
                    {plant.status}
                  </div>
                </div>
                
                <div className="p-7 flex-1 flex flex-col cursor-pointer bg-white">
                  {/* Actionable Tasks Header */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plantReminders.map((task) => {
                      const isDue = task.lastNotificationDate !== todayStr;
                      const lastCareText = getLastCareText(plant, task.type);
                      
                      return (
                        <button
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompleteTask?.(plant.id, task.type);
                          }}
                          className={`flex flex-col items-start gap-0.5 px-4 py-2 rounded-[1.2rem] border transition-all active:scale-95 shadow-sm ${getTaskLightColor(task.type)} ${isDue ? 'ring-2 ring-current' : 'opacity-80 border-gray-100'}`}
                        >
                          <div className="flex items-center gap-1.5">
                            {React.cloneElement(getTaskIcon(task.type) as React.ReactElement, { size: 12 })}
                            <span className="text-[9px] font-black uppercase tracking-widest">{task.type}</span>
                          </div>
                          {lastCareText && (
                            <span className="text-[7px] font-bold uppercase opacity-60">Last: {lastCareText}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black text-gray-900 text-2xl tracking-tight truncate leading-none">{plant.name}</h3>
                  </div>
                  <p className="text-[#00D09C] text-[10px] font-black italic tracking-widest truncate mb-8 uppercase opacity-80">{plant.species}</p>
                  
                  <div className="mt-auto flex items-center justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onManageReminders(plant.id, plant.name);
                      }}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00D09C] bg-[#EFFFFB] px-8 py-3 rounded-[1.2rem] border border-emerald-100/50 shadow-sm hover:bg-[#00D09C] hover:text-white transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Plus size={14} strokeWidth={3} /> Add Reminder
                    </button>
                  </div>
                </div>
              </div>

              {/* Float Trash Action */}
              <div className="absolute top-[280px] left-4 flex flex-col gap-3 z-10">
                <button 
                  onClick={(e) => handleDeleteRequest(e, plant)}
                  className="bg-white/95 backdrop-blur-md p-3 rounded-[1.2rem] text-rose-400 shadow-xl border border-rose-50 active:scale-90 transition-transform hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {plants.length > 0 && (
        <button 
          onClick={onAddClick}
          className="w-full mt-12 py-10 rounded-[3.5rem] border-4 border-dashed border-gray-100 text-gray-300 font-black text-base uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-gray-50 hover:border-[#00D09C]/20 hover:text-[#00D09C] transition-all"
        >
          <Plus size={28} strokeWidth={4} /> Expand Garden
        </button>
      )}

      {/* Confirmation Modal Overlay */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[4rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-center border-t-8 border-rose-500">
            <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-rose-500 shadow-inner">
              <AlertCircle size={48} />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight leading-none">Remove Plant?</h2>
            <p className="text-gray-500 text-sm font-semibold leading-relaxed mb-10 px-4">
              Are you sure you want to remove <span className="text-gray-900 font-black uppercase">{confirmDelete.name}</span> from your collection? 
            </p>

            <div className="flex flex-col gap-4">
              <button 
                onClick={executeDelete}
                className="w-full bg-rose-500 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-2xl shadow-rose-200 active:scale-95 transition-transform"
              >
                Yes, Remove it
              </button>
              <button 
                onClick={() => setConfirmDelete(null)}
                className="w-full bg-gray-50 text-gray-400 py-5 rounded-[2.5rem] font-black text-base uppercase tracking-widest active:scale-95 transition-transform"
              >
                Abort Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlantsScreen;