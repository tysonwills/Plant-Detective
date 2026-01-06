
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
import { identifyPlant, diagnoseHealth, getPlantInfoByName } from './services/geminiService';
import { getWikiImages, getWikiThumbnail } from './services/wikiService';
import { IdentificationResponse, WikiImage, UserProfile, DiagnosticResult, Reminder } from './types';
import { Loader2, X, Sprout, Crown, Check, AlertCircle, BellRing } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [termsInitialTab, setTermsInitialTab] = useState<'terms' | 'privacy'>('terms');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [currentSearchName, setCurrentSearchName] = useState('');
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

  const executeWithKeySafety = async (fn: () => Promise<void>) => {
    try {
      setError(null);
      setIsProcessing(true);
      await checkAndSelectKey();
      await fn();
    } catch (err: any) {
      console.error("Botanical API Error:", err);
      setError(err.message || "Model connection lost. Please try again.");
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
          const newDiag = { ...result, id: Date.now().toString(), timestamp: new Date().toISOString(), imageUrl: reader.result as string };
          setDiagResult(newDiag);
          setActiveTab('diag-result');
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
        });
      }
    };
    reader.readAsDataURL(file);
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
    handleNavigate('my-plants');
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
      {activeTab === 'home' && <HomeScreen onNavigate={handleNavigate} onSearch={handlePlantSearch} isSubscribed={user.isSubscribed} />}
      {activeTab === 'my-plants' && <MyPlantsScreen plants={myPlants} reminders={reminders} onAddClick={() => fileInputRef.current?.click()} onManageReminders={(id, name) => setReminderPlant({id, name})} onPlantClick={p => { setIdResult(p.fullData); setWikiImages(p.wikiImages || []); setActiveTab('id-result'); }} onRemovePlant={id => setMyPlants(myPlants.filter(p => p.id !== id))} />}
      {activeTab === 'diagnose' && <DiagnosticsScreen onStartDiagnosis={() => fileInputRef.current?.click()} />}
      {activeTab === 'stores' && <MapScreen />}
      {activeTab === 'favorites' && <FavoritesScreen onPlantClick={item => { setIdResult(item.fullData || null); setWikiImages(item.wikiImages || []); setActiveTab('id-result'); }} />}
      {activeTab === 'profile' && <ProfileScreen user={user} stats={{ plants: myPlants.length, favorites: 0, scans: 0 }} onLogout={() => setUser(null)} onNavigate={handleNavigate} onToggleNotifications={() => {}} onShowTerms={() => {}} />}
      {activeTab === 'chat' && <ChatScreen />}
      {activeTab === 'id-result' && (
        <PlantResultScreen 
          data={idResult} 
          loading={isSearchLoading}
          placeholderName={currentSearchName}
          images={wikiImages}
          onAddToGarden={(n, s, i) => addPlantToGarden({ name: n, species: s, image: i, fullData: idResult, wikiImages })}
          onBack={() => setActiveTab('home')}
        />
      )}
      {activeTab === 'diag-result' && diagResult && <DiagnosisResultScreen result={diagResult} onBack={() => setActiveTab('diagnose')} />}
      
      {activeTab === 'upsell' && (
        <UpsellScreen 
          onSubscribe={() => { setUser({...user, isSubscribed: true}); setActiveTab('home'); }} 
          onBack={() => setActiveTab('home')} 
        />
      )}

      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-[#00D09C] mb-4" size={48} />
          <p className="text-gray-900 font-black">Flora AI is thinking...</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-24 left-6 right-6 z-[150] bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-6 shadow-2xl flex gap-4">
           <AlertCircle size={20} className="text-rose-600" />
           <p className="text-rose-700 text-xs font-medium">{error}</p>
           <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
    </Layout>
  );
};

export default App;
