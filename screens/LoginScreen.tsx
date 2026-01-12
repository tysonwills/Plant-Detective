
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Dog, Leaf, Search, User } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string, email: string) => void;
  onShowTerms: (tab?: 'terms' | 'privacy') => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onShowTerms }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Manual Validation
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!isLogin && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Success - execute login
    onLogin(name || 'Gardener', email);
  };

  const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
    onLogin(`${provider} User`, `user@${provider.toLowerCase()}.com`);
  };

  return (
    <div className="min-h-screen bg-[#00D09C] flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/5 rounded-full blur-3xl"></div>

      <div className="mb-10 flex flex-col items-center text-center text-white z-10 animate-in slide-in-from-top-10 duration-700">
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-[3rem] mb-6 shadow-2xl border border-white/30 text-white relative">
          <Dog size={60} strokeWidth={2.5} />
          <Leaf size={30} strokeWidth={3} className="absolute -top-2 -right-2 text-emerald-100 fill-emerald-500" />
          <Search size={24} strokeWidth={3} className="absolute bottom-1 right-1 text-white" />
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter shadow-sm">PlantHound</h1>
        <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px]">Botanical Intelligence</p>
      </div>

      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] z-10 animate-in zoom-in-95 duration-500">
        <div className="flex gap-6 mb-8 justify-center border-b border-gray-100 pb-1">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`text-sm font-black pb-3 transition-all relative ${isLogin ? 'text-[#00D09C]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Sign In
            {isLogin && <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-[#00D09C] rounded-t-full"></div>}
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`text-sm font-black pb-3 transition-all relative ${!isLogin ? 'text-[#00D09C]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Create Account
            {!isLogin && <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-[#00D09C] rounded-t-full"></div>}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#00D09C] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 pr-6 rounded-[1.5rem] text-sm text-gray-900 font-bold placeholder-gray-400 focus:bg-white focus:border-[#00D09C] focus:ring-0 transition-all outline-none"
              />
            </div>
          )}
          
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#00D09C] transition-colors" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 pr-6 rounded-[1.5rem] text-sm text-gray-900 font-bold placeholder-gray-400 focus:bg-white focus:border-[#00D09C] focus:ring-0 transition-all outline-none"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#00D09C] transition-colors" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 pr-6 rounded-[1.5rem] text-sm text-gray-900 font-bold placeholder-gray-400 focus:bg-white focus:border-[#00D09C] focus:ring-0 transition-all outline-none"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 py-2 rounded-xl border border-rose-100 animate-in fade-in">
              {error}
            </p>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-[#00D09C] uppercase tracking-wider transition-colors">
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-[#00D09C] py-5 rounded-[2rem] text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 hover:bg-emerald-500"
          >
            {isLogin ? 'Sign In' : 'Join Now'}
            <ArrowRight size={18} strokeWidth={3} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Or authenticate with</span>
           <div className="flex gap-4">
             <button 
               type="button"
               onClick={() => handleSocialLogin('Google')}
               className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 font-black hover:bg-white hover:shadow-md hover:scale-110 border border-transparent hover:border-gray-100 transition-all active:scale-90"
             >
               G
             </button>
             <button 
               type="button"
               onClick={() => handleSocialLogin('Facebook')}
               className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 font-black hover:bg-white hover:shadow-md hover:scale-110 border border-transparent hover:border-gray-100 transition-all active:scale-90"
             >
               F
             </button>
           </div>
        </div>
      </div>

      <div className="mt-8 z-10 max-w-xs text-center">
        <p className="text-white/60 text-[10px] font-medium leading-relaxed">
          By continuing, you agree to our <button onClick={() => onShowTerms('terms')} className="text-white font-bold border-b border-white/30 hover:border-white transition-colors">Terms</button> and <button onClick={() => onShowTerms('privacy')} className="text-white font-bold border-b border-white/30 hover:border-white transition-colors">Privacy Policy</button>.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
