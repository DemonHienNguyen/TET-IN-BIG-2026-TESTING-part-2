
import React, { useState } from 'react';
import { Scroll, PenTool, Loader2, Copy } from 'lucide-react';
import { generateTetPoetry } from '../services/geminiService';

const PoetrySection: React.FC = () => {
  const [theme, setTheme] = useState('Gia đình và Sức khỏe');
  const [type, setType] = useState<'couplet' | 'poem'>('couplet');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const text = await generateTetPoetry(theme, type);
      setResult(text);
    } catch (error) {
      alert("Lỗi khi sáng tác. Thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-4xl font-cursive text-yellow-400 mb-2">Thơ Xuân & Câu Đối</h2>
        <p className="text-red-200">Sáng tác những vần thơ, câu đối đậm đà bản sắc dân tộc</p>
      </div>

      <div className="bg-red-900/30 p-6 rounded-2xl border border-yellow-600/20 space-y-4">
        <div className="flex gap-4">
          <button 
            onClick={() => setType('couplet')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'couplet' ? 'bg-yellow-600' : 'bg-red-950/50'}`}
          >
            Câu Đối
          </button>
          <button 
            onClick={() => setType('poem')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === 'poem' ? 'bg-yellow-600' : 'bg-red-950/50'}`}
          >
            Thơ Lục Bát
          </button>
        </div>

        <div>
          <label className="block text-sm text-yellow-400 mb-1">Chủ đề mong muốn</label>
          <input 
            type="text" 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="VD: Cha mẹ, công danh, bạn bè..."
            className="w-full bg-red-950 border border-yellow-600/30 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <PenTool size={20} />}
          {loading ? "Đang múa bút..." : "Sáng Tác Ngay"}
        </button>
      </div>

      {result && (
        <div className="relative group">
          <div className="bg-[#fefce8] text-red-900 p-12 rounded-lg shadow-2xl border-x-8 border-red-800 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-4 bg-red-900" />
            <div className="absolute bottom-0 inset-x-0 h-4 bg-red-900" />
            
            <h3 className="font-cursive text-3xl mb-6 text-red-800">Cung Chúc Tân Xuân</h3>
            <div className={`whitespace-pre-wrap text-2xl font-cursive leading-relaxed ${type === 'couplet' ? 'flex justify-center gap-12' : ''}`}>
              {type === 'couplet' ? (
                result.split('\n').map((line, i) => (
                  <div key={i} className="bg-red-600 text-yellow-300 p-4 rounded shadow-lg min-w-[120px] transform hover:scale-105 transition-transform">
                    {line.trim()}
                  </div>
                ))
              ) : (
                <p className="italic">"{result}"</p>
              )}
            </div>

            <button 
              onClick={() => { navigator.clipboard.writeText(result); alert("Đã sao chép!"); }}
              className="mt-8 text-sm flex items-center gap-1 mx-auto text-red-700 hover:underline"
            >
              <Copy size={14} /> Sao chép văn bản
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoetrySection;
