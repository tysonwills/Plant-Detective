
import React from 'react';
import { Home, ClipboardList, MapPin, User, Camera, Leaf } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCameraClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onCameraClick }) => {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#F8FAFB] shadow-xl relative overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={onCameraClick}
          className="bg-[#00D09C] p-5 rounded-full shadow-lg shadow-[#00D09C44] text-white transform active:scale-95 transition-transform"
        >
          <Camera size={28} />
        </button>
      </div>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-4 py-3 flex justify-between items-center z-40 rounded-t-3xl">
        <TabItem 
          icon={<Home size={22} />} 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
        />
        <TabItem 
          icon={<Leaf size={22} />} 
          label="Garden" 
          active={activeTab === 'my-plants'} 
          onClick={() => setActiveTab('my-plants')} 
        />
        
        {/* Placeholder for FAB spacing */}
        <div className="w-12" />

        <TabItem 
          icon={<ClipboardList size={22} />} 
          label="Diagnose" 
          active={activeTab === 'diagnose'} 
          onClick={() => setActiveTab('diagnose')} 
        />
        <TabItem 
          icon={<User size={22} />} 
          label="Profile" 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
        />
      </nav>
    </div>
  );
};

const TabItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-[#00D09C]' : 'text-gray-400'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default Layout;
