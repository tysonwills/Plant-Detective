
import React, { useState, useEffect, useMemo } from 'react';
import { Leaf, Droplets, Plus, Camera, Bell, BellOff, Calendar, ChevronRight, Trash2, X, AlertCircle, Search, History, CheckCircle2, FlaskConical, Scissors, Wind, Clock, Check, BarChart3, Activity, Sparkle, Shovel, Zap, HeartPulse, ShieldCheck, ShieldAlert, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Reminder, DiagnosticResult } from '../types';

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
  const [diagHistory, setDiagHistory] = useState<DiagnosticResult[]>([]);
  const [showHealthTooltip, setShowHealthTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(window.Notification.permission);
    }
    const saved = localStorage.getItem('flora_diag_history');
    if (saved) {
      setDiagHistory(JSON.parse(saved));
    }
  }, []);

  const todayStr = useMemo(() => new Date().toDateString(), []);

  // Detailed Health Score Calculation
  const getPlantHealthDetails = (plant: any) => {
    let score = 100;
    const plantReminders = reminders.filter(r => r.plantId === plant.id);
    const plantHistory = completions[plant.id] || [];
    
    const deductions = {
      maintenance: 0,
      adherence: 0,
      pathology: 0
    };

    // 1. Adherence: Overdue tasks
    const overdueTasks = plantReminders.filter(r => r.lastNotificationDate !== todayStr);
    deductions.adherence = overdueTasks.length * 15;
    score -= deductions.adherence;

    // 2. Maintenance: Watering and care recency
    const waterReminders = plantReminders.filter(r => r.type === 'Water');
    const lastWateredTask = plantHistory.filter(h => h.type === 'Water').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (waterReminders.length > 0) {
      if (!lastWateredTask) {
        deductions.maintenance += 10;
      } else {
        const lastDate = new Date(lastWateredTask.timestamp);
        const daysSinceWater = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const recommendedInterval = plant.fullData?.care?.wateringDaysInterval || 7;
        if (daysSinceWater > recommendedInterval) {
          deductions.maintenance += Math.min(30, (daysSinceWater - recommendedInterval) * 8);
        }
      }
    }
    score -= deductions.maintenance;

    // 3. Pathology: Diagnostic History
    const recentDiag = diagHistory
      .filter(d => d.plantName.toLowerCase() === plant.name.toLowerCase() || d.plantName.toLowerCase() === plant.species.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (recentDiag) {
      if (recentDiag.severity === 'Critical') deductions.pathology = 40;
      else if (recentDiag.severity === 'Warning') deductions.pathology = 20;
    }
    score -= deductions.pathology;

    const finalScore = Math.max(0, Math.min(100, score));
    
    return {
      score: finalScore,
      deductions,
      status: finalScore >= 85 ? 'Optimal' : finalScore >= 60 ? 'Fair' : 'Critical',
      trend: finalScore >= 85 ? 'stable' : finalScore >= 60 ? 'warning' : 'declining'
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-50';
    if (score >= 60) return 'bg-amber-50';
    return 'bg-rose-50';
  };

  const dailyTasks = useMemo(() => {
    return reminders.filter(r => r.lastNotificationDate !== todayStr).map(reminder => {
      const plant = plants.find(p => p.id === reminder.plantId);
      return { ...reminder, plantName: plant?.name || 'Plant', plantImage: plant?.image };
    });
  }, [reminders, plants, todayStr]);

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

  return (
    <div className="px-6 pt-4 pb-24 relative min-h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">My Garden</h2>
          <p className="text-gray-500 font-medium text-sm">{plants.length} species thriving</p>
        </div>
        {notificationPermission !== 'granted' && reminders.length > 0 && (
          <button 
            onClick={() => window.Notification.requestPermission().then(setNotificationPermission)}
            className="bg-amber-50 text-amber-600 p-2.5 rounded-2xl animate-pulse"
          >
            <BellOff size={18} />
          </button>
        )}
      </div>

      {/* Daily Routine Summary */}
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
                      {React.cloneElement(getTaskIcon(task.type) as React.ReactElement<any>, { size: 10 })}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-gray-900 truncate uppercase tracking-tighter">{task.plantName}</p>
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

      {/* Plant Grid */}
      <div className="flex flex-col gap-10">
        {plants.map((plant) => {
          const plantReminders = reminders.filter(r => r.plantId === plant.id);
          const history = completions[plant.id] || [];
          const health = getPlantHealthDetails(plant);
          const isLogVisible = showLogId === plant.id;
          
          return (
            <div 
              key={plant.id} 
              className="bg-white rounded-[3rem] overflow-hidden shadow-md border border-gray-100 flex flex-col group relative active:scale-[0.99] transition-all duration-300"
              onClick={() => onPlantClick(plant)}
            >
              <div className="relative h-72 cursor-pointer overflow-hidden">
                <img src={plant.image} alt={plant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                
                {/* Health Score Overlay */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                  <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider ${plant.statusColor} backdrop-blur-md bg-opacity-90 shadow-lg border border-white/20 pointer-events-auto`}>
                    {plant.status}
                  </div>

                  <div className="relative pointer-events-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHealthTooltip(showHealthTooltip === plant.id ? null : plant.id);
                      }}
                      className={`w-20 h-20 rounded-[2.2rem] backdrop-blur-xl border-4 shadow-2xl flex flex-col items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 ${getScoreBg(health.score)} ${health.score >= 85 ? 'border-emerald-200' : health.score >= 60 ? 'border-amber-200' : 'border-rose-200'}`}
                    >
                      <div className="relative">
                        <span className={`text-2xl font-black tracking-tighter leading-none ${getScoreColor(health.score)}`}>{health.score}%</span>
                        {health.trend === 'stable' ? <TrendingUp size={12} className="text-emerald-500 absolute -top-4 -right-3" /> : <TrendingDown size={12} className="text-rose-500 absolute -top-4 -right-3" />}
                      </div>
                      <span className={`text-[7px] font-black uppercase tracking-widest mt-1 opacity-60 ${getScoreColor(health.score)}`}>Bio-Vibrancy</span>
                    </button>

                    {/* Health Insights Tooltip */}
                    {showHealthTooltip === plant.id && (
                      <div className="absolute top-full mt-4 right-0 w-64 bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-gray-100 z-50 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Health Breakdown</h4>
                          <button onClick={() => setShowHealthTooltip(null)}><X size={14} className="text-gray-300" /></button>
                        </div>
                        <div className="space-y-3">
                          <HealthFactor label="Maintenance" value={100 - health.deductions.maintenance} color="emerald" />
                          <HealthFactor label="Adherence" value={100 - health.deductions.adherence} color="blue" />
                          <HealthFactor label="Pathology" value={100 - health.deductions.pathology} color="amber" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                           <p className="text-[9px] font-bold text-gray-500 leading-relaxed italic">
                             {health.score >= 85 ? "Optimal cellular function. Biological processes are synchronized." : 
                              health.score >= 60 ? "Maintenance drift detected. Adherence optimization recommended." : 
                              "Critical physiological stress. Immediate clinical intervention required."}
                           </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-8 left-8 pointer-events-none">
                  <h3 className="font-black text-white text-3xl tracking-tight leading-none mb-1">{plant.name}</h3>
                  <p className="text-emerald-300 text-[11px] font-black italic tracking-widest uppercase opacity-90">{plant.species}</p>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col bg-white">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2.5 rounded-xl text-[#00D09C]">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Activity Tracking</p>
                      <p className="text-sm font-black text-gray-900 leading-none">14-Day Cycle</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLogId(isLogVisible ? null : plant.id);
                    }}
                    className={`px-5 py-2.5 rounded-2xl border font-black text-[9px] uppercase tracking-wider transition-all ${isLogVisible ? 'bg-[#00D09C] text-white border-[#00D09C]' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-100'}`}
                  >
                    {isLogVisible ? 'Close Log' : 'History'}
                  </button>
                </div>

                {/* Overdue Alert */}
                {plantReminders.some(r => r.lastNotificationDate !== todayStr) && (
                  <div className="mb-8 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                    <AlertCircle size={18} className="text-rose-500" />
                    <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Action Required: Maintenance Overdue</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5 mb-8">
                  {plantReminders.map((task) => {
                    const isDue = task.lastNotificationDate !== todayStr;
                    return (
                      <button
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompleteTask?.(plant.id, task.type);
                        }}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all active:scale-95 shadow-sm ${getTaskLightColor(task.type)} ${isDue ? 'ring-2 ring-current shadow-lg' : 'opacity-80 border-gray-100'}`}
                      >
                        {React.cloneElement(getTaskIcon(task.type) as React.ReactElement<any>, { size: 16, strokeWidth: 3 })}
                        <span className="text-[10px] font-black uppercase tracking-widest">{task.type}</span>
                        {isDue && <div className="w-2 h-2 rounded-full bg-current animate-ping"></div>}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-8">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemovePlant(plant.id); }}
                    className="p-3 bg-gray-50 rounded-2xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                  >
                    <Trash2 size={22} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onManageReminders(plant.id, plant.name); }}
                    className="bg-[#EFFFFB] text-[#00D09C] px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-[#00D09C] hover:text-white transition-all active:scale-95 flex items-center gap-3"
                  >
                    <Plus size={18} strokeWidth={4} /> Add Reminder
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {plants.length > 0 && (
        <button 
          onClick={onAddClick}
          className="w-full mt-16 py-12 rounded-[4rem] border-4 border-dashed border-gray-200 text-gray-300 font-black text-base uppercase tracking-widest flex flex-col items-center justify-center gap-4 hover:bg-gray-50 hover:border-[#00D09C]/20 hover:text-[#00D09C] transition-all"
        >
          <div className="p-4 bg-gray-50 rounded-3xl group-hover:bg-emerald-50 transition-colors">
            <Plus size={32} strokeWidth={4} />
          </div>
          Add Specimen
        </button>
      )}
    </div>
  );
};

const HealthFactor = ({ label, value, color }: { label: string, value: number, color: 'emerald' | 'blue' | 'amber' }) => {
  const colors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500'
  };
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-900">{value}%</span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

export default MyPlantsScreen;
