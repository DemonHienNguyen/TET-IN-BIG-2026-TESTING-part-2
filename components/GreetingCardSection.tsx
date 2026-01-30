
import React, { useState } from 'react';
import { ImageIcon, Download, Loader2, Wand2 } from 'lucide-react';
import { generateTetGreetingCard } from '../services/geminiService';

const GreetingCardSection: React.FC = () => {
  const [desc, setDesc] = useState('Gia đình sum vầy bên nồi bánh chưng');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const url = await generateTetGreetingCard(desc);
      setImageUrl(url);
    } catch (error) {
      alert("Lỗi khi tạo hình ảnh. Hãy thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-4xl font-cursive text-yellow-400 mb-2">Sáng Tạo Thiệp Tết AI</h2>
        <p className="text-red-200">Biến ý tưởng của bạn thành những bức họa Tết rực rỡ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-red-900/30 p-6 rounded-2xl border border-yellow-600/20 space-y-6">
          <div>
            <label className="block text-sm font-medium text-yellow-400 mb-2">Mô tả thiệp của bạn</label>
            <textarea 
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="VD: Chú rồng vàng bay lượn giữa vườn hoa mai rực rỡ..."
              className="w-full bg-red-950 border border-yellow-600/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 outline-none resize-none"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-500 disabled:bg-pink-800 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
            {loading ? "Đang vẽ thiệp..." : "Tạo Thiệp Ngay"}
          </button>
          
          <div className="p-4 bg-yellow-500/10 rounded-lg text-xs text-yellow-200 leading-relaxed italic">
            Mẹo: Mô tả càng chi tiết (về màu sắc, bối cảnh, nhân vật), AI sẽ vẽ ra bức thiệp càng sát với ý tưởng của bạn!
          </div>
        </div>

        <div className="bg-red-950 rounded-2xl border-2 border-dashed border-yellow-600/30 aspect-square flex items-center justify-center relative group overflow-hidden">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="AI Generated" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <a 
                  href={imageUrl} 
                  download="tet-card.png"
                  className="bg-white text-red-900 p-3 rounded-full hover:bg-yellow-400 transition-colors"
                >
                  <Download size={24} />
                </a>
              </div>
            </>
          ) : (
            <div className="text-center text-red-400">
              <ImageIcon size={64} className="mx-auto mb-4 opacity-20" />
              <p>Hình ảnh sẽ xuất hiện tại đây</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GreetingCardSection;
