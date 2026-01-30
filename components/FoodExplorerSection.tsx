
import React, { useState, useRef } from 'react';
import { Camera, Search, Loader2, Utensils, AlertCircle } from 'lucide-react';
import { analyzeTetFood } from '../services/geminiService';

const FoodExplorerSection: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const base64Data = image.split(',')[1];
      const data = await analyzeTetFood(base64Data);
      setResult(data);
    } catch (error) {
      setError("Không thể phân tích ảnh này. Hãy thử chụp ảnh rõ nét hơn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="text-center">
        <h2 className="text-4xl font-cursive text-yellow-400 mb-2">Mâm Cỗ Ngày Tết</h2>
        <p className="text-red-200">Chụp ảnh món ăn để khám phá ý nghĩa và tinh hoa ẩm thực Tết</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-200 max-w-md mx-auto">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video bg-red-950/50 border-2 border-dashed border-yellow-600/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-red-900/40 transition-all overflow-hidden relative group shadow-inner"
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt="Food" />
            ) : (
              <div className="text-center p-8">
                <Camera size={48} className="text-red-400 mb-4 mx-auto" />
                <p className="text-red-300 font-medium">Tải lên hoặc chụp ảnh món ăn</p>
                <p className="text-xs text-red-400 mt-2 italic">(Cần quyền truy cập Camera)</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              capture="environment"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-900 py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            {loading ? "Đang khám phá ẩm thực..." : "Tìm Hiểu Ý Nghĩa"}
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col min-h-[300px] shadow-2xl">
          <div className="flex items-center gap-2 text-yellow-400 mb-4 border-b border-white/10 pb-2">
            <Utensils size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Tinh Hoa Ẩm Thực</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px] text-red-50 text-lg leading-relaxed whitespace-pre-wrap custom-scrollbar pr-2">
            {result ? result : (
              <div className="h-full flex flex-col items-center justify-center text-red-300/50 italic text-center px-8">
                <Utensils size={32} className="opacity-20 mb-2" />
                Kết quả phân tích về ý nghĩa, nguồn gốc và cách chế biến sẽ xuất hiện tại đây.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodExplorerSection;
