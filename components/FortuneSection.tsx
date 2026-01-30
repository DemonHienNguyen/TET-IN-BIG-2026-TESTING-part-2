
import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { getFortune } from '../services/geminiService';
import { FortuneResult } from '../types';

const FortuneSection: React.FC = () => {
  const [year, setYear] = useState('2000');
  const [topic, setTopic] = useState('Công danh, sự nghiệp');
  const [loading, setLoading] = useState(false);
  const [result, setFortuneResult] = useState<FortuneResult | null>(null);

  const handleConsult = async () => {
    setLoading(true);
    try {
      const data = await getFortune(year, topic);
      setFortuneResult(data);
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra khi xin quẻ. Hãy thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-4xl font-cursive text-yellow-400 mb-2">Xin Quẻ Đầu Năm</h2>
        <p className="text-red-200">Tìm hiểu vận may của bạn trong năm Bính Ngọ 2026 thông qua AI</p>
      </div>

      <div className="bg-red-900/30 p-6 rounded-2xl border border-yellow-600/20 backdrop-blur-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-1">Năm sinh của bạn</label>
          <input 
            type="number" 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
            className="w-full bg-red-950 border border-yellow-600/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-1">Vấn đề muốn hỏi</label>
          <select 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-red-950 border border-yellow-600/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none"
          >
            <option>Công danh, sự nghiệp</option>
            <option>Tình duyên, gia đạo</option>
            <option>Sức khỏe, bình an</option>
            <option>Tài lộc, làm ăn</option>
          </select>
        </div>
        <button 
          onClick={handleConsult}
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-800 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {loading ? "Đang giải quẻ..." : "Gieo Quẻ Ngay"}
        </button>
      </div>

      {result && (
        <div className="bg-white text-red-900 p-8 rounded-3xl shadow-2xl border-4 border-yellow-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 rounded-bl-xl font-bold text-sm">
            {result.luckLevel}
          </div>
          <h3 className="text-2xl font-bold mb-4 text-center border-b border-red-200 pb-2">{result.title}</h3>
          <div className="whitespace-pre-wrap leading-relaxed text-lg italic text-red-800">
            "{result.content}"
          </div>
          <div className="mt-6 text-center text-sm text-red-600 font-medium">
            * Nội dung chỉ mang tính chất tham khảo vui vẻ ngày Tết.
          </div>
        </div>
      )}
    </div>
  );
};

export default FortuneSection;
