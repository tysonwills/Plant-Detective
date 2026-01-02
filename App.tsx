
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import HomeScreen from './screens/HomeScreen';
import MyPlantsScreen from './screens/MyPlantsScreen';
import DiagnosticsScreen from './screens/DiagnosticsScreen';
import MapScreen from './screens/MapScreen';
import LoginScreen from './screens/LoginScreen';
import PlantResultScreen from './screens/PlantResultScreen';
import DiagnosisResultScreen from './screens/DiagnosisResultScreen';
import { identifyPlant, diagnoseHealth, getPlantInfoByName } from './services/geminiService';
import { getWikiImages } from './services/wikiService';
import { PlantIdentification, CareGuide, WikiImage, UserProfile, DiagnosticResult } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isProcessing, setIsProcessing] = useState(false);
  const [idResult, setIdResult] = useState<{ identification: PlantIdentification; care: CareGuide } | null>(null);
  const [diagResult, setDiagResult] = useState<Omit<DiagnosticResult, 'id' | 'timestamp'> & { imageUrl?: string } | null>(null);
  const [wikiImages, setWikiImages] = useState<WikiImage[]>([]);
  const [myPlants, setMyPlants] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user session and garden
  useEffect(() => {
    const savedUser = localStorage.getItem('flora_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedPlants = localStorage.getItem('flora_garden');
    if (savedPlants) {
      setMyPlants(JSON.parse(savedPlants));
    } else {
      // Default sample plants
      const samples = [
        {
          id: 's1',
          name: 'Oliver',
          species: 'Monstera Deliciosa',
          image: 'https://picsum.photos/seed/monstera/400/600',
          status: 'Needs Water',
          statusColor: 'text-rose-500 bg-rose-50',
          lastWatered: '4 days ago'
        },
        {
          id: 's2',
          name: 'Spike',
          species: 'Snake Plant',
          image: 'https://picsum.photos/seed/snake/400/600',
          status: 'Healthy',
          statusColor: 'text-emerald-500 bg-emerald-50',
          lastWatered: '1 day ago'
        }
      ];
      setMyPlants(samples);
      localStorage.setItem('flora_garden', JSON.stringify(samples));
    }
  }, []);

  const handleLogin = (name: string, email: string) => {
    const newUser = { id: Date.now().toString(), name, email, isSubscribed: false };
    setUser(newUser);
    localStorage.setItem('flora_user', JSON.stringify(newUser));
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const addPlantToGarden = (plant: { name: string, species: string, image?: string }) => {
    const newPlant = {
      id: Date.now().toString(),
      name: plant.name,
      species: plant.species,
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
      return (
        <PlantResultScreen 
          data={idResult} 
          images={wikiImages} 
          onAddToGarden={(name, species, img) => addPlantToGarden({ name, species, image: img })}
          onBack={() => {
            setActiveTab('home');
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
        return <MyPlantsScreen plants={myPlants} onAddClick={handleCameraClick} />;
      case 'diagnose':
        return <DiagnosticsScreen onStartDiagnosis={handleCameraClick} />;
      case 'stores':
        return <MapScreen />;
      case 'profile':
        return (
          <div className="px-6 pt-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-[#EFFFFB] text-[#00D09C] rounded-full flex items-center justify-center font-bold text-xl">
                {user.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{user.name}</h3>
                <p className="text-xs text-gray-400">{user.email}</p>
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
            
            <div className="mt-12 bg-gradient-to-br from-[#00D09C] to-[#00A080] p-8 rounded-[3rem] text-white shadow-xl shadow-[#00D09C44] relative overflow-hidden">
               <SproutIcon className="absolute -right-4 -bottom-4 opacity-20 w-32 h-32" />
               <h3 className="text-xl font-bold mb-2">FloraID Pro</h3>
               <p className="text-sm text-white/80 mb-6 leading-relaxed">Unlimited plant identifications, advanced diagnostics & no ads.</p>
               <button className="bg-white text-[#00D09C] px-8 py-3 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
                 Coming Soon
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
            <h2 className="text-gray-900 font-bold text-xl mb-2">Analyzing Botanical Data...</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our botanical expert is working hard to provide you with the most accurate results.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

const ProfileItem = ({ label, value, sub, onClick }: any) => (
  <div onClick={onClick} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center group cursor-pointer active:bg-gray-50 transition-colors">
    <div>
      <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#00D09C] transition-colors">{label}</h4>
      {sub && <p className="text-[10px] text-[#00D09C] font-bold uppercase tracking-wider mt-1">{sub}</p>}
    </div>
    {value && <span className="text-xs text-gray-400 font-medium">{value}</span>}
  </div>
);

const SproutIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 20h10" /><path d="M10 20V8a4 4 0 0 1 8 0v12" /><path d="M7 13a4 4 0 0 1 4-4" />
  </svg>
);

export default App;
