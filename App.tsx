
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from './components/Layout';
import HomeScreen from './screens/HomeScreen';
import MyPlantsScreen from './screens/MyPlantsScreen';
import DiagnosticsScreen from './screens/DiagnosticsScreen';
import MapScreen from './screens/MapScreen';
import LoginScreen from './screens/LoginScreen';
import PlantResultScreen from './screens/PlantResultScreen';
import DiagnosisResultScreen from './screens/DiagnosisResultScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import ReminderModal from './components/ReminderModal';
import SplashScreen from './screens/SplashScreen';
import { identifyPlant, diagnoseHealth, getPlantInfoByName } from './services/geminiService';
import { getWikiImages, getWikiThumbnail } from './services/wikiService';
import { IdentificationResponse, WikiImage, UserProfile, DiagnosticResult, Reminder } from './types';
import { Loader2, Droplets, X, Sprout, CheckCircle, ArrowRight, Crown, Check, ShieldCheck, Zap, Sparkles, Leaf, MapPin, AlertCircle, Bell, BellRing, Clock, PartyPopper, Scan, Activity, Microscope, Fingerprint, Search } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idResult, setIdResult] = useState<IdentificationResponse | null>(null);
  const [diagResult, setDiagResult] = useState<Omit<DiagnosticResult, 'id' | 'timestamp'> & { imageUrl?: string } | null>(null);
  const [wikiImages, setWikiImages] = useState<WikiImage[]>([]);
  const [myPlants, setMyPlants] = useState<any[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [completions, setCompletions] = useState<Record<string, Array<{type: string, timestamp: string}>>>({});
  const [reminderPlant, setReminderPlant] = useState<{id: string, name: string} | null>(null);
  const [activeNotification, setActiveNotification] = useState<{reminder: Reminder, plantName: string, plantImage?: string, isCompleting?: boolean} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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

  const triggerNotification = useCallback((reminder: Reminder, plantName: string, plantImage?: string) => {
    setActiveNotification({ reminder, plantName, plantImage });
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const NotificationClass = window.Notification;
      if (NotificationClass.permission === 'granted') {
        try {
          new NotificationClass(`FloraID: Time to ${reminder.type}!`, {
            body: `Your ${plantName} needs attention.`,
            icon: plantImage || '/favicon.ico'
          });
        } catch (e) {
          console.warn("Notification API failed", e);
        }
      }
    }
  }, []);

  const checkReminders = useCallback(() => {
    const savedReminders: Reminder[] = JSON.parse(localStorage.getItem('flora_reminders') || '[]');
    const savedPlants: any[] = JSON.parse(localStorage.getItem('flora_garden') || '[]');
    
    const now = new Date();
    const today = now.toDateString();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMinutes = (currentHour * 60) + currentMin;

    let updated = false;
    const updatedReminders = savedReminders.map(r => {
      const [rHour, rMin] = r.time.split(':').map(Number);
      const reminderTotalMinutes = (rHour * 60) + rMin;

      if (currentTotalMinutes >= reminderTotalMinutes && r.lastNotificationDate !== today) {
        const plant = savedPlants.find(p => p.id === r.plantId);
        triggerNotification(r, plant?.name || 'Your Plant', plant?.image);
        updated = true;
        return { ...r, lastNotificationDate: today };
      }
      return r;
    });

    if (updated) {
      setReminders(updatedReminders);
      localStorage.setItem('flora_reminders', JSON.stringify(updatedReminders));
    }
  }, [triggerNotification]);

  useEffect(() => {
    const savedUser = localStorage.getItem('flora_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') setUser(parsed);
      } catch (e) {
        localStorage.removeItem('flora_user');
      }
    }
    const savedPlants = localStorage.getItem('flora_garden');
    if (savedPlants) {
      try {
        const parsed = JSON.parse(savedPlants);
        if (Array.isArray(parsed)) setMyPlants(parsed);
      } catch (e) {
        setMyPlants([]);
      }
    }
    const savedReminders = localStorage.getItem('flora_reminders');
    if (savedReminders) setReminders(JSON.parse(savedReminders));
    
    const savedCompletions = localStorage.getItem('flora_completions');
    if (savedCompletions) {
      try {
        const parsed = JSON.parse(savedCompletions);
        setCompletions(parsed);
      } catch (e) {
        setCompletions({});
      }
    }

    checkReminders();

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  const executeWithKeySafety = async (fn: () => Promise<void>) => {
    try {
      setError(null);
      setIsProcessing(true);
      await checkAndSelectKey();
      await fn();
    } catch (err: any) {
      console.error("Botanical API Error:", err);
      const isNotFound = err.message?.includes("Requested entity was not found") || err.message?.includes("not found");
      
      if (isNotFound && window.aistudio?.openSelectKey) {
        await window.aistudio.openSelectKey();
        setError("API key refreshed. Please retry your botanical scan.");
      } else {
        setError(err.message || "Model connection lost. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNavigate = (tab: string) => {
    const proTabs = ['my-plants', 'diagnose', 'stores', 'chat'];
    if (proTabs.includes(tab) && !user?.isSubscribed) {
      setActiveTab('upsell');
    } else {
      setActiveTab(tab);
      setIdResult(null);
      setDiagResult(null);
      setError(null);
    }
  };

  const toggleSubscription = () => {
    if (!user) return;
    const updated = { ...user, isSubscribed: !user.isSubscribed };
    setUser(updated);
    localStorage.setItem('flora_user', JSON.stringify(updated));
    if (updated.isSubscribed) {
      setActiveTab('home');
    }
  };

  const handleLogin = (name: string, email: string) => {
    const newUser = { id: Date.now().toString(), name, email, isSubscribed: false, notificationsEnabled: true };
    setUser(newUser);
    localStorage.setItem('flora_user', JSON.stringify(newUser));
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      window.Notification.requestPermission();
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('flora_user');
    setActiveTab('home');
  };

  const handleToggleNotifications = () => {
    if (!user) return;
    const updated = { ...user, notificationsEnabled: !user.notificationsEnabled };
    setUser(updated);
    localStorage.setItem('flora_user', JSON.stringify(updated));
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const addPlantToGarden = (plant: { name: string, species: string, image?: string, fullData?: IdentificationResponse, wikiImages?: WikiImage[] }) => {
    const newPlant = {
      id: Date.now().toString(),
      name: plant.name,
      species: plant.species,
      image: plant.image || `https://picsum.photos/seed/${plant.species}/400/600`,
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
    handleNavigate('my-plants');
  };

  const handleRemovePlant = (plantId: string) => {
    const updatedPlants = myPlants.filter(p => p.id !== plantId);
    setMyPlants(updatedPlants);
    localStorage.setItem('flora_garden', JSON.stringify(updatedPlants));
    const updatedReminders = reminders.filter(r => r.plantId !== plantId);
    setReminders(updatedReminders);
    localStorage.setItem('flora_reminders', JSON.stringify(updatedReminders));
    
    const updatedComps = { ...completions };
    delete updatedComps[plantId];
    setCompletions(updatedComps);
    localStorage.setItem('flora_completions', JSON.stringify(updatedComps));
  };

  const handleSaveReminder = (reminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = { ...reminderData, id: Date.now().toString() };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem('flora_reminders', JSON.stringify(updated));
    setReminderPlant(null);
    setTimeout(checkReminders, 1000);
  };

  const handleCompleteTask = (plantId: string, taskType: string) => {
    if (activeNotification && activeNotification.reminder.plantId === plantId) {
      setActiveNotification(prev => prev ? { ...prev, isCompleting: true } : null);
    }

    const now = new Date();
    const timestamp = now.toISOString();
    const today = now.toDateString();
    
    const newEntry = { type: taskType, timestamp };
    const currentLogs = completions[plantId] || [];
    
    const newCompletions = { ...completions, [plantId]: [newEntry, ...currentLogs] };
    setCompletions(newCompletions);
    localStorage.setItem('flora_completions', JSON.stringify(newCompletions));

    const updatedPlants = myPlants.map(p => {
      if (p.id === plantId) {
        let status = p.status;
        const lastCare = { ...(p.lastCare || {}), [taskType]: timestamp };
        
        if (taskType.includes('Water')) {
          status = 'Healthy';
        } else if (taskType.includes('Prun')) {
          status = 'Freshly Groomed';
        } else if (taskType.includes('Clean')) {
          status = 'Shiny & Healthy';
        }
        
        return { ...p, status, lastCare };
      }
      return p;
    });
    setMyPlants(updatedPlants);
    localStorage.setItem('flora_garden', JSON.stringify(updatedPlants));

    const updatedReminders = reminders.map(r => {
      const typeMatch = (r.type === 'Water' && taskType.includes('Water')) ||
                        (r.type === 'Fertilize' && taskType.includes('Fertil')) ||
                        (r.type === 'Prune' && taskType.includes('Prun')) ||
                        (r.type === 'Mist' && taskType.includes('Mist')) ||
                        (r.type === 'Clean' && taskType.includes('Clean'));

      if (r.plantId === plantId && typeMatch) {
        return { ...r, lastNotificationDate: today };
      }
      return r;
    });
    setReminders(updatedReminders);
    localStorage.setItem('flora_reminders', JSON.stringify(updatedReminders));

    if (activeNotification && activeNotification.reminder.plantId === plantId) {
      setTimeout(() => setActiveNotification(null), 1500);
    }
  };

  const handlePlantSearch = (query: string) => {
    executeWithKeySafety(async () => {
      const result = await getPlantInfoByName(query);
      const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
      const similar = await Promise.all(result.similarPlants.map(async (p) => {
        const thumb = await getWikiThumbnail(p.scientificName || p.name);
        return { ...p, imageUrl: thumb || `https://picsum.photos/seed/${p.name}/400/600` };
      }));
      setWikiImages(images);
      setIdResult({ ...result, similarPlants: similar });
      setActiveTab('id-result');
    });
  };

  const handleViewRelative = async (relative: any) => {
    // If the relative already has full details, use them immediately
    if (relative.identification && relative.care) {
      setIdResult(relative as IdentificationResponse);
      const images = await getWikiImages(relative.identification.scientificName, relative.identification.genus);
      setWikiImages(images);
      setActiveTab('id-result');
      // Scroll to top
      window.scrollTo(0, 0);
    } else {
      // Fallback to name search if for some reason the relative data is sparse
      handlePlantSearch(relative.scientificName || relative.name);
    }
  };

  const handleViewFavorite = (item: any) => {
    if (item.fullData) {
      setIdResult(item.fullData);
      setWikiImages(item.wikiImages || []);
      setActiveTab('id-result');
    } else {
      handlePlantSearch(item.commonName);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      if (activeTab === 'diagnose') {
        executeWithKeySafety(async () => {
          const result = await diagnoseHealth(base64);
          const history = JSON.parse(localStorage.getItem('flora_diag_history') || '[]');
          const newDiag = { ...result, id: Date.now().toString(), timestamp: new Date().toISOString(), imageUrl: reader.result as string };
          localStorage.setItem('flora_diag_history', JSON.stringify([newDiag, ...history]));
          setDiagResult(newDiag);
          setActiveTab('diag-result');
        });
      } else {
        executeWithKeySafety(async () => {
          const result = await identifyPlant(base64);
          const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
          const similar = await Promise.all(result.similarPlants.map(async (p) => {
            const thumb = await getWikiThumbnail(p.scientificName || p.name);
            return { ...p, imageUrl: thumb || `https://picsum.photos/seed/${p.name}/400/600` };
          }));
          setWikiImages(images);
          setIdResult({ ...result, similarPlants: similar });
          setActiveTab('id-result');
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const renderContent = () => {
    if (!user) return <LoginScreen onLogin={handleLogin} />;
    if (activeTab === 'upsell') return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in zoom-in-95 duration-500">
        <div className="bg-amber-50 p-6 rounded-[3rem] mb-8 text-[#D4AF37] shadow-xl shadow-amber-100">
          <Crown size={64} fill="currentColor" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-none">Unlock FloraID Pro</h2>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">Get unlimited AI diagnostics, store finder, and personalized care schedules.</p>
        <div className="w-full space-y-4 mb-10">
           <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-left">
              <CheckCircle className="text-[#00D09C] flex-shrink-0" size={24} />
              <span className="text-sm font-bold text-gray-700">Unlimited Botanical ID & Diagnosis</span>
           </div>
           <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-left">
              <CheckCircle className="text-[#00D09C] flex-shrink-0" size={24} />
              <span className="text-sm font-bold text-gray-700">Global Garden Center Database</span>
           </div>
           <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-left">
              <CheckCircle className="text-[#00D09C] flex-shrink-0" size={24} />
              <span className="text-sm font-bold text-gray-700">Precision Humidity & Light Tools</span>
           </div>
        </div>
        <button 
          onClick={toggleSubscription}
          className="w-full bg-[#00D09C] py-6 rounded-[2.5rem] text-white font-black text-lg shadow-2xl shadow-[#00D09C44] active:scale-95 transition-transform"
        >
          Start 7-Day Free Trial
        </button>
        <button onClick={() => setActiveTab('home')} className="mt-6 text-gray-400 font-black text-xs uppercase tracking-widest">Maybe Later</button>
      </div>
    );
    if (activeTab === 'home') return <HomeScreen isSubscribed={user.isSubscribed} onNavigate={handleNavigate} onSearch={handlePlantSearch} onScanClick={handleCameraClick} onAddToGarden={(n, s) => addPlantToGarden({ name: n, species: s })} />;
    if (activeTab === 'my-plants') return <MyPlantsScreen plants={myPlants} reminders={reminders} completions={completions} onAddClick={handleCameraClick} onManageReminders={(id, name) => setReminderPlant({ id, name })} onPlantClick={(p) => { setIdResult(p.fullData || null); if (p.fullData) { setWikiImages(p.wikiImages || []); setActiveTab('id-result'); } }} onRemovePlant={handleRemovePlant} onCompleteTask={handleCompleteTask} />;
    if (activeTab === 'diagnose') return <DiagnosticsScreen onStartDiagnosis={handleCameraClick} />;
    if (activeTab === 'favorites') return <FavoritesScreen onPlantClick={handleViewFavorite} />;
    if (activeTab === 'profile') return <ProfileScreen 
      user={user} 
      stats={{ 
        plants: myPlants.length, 
        favorites: JSON.parse(localStorage.getItem('flora_favorites') || '[]').length, 
        scans: JSON.parse(localStorage.getItem('flora_diag_history') || '[]').length 
      }} 
      onLogout={handleLogout} 
      onNavigate={handleNavigate} 
      onToggleNotifications={handleToggleNotifications}
    />;
    if (activeTab === 'stores') return <MapScreen />;
    if (activeTab === 'chat') return <ChatScreen />;
    if (activeTab === 'id-result' && idResult) return <PlantResultScreen data={idResult} images={wikiImages} onAddToGarden={(n, s, i) => addPlantToGarden({ name: n, species: s, image: i, fullData: idResult, wikiImages })} onBack={() => setActiveTab('home')} onFindStores={() => setActiveTab('stores')} onSearchSimilar={handleViewRelative} />;
    if (activeTab === 'diag-result' && diagResult) return <DiagnosisResultScreen result={diagResult} onBack={() => setActiveTab('diagnose')} />;
    return <HomeScreen onNavigate={handleNavigate} />;
  };

  if (showSplash) return <SplashScreen />;

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleNavigate} 
      onCameraClick={handleCameraClick}
      userName={user?.name}
      isSubscribed={user?.isSubscribed}
    >
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500 overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(#00D09C 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           
           <div className="relative mb-16 scale-110">
              <div className="w-56 h-56 border-2 border-emerald-50 rounded-full flex items-center justify-center relative shadow-[0_0_80px_rgba(0,208,156,0.15)] ring-1 ring-emerald-100/30">
                 
                 <div className="absolute inset-0 border-4 border-dashed border-[#00D09C] rounded-full animate-[spin_12s_linear_infinite] opacity-20"></div>
                 <div className="absolute inset-4 border-2 border-[#00D09C] rounded-full animate-[spin_8s_linear_reverse_infinite] border-t-transparent border-b-transparent opacity-40"></div>
                 <div className="absolute inset-10 border border-[#00D09C] rounded-full animate-[spin_4s_linear_infinite] border-l-transparent border-r-transparent opacity-60"></div>
                 
                 <div className="absolute inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#00D09C] to-transparent animate-[scanLine_2.5s_ease-in-out_infinite] shadow-[0_0_20px_#00D09C] z-20"></div>
                 
                 <div className="bg-white/80 backdrop-blur-md p-10 rounded-full relative z-10 border-2 border-emerald-50 shadow-xl overflow-hidden group">
                    <Sprout className="text-[#00D09C] animate-pulse drop-shadow-md" size={64} strokeWidth={2} />
                    <div className="absolute inset-0 bg-emerald-400/5 animate-pulse"></div>
                 </div>

                 <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00D09C] rounded-tl-2xl opacity-80"></div>
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#00D09C] rounded-tr-2xl opacity-80"></div>
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#00D09C] rounded-bl-2xl opacity-80"></div>
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00D09C] rounded-br-2xl opacity-80"></div>
              </div>
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-2 animate-bounce">
                 <Fingerprint className="text-[#00D09C]" size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Sequence Matching</span>
              </div>
           </div>

           <div className="max-w-xs relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                 <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-200">
                    <Microscope size={22} />
                 </div>
                 <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Botanical Lab</h3>
              </div>
              <p className="text-gray-400 font-bold italic text-sm mb-10 leading-relaxed px-4">
                 Decoding cellular structures and sequencing taxonomic markers...
              </p>

              <div className="bg-gray-900 p-6 rounded-[2.5rem] font-mono text-[9px] text-emerald-400 text-left space-y-2 shadow-2xl border-4 border-gray-800 h-32 overflow-hidden relative group">
                 <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
                 <div className="animate-[scrollLog_15s_linear_infinite] space-y-1.5">
                    <p className="flex justify-between items-center"><span className="opacity-60">10:42:01</span> <span>INITIALIZING_SCAN_ENG...</span> <span className="text-white">DONE</span></p>
                    <p className="flex justify-between items-center"><span className="opacity-60">10:42:02</span> <span>EXTRACTING_PHENO_DATA...</span> <span className="text-white">DONE</span></p>
                    <p className="flex justify-between items-center"><span className="opacity-60">10:42:04</span> <span>SEQ_GENUS_MARKERS...</span> <span className="animate-pulse">MATCHING</span></p>
                    <p className="flex justify-between items-center"><span className="opacity-60">10:42:05</span> <span>MAPPING_VENATION...</span> <span className="text-emerald-200">92%</span></p>
                    <p className="flex justify-between items-center"><span className="opacity-60">10:42:07</span> <span>CROSS_REF_TAXONOMY...</span> <span className="text-white">RUNNING</span></p>
                    <p className="flex justify-between items-center"><span className="opacity-60">10:42:08</span> <span>ENV_FACTOR_CALC...</span> <span className="text-emerald-200">VALIDATING</span></p>
                    <p className="flex justify-between items-center"><span className="opacity-60">10:42:10</span> <span>TOX_ANALYSIS_SYNC...</span> <span className="text-white">OK</span></p>
                    <p className="flex justify-between items-center"><span className="opacity-60">10:42:12</span> <span>FETCHING_CARE_SCHEMA...</span> <span className="animate-pulse">LINKING</span></p>
                 </div>
              </div>
           </div>

           <div className="absolute bottom-24 flex items-center gap-4 px-8 py-3 bg-white rounded-full shadow-lg border border-gray-100">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Compiling Database</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
           </div>
        </div>
      )}

      {error && (
        <div className="fixed top-20 left-6 right-6 z-[100] bg-rose-50 border-2 border-rose-100 p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-10 duration-500">
           <div className="flex items-start gap-4">
              <div className="bg-rose-100 text-rose-500 p-2.5 rounded-xl"><AlertCircle size={20} /></div>
              <div className="flex-1">
                 <h4 className="text-rose-900 font-black text-sm uppercase tracking-wider mb-1">Processing Error</h4>
                 <p className="text-rose-700 text-xs font-bold leading-relaxed">{error}</p>
                 <button onClick={() => setError(null)} className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200">Dismiss</button>
              </div>
           </div>
        </div>
      )}

      {activeNotification && (
        <div className={`fixed top-12 left-6 right-6 z-[110] bg-white rounded-[2.5rem] p-5 shadow-2xl border-4 transition-all duration-500 transform ${activeNotification.isCompleting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} border-[#00D09C]`}>
           <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 flex-shrink-0">
                 <img src={activeNotification.plantImage} className="w-full h-full object-cover rounded-2xl" alt="" />
                 <div className="absolute -bottom-2 -right-2 bg-[#00D09C] text-white p-1.5 rounded-xl border-4 border-white"><Droplets size={14} fill="currentColor" /></div>
              </div>
              <div className="flex-1 overflow-hidden">
                 <h4 className="text-[10px] font-black text-[#00D09C] uppercase tracking-widest mb-1">Time to {activeNotification.reminder.type}</h4>
                 <p className="text-gray-900 font-black text-lg truncate leading-none mb-1">{activeNotification.plantName}</p>
                 <p className="text-gray-400 font-bold text-[9px] uppercase tracking-tighter">Scheduled for {activeNotification.reminder.time}</p>
              </div>
           </div>
           <div className="flex gap-3 mt-5">
              <button 
                onClick={() => handleCompleteTask(activeNotification.reminder.plantId, activeNotification.reminder.type)}
                className="flex-1 bg-[#00D09C] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
              >
                <Check size={16} strokeWidth={3} /> Mark Done
              </button>
              <button onClick={() => setActiveNotification(null)} className="px-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest">Later</button>
           </div>
        </div>
      )}

      {renderContent()}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        capture="environment"
        className="hidden" 
      />

      {reminderPlant && (
        <ReminderModal 
          plantId={reminderPlant.id} 
          plantName={reminderPlant.name} 
          onClose={() => setReminderPlant(null)} 
          onSave={handleSaveReminder} 
        />
      )}

      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 20%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }
        @keyframes scrollLog {
          0% { transform: translateY(0); }
          100% { transform: translateY(-150px); }
        }
      `}</style>
    </div>
  );
};

export default App;
