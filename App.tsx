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
import TermsScreen from './screens/TermsScreen';
import UpsellScreen from './screens/UpsellScreen';
import SplashScreen from './screens/SplashScreen';
import ReminderModal from './components/ReminderModal';
import { identifyPlant, diagnoseHealth, getPlantInfoByName } from './services/geminiService';
import { getWikiImages, getWikiThumbnail } from './services/wikiService';
import { IdentificationResponse, WikiImage, UserProfile, DiagnosticResult, Reminder } from './types';
import { Loader2, X, Sprout, Crown, Check, AlertCircle, BellRing, Activity, Sparkles, Cpu, Bell, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [termsInitialTab, setTermsInitialTab] = useState<'terms' | 'privacy'>('terms');
  const [isProcessing, setIsProcessing] = useState(false);
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persistence data
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

  // Notification Trigger Logic
  const triggerSystemNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico' // Or a specific plant icon if available
      });
    }
  }, []);

  // Check for overdue tasks on load and when reminders change
  useEffect(() => {
    if (reminders.length > 0 && !showSplash) {
      const todayStr = new Date().toDateString();
      const pendingCount = reminders.filter(r => r.lastNotificationDate !== todayStr).length;
      
      if (pendingCount > 0) {
        triggerSystemNotification(
          "Plant Care Due",
          `You have ${pendingCount} plant maintenance tasks pending for today.`
        );
      }
    }
  }, [reminders, showSplash, triggerSystemNotification]);

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

  const handlePlantSearch = (query: string) => {
    setCurrentSearchName(query);
    executeWithKeySafety(async () => {
      setActiveTab('id-result');
      setIsSearchLoading(true);
      setIdResult(null); 
      setWikiImages([]);

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
        executeWithKeySafety(async () => {
          const result = await identifyPlant(base64);
          setIdResult(result);
          setActiveTab('id-result');
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
    const newPlant = {
      id: Date.now().toString(),
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
    showInAppToast(`${plant.name} added to garden!`, "success");
    handleNavigate('my-plants');
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

  const handleCompleteTask = (plantId: string, taskType: string) => {
    const now = new Date();
    const todayStr = now.toDateString();
    const plant = myPlants.find(p => p.id === plantId);

    // 1. Update completions
    const newCompletion = { type: taskType, timestamp: now.toISOString() };
    const plantCompletions = completions[plantId] || [];
    const newCompletionsMap = {
      ...completions,
      [plantId]: [newCompletion, ...plantCompletions].slice(0, 50)
    };
    setCompletions(newCompletionsMap);
    localStorage.setItem('flora_completions', JSON.stringify(newCompletionsMap));

    // 2. Mark reminder as done
    const updatedReminders = reminders.map(r => {
      if (r.plantId === plantId && r.type === taskType) {
        return { ...r, lastNotificationDate: todayStr };
      }
      return r;
    });
    setReminders(updatedReminders);
    localStorage.setItem('flora_reminders', JSON.stringify(updatedReminders));

    // 3. Update plant
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
    
    showInAppToast(`${taskType} completed for ${plant?.name || 'plant'}`, "success");
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
  if (!user) return <LoginScreen onLogin={(n, e) => {
    const u = { id: '1', name: n, email: e, isSubscribed: false };
    setUser(u);
    localStorage.setItem('flora_user', JSON.stringify(u));
  }} onShowTerms={() => setActiveTab('terms')} />;

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleNavigate} 
      onCameraClick={() => fileInputRef.current?.click()}
      userName={user.name}
      isSubscribed={user.isSubscribed}
    >
      {/* Toast Pop-up UI */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-6 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 border border-white/20 backdrop-blur-xl ${
            toast.type === 'success' ? 'bg-[#00D09C] text-white' : 
            toast.type === 'error' ? 'bg-rose-50 text-white' : 
            'bg-gray-800 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : toast.type === 'error' ? <AlertCircle size={20} /> : <Bell size={20} />}
            <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      {activeTab === 'home' && (
        <HomeScreen 
          onNavigate={handleNavigate} 
          onSearch={handlePlantSearch} 
          isSubscribed={user.isSubscribed} 
          onScanClick={() => fileInputRef.current?.click()}
        />
      )}
      {activeTab === 'my-plants' && (
        <MyPlantsScreen 
          plants={myPlants} 
          reminders={reminders} 
          completions={completions}
          onAddClick={() => fileInputRef.current?.click()} 
          onManageReminders={(id, name) => setReminderPlant({id, name})} 
          onPlantClick={p => { setIdResult(p.fullData); setWikiImages(p.wikiImages || []); setActiveTab('id-result'); }} 
          onRemovePlant={handleRemovePlant}
          onCompleteTask={handleCompleteTask}
        />
      )}
      {activeTab === 'diagnose' && <DiagnosticsScreen onStartDiagnosis={() => fileInputRef.current?.click()} />}
      {activeTab === 'stores' && <MapScreen />}
      {activeTab === 'favorites' && <FavoritesScreen onPlantClick={item => { setIdResult(item.fullData || null); setWikiImages(item.wikiImages || []); setActiveTab('id-result'); }} />}
      {activeTab === 'profile' && <ProfileScreen user={user} stats={{ plants: myPlants.length, favorites: JSON.parse(localStorage.getItem('flora_favorites') || '[]').length, scans: JSON.parse(localStorage.getItem('flora_diag_history') || '[]').length }} onLogout={() => setUser(null)} onNavigate={handleNavigate} onToggleNotifications={() => {}} onShowTerms={() => {}} />}
      {activeTab === 'chat' && <ChatScreen />}
      {activeTab === 'id-result' && (
        <PlantResultScreen 
          data={idResult} 
          loading={isSearchLoading}
          placeholderName={currentSearchName}
          images={wikiImages}
          onAddToGarden={(n, s, i) => addPlantToGarden({ name: n, species: s, image: i, fullData: idResult, wikiImages })}
          onBack={() => setActiveTab('home')}
          onSearchSimilar={(plant) => handlePlantSearch(plant.name)}
          onFindStores={() => handleNavigate('stores')}
        />
      )}
      {activeTab === 'diag-result' && diagResult && <DiagnosisResultScreen result={diagResult} onBack={() => setActiveTab('diagnose')} />}
      
      {activeTab === 'upsell' && (
        <UpsellScreen 
          onSubscribe={() => { 
            const u = {...user, isSubscribed: true}; 
            setUser(u); 
            localStorage.setItem('flora_user', JSON.stringify(u)); 
            showInAppToast("Welcome to PlantHound Pro!", "success");
            setActiveTab('home'); 
          }} 
          onBack={() => setActiveTab('home')} 
        />
      )}

      {reminderPlant && (
        <ReminderModal 
          plantId={reminderPlant.id}
          plantName={reminderPlant.name}
          onClose={() => setReminderPlant(null)}
          onSave={handleSaveReminder}
        />
      )}

      {isProcessing && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[40px] animate-in fade-in duration-700"></div>
          <div className="relative z-10 flex flex-col items-center">
             <div className="relative w-48 h-48 flex items-center justify-center mb-12">
                <div className="absolute inset-[-40px] border-4 border-emerald-50 rounded-full animate-[ping_4s_ease-in-out_infinite] opacity-50"></div>
                <div className="absolute inset-[-20px] border-2 border-[#00D09C]/10 rounded-full animate-[pulse_3s_ease-in-out_infinite]"></div >
                <div className="absolute inset-0 border-[3px] border-dashed border-[#00D09C]/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="bg-white p-8 rounded-[3.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.1)] border-4 border-white flex items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-[#00D09C]/5 to-transparent"></div>
                   <Sprout className="text-[#00D09C] animate-[bounce_2s_infinite]" size={64} strokeWidth={2.5} />
                   <div className="absolute top-2 right-2">
                      <Sparkles className="text-amber-400 animate-pulse" size={20} />
                   </div>
                </div>
                <div className="absolute -top-4 -left-4 bg-[#EFFFFB] p-3 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-2 animate-[bounce_3s_infinite]">
                   <Cpu size={14} className="text-[#00D09C]" />
                   <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest">Neural Analysis</span>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-sm border border-emerald-50 flex items-center gap-2 animate-[bounce_2.5s_infinite] delay-300">
                   <Activity size={14} className="text-[#00D09C]" />
                   <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Bio-Sync</span>
                </div>
             </div>
             <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-2 leading-none">PlantHound AI is thinking...</h3>
                <p className="text-[#00D09C] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Establishing Botanical Link</p>
             </div>
          </div>
        </div>
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
    </div>
  );
};

export default App;