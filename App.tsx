
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from './components/Layout.tsx';
import HomeScreen from './screens/HomeScreen.tsx';
import MyPlantsScreen from './screens/MyPlantsScreen.tsx';
import DiagnosticsScreen from './screens/DiagnosticsScreen.tsx';
import MapScreen from './screens/MapScreen.tsx';
import LoginScreen from './screens/LoginScreen.tsx';
import PlantResultScreen from './screens/PlantResultScreen.tsx';
import DiagnosisResultScreen from './screens/DiagnosisResultScreen.tsx';
import FavoritesScreen from './screens/FavoritesScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import ChatScreen from './screens/ChatScreen.tsx';
import TermsScreen from './screens/TermsScreen.tsx';
import UpsellScreen from './screens/UpsellScreen.tsx';
import SplashScreen from './screens/SplashScreen.tsx';
import ReminderModal from './components/ReminderModal.tsx';
import { identifyPlant, diagnoseHealth, getPlantInfoByName } from './services/geminiService.ts';
import { getWikiImages, getWikiThumbnail } from './services/wikiService.ts';
import { IdentificationResponse, WikiImage, UserProfile, DiagnosticResult, Reminder } from './types.ts';
import { Loader2, X, Sprout, Crown, Check, AlertCircle, BellRing, Activity, Sparkles, Cpu, Bell, CheckCircle2, Star, ShieldCheck, ArrowRight, Sparkle, Clock, Droplets, PartyPopper, Zap, FlaskConical, Scissors, Wind, Shovel, Search, Camera, Aperture, Fingerprint, Microscope, CalendarDays, Scan, Leaf, ZapOff, Crosshair, Target } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [termsInitialTab, setTermsInitialTab] = useState<'terms' | 'privacy'>('terms');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<'scan' | 'search' | 'diagnose'>('scan');
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [currentSearchName, setCurrentSearchName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [idResult, setIdResult] = useState<IdentificationResponse | null>(null);
  const [diagResult, setDiagResult] = useState<Omit<DiagnosticResult, 'id' | 'timestamp'> & { imageUrl?: string } | null>(null);
  const [wikiImages, setWikiImages] = useState<WikiImage[]>([]);
  const [myPlants, setMyPlants] = useState<any[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [completions, setCompletions] = useState<Record<string, Array<{type: string, timestamp: string}>>>({});
  const [reminderPlant, setReminderPlant] = useState<{id: string, name: string} | null>(null);
  const [showProSuccess, setShowProSuccess] = useState(false);
  const [showAddSuccess, setShowAddSuccess] = useState<{name: string, image: string} | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | undefined>(undefined);
  
  const [activeDueTask, setActiveDueTask] = useState<Reminder & { plantName: string } | null>(null);
  const [completedTaskData, setCompletedTaskData] = useState<{ plantName: string, type: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('flora_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedGarden = localStorage.getItem('flora_garden');
    if (savedGarden) setMyPlants(JSON.parse(savedGarden));

    const savedReminders = localStorage.getItem('flora_reminders');
    if (savedReminders) setReminders(JSON.parse(savedReminders));

    const savedCompletions = localStorage.getItem('flora_completions');
    if (savedCompletions) setCompletions(JSON.parse(savedCompletions));

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const showInAppToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const triggerSystemNotification = useCallback((title: string, body: string) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (e) {
        console.warn("Notification blocked:", e);
      }
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      if (reminders.length === 0 || showSplash) return;
      
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toDateString();

      reminders.forEach(r => {
        let isFrequencyDue = false;
        if (!r.lastCompleted) {
          isFrequencyDue = true;
        } else {
          const lastDate = new Date(r.lastCompleted);
          const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (r.frequency === 'Daily' && diffDays >= 1) isFrequencyDue = true;
          else if (r.frequency === 'Weekly' && diffDays >= 7) isFrequencyDue = true;
          else if (r.frequency === 'Bi-weekly' && diffDays >= 14) isFrequencyDue = true;
          else if (r.frequency === 'Monthly' && diffDays >= 30) isFrequencyDue = true;
        }

        if (isFrequencyDue && r.time === currentTimeStr && r.lastNotificationDate !== todayStr) {
          const plant = myPlants.find(p => p.id === r.plantId);
          const msg = `Time to ${r.type} your ${plant?.name || 'plant'}!`;
          
          triggerSystemNotification("Botanical Alert", msg);
          if (plant) setActiveDueTask({ ...r, plantName: plant.name });

          const updated = reminders.map(rem => rem.id === r.id ? { ...rem, lastNotificationDate: todayStr } : rem);
          setReminders(updated);
          localStorage.setItem('flora_reminders', JSON.stringify(updated));
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders, myPlants, showSplash, triggerSystemNotification]);

  const handleCompleteTask = (plantId: string, taskType: string, reminderId?: string) => {
    const now = new Date();
    const todayStr = now.toDateString();
    const plant = myPlants.find(p => p.id === plantId);

    const newCompletion = { type: taskType, timestamp: now.toISOString() };
    const plantCompletions = completions[plantId] || [];
    const newCompletionsMap = {
      ...completions,
      [plantId]: [newCompletion, ...plantCompletions].slice(0, 50)
    };
    setCompletions(newCompletionsMap);
    localStorage.setItem('flora_completions', JSON.stringify(newCompletionsMap));

    const updatedReminders = reminders.map(r => {
      const isMatch = reminderId ? r.id === reminderId : (r.plantId === plantId && r.type === taskType);
      if (isMatch) {
        return { ...r, lastNotificationDate: todayStr, lastCompleted: now.toISOString() };
      }
      return r;
    });
    setReminders(updatedReminders);
    localStorage.setItem('flora_reminders', JSON.stringify(updatedReminders));

    const updatedPlants = myPlants.map(p => {
      if (p.id === plantId) {
        return {
          ...p,
          lastCare: { ...p.lastCare, [taskType]: now.toISOString() }
        };
      }
      return p;
    });
    setMyPlants(updatedPlants);
    localStorage.setItem('flora_garden', JSON.stringify(updatedPlants));
    
    setActiveDueTask(null);
    setCompletedTaskData({ plantName: plant?.name || 'Specimen', type: taskType });
    setTimeout(() => setCompletedTaskData(null), 3000);
  };

  const checkAndSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        return true;
      }
    }
    return true;
  };

  const executeWithKeySafety = async (fn: () => Promise<void>) => {
    try {
      setError(null);
      setIsProcessing(true);
      await checkAndSelectKey();
      await fn();
    } catch (err: any) {
      console.error("Botanical API Error:", err);
      setError(err.message || "Model connection lost. Please try again.");
      showInAppToast("Connection error", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = (name: string, email: string) => {
    const u = { id: '1', name, email, isSubscribed: false };
    setUser(u);
    localStorage.setItem('flora_user', JSON.stringify(u));
    setActiveTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('flora_user');
    setActiveTab('home');
    showInAppToast("Logged out safely", "info");
  };

  const handleNavigate = (tab: string) => {
    const proTabs = ['my-plants', 'diagnose', 'stores', 'chat'];
    if (proTabs.includes(tab) && !user?.isSubscribed) {
      setActiveTab('upsell');
    } else {
      setActiveTab(tab);
      setIdResult(null);
      setDiagResult(null);
      setSelectedPlantId(undefined);
      setError(null);
    }
  };

  const handlePlantSearch = (query: string) => {
    setCurrentSearchName(query);
    setProcessingType('search');
    executeWithKeySafety(async () => {
      setActiveTab('id-result');
      setIsSearchLoading(true);
      setIdResult(null); 
      setWikiImages([]);
      setSelectedPlantId(undefined);

      const result = await getPlantInfoByName(query);
      setIdResult(result);
      
      const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
      const similar = await Promise.all(result.similarPlants.map(async (p) => {
        const thumb = await getWikiThumbnail(p.scientificName || p.name);
        return { ...p, imageUrl: thumb || `https://picsum.photos/seed/${p.name}/400/600` };
      }));

      setWikiImages(images);
      setIdResult({ ...result, similarPlants: similar });
      setIsSearchLoading(false);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      if (activeTab === 'diagnose') {
        setProcessingType('diagnose');
        executeWithKeySafety(async () => {
          const result = await diagnoseHealth(base64);
          const newDiag: DiagnosticResult = { 
            ...result, 
            id: Date.now().toString(), 
            timestamp: new Date().toISOString(), 
            imageUrl: reader.result as string 
          };
          
          const history = JSON.parse(localStorage.getItem('flora_diag_history') || '[]');
          localStorage.setItem('flora_diag_history', JSON.stringify([newDiag, ...history]));
          
          setDiagResult(newDiag);
          setActiveTab('diag-result');
          showInAppToast("Diagnostic scan complete", "success");
        });
      } else {
        setProcessingType('scan');
        executeWithKeySafety(async () => {
          const result = await identifyPlant(base64);
          setIdResult(result);
          setActiveTab('id-result');
          setSelectedPlantId(undefined);
          setIsSearchLoading(true);
          const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
          setWikiImages(images);
          setIsSearchLoading(false);
          showInAppToast("Specimen identified", "success");
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addPlantToGarden = (plant: any) => {
    const newId = Date.now().toString();
    const newPlant = {
      id: newId,
      name: plant.name,
      species: plant.species,
      image: plant.image || `https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=400&h=600&auto=format&fit=crop`,
      status: 'Healthy',
      statusColor: 'text-emerald-500 bg-emerald-50',
      lastWatered: 'Just added',
      lastCare: {}, 
      fullData: plant.fullData, 
      wikiImages: plant.wikiImages 
    };
    const updated = [newPlant, ...myPlants];
    setMyPlants(updated);
    localStorage.setItem('flora_garden', JSON.stringify(updated));
    setSelectedPlantId(newId);
    
    // Trigger the success pop-up
    setShowAddSuccess({ name: plant.name, image: newPlant.image });
  };

  const handleSaveReminder = (reminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      lastNotificationDate: '' 
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem('flora_reminders', JSON.stringify(updated));
    setReminderPlant(null);
    showInAppToast("Care schedule updated", "success");
  };

  const handleRemovePlant = (id: string) => {
    const updatedPlants = myPlants.filter(p => p.id !== id);
    const updatedReminders = reminders.filter(r => r.plantId !== id);
    
    setMyPlants(updatedPlants);
    setReminders(updatedReminders);
    
    localStorage.setItem('flora_garden', JSON.stringify(updatedPlants));
    localStorage.setItem('flora_reminders', JSON.stringify(updatedReminders));
    showInAppToast("Specimen removed from garden", "info");
  };

  if (showSplash) return <SplashScreen />;

  if (!user && activeTab === 'terms') {
    return <TermsScreen onBack={() => setActiveTab('home')} initialTab={termsInitialTab} />;
  }

  if (!user) {
    return <LoginScreen 
      onLogin={handleLogin} 
      onShowTerms={(tab) => {
        if (tab) setTermsInitialTab(tab);
        setActiveTab('terms');
      }} 
    />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleNavigate} 
      onCameraClick={() => fileInputRef.current?.click()}
      userName={user.name}
      isSubscribed={user.isSubscribed}
    >
      {/* ALERTS & CELEBRATIONS */}
      {activeDueTask && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
           <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-[60px]"></div>
           <div className="relative z-10 w-full max-w-sm bg-white rounded-[4.5rem] p-12 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.8)] text-center animate-in zoom-in-90 slide-in-from-bottom-20 duration-700 border-4 border-white">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                 <div className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-2xl text-white animate-bounce">
                    <BellRing size={48} strokeWidth={2.5} />
                 </div>
              </div>
              <div className="mt-10 mb-10 text-center">
                 <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 leading-none uppercase italic">Protocol Alert</h2>
                 <p className="text-[#00D09C] text-[10px] font-black uppercase tracking-[0.4em] mb-10">Chrono-Sync Intercept</p>
                 <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border-2 border-gray-100 mb-2 shadow-inner">
                    <p className="text-gray-500 text-sm font-bold italic leading-relaxed">
                       "Unit <span className="text-gray-900 not-italic font-black underline decoration-[#00D09C] underline-offset-4">{activeDueTask.plantName}</span> requires immediate maintenance."
                    </p>
                 </div>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => handleCompleteTask(activeDueTask.plantId, activeDueTask.type, activeDueTask.id)}
                  className="w-full bg-[#00D09C] text-white py-7 rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                   Implement Now
                </button>
                <button 
                  onClick={() => setActiveDueTask(null)}
                  className="w-full bg-gray-50 text-gray-400 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest active:scale-95"
                >
                   Defer Protocol
                </button>
              </div>
           </div>
        </div>
      )}

      {/* ENHANCED SCAN ANIMATION OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 z-[1200] flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[100px]"></div>
          
          {/* Viewfinder Overlay Corners */}
          <div className="absolute inset-12 z-20 pointer-events-none opacity-40">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#00D09C] rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#00D09C] rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#00D09C] rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#00D09C] rounded-br-3xl"></div>
          </div>

          <div className="relative z-10 w-full max-w-[360px] bg-white/80 rounded-[5rem] p-16 shadow-[0_80px_160px_-40px_rgba(0,208,156,0.25)] text-center animate-in zoom-in-95 duration-700 flex flex-col items-center border-[8px] border-white backdrop-blur-md">
             
             {/* Dynamic Central UI */}
             <div className="relative w-56 h-56 mb-16 flex items-center justify-center">
                {/* Orbital Rings */}
                <div className="absolute inset-0 border-[2px] border-[#00D09C]/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
                <div className="absolute inset-4 border-[1px] border-dashed border-[#00D09C]/40 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
                <div className="absolute -inset-8 border-[1px] border-[#00D09C]/10 rounded-full animate-pulse"></div>
                
                {/* Icon Core */}
                <div className="w-44 h-44 bg-gradient-to-br from-emerald-50 to-white rounded-[4rem] flex items-center justify-center relative shadow-[inset_0_4px_25px_rgba(0,208,156,0.15)] border border-emerald-50 overflow-hidden group">
                   
                   {/* DUAL INTENSITY SCANNING BEAMS */}
                   <div className="absolute inset-x-0 h-[6px] bg-gradient-to-r from-transparent via-[#00D09C] to-transparent animate-[scan_2.5s_ease-in-out_infinite] top-0 z-30 shadow-[0_0_20px_#00D09C]"></div>
                   <div className="absolute inset-x-0 h-[12px] bg-gradient-to-r from-transparent via-[#00D09C]/30 to-transparent animate-[scan_2.5s_ease-in-out_infinite] top-0 z-20 blur-sm shadow-[0_0_40px_rgba(0,208,156,0.5)]"></div>
                   
                   <div className="bg-white p-10 rounded-[3rem] shadow-2xl relative animate-[float_3s_ease-in-out_infinite] border-2 border-emerald-50 flex items-center justify-center">
                      <Leaf 
                        size={80} 
                        className="text-[#00D09C] filter drop-shadow-[0_0_8px_rgba(0,208,156,0.3)]" 
                        fill="#00D09C10"
                        strokeWidth={2}
                      />
                   </div>
                </div>

                {/* Floating Technical Markers */}
                <div className="absolute -top-4 -right-4 bg-[#00D09C] p-4 rounded-3xl text-white shadow-[0_15px_30px_-5px_rgba(0,208,156,0.4)] rotate-12 scale-110 z-40">
                   <Aperture size={24} strokeWidth={3} className="animate-[spin_4s_linear_infinite]" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gray-900 p-3 rounded-2xl text-white shadow-xl -rotate-12 z-40">
                   <Target size={20} strokeWidth={3} className="animate-pulse" />
                </div>
             </div>

             {/* Typographic Content */}
             <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                   <div className="h-1 w-8 bg-[#00D09C] rounded-full opacity-30"></div>
                   <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none italic uppercase">
                      Neural Analysis
                   </h3>
                   <div className="h-1 w-8 bg-[#00D09C] rounded-full opacity-30"></div>
                </div>
                
                <div className="flex flex-col items-center">
                   <div className="bg-emerald-50 px-6 py-2 rounded-full mb-4 border border-emerald-100/50">
                      <p className="text-[#00D09C] text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">
                         {processingType === 'search' ? `PROBING Archive: ${currentSearchName}` : 'SEQUENCING DNA STRAND'}
                      </p>
                   </div>
                   
                   {/* Data Progress Indicator */}
                   <div className="flex gap-2.5">
                      {[1,2,3,4,5,6].map(i => (
                        <div 
                          key={i} 
                          className="w-2 h-2 bg-[#00D09C] rounded-full animate-bounce" 
                          style={{ animationDelay: `${i * 150}ms`, opacity: 0.2 + (i * 0.1) }}
                        ></div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="absolute bottom-10 right-12">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] leading-none italic">ALGO_CORE_X.9</p>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`${isProcessing ? 'blur-xl scale-[1.02] grayscale-[0.3] transition-all duration-1000 ease-out' : 'transition-all duration-700 ease-in'}`}>
        {activeTab === 'home' && (
          <HomeScreen 
            onNavigate={handleNavigate} 
            onSearch={handlePlantSearch} 
            isSubscribed={user.isSubscribed} 
            onScanClick={() => fileInputRef.current?.click()}
            onShowTerms={() => {
              setTermsInitialTab('terms');
              setActiveTab('terms');
            }}
          />
        )}
        {activeTab === 'my-plants' && (
          <MyPlantsScreen 
            plants={myPlants} 
            reminders={reminders} 
            completions={completions}
            onAddClick={() => fileInputRef.current?.click()} 
            onManageReminders={(id, name) => setReminderPlant({id, name})} 
            onPlantClick={p => { 
              setIdResult(p.fullData); 
              setWikiImages(p.wikiImages || []); 
              setSelectedPlantId(p.id);
              setActiveTab('id-result'); 
            }} 
            onRemovePlant={handleRemovePlant}
            onCompleteTask={handleCompleteTask}
          />
        )}
        {activeTab === 'diagnose' && (
          <DiagnosticsScreen 
            onStartDiagnosis={() => fileInputRef.current?.click()} 
            onHistoryItemClick={(result) => {
              setDiagResult(result);
              setActiveTab('diag-result');
            }}
          />
        )}
        {activeTab === 'stores' && <MapScreen />}
        {activeTab === 'favorites' && <FavoritesScreen onPlantClick={item => { setIdResult(item.fullData || null); setWikiImages(item.wikiImages || []); setActiveTab('id-result'); }} />}
        {activeTab === 'profile' && (
          <ProfileScreen 
            user={user} 
            stats={{ plants: myPlants.length, favorites: JSON.parse(localStorage.getItem('flora_favorites') || '[]').length, scans: JSON.parse(localStorage.getItem('flora_diag_history') || '[]').length }} 
            onLogout={handleLogout} 
            onNavigate={handleNavigate} 
            onToggleNotifications={() => {}} 
            onShowTerms={() => {
              setTermsInitialTab('terms');
              setActiveTab('terms');
            }} 
          />
        )}
        {activeTab === 'chat' && <ChatScreen />}
        {activeTab === 'id-result' && (
          <PlantResultScreen 
            data={idResult} 
            loading={isSearchLoading}
            placeholderName={currentSearchName}
            images={wikiImages}
            plantId={selectedPlantId}
            reminders={reminders}
            onAddToGarden={(n, s, i) => addPlantToGarden({ name: n, species: s, image: i, fullData: idResult, wikiImages })}
            onBack={() => setActiveTab('home')}
            onSearchSimilar={(plant) => handlePlantSearch(plant.name)}
            onFindStores={() => handleNavigate('stores')}
            onAddReminder={() => {
               if (selectedPlantId && idResult) setReminderPlant({ id: selectedPlantId, name: idResult.identification.commonName });
               else showInAppToast("Add plant to garden first", "info");
            }}
            onCompleteTask={(type) => {
              if (selectedPlantId) handleCompleteTask(selectedPlantId, type);
            }}
          />
        )}
        {activeTab === 'diag-result' && diagResult && <DiagnosisResultScreen result={diagResult} onBack={() => setActiveTab('diagnose')} />}
        {activeTab === 'upsell' && <UpsellScreen onSubscribe={() => { const u = {...user, isSubscribed: true}; setUser(u); localStorage.setItem('flora_user', JSON.stringify(u)); setShowProSuccess(true); setActiveTab('home'); }} onBack={() => setActiveTab('home')} />}
      </div>

      {showProSuccess && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-2xl" onClick={() => setShowProSuccess(false)}></div>
           <div className="bg-white w-full max-sm rounded-[4rem] p-10 shadow-2xl relative z-10 text-center">
              <div className="mb-8 flex justify-center">
                 <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-emerald-50 text-amber-500 animate-bounce">
                    <Crown size={64} fill="currentColor" />
                 </div>
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">PlantHound Pro Active</h2>
              <button onClick={() => setShowProSuccess(false)} className="w-full bg-[#00D09C] text-white py-6 rounded-[2rem] font-black">Get Started</button>
           </div>
        </div>
      )}

      {showAddSuccess && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-2xl" onClick={() => setShowAddSuccess(null)}></div>
           <div className="bg-white w-full max-w-sm rounded-[4rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative z-10 text-center animate-in zoom-in-95 duration-500 border-[6px] border-white">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                 <div className="relative">
                    <div className="absolute -inset-4 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                    <div className="bg-[#00D09C] p-8 rounded-[2.8rem] shadow-2xl text-white relative border-4 border-white">
                       <PartyPopper size={48} strokeWidth={2.5} />
                    </div>
                 </div>
              </div>
              
              <div className="mt-14 mb-10">
                 <div className="relative w-32 h-32 mx-auto mb-6">
                    <img src={showAddSuccess.image} className="w-full h-full rounded-[2.5rem] object-cover border-4 border-emerald-50 shadow-xl" alt={showAddSuccess.name} />
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg text-[#00D09C]">
                       <Check size={20} strokeWidth={4} />
                    </div>
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 leading-[0.9] mb-3 italic uppercase tracking-tighter">Specimen Integrated</h2>
                 <p className="text-gray-400 text-xs font-bold px-4 italic leading-relaxed">
                    Unit <span className="text-gray-900 not-italic font-black underline decoration-[#00D09C] underline-offset-4">{showAddSuccess.name}</span> has been successfully indexed into your collection.
                 </p>
              </div>

              <div className="space-y-4">
                 <button 
                  onClick={() => { handleNavigate('my-plants'); setShowAddSuccess(null); }}
                  className="w-full bg-[#00D09C] text-white py-6 rounded-[2.2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    Access Garden <ArrowRight size={18} strokeWidth={3} />
                 </button>
                 <button 
                  onClick={() => setShowAddSuccess(null)}
                  className="w-full bg-gray-50 text-gray-400 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                 >
                    Dismiss Protocol
                 </button>
              </div>
           </div>
        </div>
      )}

      {reminderPlant && (
        <ReminderModal 
          plantId={reminderPlant.id}
          plantName={reminderPlant.name}
          onClose={() => setReminderPlant(null)}
          onSave={handleSaveReminder}
        />
      )}

      {error && (
        <div className="fixed bottom-24 left-6 right-6 z-[150] bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-6 shadow-2xl flex gap-4">
           <AlertCircle size={20} className="text-rose-600" />
           <p className="text-rose-700 text-xs font-medium">{error}</p>
           <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*" 
        capture="environment" 
      />

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(220px); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Layout>
  );
};

export default App;
