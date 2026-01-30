import React, { useState } from 'react';
import { Dices, Coins, RotateCw, Trophy } from 'lucide-react';
import { playSound } from '../services/audioService';

const ITEMS = [
  { id: 'bau', label: 'Bầu', icon: '🍐' },
  { id: 'cua', label: 'Cua', icon: '🦀' },
  { id: 'tom', label: 'Tôm', icon: '🦐' },
  { id: 'ca', label: 'Cá', icon: '🐟' },
  { id: 'ga', label: 'Gà', icon: '🐔' },
  { id: 'nai', label: 'Nai', icon: '🦌' },
];

const BauCuaSection: React.FC = () => {
  const [balance, setBalance] = useState(1000);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [rolling, setRolling] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const placeBet = (id: string) => {
    if (balance >= 100 && !rolling) {
      setBalance(prev => prev - 100);
      setBets(prev => ({ ...prev, [id]: (prev[id] || 0) + 100 }));
      playSound('click');
    }
  };

  const roll = () => {
    if (Object.keys(bets).length === 0 || rolling) return;
    
    setRolling(true);
    setLastWin(null);
    playSound('rustle');

    setTimeout(() => {
      const newResults = Array.from({ length: 3 }).map(() => 
        ITEMS[Math.floor(Math.random() * ITEMS.length)].id
      );
      
      let totalWin = 0;
      Object.entries(bets).forEach(([id, amount]) => {
        const matches = newResults.filter(r => r === id).length;
        if (matches > 0) {
          totalWin += amount + (amount * matches);
        }
      });

      setResults(newResults);
      setBalance(prev => prev + totalWin);
      setLastWin(totalWin);
      setBets({});
      setRolling(false);
      
      if (totalWin > 0) playSound('victory');
      else playSound('miss');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="text-center">
        <h2 className="text-4xl font-cursive text-yellow-400 mb-2">Bầu Cua Tôm Cá</h2>
        <p className="text-red-200">Trò chơi dân gian may mắn ngày Tết</p>
      </div>

      <div className="flex justify-between items-center bg-red-950/50 p-6 rounded-2xl border border-yellow-600/30">
        <div className="flex items-center gap-3">
          <Coins className="text-yellow-400" />
          <span className="text-2xl font-bold text-yellow-400">{balance.toLocaleString()} Lộc</span>
        </div>
        {lastWin !== null && (
          <div className={`text-xl font-bold ${lastWin > 0 ? 'text-green-400 animate-bounce' : 'text-red-400'}`}>
            {lastWin > 0 ? `+${lastWin.toLocaleString()} Lộc!` : 'Trắng tay rồi!'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => placeBet(item.id)}
            disabled={rolling}
            className={`bg-red-900/40 p-6 rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2 ${
              bets[item.id] ? 'border-yellow-400 shadow-lg shadow-yellow-900/50' : 'border-white/10'
            }`}
          >
            <span className="text-6xl">{item.icon}</span>
            <span className="font-bold text-xl text-yellow-100">{item.label}</span>
            {bets[item.id] > 0 && (
              <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                {bets[item.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-4 h-32 items-center">
          {rolling ? (
            <div className="flex gap-4 animate-bounce">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-xl">🎲</div>
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-xl">🎲</div>
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-xl">🎲</div>
            </div>
          ) : results.length > 0 ? (
            results.map((r, i) => (
              <div key={i} className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-5xl shadow-2xl border-4 border-yellow-500 animate-slideUp">
                {ITEMS.find(item => item.id === r)?.icon}
              </div>
            ))
          ) : (
            <div className="text-red-300 italic opacity-50">Đặt cược và bấm Mở để xem kết quả</div>
          )}
        </div>

        <button
          onClick={roll}
          disabled={rolling || Object.keys(bets).length === 0}
          className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-red-900/50 px-12 py-4 rounded-full font-black text-2xl shadow-xl transition-all flex items-center gap-3 active:scale-95"
        >
          {rolling ? <RotateCw className="animate-spin" /> : <Dices />}
          {rolling ? 'ĐANG MỞ...' : 'MỞ BÁT'}
        </button>
      </div>
    </div>
  );
};

export default BauCuaSection;
