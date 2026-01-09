
import React from 'react';
import { User, ShieldCheck, Crown, Bell, LogOut, ChevronRight, Settings, Heart, Leaf, ClipboardList, Info, FileText } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileScreenProps {
  user: UserProfile;
  stats: {
    plants: number;
    favorites: number;
    scans: number;
  };
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  onToggleNotifications: () => void;
  onShowTerms: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, stats, onLogout, onNavigate, onToggleNotifications, onShowTerms }) => {
  return (
    <div className="px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile Section */}
      <div className="flex flex-col items-center pt-8 mb-10">
        <div className="relative mb-6">
          <div className="w-28 h-28 bg-[#EFFFFB] rounded-[2.5rem] flex items-center justify-center text-[#00D09C] font-black text-4xl shadow-xl border-4 border-white">
            {user.name[0].toUpperCase()}
          </div>
          {user.isSubscribed && (
            <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] p-2 rounded-2xl border-4 border-white text-white shadow-lg">
              <Crown size={20} fill="currentColor" />
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{user.name}</h2>
        <p className="text-gray-400 font-bold text-sm mb-4">{user.email}</p>
        
        <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 flex items-center gap-2 ${
          user.isSubscribed ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-100 text-gray-400 border-gray-100'
        }`}>
          {user.isSubscribed ? <ShieldCheck size={14} /> : <User size={14} />}
          {user.isSubscribed ? 'Premium Botanist' : 'Basic Member'}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 flex justify-between mb-8">
        <StatItem label="Plants" value={stats.plants} icon={<Leaf size={14} />} color="text-emerald-500" />
        <div className="w-px h-10 bg-gray-100 self-center"></div>
        <StatItem label="Favorites" value={stats.favorites} icon={<Heart size={14} />} color="text-rose-500" />
        <div className="w-px h-10 bg-gray-100 self-center"></div>
        <StatItem label="Total Scans" value={stats.scans} icon={<ClipboardList size={14} />} color="text-blue-500" />
      </div>

      {/* Settings Menu */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-2">Account Settings</h3>
        
        <button 
          onClick={() => onNavigate('upsell')}
          className="w-full bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
              <Crown size={20} fill="currentColor" />
            </div>
            <div className="text-left">
              <p className="font-black text-gray-900 text-sm">Subscription</p>
              <p className="text-[10px] font-bold text-gray-400">{user.isSubscribed ? 'Manage Pro Plan' : 'Upgrade to FloraID Pro'}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-500">
              <Bell size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-gray-900 text-sm">Notifications</p>
              <p className="text-[10px] font-bold text-gray-400">Care alerts & Reminders</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={user.notificationsEnabled} 
              onChange={onToggleNotifications} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D09C]"></div>
          </label>
        </div>

        <button 
          onClick={onShowTerms}
          className="w-full bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-gray-900 text-sm">Privacy & Terms</p>
              <p className="text-[10px] font-bold text-gray-400">Policy and conditions</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>

        <button 
          onClick={onLogout}
          className="w-full bg-rose-50 p-5 rounded-3xl flex items-center justify-between group active:scale-[0.98] transition-all border border-rose-100"
        >
          <div className="flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform">
              <LogOut size={20} />
            </div>
            <p className="font-black text-rose-900 text-sm">Logout Account</p>
          </div>
        </button>
      </div>
      
      <p className="mt-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">FloraID Version 2.5.1</p>
    </div>
  );
};

const StatItem = ({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) => (
  <div className="flex flex-col items-center flex-1">
    <div className={`flex items-center gap-1.5 mb-1 ${color}`}>
      {icon}
      <span className="text-xl font-black">{value}</span>
    </div>
    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
  </div>
);

export default ProfileScreen;