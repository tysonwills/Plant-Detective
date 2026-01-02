
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
import { getWikiImages } from './services/wikiService';
import { IdentificationResponse, WikiImage, UserProfile, DiagnosticResult, Reminder } from './types';
import { Loader2, Bell, Droplets, X, Sprout, CheckCircle, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [idResult, setIdResult] = useState<IdentificationResponse | null>(null);
  const [diagResult, setDiagResult] = useState<Omit<DiagnosticResult, 'id' | 'timestamp'> & { imageUrl?: string } | null>(null);
  const [wikiImages, setWikiImages] = useState<WikiImage[]>([]);
  const [myPlants, setMyPlants] = useState<any[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [completions, setCompletions] = useState<Record<string, string[]>>({}); // Track completions per plant ID
  
  // Modal states
  const [reminderPlant, setReminderPlant] = useState<{id: string, name: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user session, garden, reminders and completions
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
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
    const savedCompletions = localStorage.getItem('flora_completions');
    if (savedCompletions) {
      setCompletions(JSON.parse(savedCompletions));
    }
  }, []);

  // Simulate Push Notifications Logic
  useEffect(() => {
    const checkReminders = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const due = reminders.find(r => r.time === currentTime);
      if (due && !activeNotification) {
        // Only show if not already completed today
        const plantCompletions = completions[due.plantId] || [];
        const taskName = due.type === 'Water' ? 'Watering' : due.type;
        
        if (!plantCompletions.includes(taskName)) {
          const plant = myPlants.find(p => p.id === due.plantId);
          if (plant) {
            setActiveNotification({
              id: due.id,
              title: `Time to ${due.type}!`,
              body: `Your ${plant.name} is waiting for some attention.`,
              plantName: plant.name,
              plantId: plant.id
            });
            setTimeout(() => setActiveNotification(null), 15000);
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkReminders);
  }, [reminders, myPlants, activeNotification, completions]);

  const handleLogin = (name: string, email: string) => {
    const newUser = { id: Date.now().toString(), name: String(name), email: String(email), isSubscribed: false };
    setUser(newUser);
    localStorage.setItem('flora_user', JSON.stringify(newUser));
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const addPlantToGarden = (plant: { name: string, species: string, image?: string }) => {
    const newPlant = {
      id: Date.now().toString(),
      name: String(plant.name),
      species: String(plant.species),
      image: plant.image || `https://picsum.photos/seed/${plant.species}/400/600`,
      status: 'Healthy',
      statusColor: 'text-emerald-500 bg-emerald-50',
      lastWatered: 'Just added'
    };
    const updated = [newPlant, ...myPlants];
    setMyPlants(updated);
    localStorage.setItem('flora_garden', JSON.stringify(updated));
    setActiveTab('my-plants');
    setIdResult(null);
  };

  const handleRemovePlant = (plantId: string) => {
    const updatedPlants = myPlants.filter(p => p.id !== plantId);
    setMyPlants(updatedPlants);
    localStorage.setItem('flora_garden', JSON.stringify(updatedPlants));

    // Cleanup associated reminders
    const updatedReminders = reminders.filter(r => r.plantId !== plantId);
    setReminders(updatedReminders);
    localStorage.setItem('flora_reminders', JSON.stringify(updatedReminders));

    // Cleanup completions
    const updatedCompletions = { ...completions };
    delete updatedCompletions[plantId];
    setCompletions(updatedCompletions);
    localStorage.setItem('flora_completions', JSON.stringify(updatedCompletions));

    // Show removal confirmation snackbar
    setActiveNotification({
      id: 'removed',
      title: 'Plant Removed',
      body: 'Your garden and reminders have been updated.',
      plantName: 'FloraID'
    });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const handleSaveReminder = (reminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem('flora_reminders', JSON.stringify(updated));
    setReminderPlant(null);
    
    setActiveNotification({
      id: 'demo',
      title: 'Reminder Activated',
      body: `${reminderData.type} schedule for your plant has been successfully set up.`,
      plantName: 'FloraID'
    });
    setTimeout(() => setActiveNotification(null), 6000);
  };

  const handleCompleteTask = (plantId: string, taskType: string) => {
    const currentPlantCompletions = completions[plantId] || [];
    let updatedCompletions: string[];
    
    if (currentPlantCompletions.includes(taskType)) {
      updatedCompletions = currentPlantCompletions.filter(t => t !== taskType);
    } else {
      updatedCompletions = [...currentPlantCompletions, taskType];
      
      // If it's a watering task, update the plant status in garden
      if (taskType === 'Watering') {
        const updatedPlants = myPlants.map(p => {
          if (p.id === plantId) {
            return { ...p, lastWatered: 'Watered today', status: 'Healthy', statusColor: 'text-emerald-500 bg-emerald-50' };
          }
          return p;
        });
        setMyPlants(updatedPlants);
        localStorage.setItem('flora_garden', JSON.stringify(updatedPlants));
      }

      // Show small success alert
      setActiveNotification({
        id: 'task-done',
        title: 'Task Completed!',
        body: `Great job! Your plant is feeling much better now.`,
        plantName: 'FloraID'
      });
      setTimeout(() => setActiveNotification(null), 4000);
    }

    const newCompletions = { ...completions, [plantId]: updatedCompletions };
    setCompletions(newCompletions);
    localStorage.setItem('flora_completions', JSON.stringify(newCompletions));
  };

  const handlePlantSearch = async (query: string) => {
    setIsProcessing(true);
    try {
      const result = await getPlantInfoByName(query);
      const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
      setIdResult(result);
      setWikiImages(images);
      setActiveTab('results');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGardenPlantClick = async (plant: any) => {
    setIsProcessing(true);
    try {
      const result = await getPlantInfoByName(plant.species || plant.name);
      const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
      
      const finalImages = images;
      if (plant.image && !images.some(img => img.imageUrl === plant.image)) {
        finalImages.unshift({ imageUrl: plant.image, sourcePageUrl: '' });
      }

      setIdResult(result);
      setWikiImages(finalImages);
      setActiveTab('results');
    } catch (err) {
      console.error("Failed to load plant details:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        if (activeTab === 'diagnose') {
          const rawDiag = await diagnoseHealth(base64);
          const currentImg = reader.result as string;
          const newResult = { ...rawDiag, imageUrl: currentImg };
          setDiagResult(newResult);
          
          const history = JSON.parse(localStorage.getItem('flora_diag_history') || '[]');
          const historyEntry = {
            ...newResult,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('flora_diag_history', JSON.stringify([historyEntry, ...history]));
          setActiveTab('diag-results');
        } else {
          const result = await identifyPlant(base64);
          const images = await getWikiImages(result.identification.scientificName, result.identification.genus);
          setIdResult(result);
          setWikiImages(images);
          setActiveTab('results'); 
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (activeTab === 'results' && idResult) {
      const currentPlant = myPlants.find(p => p.species === idResult.identification.scientificName);
      const isAlreadyInGarden = !!currentPlant;
      const plantReminders = currentPlant ? reminders.filter(r => r.plantId === currentPlant.id) : [];
      const plantCompletions = currentPlant ? (completions[currentPlant.id] || []) : [];

      return (
        <PlantResultScreen 
          data={idResult} 
          images={wikiImages} 
          hideAddButton={isAlreadyInGarden}
          reminders={plantReminders}
          completedTasks={plantCompletions}
          onAddReminder={() => {
            if (currentPlant) {
              setReminderPlant({ id: currentPlant.id, name: currentPlant.name });
            }
          }}
          onCompleteTask={(type) => {
            if (currentPlant) handleCompleteTask(currentPlant.id, type);
          }}
          onSearchSimilar={handlePlantSearch}
          onAddToGarden={(name, species, img) => addPlantToGarden({ name, species, image: img })}
          onBack={() => {
            setActiveTab(isAlreadyInGarden ? 'my-plants' : 'home');
            setIdResult(null);
          }} 
        />
      );
    }

    if (activeTab === 'diag-results' && diagResult) {
      return (
        <DiagnosisResultScreen 
          result={diagResult}
          onBack={() => {
            setActiveTab('diagnose');
            setDiagResult(null);
          }}
        />
      );
    }

    switch(activeTab) {
      case 'home':
        return <HomeScreen onNavigate={setActiveTab} onSearch={handlePlantSearch} onAddToGarden={(name, species) => addPlantToGarden({ name, species })} />;
      case 'my-plants':
        return (
          <MyPlantsScreen 
            plants={myPlants} 
            reminders={reminders}
            onAddClick={handleCameraClick} 
            onManageReminders={(id, name) => setReminderPlant({ id, name })}
            onPlantClick={handleGardenPlantClick}
            onRemovePlant={handleRemovePlant}
          />
        );
      case 'diagnose':
        return <DiagnosticsScreen onStartDiagnosis={handleCameraClick} />;
      case 'stores':
        return <MapScreen />;
      case 'profile':
        return (
          <div className="px-6 pt-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#EFFFFB] text-[#00D09C] rounded-full flex items-center justify-center font-bold text-xl uppercase">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{String(user.name)}</h3>
                <p className="text-xs text-gray-400">{String(user.email)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <ProfileItem label="My Subscriptions" value="Free Plan" sub="Upgrade to Pro" />
              <ProfileItem label="Nearby Stores" onClick={() => setActiveTab('stores')} />
              <ProfileItem label="Garden Settings" />
              <ProfileItem label="Notification Preferences" />
              <ProfileItem label="Privacy Policy" />
              <button 
                onClick={() => {
                  setUser(null);
                  localStorage.removeItem('flora_user');
                }}
                className="w-full text-center py-5 text-rose-500 font-bold uppercase tracking-widest text-[10px]"
              >
                Sign Out
              </button>
            </div>
          </div>
        );
      default:
        return <HomeScreen onNavigate={setActiveTab} onSearch={handlePlantSearch} onAddToGarden={(name, species) => addPlantToGarden({ name, species })} />;
    }
  };

  const currentTabForLayout = (activeTab === 'results' || activeTab === 'diag-results') ? (diagResult ? 'diagnose' : 'home') : activeTab;

  return (
    <>
      {activeNotification && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] w-[92%] max-w-md animate-in slide-in-from-top-40 fade-in zoom-in-95 duration-700">
          <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] border border-[#00D09C]/10 overflow-hidden">
            <div className="p-8">
              <div className="flex gap-6 items-start">
                <div className="relative">
                   <div className="absolute inset-0 bg-[#00D09C] rounded-[2rem] animate-ping opacity-25 scale-125"></div>
                   <div className="bg-[#EFFFFB] p-4 rounded-[2rem] text-[#00D09C] relative z-10 shadow-sm border border-[#00D09C]/10">
                     <Bell size={32} className="animate-bounce" />
                   </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#00D09C] uppercase tracking-widest">FloraID Alert</span>
                    <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Just Now</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl mb-1 leading-tight">{activeNotification.title}</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{activeNotification.body}</p>
                </div>
                <button onClick={() => setActiveNotification(null)} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => {
                    const plant = myPlants.find(p => p.id === activeNotification.plantId);
                    if (plant) handleGardenPlantClick(plant);
                    setActiveNotification(null);
                  }}
                  className="flex-1 bg-[#00D09C] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-[#00D09C33] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  View Details <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => setActiveNotification(null)}
                  className="px-6 bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold text-sm hover:bg-gray-100 active:scale-95 transition-transform"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gray-50">
               <div className="h-full bg-[#00D09C] animate-progress-timer origin-left"></div>
            </div>
          </div>
        </div>
      )}

      <Layout 
        activeTab={currentTabForLayout} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIdResult(null);
          setDiagResult(null);
        }} 
        onCameraClick={handleCameraClick}
      >
        {renderContent()}
      </Layout>

      {reminderPlant && (
        <ReminderModal 
          plantId={reminderPlant.id} 
          plantName={reminderPlant.name}
          onClose={() => setReminderPlant(null)}
          onSave={handleSaveReminder}
        />
      )}

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-xs">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#00D09C] rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="bg-[#EFFFFB] p-4 rounded-full relative">
                <Loader2 size={40} className="text-[#00D09C] animate-spin" />
              </div>
            </div>
            <h2 className="text-gray-900 font-bold text-xl mb-2">Deep Botanical Dive...</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Harvesting the latest botanical insights and care secrets just for you.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress-timer {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .animate-progress-timer {
          animation: progress-timer 15s linear forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

const ProfileItem = ({ label, value, sub, onClick }: any) => (
  <div onClick={onClick} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center group cursor-pointer active:bg-gray-50 transition-colors">
    <div>
      <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#00D09C] transition-colors">{String(label)}</h4>
      {sub && <p className="text-[10px] text-[#00D09C] font-bold uppercase tracking-wider mt-1">{String(sub)}</p>}
    </div>
    {value && <span className="text-xs text-gray-400 font-medium">{String(value)}</span>}
  </div>
);

export default App;
