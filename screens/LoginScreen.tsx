
import React, { useState } from 'react';
import { Sprout, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string, email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(name || 'Gardener', email || 'demo@flora.id');
  };

  return (
    <div className="min-h-screen bg-[#00D09C] flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/5 rounded-full blur-3xl"></div>

      <div className="mb-12 flex flex-col items-center text-center text-white z-10">
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-[3rem] mb-6 shadow-2xl border border-white/30">
          <Sprout size={64} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2">FloraID</h1>
        <p className="text-white/80 font-medium">Your companion in the botanical world</p>
      </div>

      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl z-10">
        <div className="flex gap-6 mb-8 justify-center">
          <button 
            onClick={() => setIsLogin(true)}
            className={`text-lg font-bold pb-1 transition-all ${isLogin ? 'text-gray-900 border-b-4 border-[#00D09C]' : 'text-gray-400'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`text-lg font-bold pb-1 transition-all ${!isLogin ? 'text-gray-900 border-b-4 border-[#00D09C]' : 'text-gray-400'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-none py-4 px-6 rounded-3xl text-sm focus:ring-2 focus:ring-[#00D09C] transition-shadow"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-none py-4 pl-12 pr-6 rounded-3xl text-sm focus:ring-2 focus:ring-[#00D09C] transition-shadow"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-none py-4 pl-12 pr-6 rounded-3xl text-sm focus:ring-2 focus:ring-[#00D09C] transition-shadow"
            />
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <button type="button" className="text-[10px] font-bold text-[#00D09C] uppercase tracking-wider">Forgot Password?</button>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-[#00D09C] py-5 rounded-[2.5rem] text-white font-bold shadow-lg shadow-[#00D09C44] active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-4">
           <span className="text-xs text-gray-400 font-medium">Or join with</span>
           <div className="flex gap-4">
             <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">G</button>
             <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">F</button>
           </div>
        </div>
      </div>

      <div className="mt-8 z-10">
        <p className="text-white/60 text-xs text-center px-12 leading-relaxed">
          By signing up, you agree to our <span className="text-white font-bold border-b border-white/30">Terms</span> and <span className="text-white font-bold border-b border-white/30">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
