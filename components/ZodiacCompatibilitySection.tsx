
import React, { useState } from 'react';
import { UserCheck, Star, Loader2, Sparkles } from 'lucide-react';
import { getZodiacCompatibility } from '../services/geminiService';

const ZodiacCompatibilitySection: React.FC = () => {
  const [year, setYear] = useState('1990');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const data = await getZodiacCompatibility(year);
      setResult(data);
    } catch (error) {
      alert("Lỗi khi xem tuổi. Thử lại sau nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="text-center">
        <h2 className="text-4xl font-cursive text-yellow-400 mb-2">Xem Tuổi Xông Đất 2026</h2>
        <p className="text-red-200">Tìm người hợp tuổi mang lại may mắn, tài lộc cho gia đình trong năm Bính Ngọ</p>
      </div>

      <div className="bg-red-900/30 p-8 rounded-3xl border border-yellow-600/20 backdrop-blur-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-yellow-400 mb-2">Năm sinh của gia chủ (Dương lịch)</label>
          <div className="flex gap-4">
            <input 
              type="number" 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="flex-1 bg-red-950 border border-yellow-600/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 outline-none text-xl font-bold text-center"
              placeholder="VD: 1990"
            />
            <button 
              onClick={handleCheck}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-800 px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : <UserCheck />}
              {loading ? "Đang xem..." : "Xem Kết Quả"}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white/10 rounded-2xl p-6 border border-yellow-500/20 relative overflow-hidden">
            <Sparkles className="absolute -top-2 -right-2 text-yellow-400 opacity-30" size={80} />
            <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Star size={20} className="fill-yellow-400" /> Phân tích từ AI
            </h3>
            <div className="text-red-50 leading-relaxed whitespace-pre-wrap text-lg italic">
              {result}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-red-300 italic">
              * Thông tin mang tính chất tham khảo dân gian, niềm tin vào một năm mới hạnh phúc là quan trọng nhất!
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-950/50 p-6 rounded-2xl border border-yellow-900/30">
          <h4 className="font-bold text-yellow-500 mb-2">Tuổi Bính Ngọ 2026</h4>
          <p className="text-sm text-red-100/70">Năm 2026 là năm con Ngựa (Hỏa), thích hợp với các tuổi thuộc bộ Tam Hợp: Dần - Ngọ - Tuất.</p>
        </div>
        <div className="bg-red-950/50 p-6 rounded-2xl border border-yellow-900/30">
          <h4 className="font-bold text-yellow-500 mb-2">Tiêu chí xông đất</h4>
          <p className="text-sm text-red-100/70">Nên chọn người có đạo đức tốt, tính tình vui vẻ, thành đạt và không có tang chế trong năm qua.</p>
        </div>
      </div>
    </div>
  );
};

export default ZodiacCompatibilitySection;
