
import React, { useState } from 'react';
import { Crown, Check, X, Leaf, ShieldCheck, Zap, MessageSquare, Microscope, BellRing, ChevronRight, Sparkles, Star } from 'lucide-react';

interface UpsellScreenProps {
  onSubscribe: () => void;
  onBack: () => void;
}

const UpsellScreen: React.FC<UpsellScreenProps> = ({ onSubscribe, onBack }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const features = [
    { label: 'Unlimited AI Identification', free: true, pro: true, icon: <Leaf size={14} /> },
    { label: 'Advanced Pathogen Diagnostics', free: false, pro: true, icon: <Microscope size={14} /> },
    { label: 'Smart Care Reminders', free: false, pro: true, icon: <BellRing size={14} /> },
    { label: 'Expert Botanist Chat', free: false, pro: true, icon: <MessageSquare size={14} /> },
    { label: 'Local Store Grounding', free: false, pro: true, icon: <Star size={14} /> },
    { label: 'Offline Botanical Database', free: false, pro: true, icon: <Zap size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden pb-12">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 inset-x-0 h-[60vh] bg-gradient-to-b from-emerald-900 to-white -z-10"></div>
      <div className="absolute top-20 right-[-10%] w-80 h-80 bg-[#00D09C]/20 rounded-full blur-[100px]"></div>
      <div className="absolute top-40 left-[-10%] w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px]"></div>

      <header className="px-6 pt-12 pb-6 flex justify-between items-center text-white">
        <button onClick={onBack} className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">FloraID Pro</span>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="px-8 pt-4 pb-10 text-center text-white">
        <div className="bg-white/20 backdrop-blur-md w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30 animate-in zoom-in-50 duration-700">
          <Crown size={48} fill="currentColor" className="text-[#D4AF37]" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-2 leading-none">Unlock Full Potential</h1>
        <p className="text-emerald-50/70 text-sm font-medium tracking-wide">Join 50k+ Botanists using our laboratory suite.</p>
      </div>

      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-[3.5rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 mb-8">
          {/* Comparison Table */}
          <div className="space-y-5 mb-10">
            <div className="flex justify-between items-center px-4 mb-2">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Capabilities</span>
              <div className="flex gap-8">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Free</span>
                <span className="text-[10px] font-black text-[#00D09C] uppercase tracking-widest">Pro</span>
              </div>
            </div>
            
            {features.map((f, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50/50 border border-gray-50 group hover:bg-emerald-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-gray-400 group-hover:text-[#00D09C] transition-colors">
                    {f.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{f.label}</span>
                </div>
                <div className="flex gap-10 pr-2">
                  {f.free ? <Check size={16} className="text-gray-300" /> : <X size={16} className="text-gray-100" />}
                  <Check size={16} className="text-[#00D09C]" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>

          {/* Billing Switcher */}
          <div className="bg-gray-100 p-1.5 rounded-3xl flex mb-10">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative ${billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
            >
              Yearly
              <div className="absolute -top-3 -right-2 bg-[#D4AF37] text-white px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-tighter shadow-lg">
                Save 40%
              </div>
            </button>
          </div>

          {/* Pricing Display */}
          <div className="text-center mb-10">
            <div className="flex items-end justify-center gap-1 mb-2">
              <span className="text-5xl font-black text-gray-900 tracking-tighter">
                {billingCycle === 'yearly' ? '$29.99' : '$4.99'}
              </span>
              <span className="text-gray-400 font-bold mb-1.5">
                {billingCycle === 'yearly' ? '/year' : '/month'}
              </span>
            </div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
              {billingCycle === 'yearly' ? 'billed annually ($2.50/mo)' : 'billed monthly'}
            </p>
          </div>

          <button 
            onClick={onSubscribe}
            className="w-full bg-[#00D09C] text-white py-6 rounded-[2.5rem] font-black text-base uppercase tracking-[0.2em] shadow-2xl shadow-emerald-100 active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            Start Identification <ChevronRight size={20} strokeWidth={3} />
          </button>
          
          <p className="mt-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            7-day free trial • Cancel anytime
          </p>
        </div>

        {/* Testimonial */}
        <div className="bg-emerald-50/50 rounded-[2.5rem] p-6 border border-emerald-100/50 flex flex-col items-center text-center gap-3">
           <div className="flex gap-0.5 text-[#D4AF37]">
             {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
           </div>
           <p className="text-[11px] font-bold italic text-emerald-800 leading-relaxed">
             "The pathogen diagnostics tool saved my 10-year old Monstera from root rot within hours. Absolutely worth the upgrade."
           </p>
           <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">— Dr. Elena S., Botanist</span>
        </div>
      </div>
      
      <div className="mt-12 px-12 text-center">
        <p className="text-[10px] font-bold text-gray-300 leading-relaxed">
          Payments will be charged to your Play/App Store account. Subscription automatically renews unless auto-renew is turned off.
        </p>
      </div>
    </div>
  );
};

export default UpsellScreen;
