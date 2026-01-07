
import React, { useState } from 'react';
import { Crown, Check, X, Leaf, ShieldCheck, Zap, MessageSquare, Microscope, BellRing, ChevronRight, Sparkles, Star, Shield, Lock, Fingerprint, CreditCard, Activity, ArrowRight, Sparkle } from 'lucide-react';

interface UpsellScreenProps {
  onSubscribe: () => void;
  onBack: () => void;
}

const UpsellScreen: React.FC<UpsellScreenProps> = ({ onSubscribe, onBack }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const features = [
    { label: 'Neural Diagnostics', desc: 'Identify 10k+ plant pathogens', icon: <Microscope size={20} />, color: 'bg-emerald-50 text-[#00D09C]' },
    { label: 'Botanist Chat', desc: '24/7 access to AI experts', icon: <MessageSquare size={20} />, color: 'bg-blue-50 text-blue-500' },
    { label: 'Smart Maintenance', desc: 'Predictive watering & care logs', icon: <BellRing size={20} />, color: 'bg-amber-50 text-amber-500' },
    { label: 'Global Store Search', desc: 'Grounding via Google Maps', icon: <Star size={20} />, color: 'bg-indigo-50 text-indigo-500' },
  ];

  const handleFinalPurchase = () => {
    setIsProcessing(true);
    // Simulate a native purchase delay
    setTimeout(() => {
      onSubscribe();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col relative overflow-hidden pb-12">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[60vh] bg-gradient-to-b from-[#EFFFFB] via-white to-transparent -z-10"></div>
      <div className="absolute top-[-10%] left-[-20%] w-[100%] aspect-square bg-[#00D09C]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] aspect-square bg-[#00D09C]/5 rounded-full blur-[80px] pointer-events-none"></div>

      <header className="px-6 pt-12 pb-6 flex justify-between items-center relative z-20">
        <button onClick={onBack} className="p-3 bg-white/80 backdrop-blur-xl rounded-[1.2rem] text-gray-400 active:scale-90 transition-all hover:text-gray-900 border border-white shadow-sm">
          <X size={20} />
        </button>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#00D09C] animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">PlantHound Pro</span>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="px-8 pt-4 pb-10 text-center relative z-10">
        <div className="inline-block relative mb-8">
           <div className="absolute -inset-4 bg-emerald-100/50 rounded-full blur-xl"></div>
           <div className="bg-white p-6 rounded-[2.8rem] shadow-xl relative border-4 border-emerald-50 text-[#00D09C]">
              <Crown size={52} fill="currentColor" strokeWidth={2.5} />
              <div className="absolute -top-2 -right-2 bg-amber-400 p-2 rounded-xl text-white shadow-lg rotate-12">
                 <Sparkle size={16} fill="currentColor" />
              </div>
           </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-3 leading-[0.9] text-gray-900">Unlock Premium Botanical Insight</h1>
        <p className="text-gray-500 text-sm font-bold tracking-tight px-8 leading-relaxed italic opacity-80">
          "The definitive suite for serious enthusiasts who demand clinical care standards."
        </p>
      </div>

      <div className="px-6 space-y-4 mb-10 flex-1 overflow-y-auto scrollbar-hide">
        {features.map((f, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-md border border-white p-6 rounded-[2.5rem] flex items-center gap-6 group hover:border-[#00D09C]/20 transition-all active:scale-[0.98] shadow-sm">
             <div className={`${f.color} p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-inner`}>
               {f.icon}
             </div>
             <div className="flex-1">
                <h3 className="text-gray-900 font-black text-[13px] uppercase tracking-wider mb-0.5">{f.label}</h3>
                <p className="text-gray-400 text-[11px] font-bold leading-tight">{f.desc}</p>
             </div>
             <ChevronRight className="text-gray-200 group-hover:text-[#00D09C] transition-colors" size={16} />
          </div>
        ))}
      </div>

      <div className="px-6 relative z-10">
        <div className="bg-white rounded-[3.5rem] p-8 border border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
          {/* Billing Switcher */}
          <div className="bg-gray-50 p-1.5 rounded-3xl flex mb-8 border border-gray-100">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white text-[#00D09C] shadow-md border border-emerald-50' : 'text-gray-400'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative ${billingCycle === 'yearly' ? 'bg-white text-[#00D09C] shadow-md border border-emerald-50' : 'text-gray-400'}`}
            >
              Annual
              <div className="absolute -top-3 -right-2 bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-tighter shadow-xl">
                SAVE 40%
              </div>
            </button>
          </div>

          <div className="flex justify-between items-end mb-8 px-2">
             <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Standard Billing</p>
                <div className="flex items-baseline gap-1">
                   <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                    {billingCycle === 'yearly' ? '$29.99' : '$4.99'}
                   </h2>
                   <span className="text-sm text-gray-400 font-black uppercase tracking-widest">
                    / {billingCycle === 'yearly' ? 'yr' : 'mo'}
                   </span>
                </div>
             </div>
             <div className="text-right">
                <div className="flex items-center gap-1.5 text-[#00D09C] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                   <ShieldCheck size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Secure</span>
                </div>
             </div>
          </div>

          <button 
            onClick={() => setShowConfirmSheet(true)}
            className="w-full bg-[#00D09C] text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-[#00D09C44] active:scale-95 transition-transform flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            Start Your Free Week <ArrowRight size={22} strokeWidth={3} />
          </button>
          
          <p className="mt-6 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
            Cancel Anytime • 7 Days Complimentary
          </p>
        </div>
      </div>

      {/* PURCHASE CONFIRMATION SHEET (POPUP) - RE-STYLED & MORE PROMINENT */}
      {showConfirmSheet && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center px-4 pb-12 animate-in fade-in duration-500">
           {/* Deeper Backdrop Blur */}
           <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[20px]" onClick={() => !isProcessing && setShowConfirmSheet(false)}></div>
           
           {/* The Sheet with Scale Animation */}
           <div className="bg-white w-full max-w-sm rounded-[4rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative z-20 animate-in zoom-in-95 slide-in-from-bottom-32 duration-500 border-4 border-white">
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-10"></div>
              
              <div className="flex items-center gap-6 mb-12">
                 <div className="w-20 h-20 bg-emerald-50 rounded-[2.2rem] flex items-center justify-center shadow-inner flex-shrink-0 border-2 border-emerald-100">
                    <Crown size={32} className="text-[#00D09C]" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-none mb-1.5 tracking-tight">Confirm Plan</h3>
                    <div className="flex items-center gap-2">
                       <Shield size={12} className="text-[#00D09C]" fill="currentColor" />
                       <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Verified Payment System</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 mb-12 bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Type</span>
                    <span className="text-sm font-black text-gray-900">Pro {billingCycle === 'yearly' ? 'Annual' : 'Monthly'}</span>
                 </div>
                 <div className="h-px bg-gray-100 w-full"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Account</span>
                    <span className="text-sm font-black text-gray-900 truncate max-w-[150px]">demo@planthound.id</span>
                 </div>
                 <div className="h-px bg-gray-100 w-full"></div>
                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-[#00D09C] uppercase tracking-widest">Total Today</span>
                       <span className="text-[8px] font-bold text-gray-400">Complimentary Trial</span>
                    </div>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">$0.00</span>
                 </div>
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center gap-8 py-6">
                   <div className="relative">
                      <div className="absolute inset-0 bg-[#00D09C]/10 rounded-full scale-[1.8] animate-pulse"></div>
                      <Activity className="text-[#00D09C] animate-[spin_4s_linear_infinite]" size={56} />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Fingerprint className="text-gray-300" size={28} />
                      </div>
                   </div>
                   <div className="text-center">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Authenticating...</p>
                      <p className="text-[9px] font-bold text-gray-300 uppercase mt-2">Linking Botanical Protocol</p>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="text-center mb-2 px-6">
                     <p className="text-[9px] text-gray-400 font-bold leading-relaxed italic">
                        By confirming, you authorize a recurring payment of {billingCycle === 'yearly' ? '$29.99' : '$4.99'} after your 7-day trial.
                     </p>
                  </div>
                  
                  <button 
                    onClick={handleFinalPurchase}
                    className="w-full bg-gray-900 text-white py-7 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-95 transition-all flex items-center justify-center gap-4 group ring-4 ring-black/5"
                  >
                    <div className="p-2 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                      <Fingerprint size={22} className="text-emerald-400" />
                    </div>
                    Double Click to Pay
                  </button>
                  
                  <button 
                    onClick={() => setShowConfirmSheet(false)}
                    className="w-full py-4 text-gray-300 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors"
                  >
                    Discard Transaction
                  </button>
                </div>
              )}

              <div className="mt-10 flex items-center justify-center gap-6 opacity-30">
                 <Shield size={22} />
                 <Lock size={22} />
                 <CreditCard size={22} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default UpsellScreen;
