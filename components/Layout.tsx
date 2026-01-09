
import React, { useRef } from 'react';
import { Home, Heart, User, Camera, Leaf, Crown, MessageSquare, Sprout, Stethoscope, Dog, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCameraClick: () => void;
  userName?: string;
  isSubscribed?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onCameraClick, userName, isSubscribed }) => {
  const isMainTab = ['home', 'my-plants', 'diagnose', 'favorites', 'profile', 'upsell', 'chat'].includes(activeTab);
  const mainContentRef = useRef<HTMLElement>(null);

  const handleTabClick = (tab: string) => {
    if (tab === 'home' && activeTab === 'home') {
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#F2F4F7] shadow-xl relative overflow-hidden">
      {/* Top Header Section */}
      {isMainTab && activeTab !== 'upsell' && (
        <header className="px-6 pt-12 pb-4 flex justify-between items-center z-30 bg-[#F2F4F7]">
          <button 
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="bg-[#00D09C] w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-white relative">
              <Dog size={22} strokeWidth={2.5} />
              <Leaf size={10} strokeWidth={3} className="absolute -top-1 -right-1 text-emerald-900 fill-emerald-100" />
              <Search size={10} strokeWidth={3} className="absolute bottom-0.5 right-0.5 text-white" />
            </div>
            <div className="flex flex-col text-left">
               <span className="font-bold text-xl text-gray-900 tracking-tight leading-none">PlantHound</span>
               {isSubscribed && <span className="text-[8px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mt-0.5">Premium</span>}
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            {!isSubscribed && (
              <button 
                onClick={() => handleTabClick('upsell')}
                className="bg-[#FFF9E6] px-3 py-1.5 rounded-xl border border-[#D4AF37]/20 flex items-center gap-1.5 text-[#D4AF37] active:scale-95 transition-transform"
              >
                <Crown size={12} fill="currentColor" />
                <span className="text-[9px] font-black uppercase tracking-wider">Unlock Pro</span>
              </button>
            )}
            
            <button 
              onClick={() => handleTabClick('favorites')}
              className={`p-2.5 rounded-2xl transition-all active:scale-90 ${activeTab === 'favorites' ? 'bg-rose-50 text-rose-500 shadow-inner' : 'bg-white text-gray-500 shadow-sm border border-gray-50'}`}
            >
              <Heart size={20} className={activeTab === 'favorites' ? 'fill-rose-500' : ''} />
            </button>

            <button 
              onClick={() => handleTabClick('profile')}
              className={`relative p-0.5 rounded-2xl border-2 transition-all active:scale-90 ${activeTab === 'profile' ? 'border-[#00D09C]' : 'border-white shadow-sm'}`}
            >
              <div className="w-9 h-9 bg-[#EFFFFB] rounded-[0.9rem] flex items-center justify-center text-[#00D09C] font-bold text-sm overflow-hidden">
                {userName ? userName[0].toUpperCase() : <User size={18} />}
              </div>
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main 
        ref={mainContentRef}
        className={`flex-1 overflow-y-auto scroll-smooth ${isMainTab && activeTab !== 'upsell' && 'pb-24'}`}
      >
        {children}
      </main>

      {/* Floating Action Button */}
      {activeTab !== 'upsell' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={onCameraClick}
            className="bg-[#00D09C] p-5 rounded-full shadow-lg shadow-[#00D09C44] text-white transform active:scale-95 transition-transform border-4 border-white"
          >
            <Camera size={28} />
          </button>
        </div>
      )}

      {/* Bottom Nav Bar */}
      {activeTab !== 'upsell' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 py-3 flex justify-between items-center z-40 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          <TabItem 
            icon={<Home size={20} />} 
            label="Home" 
            active={activeTab === 'home'} 
            onClick={() => handleTabClick('home')} 
          />
          <TabItem 
            icon={<Leaf size={20} />} 
            label="Garden" 
            isPro={!isSubscribed}
            active={activeTab === 'my-plants'} 
            onClick={() => handleTabClick('my-plants')} 
          />
          
          <div className="w-12" />

          <TabItem 
            icon={<Stethoscope size={20} />} 
            label="Doctor" 
            isPro={!isSubscribed}
            active={activeTab === 'diagnose'} 
            onClick={() => handleTabClick('diagnose')} 
          />
          <TabItem 
            icon={<MessageSquare size={20} />} 
            label="Ask Expert" 
            isPro={!isSubscribed}
            active={activeTab === 'chat'} 
            onClick={() => handleTabClick('chat')} 
          />
        </nav>
      )}
    </div>
  );
};

const TabItem = ({ icon, label, active, onClick, isPro }: { icon: any, label: string, active: boolean, onClick: () => void, isPro?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${active ? 'text-[#00D09C] scale-110' : 'text-gray-500 hover:text-gray-700'}`}
  >
    {isPro && (
      <div className="absolute -top-1 -right-1 text-[#D4AF37]">
        <Crown size={8} fill="currentColor" />
      </div>
    )}
    <div className={`${active ? 'bg-emerald-50 p-1 rounded-lg' : ''}`}>
      {icon}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default Layout;
