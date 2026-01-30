
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Target, Trophy, RefreshCcw, Sparkles, Heart, Star, Bell, Volume2, VolumeX, Award } from 'lucide-react';
import { playSound } from '../services/audioService';

const WISHES_DATABASE = [
  "Mã đáo thành công, vạn sự hanh thông, tài lộc đầy nhà.",
  "Ngũ phúc lâm môn, phú quý thọ khang ninh, an khang thịnh vượng.",
  "Xuân sang đắc lộc, gia đình hạnh phúc, vận may gõ cửa.",
  "Công danh rạng rỡ, sự nghiệp thăng hoa, sức khỏe dồi dào.",
  "Vạn phúc tựa vân lai, cát tường như ý, mã đáo thành công.",
  "Năm mới Bính Ngọ, lộc lá đầy kho, tựa như rồng bay ngựa chạy."
];

const DragonHuntSection: React.FC = () => {
  const [score, setScore] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isBlessingReceived, setIsBlessingReceived] = useState(false);
  const [currentWish, setCurrentWish] = useState("");
  const [isRare, setIsRare] = useState(false);
  const [dragonPos, setDragonPos] = useState({ x: 50, y: 50 });
  const [dragonScale, setDragonScale] = useState(1);
  const [isGameActive, setIsGameActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isRecoil, setIsRecoil] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);

  const VICTORY_SCORE = 36;

  const moveDragon = useCallback(() => {
    if (!isGameActive || isVictory) return;
    const margin = Math.min(25, 10 + dragonScale * 5);
    const nextX = Math.random() * (100 - margin * 2) + margin;
    const nextY = Math.random() * (100 - margin * 2) + margin;
    setDragonPos({ x: nextX, y: nextY });
  }, [isGameActive, isVictory, dragonScale]);

  useEffect(() => {
    let interval: any;
    if (isGameActive && !isVictory) {
      const intervalTime = Math.max(120, 900 - (score * 20));
      interval = setInterval(moveDragon, intervalTime);
    }
    return () => clearInterval(interval);
  }, [moveDragon, isGameActive, isVictory, score]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameContainerRef.current) {
      const rect = gameContainerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const processHit = useCallback(() => {
    setScore(prev => {
      const newScore = prev + 1;
      setDragonScale(1 + newScore * 0.05);
      
      if (newScore >= VICTORY_SCORE) {
        setIsVictory(true);
        setIsGameActive(false);
        setCurrentWish(WISHES_DATABASE[Math.floor(Math.random() * WISHES_DATABASE.length)]);
        setIsRare(Math.random() < 0.15); // 15% chance for rare blessing
        playSound('victory');
      } else {
        moveDragon();
      }
      return newScore;
    });
    playSound('hit');
  }, [moveDragon]);

  const shoot = useCallback((clientX: number, clientY: number) => {
    if (!isGameActive || isVictory) return;
    setIsRecoil(true);
    setTimeout(() => setIsRecoil(false), 50);
    playSound('gunshot');
    const element = document.elementFromPoint(clientX, clientY);
    if (element && (element.classList.contains('head-target') || element.classList.contains('body-target'))) {
      processHit();
    } else {
      playSound('miss');
    }
  }, [isGameActive, isVictory, processHit]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!isGameActive || isVictory) return;
    isMouseDownRef.current = true;
    shoot(e.clientX, e.clientY);
  };

  const onMouseUp = () => (isMouseDownRef.current = false);

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  const handleNhanPhuc = () => {
    setIsBlessingReceived(true);
    setHistoryCount(prev => prev + 1);
    playSound('victory');
    // Trigger vibration if available
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
  };

  const resetGame = () => {
    setScore(0);
    setIsVictory(false);
    setIsBlessingReceived(false);
    setIsGameActive(true);
    setDragonPos({ x: 50, y: 50 });
    playSound('click');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn text-center pb-20 select-none px-4">
      {/* HUD Header */}
      <div className="flex justify-between items-center bg-red-950/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-yellow-500/30 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-yellow-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative bg-red-900 p-3 rounded-2xl">
              <Trophy className="text-yellow-400" size={28} />
            </div>
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-[0.3em] text-yellow-500/70 font-black">Lộc Xuân Đã Tích</div>
            <div className="text-4xl font-black font-mono tracking-tighter text-white">
              <span className="text-yellow-400">{score}</span>
              <span className="text-xl opacity-30 mx-1">/</span>
              <span className="opacity-50 text-2xl">{VICTORY_SCORE}</span>
            </div>
          </div>
        </div>
        
        {historyCount > 0 && (
          <div className="hidden md:flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
            <Award size={16} className="text-yellow-500" />
            <span className="text-xs font-bold text-yellow-200 uppercase">Đã nhận {historyCount} Phúc</span>
          </div>
        )}

        <button 
          onClick={resetGame}
          className="bg-red-800 hover:bg-red-700 text-yellow-100 px-8 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 border border-yellow-600/30"
        >
          <RefreshCcw size={20} /> CHƠI LẠI
        </button>
      </div>

      {!isGameActive && !isVictory ? (
        <div className="bg-gradient-to-br from-red-950 to-[#4a0404] p-16 rounded-[4rem] border-4 border-yellow-600/30 flex flex-col items-center gap-10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-md">
           <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
           <div className="relative">
             <Target size={140} className="text-yellow-500/10 animate-spin-slow absolute inset-0 m-auto" />
             <div className="w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl absolute inset-0 m-auto"></div>
             <Target size={80} className="text-yellow-500 animate-pulse relative z-10" />
           </div>
           <div className="space-y-6">
             <h2 className="text-6xl font-cursive text-yellow-400 drop-shadow-2xl">Săn Long Đoạt Lộc</h2>
             <p className="text-red-100 max-w-lg italic text-xl opacity-80 leading-relaxed mx-auto font-light">
               Khai hỏa súng thần, khuất phục chân long. <br/>
               Đạt 36 điểm để mở cánh cửa <span className="text-yellow-400 font-bold">"Vạn Phúc Lâm Môn"</span>.
             </p>
           </div>
           <button 
             onClick={() => { playSound('click'); setIsGameActive(true); }}
             className="relative group bg-gradient-to-b from-yellow-400 to-yellow-600 text-red-950 px-24 py-6 rounded-full font-black text-3xl shadow-[0_15px_60px_rgba(234,179,8,0.4)] hover:scale-105 transition-all border-b-8 border-yellow-700 active:border-b-0 active:translate-y-2"
           >
             KHAI HỎA ĐÓN XUÂN
           </button>
        </div>
      ) : isVictory ? (
        /* --- VAN PHUC LAM MON SPACE --- */
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fadeIn overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#4a0404] to-[#1a0101] animate-gradient-slow"></div>
          
          {/* Background Particles */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-float-slow" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }} />
            ))}
          </div>

          <div className={`relative w-full max-w-2xl bg-gradient-to-br from-[#5c0b0b] to-[#2d0505] rounded-[3.5rem] p-1 shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-4 ${isRare ? 'animate-rainbow-border' : 'border-yellow-600/50'} group`}>
            {/* The Breathing Glow Viền */}
            <div className={`absolute -inset-2 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 ${isRare ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' : 'bg-yellow-500'}`}></div>
            
            <div className="bg-[#4a0404] rounded-[3.2rem] p-12 lg:p-16 relative overflow-hidden border border-white/5">
              
              {/* Calligraphy Title */}
              <div className="mb-10 relative">
                <h2 className="text-7xl lg:text-9xl font-cursive text-yellow-400 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-calligraphy leading-none">
                  Vạn Phúc Lâm Môn
                </h2>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-yellow-600"></div>
                  <span className="text-yellow-500/80 font-black tracking-[0.5em] text-xs uppercase">Xuân Bính Ngọ 2026</span>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-yellow-600"></div>
                </div>
              </div>

              {/* Wish Content */}
              <div className="min-h-[140px] flex flex-col items-center justify-center">
                <p className="text-2xl lg:text-3xl text-yellow-50/90 font-medium leading-relaxed italic animate-text-stream">
                   "{currentWish}"
                </p>
              </div>

              {/* Interaction Area */}
              <div className="mt-12 space-y-8">
                {!isBlessingReceived ? (
                  <button 
                    onClick={handleNhanPhuc}
                    className="relative px-16 py-5 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-full font-black text-2xl text-red-950 shadow-[0_0_50px_rgba(234,179,8,0.3)] hover:scale-110 active:scale-95 transition-all animate-pulse-slow"
                  >
                    NHẬN PHÚC ĐẦU NĂM
                  </button>
                ) : (
                  <div className="space-y-6 animate-page-entry">
                    <div className="flex justify-center gap-6">
                      <Trophy size={48} className="text-yellow-400 animate-bounce" />
                    </div>
                    <button 
                      onClick={resetGame}
                      className="text-red-300 hover:text-yellow-400 font-bold flex items-center gap-2 mx-auto uppercase tracking-widest text-sm transition-colors"
                    >
                      <RefreshCcw size={16} /> Quay lại du xuân
                    </button>
                  </div>
                )}
              </div>

              {/* Special Rare Tag */}
              {isRare && (
                <div className="absolute top-8 right-10 rotate-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
                   Phúc Kim Cương
                </div>
              )}
            </div>
          </div>

          {/* Fireworks & Nhan Phuc Animation Overlay */}
          {isBlessingReceived && (
            <div className="fixed inset-0 pointer-events-none z-[2000] flex items-center justify-center">
               <div className="absolute text-[25rem] font-black text-yellow-400/20 animate-wish-pop select-none">福</div>
               {[...Array(50)].map((_, i) => (
                 <div key={i} className="absolute w-2 h-2 rounded-full animate-firework-gold" style={{
                   left: '50%',
                   top: '50%',
                   backgroundColor: i % 2 === 0 ? '#facc15' : '#ffffff',
                   '--dx': `${(Math.random() - 0.5) * 800}px`,
                   '--dy': `${(Math.random() - 0.5) * 800}px`,
                   animationDelay: `${Math.random() * 0.5}s`
                 } as any} />
               ))}
            </div>
          )}
        </div>
      ) : (
        /* --- GAMEPLAY VIEW --- */
        <div 
          ref={gameContainerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={onMouseDown}
          className="relative w-full aspect-video bg-[#1a0505] rounded-[3.5rem] border-8 border-yellow-600/30 overflow-hidden shadow-2xl group cursor-none"
        >
          {/* Custom Reticle */}
          <div 
            className="absolute w-8 h-8 border-2 border-red-500 rounded-full pointer-events-none z-[100] transition-transform duration-75"
            style={{ left: mousePos.x, top: mousePos.y, transform: `translate(-50%, -50%) scale(${isRecoil ? 1.5 : 1})` }}
          >
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500/50"></div>
            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-red-500/50"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full m-auto absolute inset-0 shadow-[0_0_15px_red]"></div>
          </div>

          {/* Dragon Object */}
          <div 
            style={{ 
              left: `${dragonPos.x}%`, 
              top: `${dragonPos.y}%`, 
              transform: `translate(-50%, -50%) scale(${dragonScale})`,
              transition: `all ${Math.max(120, 800 - (score * 20))}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`
            }}
            className="absolute select-none z-20"
          >
            <div className="relative pointer-events-none">
              <div className="w-32 h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-800 rounded-full border-4 border-yellow-500 relative flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.8)] head-target pointer-events-auto group">
                 <div className="absolute -top-12 -left-12 w-24 h-1 bg-yellow-400/60 rounded-full rotate-[40deg] animate-pulse"></div>
                 <div className="absolute -top-12 -right-12 w-24 h-1 bg-yellow-400/60 rounded-full rotate-[-40deg] animate-pulse"></div>
                 <Target className="text-white/40 group-hover:text-white/100 group-hover:scale-110 transition-all drop-shadow-xl" size={60} />
              </div>
            </div>
          </div>

          {/* Cannon UI */}
          <div 
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-40 transition-transform duration-75 ${isRecoil ? '-translate-y-10' : ''}`}
            style={{ transform: `translateX(calc(-50% + ${(mousePos.x - (gameContainerRef.current?.offsetWidth || 0) / 2) * 0.15}px)) rotate(${(mousePos.x / (gameContainerRef.current?.offsetWidth || 1) - 0.5) * 20}deg)` }}
          >
            <svg width="240" height="200" viewBox="0 0 200 150" fill="none">
              <path d="M80 50 L120 50 L120 120 L80 120 Z" fill="#222" stroke="#CA8A04" strokeWidth="4" />
              <path d="M70 110 Q100 90 130 110 L140 140 L60 140 Z" fill="#111" stroke="#CA8A04" strokeWidth="2" />
              {isRecoil && <circle cx="100" cy="40" r="30" fill="rgba(255, 200, 0, 0.3)" className="animate-ping" />}
            </svg>
          </div>
        </div>
      )}

      <style>{`
        @keyframes calligraphy {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0 0 0); }
        }
        .animate-calligraphy { animation: calligraphy 2.5s ease-out forwards; }
        
        @keyframes rainbow-border {
          0% { border-color: #3b82f6; }
          33% { border-color: #a855f7; }
          66% { border-color: #ec4899; }
          100% { border-color: #3b82f6; }
        }
        .animate-rainbow-border { animation: rainbow-border 3s linear infinite; }

        @keyframes firework-gold {
          0% { transform: scale(1) translate(0, 0); opacity: 1; }
          100% { transform: scale(1) translate(var(--dx), var(--dy)); opacity: 0; }
        }
        .animate-firework-gold { animation: firework-gold 1.5s ease-out forwards; }

        @keyframes wish-pop {
          0% { transform: scale(0.5); opacity: 0; filter: blur(20px); }
          50% { opacity: 0.15; filter: blur(0); }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-wish-pop { animation: wish-pop 3s ease-out forwards; }
        
        @keyframes text-stream {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-text-stream { animation: text-stream 1.2s ease-out 2s both; }
        
        .animate-spin-slow { animation: spin 10s linear infinite; }
        .animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default DragonHuntSection;
