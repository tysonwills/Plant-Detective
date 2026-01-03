
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShieldCheck, Lock, Eye, Info, FileText, Scale, AlertCircle, Trash2, Globe } from 'lucide-react';

interface TermsScreenProps {
  onBack: () => void;
  initialTab?: 'terms' | 'privacy';
}

const TermsScreen: React.FC<TermsScreenProps> = ({ onBack, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="min-h-screen bg-white pb-20 animate-in slide-in-from-right-4 duration-500">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 px-6 pt-12 pb-4 flex flex-col gap-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-gray-50 rounded-xl text-gray-500 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900">Legal Center</h1>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'terms' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
          >
            Terms of Use
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'privacy' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
          >
            Privacy Policy
          </button>
        </div>
      </div>

      <div className="px-8 pt-8">
        {activeTab === 'terms' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex gap-4 items-start">
               <div className="bg-white p-3 rounded-2xl text-blue-500 shadow-sm">
                 <Scale size={24} />
               </div>
               <div>
                 <h2 className="font-black text-blue-900 text-lg leading-tight mb-1">Our Agreement</h2>
                 <p className="text-blue-700/70 text-xs font-bold leading-relaxed">
                   Please read these terms carefully before using FloraID.
                 </p>
               </div>
            </div>

            <section className="prose prose-sm text-gray-700">
              <p className="font-medium leading-relaxed italic mb-8">
                Welcome to the Plant Finder App! By using our app, you agree to the following terms and conditions. Please read them carefully.
              </p>

              <div className="space-y-6">
                <LegalSection number="1" title="Acceptance of Terms" icon={<Info size={16}/>}>
                  By downloading, accessing, or using the Plant Finder App (“App”), you agree to comply with these Terms and Conditions. If you do not agree, please do not use the App.
                </LegalSection>

                <LegalSection number="2" title="Use of the App" icon={<FileText size={16}/>}>
                  <p>The App is intended for personal, non-commercial use only.</p>
                  <p className="mt-2 font-bold text-gray-900 text-[11px] uppercase tracking-wider">You agree not to:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Copy, modify, or distribute the App’s content without permission</li>
                    <li>Attempt to access the App’s backend, database, or other users’ information</li>
                    <li>Use the App for unlawful purposes</li>
                  </ul>
                </LegalSection>

                <LegalSection number="3" title="User Accounts" icon={<Lock size={16}/>}>
                  <p>Some features require creating an account.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>You are responsible for keeping your login information secure.</li>
                    <li>You are responsible for all activity that occurs under your account.</li>
                  </ul>
                </LegalSection>

                <LegalSection number="4" title="Privacy" icon={<Eye size={16}/>}>
                  Your use of the App is also governed by our Privacy Policy, which explains how we collect, use, and protect your data.
                </LegalSection>

                <LegalSection number="5" title="Intellectual Property" icon={<Scale size={16}/>}>
                  All content, images, designs, and software in the App are owned by [Your Company Name] or its licensors. You may not copy, reproduce, distribute, or create derivative works without explicit permission.
                </LegalSection>

                <LegalSection number="6" title="User-Generated Content" icon={<FileText size={16}/>}>
                  Users may submit information about plants or locations (“Content”). By submitting Content, you grant us a non-exclusive, royalty-free, worldwide license to use, display, and distribute that content.
                </LegalSection>

                <LegalSection number="7" title="Disclaimers" icon={<AlertCircle size={16}/>}>
                  The App is provided “as is” and “as available”. We do not guarantee that plant identifications are always accurate. Use the App at your own risk.
                </LegalSection>

                <LegalSection number="8" title="Limitation of Liability" icon={<AlertCircle size={16}/>}>
                  [Your Company Name] is not liable for any damages arising from the use or inability to use the App, including misidentification of plants or technical failures.
                </LegalSection>

                <LegalSection number="9" title="Termination" icon={<Trash2 size={16}/>}>
                  We may suspend or terminate your account for violating these Terms. You may terminate your account at any time via the App settings.
                </LegalSection>

                <LegalSection number="10" title="Changes to Terms" icon={<FileText size={16}/>}>
                  We may update these Terms from time to time. Updated Terms take effect when posted.
                </LegalSection>

                <LegalSection number="11" title="Governing Law" icon={<Globe size={16}/>}>
                  These Terms are governed by the laws of [Your Country/State], without regard to conflict of law rules.
                </LegalSection>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 flex gap-4 items-start">
               <div className="bg-white p-3 rounded-2xl text-[#00D09C] shadow-sm">
                 <ShieldCheck size={24} />
               </div>
               <div>
                 <h2 className="font-black text-emerald-900 text-lg leading-tight mb-1">Privacy Priority</h2>
                 <p className="text-emerald-700/70 text-xs font-bold leading-relaxed">
                   Your botanical data belongs to you. We just help you manage it.
                 </p>
               </div>
            </div>

            <section className="prose prose-sm text-gray-700">
              <p className="font-medium leading-relaxed italic mb-8">
                Your privacy is important to us. This Privacy Policy explains how Plant Finder App (“we,” “our,” or “us”) collects, uses, and protects your information when you use our app (“App”).
              </p>

              <div className="space-y-6">
                <LegalSection number="1" title="Information We Collect" icon={<Info size={16}/>}>
                  <div className="space-y-4">
                    <div className="border-l-2 border-gray-100 pl-4">
                      <h4 className="font-bold text-gray-900 text-[11px] uppercase">1.1 Personal Information</h4>
                      <p className="text-xs font-medium text-gray-500">Name, Email, and securely managed credentials.</p>
                    </div>
                    <div className="border-l-2 border-gray-100 pl-4">
                      <h4 className="font-bold text-gray-900 text-[11px] uppercase">1.2 User Content</h4>
                      <p className="text-xs font-medium text-gray-500">Plant observations, photos, and descriptions.</p>
                    </div>
                  </div>
                </LegalSection>

                <LegalSection number="2" title="How We Use Data" icon={<Lock size={16}/>}>
                  We use collected data to provide the service, improve experience, analyze trends, and send account updates.
                </LegalSection>

                <LegalSection number="3" title="Sharing Data" icon={<Eye size={16}/>}>
                  We do not sell your personal information. We only share with essential service providers like Firebase or when legally required.
                </LegalSection>

                <LegalSection number="4" title="Security" icon={<ShieldCheck size={16}/>}>
                  We implement industry-standard security. Your login credentials are handled securely via Firebase Authentication.
                </LegalSection>

                <LegalSection number="5" title="Retention" icon={<FileText size={16}/>}>
                  We retain data as long as your account exists. You can request deletion at any time.
                </LegalSection>
              </div>
            </section>
          </div>
        )}

        <div className="text-center py-12">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Version 2.5.1 • 2023</p>
        </div>
      </div>
    </div>
  );
};

const LegalSection: React.FC<{ number: string, title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ number, title, icon, children }) => (
  <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-gray-50 text-[#00D09C] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-gray-900 font-black text-sm uppercase tracking-wider">
        {number}. {title}
      </h3>
    </div>
    <div className="text-sm font-medium text-gray-500 leading-relaxed pl-2">
      {children}
    </div>
  </div>
);

export default TermsScreen;
