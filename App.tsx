
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import HomeScreen from './screens/HomeScreen';
import MyPlantsScreen from './screens/MyPlantsScreen';
import DiagnosticsScreen from './screens/DiagnosticsScreen';
import MapScreen from './screens/MapScreen';
import LoginScreen from './screens/LoginScreen';
import PlantResultScreen from './screens/PlantResultScreen';
import DiagnosisResultScreen from './screens/DiagnosisResultScreen';
import ReminderModal from './components/ReminderModal';
import { identifyPlant, diagnoseHealth, getPlantInfoByName } from './services/geminiService';
import { getWikiImages, getWikiThumbnail } from './services/wikiService';
import { IdentificationResponse, WikiImage, UserProfile, DiagnosticResult, Reminder } from './types';
import { Loader2, Droplets, X, Sprout, CheckCircle, ArrowRight, Crown, Check, ShieldCheck, Zap, Sparkles, Leaf, MapPin, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idResult, setIdResult] = useState<IdentificationResponse | null>(null);
  const [diagResult, setDiagResult] = useState<Omit<DiagnosticResult, 'id' | 'timestamp'> & { imageUrl?: string } | null>(null);
  const [wikiImages, setWikiImages] = useState<WikiImage[]>([]);
  const [myPlants, setMyPlants] = useState<any[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [completions, setCompletions] = useState<Record<string, string[]>>({});
  const [reminderPlant, setReminderPlant] = useState<{id: string, name: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
  }, []);

  const executeWithKeySafety = async (fn: () => Promise<void>) => {
    try {
      setError(null);
      setIsProcessing(true);
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
    const proTabs = ['my-plants', 'diagnose', 'stores'];
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
    const newUser = { id: Date.now().toString(), name, email, isSubscribed: false };
    setUser(newUser);
    localStorage.setItem('flora_user', JSON.stringify(newUser));
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
  };

  const handleSaveReminder = (reminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = { ...reminderData, id: Date.now().toString() };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem('flora_reminders', JSON.stringify(updated));
    setReminderPlant(null);
  };

  const handleCompleteTask = (plantId: string, taskType: string) => {
    const current = completions[plantId] || [];
    const updated = current.includes(taskType) ? current.filter(t => t !== taskType) : [...current, taskType];
    const newCompletions = { ...completions, [plantId]: updated };
    setCompletions(newCompletions);
    localStorage.setItem('flora_completions', JSON.stringify(newCompletions));
  };

  const handlePlantSearch = (query: string) => {
    executeWithKeySafety(async () => {
      const result = await getPlantInfoByName(query);
      const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
      const similar = await Promise.all(result.similarPlants.map(async (p) => {
        const thumb = await getWikiThumbnail(p.scientificName || p.name);
        return { ...p, imageUrl: thumb || `https://picsum.photos/seed/${p.name}/300/200` };
      }));
      setIdResult({ ...result, similarPlants: similar });
      setWikiImages(images);
      setActiveTab('results');
    });
  };

  const handleGardenPlantClick = (plant: any) => {
    if (plant.fullData) {
      setIdResult(plant.fullData);
      setWikiImages(plant.wikiImages || []);
      setActiveTab('results');
      return;
    }

    executeWithKeySafety(async () => {
      const result = await getPlantInfoByName(plant.species || plant.name);
      const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
      const similar = await Promise.all(result.similarPlants.map(async (p) => {
        const thumb = await getWikiThumbnail(p.scientificName || p.name);
        return { ...p, imageUrl: thumb || `https://picsum.photos/seed/${p.name}/300/200` };
      }));
      const finalImages = images;
      if (plant.image && !images.some(img => img.imageUrl === plant.image)) {
        finalImages.unshift({ imageUrl: plant.image, sourcePageUrl: '' });
      }
      setIdResult({ ...result, similarPlants: similar });
      setWikiImages(finalImages);
      setActiveTab('results');
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      executeWithKeySafety(async () => {
        if (activeTab === 'diagnose' || (activeTab === 'upsell' && diagResult === null)) {
          const rawDiag = await diagnoseHealth(base64);
          const entry = { ...rawDiag, id: Date.now().toString(), timestamp: new Date().toISOString(), imageUrl: reader.result as string };
          const history = JSON.parse(localStorage.getItem('flora_diag_history') || '[]');
          localStorage.setItem('flora_diag_history', JSON.stringify([entry, ...history]));
          setDiagResult(entry);
          setActiveTab('diag-results');
        } else {
          const result = await identifyPlant(base64);
          const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
          const similar = await Promise.all(result.similarPlants.map(async (p) => {
            const thumb = await getWikiThumbnail(p.scientificName || p.name);
            return { ...p, imageUrl: thumb || `https://picsum.photos/seed/${p.name}/300/200` };
          }));
          setIdResult({ ...result, similarPlants: similar });
          setWikiImages(images);
          setActiveTab('results'); 
        }
      });
    };
    reader.readAsDataURL(file);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const renderContent = () => {
    if (activeTab === 'results' && idResult) {
      const current = myPlants.find(p => p.species === idResult.identification.scientificName);
      return (
        <PlantResultScreen 
          data={idResult} images={wikiImages} hideAddButton={!!current}
          reminders={current ? reminders.filter(r => r.plantId === current.id) : []}
          completedTasks={current ? (completions[current.id] || []) : []}
          onAddReminder={() => current && setReminderPlant({ id: current.id, name: current.name })}
          onCompleteTask={(type) => current && handleCompleteTask(current.id, type)}
          onSearchSimilar={handlePlantSearch}
          onFindStores={() => handleNavigate('stores')}
          onAddToGarden={(name, species, img) => addPlantToGarden({ name, species, image: img, fullData: idResult, wikiImages })}
          onBack={() => handleNavigate(!!current ? 'my-plants' : 'home')} 
        />
      );
    }

    if (activeTab === 'diag-results' && diagResult) {
      return <DiagnosisResultScreen result={diagResult} onBack={() => handleNavigate('diagnose')} />;
    }

    if (activeTab === 'upsell') {
      return (
        <div className="min-h-full bg-white animate-in slide-in-from-bottom-20 duration-500 pb-10">
          <div className="relative h-[40vh] bg-[#FFF9E6] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
               <Crown size={300} fill="currentColor" className="text-[#D4AF37]" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
               <div className="bg-white p-6 rounded-[2.5rem] shadow-xl mb-6 border-4 border-[#D4AF37]">
                 <Crown size={48} className="text-[#D4AF37]" fill="currentColor" />
               </div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">FloraID Pro</h1>
               <p className="text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-xs">The Ultimate Garden Toolkit</p>
            </div>
          </div>
          
          <div className="px-8 -mt-8 relative z-10 space-y-4">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                 <Sparkles size={20} className="text-[#D4AF37]" />
                 Premium Benefits
               </h3>
               <div className="space-y-6">
                 <UpsellFeature icon={<Leaf />} title="Virtual Garden" desc="Track unlimited plants and care history." />
                 <UpsellFeature icon={<ShieldCheck />} title="AI Diagnostics" desc="Identify 1000+ pests and diseases." />
                 <UpsellFeature icon={<Zap />} title="Unlimited ID" desc="Snap & identify any species instantly." />
                 <UpsellFeature icon={<MapPin />} title="Garden Maps" desc="Exclusive access to store finders." />
               </div>
            </div>

            <button 
              onClick={toggleSubscription}
              className="w-full bg-[#00D09C] py-6 rounded-[2.5rem] text-white font-bold text-lg shadow-xl shadow-[#00D09C44] active:scale-95 transition-transform"
            >
              Start 7-Day Free Trial
            </button>
            <button onClick={() => setActiveTab('home')} className="w-full py-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
              Maybe Later
            </button>
          </div>
        </div>
      );
    }

    switch(activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} onSearch={handlePlantSearch} onScanClick={handleCameraClick} onAddToGarden={(name, species) => addPlantToGarden({ name, species })} isSubscribed={user.isSubscribed} />;
      case 'my-plants':
        return <MyPlantsScreen plants={myPlants} reminders={reminders} onAddClick={handleCameraClick} onManageReminders={(id, name) => setReminderPlant({ id, name })} onPlantClick={handleGardenPlantClick} onRemovePlant={handleRemovePlant} />;
      case 'diagnose':
        return <DiagnosticsScreen onStartDiagnosis={handleCameraClick} />;
      case 'stores':
        return <MapScreen />;
      case 'profile':
        return (
          <div className="px-6 pt-4 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#EFFFFB] text-[#00D09C] rounded-[1.5rem] flex items-center justify-center font-bold text-xl uppercase shadow-inner">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                <p className="text-xs text-gray-400 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <ProfileItem 
                label="My Subscriptions" 
                value={user.isSubscribed ? "Premium Pro" : "Free Plan"} 
                sub={user.isSubscribed ? "Manage Billing" : "Upgrade to Pro"} 
                onClick={user.isSubscribed ? undefined : () => setActiveTab('upsell')}
              />
              <ProfileItem label="Nearby Stores" onClick={() => handleNavigate('stores')} />
              <ProfileItem label="Garden Settings" />
              <button onClick={() => { setUser(null); localStorage.removeItem('flora_user'); }} className="w-full text-center py-6 text-rose-500 font-bold uppercase tracking-widest text-[10px] mt-4 hover:bg-rose-50 rounded-[1.5rem] transition-colors">Sign Out</button>
            </div>
          </div>
        );
      default:
        return <HomeScreen onNavigate={handleNavigate} onSearch={handlePlantSearch} onScanClick={handleCameraClick} onAddToGarden={(name, species) => addPlantToGarden({ name, species })} isSubscribed={user.isSubscribed} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleNavigate} 
      onCameraClick={handleCameraClick} 
      userName={user.name} 
      isSubscribed={user.isSubscribed}
    >
      {renderContent()}

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-sm animate-in slide-in-from-top-10 fade-in duration-300">
          <div className="bg-white border-2 border-rose-100 p-6 rounded-[2.5rem] shadow-2xl flex items-start gap-4">
            <div className="bg-rose-50 p-3 rounded-2xl text-rose-500 flex-shrink-0">
              <AlertCircle size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-rose-900 text-sm mb-1">Notice</h4>
              <p className="text-rose-700 text-[11px] leading-relaxed font-semibold">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-3 text-rose-900 font-bold text-[10px] uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      
      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-xs">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#00D09C] rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="bg-[#EFFFFB] p-4 rounded-full relative"><Loader2 size={40} className="text-[#00D09C] animate-spin" /></div>
            </div>
            <h2 className="text-gray-900 font-bold text-xl mb-2">Botanical Deep Dive...</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Harvesting latest plant secrets just for you.</p>
          </div>
        </div>
      )}
      {reminderPlant && <ReminderModal plantId={reminderPlant.id} plantName={reminderPlant.name} onClose={() => setReminderPlant(null)} onSave={handleSaveReminder} />}
    </Layout>
  );
};

const UpsellFeature = ({ icon, title, desc }: any) => (
  <div className="flex gap-4">
    <div className="bg-[#FFF9E6] p-2.5 h-11 w-11 rounded-2xl flex items-center justify-center text-[#D4AF37] flex-shrink-0">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div>
      <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
      <p className="text-[10px] text-gray-400 font-medium">{desc}</p>
    </div>
  </div>
);

const ProfileItem = ({ label, value, sub, onClick }: any) => (
  <div onClick={onClick} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center group cursor-pointer active:bg-gray-50 transition-colors">
    <div>
      <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#00D09C] transition-colors">{label}</h4>
      {sub && <p className="text-[10px] text-[#00D09C] font-bold uppercase tracking-wider mt-1">{sub}</p>}
    </div>
    {value && <span className={`text-xs font-bold ${value === "Premium Pro" ? 'text-[#D4AF37]' : 'text-gray-400'}`}>{value}</span>}
  </div>
);

export default App;
