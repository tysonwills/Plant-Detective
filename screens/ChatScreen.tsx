import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { startBotanistChat } from '../services/geminiService';

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    chatRef.current = startBotanistChat();
    setMessages([
      { 
        role: 'model', 
        text: "Hi there! I'm Flora, your AI botanist. Ask me anything about your plants, gardening, or how to revive that sad-looking succulent!", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessage({ message: input });
      const modelMsg: ChatMessage = {
        role: 'model',
        text: result.text || "I'm sorry, I couldn't process that. Can you rephrase?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "My botanical senses are a bit fuzzy right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFB]">
      <div className="px-6 pt-12 pb-4 bg-white shadow-sm flex items-center gap-3">
        <div className="bg-emerald-50 p-2 rounded-xl text-[#00D09C]">
          <MessageCircle size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 leading-none">Botanist AI</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 bg-[#00D09C] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Flora is Online</span>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-[#00D09C] text-white' : 'bg-white text-gray-400'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-[1.5rem] shadow-sm text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-[#00D09C] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                {msg.text}
                <div className={`text-[8px] font-bold uppercase tracking-wider mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-white flex-shrink-0 flex items-center justify-center shadow-sm text-gray-400">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-[1.5rem] shadow-sm bg-white text-gray-800 rounded-tl-none border border-gray-100">
                <Loader2 className="animate-spin text-[#00D09C]" size={16} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Flora anything..." 
            className="w-full bg-gray-50 border-none py-4 px-6 rounded-full text-sm font-medium focus:ring-2 focus:ring-[#00D09C] transition-shadow outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00D09C] opacity-30">
            <Sparkles size={16} />
          </div>
        </div>
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="bg-[#00D09C] p-4 rounded-full text-white shadow-lg shadow-[#00D09C44] active:scale-90 transition-transform disabled:opacity-50 disabled:active:scale-100"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;