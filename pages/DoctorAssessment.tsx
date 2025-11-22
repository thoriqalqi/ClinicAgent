
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { chatWithMedicalExpert } from '../services/geminiService';
import { Send, Bot, User as UserIcon, Sparkles, RefreshCw, Eraser, Stethoscope } from 'lucide-react';

interface DoctorAssessmentProps {
  currentUser: User;
}

export const DoctorAssessment: React.FC<DoctorAssessmentProps> = ({ currentUser }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: `Halo Dr. ${currentUser.name.split(' ').pop()}. Saya adalah Asisten Riset Medis AI Anda. Saya dapat membantu dengan diagnosis banding, interaksi obat, atau merangkum pedoman klinis. Ada yang bisa saya bantu hari ini?`,
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
        const responseText = await chatWithMedicalExpert(messages, userMsg.text);
        
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "Saya mengalami kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsThinking(false);
    }
  };

  const handleClear = () => {
      if(window.confirm("Hapus riwayat obrolan?")) {
          setMessages([{
            id: 'init',
            role: 'model',
            text: `Riwayat dihapus. Siap untuk topik baru, Dr. ${currentUser.name.split(' ').pop()}.`,
            timestamp: new Date()
          }]);
      }
  };

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
        
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col gap-4 h-fit">
                <div className="flex items-center gap-4 mb-2">
                     <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                        <Stethoscope size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Chat Medis</h1>
                        <p className="text-slate-500 font-medium text-xs uppercase tracking-wide">Asisten Riset</p>
                    </div>
                </div>
                
                <p className="text-slate-600 font-medium text-sm leading-relaxed">
                    Gunakan alat ini untuk mencari interaksi obat, pedoman, atau mendapatkan pendapat kedua tentang kasus kompleks menggunakan <strong>Gemini Pro</strong>.
                </p>
                
                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-900 text-sm font-medium leading-relaxed mt-2">
                    <p className="flex items-center gap-2 font-bold mb-3"><Sparkles size={16}/> Coba tanyakan:</p>
                    <div className="space-y-2">
                        <button onClick={() => setInput("Cek interaksi antara Warfarin dan Aspirin")} className="block w-full text-left px-3 py-2 bg-white/60 hover:bg-white rounded-xl text-xs transition-colors border border-indigo-100/50">
                            "Interaksi: Warfarin & Aspirin"
                        </button>
                        <button onClick={() => setInput("Diagnosis banding untuk nyeri perut akut pada pria 30 tahun")} className="block w-full text-left px-3 py-2 bg-white/60 hover:bg-white rounded-xl text-xs transition-colors border border-indigo-100/50">
                            "DDx: Nyeri Perut Akut"
                        </button>
                        <button onClick={() => setInput("Pedoman terbaru manajemen Hipertensi")} className="block w-full text-left px-3 py-2 bg-white/60 hover:bg-white rounded-xl text-xs transition-colors border border-indigo-100/50">
                            "Pedoman Manajemen HTN"
                        </button>
                    </div>
                </div>

                <button 
                    onClick={handleClear}
                    className="mt-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Eraser size={16} /> Hapus Percakapan
                </button>
            </div>
        </div>

        <div className="lg:col-span-8 flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/30">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border-2 border-white ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'}`}>
                            {msg.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                        </div>
                        
                        <div className={`max-w-[80%] p-5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-slate-900 text-white rounded-tr-sm' 
                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                        }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <p className={`text-[10px] mt-2 font-bold opacity-60 ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                ))}
                
                {isThinking && (
                    <div className="flex gap-4 animate-pulse">
                         <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Bot size={18} />
                        </div>
                        <div className="bg-white border border-slate-100 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                            <RefreshCw size={16} className="animate-spin text-indigo-500" />
                            <span className="text-sm font-bold text-indigo-900">Berkonsultasi dengan basis pengetahuan medis...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
                <div className="relative flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ketik pertanyaan medis Anda di sini..."
                        className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="absolute right-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-70 disabled:scale-95 hover:scale-105"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div className="flex justify-center mt-3">
                    <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-100 flex items-center gap-1.5">
                        <Sparkles size={10} />
                        Konten dihasilkan AI. Verifikasi dengan protokol klinis standar.
                    </span>
                </div>
            </div>
        </div>

      </div>
      </div>
    </div>
  );
};
