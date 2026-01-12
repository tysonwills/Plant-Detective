
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, MessageCircle, ChevronLeft, MoreHorizontal, Camera, Image as ImageIcon, Sprout, X, ExternalLink, Dog, Leaf, Search, Stethoscope, Droplets, Scan, Lightbulb, ArrowRight } from 'lucide-react';
import { ChatMessage } from '../types.ts';
import { startBotanistChat } from '../services/geminiService.ts';

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ base64: string, preview: string } | null>(null);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize chat session
    chatRef.current = startBotanistChat();
    setMessages([
      { 
        role: 'model', 
        text: "System Online: Botanical Data Engine initialized.\n\nI provide WFO-verified taxonomy and visual references. What specimen shall we audit today?", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, capture?: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedImage({
        base64,
        preview: reader.result as string
      });
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const sendMessageToModel = async (text: string, image?: { base64: string }) => {
     if (!chatRef.current) return;
     
     setIsTyping(true);
     try {
      let result;
      if (image) {
        const parts = [];
        if (text.trim()) parts.push({ text: text });
        parts.push({ 
          inlineData: { 
            mimeType: "image/jpeg", 
            data: image.base64 
          } 
        });
        result = await chatRef.current.sendMessage({ message: parts });
      } else {
        result = await chatRef.current.sendMessage({ message: text });
      }

      const modelMsg: ChatMessage = {
        role: 'model',
        text: result.text || "Analysis incomplete. The WFO verification stream was interrupted. Please retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Connection Error: Unable to access World Flora Online database. Please check signal.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || !chatRef.current) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create user message
    const userMsg: ChatMessage = {
      role: 'user',
      text: input || (selectedImage ? "[Specimen Image]" : ""),
      timestamp
    };

    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = input;
    const currentImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    
    await sendMessageToModel(currentInput, currentImage || undefined);
  };

  const handleSuggestionClick = (prompt: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      role: 'user',
      text: prompt,
      timestamp
    };
    setMessages(prev => [...prev, userMsg]);
    sendMessageToModel(prompt);
  };

  // Improved markdown renderer for images and links
  const renderMessageText = (text: string) => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = imageRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'image', alt: match[1], url: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts.map((part, i) => {
      if (part.type === 'image') {
        return (
          <div key={i} className="my-3 rounded-2xl overflow-hidden shadow-md border border-gray-200">
            <img 
              src={part.url} 
              alt={part.alt} 
              className="w-full h-auto max-h-64 object-cover bg-gray-100" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {part.alt && <p className="text-[9px] text-gray-500 bg-gray-50 px-3 py-1.5 font-bold uppercase">{part.alt}</p>}
          </div>
        );
      } else {
        const linkParts = [];
        let linkLastIndex = 0;
        let linkMatch;
        const subText = part.content;

        while ((linkMatch = linkRegex.exec(subText)) !== null) {
          if (linkMatch.index > linkLastIndex) {
            linkParts.push(subText.substring(linkLastIndex, linkMatch.index));
          }
          linkParts.push(
            <a 
              key={`${i}-${linkMatch.index}`} 
              href={linkMatch[2]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#00D09C] underline underline-offset-2 font-bold inline-flex items-center gap-0.5 hover:text-emerald-700"
            >
              {linkMatch[1]} <ExternalLink size={10} strokeWidth={3} />
            </a>
          );
          linkLastIndex = linkMatch.index + linkMatch[0].length;
        }
        if (linkLastIndex < subText.length) {
          linkParts.push(subText.substring(linkLastIndex));
        }
        return <span key={i}>{linkParts}</span>;
      }
    });
  };

  const showIntro = messages.length <= 1;

  return (
    <div className="flex flex-col h-full bg-[#F2F4F7] relative overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => handleFileSelect(e)}
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#00D09C 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

      {/* Header with Icon */}
      <div className="px-6 pt-12 pb-4 bg-white/80 backdrop-blur-xl shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-[1.25rem] bg-[#EFFFFB] flex items-center justify-center border-2 border-emerald-100 shadow-sm text-[#00D09C] relative">
              <Dog size={24} strokeWidth={2.5} />
              <Leaf size={12} strokeWidth={3} className="absolute -top-1 -right-1 text-emerald-900 fill-emerald-100" />
              <Search size={12} strokeWidth={3} className="absolute bottom-0.5 right-0.5 text-[#00D09C]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00D09C] border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 leading-none">Flora</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-black text-[#00D09C] uppercase tracking-widest">Botanical Data Engine</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scroll-smooth relative z-10"
      >
        {showIntro ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-700">
             {/* Hero Avatar */}
             <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-[#00D09C]/20 rounded-full blur-[40px] group-hover:bg-[#00D09C]/30 transition-colors duration-700"></div>
                <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(0,208,156,0.3)] border-4 border-white relative z-10">
                   <Bot size={56} className="text-[#00D09C]" strokeWidth={1.5} />
                   <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-lg border-4 border-white">
                      <Sparkles size={16} fill="currentColor" />
                   </div>
                </div>
             </div>

             <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight text-center">Botanical Intelligence</h2>
             <p className="text-gray-500 font-medium text-sm text-center max-w-xs leading-relaxed mb-10">
                I can diagnose pathogens, identify species, or build custom care protocols. What is the task?
             </p>

             <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => handleSuggestionClick("I need to diagnose a sick plant. I will upload a photo.")}
                  className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-start gap-3 active:scale-[0.98] transition-all hover:border-rose-200 hover:shadow-rose-100 group"
                >
                   <div className="bg-rose-50 text-rose-500 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                      <Stethoscope size={20} />
                   </div>
                   <div className="text-left">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1 block">Health Check</span>
                      <p className="text-sm font-bold text-gray-700 group-hover:text-rose-600 transition-colors">Diagnose Issue</p>
                   </div>
                </button>

                <button 
                  onClick={() => handleSuggestionClick("Create a care guide for a [Plant Name].")}
                  className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-start gap-3 active:scale-[0.98] transition-all hover:border-blue-200 hover:shadow-blue-100 group"
                >
                   <div className="bg-blue-50 text-blue-500 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                      <Droplets size={20} />
                   </div>
                   <div className="text-left">
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 block">Maintenance</span>
                      <p className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Care Guide</p>
                   </div>
                </button>

                <button 
                  onClick={() => handleSuggestionClick("Identify this plant from a photo.")}
                  className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-start gap-3 active:scale-[0.98] transition-all hover:border-emerald-200 hover:shadow-emerald-100 group"
                >
                   <div className="bg-emerald-50 text-[#00D09C] p-3 rounded-2xl group-hover:scale-110 transition-transform">
                      <Scan size={20} />
                   </div>
                   <div className="text-left">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 block">Taxonomy</span>
                      <p className="text-sm font-bold text-gray-700 group-hover:text-[#00D09C] transition-colors">Identify Plant</p>
                   </div>
                </button>

                <button 
                  onClick={() => handleSuggestionClick("Tell me a rare botanical fact.")}
                  className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-start gap-3 active:scale-[0.98] transition-all hover:border-amber-200 hover:shadow-amber-100 group"
                >
                   <div className="bg-amber-50 text-amber-500 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                      <Lightbulb size={20} />
                   </div>
                   <div className="text-left">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1 block">Trivia</span>
                      <p className="text-sm font-bold text-gray-700 group-hover:text-amber-600 transition-colors">Surprise Me</p>
                   </div>
                </button>
             </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isModel = msg.role === 'model';
              return (
                <div 
                  key={i} 
                  className={`flex ${isModel ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                  <div className={`flex gap-3 max-w-[90%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Message Icon Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 mt-1 ${isModel ? 'bg-emerald-50 text-[#00D09C]' : 'bg-gray-100 text-gray-400'}`}>
                      {isModel ? <Bot size={18} /> : <User size={18} />}
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className={`p-5 rounded-[1.8rem] shadow-sm text-sm font-medium leading-relaxed whitespace-pre-wrap break-words ${
                        isModel 
                          ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
                          : 'bg-[#00D09C] text-white rounded-tr-none shadow-[#00D09C33]'
                      }`}>
                        {renderMessageText(msg.text)}
                      </div>
                      <div className={`text-[8px] font-black uppercase tracking-wider opacity-40 px-2 ${!isModel ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-3 max-w-[85%] items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00D09C] flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 mt-1">
                <Bot size={18} />
              </div>
              <div className="px-5 py-4 rounded-[1.5rem] bg-white border border-gray-100 rounded-tl-none flex items-center gap-1 shadow-sm">
                <div className="w-1.5 h-1.5 bg-[#00D09C] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-[#00D09C] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-[#00D09C] rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 relative z-20 pb-8">
        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-4 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#00D09C] shadow-lg">
              <img src={selectedImage.preview} alt="Upload preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full backdrop-blur-sm"
              >
                <X size={12} />
              </button>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Image attached</p>
          </div>
        )}

        <div className="max-w-md mx-auto flex items-end gap-3 bg-gray-50 p-2 rounded-[2rem] border border-gray-100 shadow-inner">
          <div className="flex items-center gap-1 pl-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-[#00D09C] active:scale-90 transition-all"
            >
              <ImageIcon size={20} />
            </button>
            <button 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              className="p-2 text-gray-400 hover:text-[#00D09C] active:scale-90 transition-all"
            >
              <Camera size={20} />
            </button>
          </div>
          
          <textarea 
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask your expert..." 
            className="flex-1 bg-transparent border-none py-3 px-2 text-sm font-bold text-gray-900 placeholder-gray-400 focus:ring-0 outline-none resize-none max-h-32"
          />
          
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className={`p-3 rounded-2xl transition-all duration-300 ${
              (input.trim() || selectedImage)
                ? 'bg-[#00D09C] text-white shadow-lg shadow-[#00D09C44] scale-100' 
                : 'bg-gray-200 text-gray-400 scale-95 opacity-50'
            } active:scale-90`}
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
