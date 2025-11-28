import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Logo } from './components/Logo';
import { Footer } from './components/Footer';
import { VOICE_PROFILES, READING_STYLES, SAMPLE_TEXT } from './constants';
import { VoiceProfile, StyleProfile, ProcessingState, GeneratedAudio } from './types';
import { generateSpeech } from './services/geminiService';
import { decodeAudioData, encodeWAV } from './utils/audioUtils';
import { Download, Music, Upload, FileText, Loader2, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(VOICE_PROFILES[0]);
  const [selectedStyle, setSelectedStyle] = useState<StyleProfile>(READING_STYLES[0]);
  const [speed, setSpeed] = useState<number>(1.0);
  const [inputText, setInputText] = useState<string>("");
  const [processing, setProcessing] = useState<ProcessingState>({ isGenerating: false, progress: 0, error: null });
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setInputText(text);
      }
    };
    // Basic support for txt files. 
    if (file.name.endsWith('.txt')) {
       reader.readAsText(file);
    } else {
       alert("Phiên bản demo hiện chỉ hỗ trợ đọc trực tiếp file .txt. Vui lòng copy nội dung từ Word/PDF vào khung bên dưới.");
    }
  };

  const playPreview = async () => {
     if (!processing.isGenerating) {
        // Stop any current playback
        if (audioSourceRef.current) {
            try { audioSourceRef.current.stop(); } catch (e) {}
        }
        
        // Use a short text for preview if input is empty
        const textToPreview = inputText.length > 0 ? inputText.substring(0, 50) : SAMPLE_TEXT;
        
        setProcessing({ isGenerating: true, progress: 20, error: null });
        try {
            const base64 = await generateSpeech(textToPreview, selectedVoice, selectedStyle.instruction);
            if(audioContextRef.current) {
                const buffer = await decodeAudioData(base64, audioContextRef.current);
                
                const source = audioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.playbackRate.value = speed;
                source.connect(audioContextRef.current.destination);
                source.start();
                audioSourceRef.current = source;
                
                source.onended = () => {
                     setProcessing(prev => ({ ...prev, isGenerating: false }));
                };
            }
        } catch (err: any) {
             setProcessing({ isGenerating: false, progress: 0, error: err.message });
        }
     }
  };

  const handleConvert = async () => {
    if (!inputText.trim()) {
      setProcessing({ ...processing, error: "Vui lòng nhập văn bản hoặc tải file lên." });
      return;
    }

    setProcessing({ isGenerating: true, progress: 10, error: null });
    setGeneratedAudio(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProcessing(prev => {
          if (prev.progress >= 90) return prev;
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 500);

      const base64 = await generateSpeech(inputText, selectedVoice, selectedStyle.instruction);
      
      clearInterval(progressInterval);
      setProcessing({ isGenerating: false, progress: 100, error: null });

      if (audioContextRef.current) {
          const buffer = await decodeAudioData(base64, audioContextRef.current);
          
          // Encode to WAV for download/playback
          const wavBlob = encodeWAV(buffer.getChannelData(0), 24000); // 24k is Gemini's rate
          const url = URL.createObjectURL(wavBlob);
          
          setGeneratedAudio({
              blob: wavBlob,
              url: url,
              duration: buffer.duration
          });
      }

    } catch (err: any) {
      setProcessing({ isGenerating: false, progress: 0, error: err.message || "Có lỗi xảy ra." });
    }
  };

  // Adjust playback speed of the result audio element when speed slider changes
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  return (
    <div className="min-h-screen pb-10 font-sans">
      <div className="container mx-auto px-4 py-8">
        
        {/* HEADER */}
        <Logo />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* COLUMN 1: CONTROL CENTER */}
          <div className="bg-[#002244] border border-[#004080] rounded-xl p-6 shadow-2xl relative overflow-visible">
             {/* Decorative top border */}
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mwg-blue via-mwg-gold to-mwg-blue rounded-t-xl"></div>
             
             <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
               <span className="bg-mwg-gold text-mwg-blue w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
               Cấu Hình & Nhập Liệu
             </h2>

             {/* Voice Selection (Dropdown) */}
             <div className="mb-6">
               <label className="block text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">Chọn Giọng Đọc</label>
               <div className="relative">
                 <select
                    value={selectedVoice.id}
                    onChange={(e) => {
                      const voice = VOICE_PROFILES.find(v => v.id === e.target.value);
                      if(voice) setSelectedVoice(voice);
                    }}
                    className="w-full bg-[#003366] border border-gray-600 text-white rounded-lg p-3 pl-4 pr-10 appearance-none focus:outline-none focus:border-mwg-gold focus:ring-1 focus:ring-mwg-gold cursor-pointer"
                 >
                    {VOICE_PROFILES.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} - {voice.description}
                      </option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-3 top-3.5 text-mwg-gold pointer-events-none" size={20}/>
               </div>
             </div>

             {/* Style Selection (Dropdown) */}
             <div className="mb-6">
               <label className="block text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">Phong Cách Đọc</label>
               <div className="relative">
                 <select
                    value={selectedStyle.id}
                    onChange={(e) => {
                      const style = READING_STYLES.find(s => s.id === e.target.value);
                      if(style) setSelectedStyle(style);
                    }}
                    className="w-full bg-[#003366] border border-gray-600 text-white rounded-lg p-3 pl-4 pr-10 appearance-none focus:outline-none focus:border-mwg-gold focus:ring-1 focus:ring-mwg-gold cursor-pointer"
                 >
                    {READING_STYLES.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                 </select>
                 <ChevronDown className="absolute right-3 top-3.5 text-mwg-gold pointer-events-none" size={20}/>
               </div>
             </div>

             {/* Speed Slider */}
             <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wide">Tốc Độ Đọc</label>
                    <span className="text-mwg-gold font-mono font-bold">{speed}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-mwg-gold"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Chậm (0.5x)</span>
                  <span>Bình thường (1.0x)</span>
                  <span>Nhanh (2.0x)</span>
                </div>
             </div>

             {/* Input Area */}
             <div className="mb-6">
               <div className="flex justify-between items-center mb-2">
                 <label className="block text-gray-300 text-sm font-semibold uppercase tracking-wide">Nội Dung Văn Bản</label>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center text-xs text-mwg-gold hover:text-white transition"
                 >
                   <Upload size={14} className="mr-1"/> Tải file text
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".txt"
                 />
               </div>
               <textarea
                 className="w-full h-40 bg-[#001a33] border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-mwg-gold focus:ring-1 focus:ring-mwg-gold transition-all leading-relaxed resize-none"
                 placeholder="Nhập nội dung văn bản cần chuyển đổi hoặc tải file txt..."
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
               ></textarea>
               <div className="text-right text-xs text-gray-500 mt-1">
                 {inputText.length} ký tự
               </div>
             </div>

             {/* Action Buttons */}
             <div className="flex gap-4">
                <button 
                  onClick={playPreview}
                  disabled={processing.isGenerating}
                  className="flex-1 py-3 bg-transparent border border-gray-500 text-gray-300 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center disabled:opacity-50"
                >
                  <Music size={18} className="mr-2"/> Nghe Thử
                </button>
                
                <button 
                  onClick={handleConvert}
                  disabled={processing.isGenerating}
                  className="flex-[2] py-3 bg-mwg-gold text-[#002244] rounded-lg font-bold hover:bg-mwg-goldHover transition flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {processing.isGenerating ? (
                    <>
                       <Loader2 className="animate-spin mr-2" /> Đang Xử Lý...
                    </>
                  ) : (
                    "CHUYỂN ĐỔI VĂN BẢN SANG GIỌNG NÓI"
                  )}
                </button>
             </div>
             {processing.error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm text-center">
                    {processing.error}
                </div>
             )}
          </div>

          {/* COLUMN 2: OUTPUT CENTER */}
          <div className="flex flex-col h-full">
            <div className="bg-[#002244] border border-[#004080] rounded-xl p-6 shadow-2xl relative flex-1">
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mwg-blue via-mwg-gold to-mwg-blue rounded-t-xl"></div>
               
               <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                 <span className="bg-mwg-gold text-mwg-blue w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                 Kết Quả
               </h2>

               <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] space-y-8">
                  
                  {generatedAudio ? (
                    <div className="w-full animate-fade-in-up">
                        <div className="bg-[#001a33] p-8 rounded-2xl border border-gray-700 flex flex-col items-center">
                            <div className="w-24 h-24 bg-mwg-gold/10 rounded-full flex items-center justify-center mb-6 border-2 border-mwg-gold animate-pulse">
                                <Music size={40} className="text-mwg-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Chuyển đổi hoàn tất!</h3>
                            <p className="text-gray-400 mb-1 text-sm">{selectedVoice.name}</p>
                            <p className="text-mwg-gold mb-6 text-xs font-medium uppercase tracking-wider">{selectedStyle.name}</p>
                            
                            <audio 
                                ref={audioRef}
                                controls 
                                className="w-full mb-6 accent-mwg-gold" 
                                src={generatedAudio.url}
                            />

                            <div className="flex gap-4 w-full">
                                <a 
                                  href={generatedAudio.url} 
                                  download={`mwg-voice-${Date.now()}.wav`}
                                  className="flex-1 bg-white text-mwg-blue font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
                                >
                                    <Download size={18} className="mr-2" /> WAV
                                </a>
                                <a 
                                  href={generatedAudio.url} // In a real app we would transcode to mp3, but wav is safer here
                                  download={`mwg-voice-${Date.now()}.mp3`}
                                  className="flex-1 bg-transparent border border-white text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
                                >
                                    <Download size={18} className="mr-2" /> MP3
                                </a>
                            </div>
                        </div>
                    </div>
                  ) : (
                    <div className="text-center opacity-50">
                        {processing.isGenerating ? (
                            <div className="flex flex-col items-center">
                                <Loader2 size={64} className="text-mwg-gold animate-spin mb-4" />
                                <p className="text-lg animate-pulse">Đang khởi tạo giọng đọc AI...</p>
                                <div className="w-64 h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-mwg-gold transition-all duration-300" style={{width: `${processing.progress}%`}}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <FileText size={80} className="text-gray-600 mb-4" />
                                <p className="text-gray-400 text-lg">Chưa có dữ liệu âm thanh.</p>
                                <p className="text-gray-500 text-sm mt-2">Vui lòng nhập văn bản và nhấn chuyển đổi.</p>
                            </div>
                        )}
                    </div>
                  )}

               </div>
            </div>
          </div>

        </div>

        <Footer />
      </div>
    </div>
  );
};

// Mount the app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

export default App;