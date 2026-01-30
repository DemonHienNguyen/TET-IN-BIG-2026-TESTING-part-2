
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { PhoneOff, PhoneCall, Loader2, AlertCircle, Volume2, Mic, MicOff } from 'lucide-react';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ThayDoAvatar: React.FC<{ isTalking: boolean; isActive: boolean; audioLevel: number }> = ({ isTalking, isActive, audioLevel }) => {
  return (
    <div className="relative w-72 h-72 mx-auto mb-10">
      {/* Aura rực rỡ xung quanh */}
      <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isActive ? 'bg-yellow-500/10 blur-3xl scale-125 opacity-100' : 'opacity-0'}`} />
      
      {/* Vòng sóng âm thanh */}
      {isTalking && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-ping"
          style={{ transform: `scale(${1 + audioLevel * 2})` }}
        />
      )}

      {/* Frame chính của Ông Đồ */}
      <div className={`relative z-10 w-full h-full bg-[#fefce8] rounded-full border-8 border-red-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center transition-transform duration-500 ${isActive ? 'scale-105' : 'scale-100'}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Nền giấy sần */}
          <rect width="200" height="200" fill="#fefce8" />
          <path d="M0 0 L200 200 M200 0 L0 200" stroke="#f0e68c" strokeWidth="0.5" opacity="0.3" />

          {/* Nhân vật */}
          <g transform="translate(0, 10)">
            {/* Áo dài đỏ */}
            <path d="M40 190 Q100 140 160 190 L180 200 L20 200 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
            <path d="M100 145 L100 200" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 2" />

            {/* Cổ áo */}
            <path d="M75 110 Q100 130 125 110" fill="none" stroke="#fbbf24" strokeWidth="3" />

            {/* Khuôn mặt */}
            <circle cx="100" cy="85" r="45" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
            
            {/* Khăn đóng */}
            <path d="M55 75 Q100 35 145 75 L140 85 Q100 60 60 85 Z" fill="#1a1a1a" />
            <path d="M65 65 Q100 45 135 65" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.6" />

            {/* Mắt */}
            <g className={isActive ? 'animate-blink' : ''}>
              <ellipse cx="82" cy="90" rx="4" ry="2" fill="#333" />
              <ellipse cx="118" cy="90" rx="4" ry="2" fill="#333" />
            </g>

            {/* Lông mày trắng */}
            <path d="M72 82 Q82 75 92 82" stroke="white" strokeWidth="3" fill="none" />
            <path d="M108 82 Q118 75 128 82" stroke="white" strokeWidth="3" fill="none" />

            {/* Mũi */}
            <path d="M97 95 Q100 102 103 95" stroke="#d97706" strokeWidth="1.5" fill="none" />

            {/* Miệng nói chuyện */}
            <path 
              d={isTalking ? `M88 110 Q100 ${110 + audioLevel * 50} 112 110` : "M92 112 Q100 115 108 112"} 
              stroke="#991b1b" 
              strokeWidth="3" 
              fill={isTalking ? "#7f1d1d" : "none"}
              className="transition-all duration-75"
            />

            {/* Râu dài màu trắng */}
            <path 
              d={`M80 115 Q100 ${175 + audioLevel * 20} 120 115`} 
              fill="white" 
              opacity="0.9"
              className="transition-all duration-100"
            />
          </g>
        </svg>
      </div>

      {/* Mic status indicator */}
      {isActive && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-2">
           <div className="bg-red-800 px-4 py-1 rounded-full border border-yellow-500/50 shadow-xl flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTalking ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-tighter">Live</span>
           </div>
        </div>
      )}
    </div>
  );
};

const LiveCallSection: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const aiRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyserRef = useRef<AnalyserNode | null>(null);

  const startCall = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      aiRef.current = ai;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
        throw new Error("Vui lòng cho phép truy cập Microphone để trò chuyện với Ông Đồ.");
      });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Setup Analyzer for visualization
      analyserRef.current = outputAudioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length;
        setAudioLevel(avg / 255);
        setIsTalking(avg > 15);
        if (isActive) requestAnimationFrame(updateLevel);
      };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setLoading(false);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
            updateLevel();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64 = message.serverContent.modelTurn.parts[0].inlineData.data;
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(analyserRef.current!);
              analyserRef.current!.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopCall(),
          onerror: (e) => {
            setError("Lỗi kết nối âm thanh. Hãy thử lại!");
            stopCall();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: 'Bạn là "Ông Đồ AI" thông thái, hào sảng, vui vẻ. Bạn đang gọi điện trực tiếp chúc Tết Bính Ngọ 2026. Hãy trò chuyện về phong tục Tết, hỏi thăm sức khỏe, gia đình và tặng những câu đối hoặc lời chúc ý nghĩa. Giọng điệu ấm áp, truyền thống, sử dụng nhiều từ ngữ Hán Việt nhẹ nhàng nhưng dễ hiểu. Luôn chào mừng người nghe bằng sự nồng hậu của một người thầy đồ già.',
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message || "Không thể khởi động cuộc gọi.");
      setLoading(false);
    }
  };

  const stopCall = () => {
    setIsActive(false);
    setIsTalking(false);
    setAudioLevel(0);
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn text-center pb-20 px-4">
      <ThayDoAvatar isActive={isActive} isTalking={isTalking} audioLevel={audioLevel} />
      
      <div className="space-y-2">
        <h2 className="text-5xl font-cursive text-yellow-400 drop-shadow-md">Điện Thoại Chúc Tết</h2>
        <p className="text-red-200 opacity-80 italic">Đàm đạo cùng Ông Đồ thông thái qua Live API</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center justify-center gap-3 text-red-200 max-w-md mx-auto animate-shake">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {!isActive ? (
          <button
            onClick={startCall}
            disabled={loading}
            className="group relative bg-gradient-to-b from-yellow-400 to-yellow-600 text-red-950 px-12 py-6 rounded-full font-black text-2xl shadow-[0_15px_40px_rgba(234,179,8,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-4 border-b-4 border-yellow-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <PhoneCall className="animate-pulse" />}
            {loading ? "ĐANG KẾT NỐI..." : "NHẤN ĐỂ GỌI ÔNG ĐỒ"}
          </button>
        ) : (
          <button
            onClick={stopCall}
            className="bg-red-600 hover:bg-red-500 text-white px-12 py-6 rounded-full font-black text-2xl shadow-[0_15px_40px_rgba(220,38,38,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-4 border-b-4 border-red-800"
          >
            <PhoneOff />
            KẾT THÚC ĐÀM ĐẠO
          </button>
        )}
        
        {isActive && (
          <div className="flex items-center gap-2 text-yellow-500/80 text-xs font-bold uppercase tracking-widest animate-pulse">
            <Mic size={14} /> 
            <span>Ông Đồ đang lắng nghe...</span>
          </div>
        )}
      </div>

      <div className={`mt-10 transition-all duration-700 p-8 rounded-[2.5rem] border ${isActive ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.15)]' : 'bg-red-950/20 border-white/5 opacity-40'}`}>
        <div className="flex items-center justify-center gap-3 text-yellow-500 mb-4">
           <Volume2 size={24} className={isTalking ? 'animate-bounce' : ''} />
           <span className="font-black uppercase tracking-[0.2em] text-sm">Trà Quán AI</span>
        </div>
        <div className="max-w-md mx-auto">
          <p className="text-red-100 text-lg leading-relaxed font-medium italic">
            {isActive ? "Hãy nói: 'Dạ con chào Thầy, năm mới Thầy có gì nhắn nhủ con không?'" : "Cầm máy lên và đàm đạo cùng bậc trí giả để nhận những lời chúc vàng ngọc cho năm Bính Ngọ."}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .animate-blink { animation: blink 5s infinite; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default LiveCallSection;
