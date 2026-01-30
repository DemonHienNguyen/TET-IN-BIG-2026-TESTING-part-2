
import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, ExternalLink, Navigation } from 'lucide-react';
import { findFlowerMarkets } from '../services/geminiService';

const FlowerMapSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [result, setResult] = useState<{ text: string, grounding: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Trình duyệt của bạn không hỗ trợ định vị.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        handleSearch(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error(err);
        setError("Không thể lấy vị trí. Vui lòng cho phép truy cập GPS.");
        setLoading(false);
      }
    );
  };

  const handleSearch = async (lat: number, lng: number) => {
    try {
      const data = await findFlowerMarkets(lat, lng);
      setResult(data);
    } catch (err) {
      setError("Lỗi khi tìm kiếm địa điểm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="text-center">
        <h2 className="text-4xl font-cursive text-yellow-400 mb-2">Bản Đồ Chợ Hoa Xuân</h2>
        <p className="text-red-200">Tìm kiếm các chợ hoa và địa điểm du xuân rực rỡ gần bạn</p>
      </div>

      <div className="bg-red-900/30 p-8 rounded-3xl border border-yellow-600/20 backdrop-blur-md text-center">
        {!location ? (
          <div className="space-y-4">
            <MapPin size={48} className="mx-auto text-yellow-500 animate-bounce" />
            <p className="text-lg">Cho phép chúng tôi biết vị trí của bạn để tìm chợ hoa gần nhất!</p>
            <button 
              onClick={requestLocation}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-800 px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Navigation size={20} />}
              {loading ? "Đang xác định vị trí..." : "Tìm Chợ Hoa Quanh Đây"}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-2 text-yellow-400 font-bold border-b border-yellow-600/30 pb-2">
              <Search size={20} />
              <h3>Gợi ý địa điểm du xuân</h3>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="animate-spin text-yellow-500 mb-4" size={40} />
                <p>Đang tìm kiếm các vườn hoa và chợ Tết...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-red-50 leading-relaxed whitespace-pre-wrap italic">
                  {result?.text}
                </div>
                
                {result?.grounding && result.grounding.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
                      <ExternalLink size={16} /> Liên kết bản đồ & thông tin:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.grounding.map((chunk, i) => {
                        const mapsUri = chunk.maps?.uri;
                        const title = chunk.maps?.title || "Địa điểm trên Google Maps";
                        if (!mapsUri) return null;
                        return (
                          <a 
                            key={i} 
                            href={mapsUri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white/5 hover:bg-white/10 p-3 rounded-xl flex items-center justify-between group transition-colors border border-white/5"
                          >
                            <span className="truncate text-sm pr-2">{title}</span>
                            <Navigation size={14} className="text-yellow-500 group-hover:scale-125 transition-transform" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={requestLocation}
                  className="mt-4 text-xs text-red-300 hover:text-white underline"
                >
                  Cập nhật lại vị trí
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-yellow-500/10 p-6 rounded-2xl border border-yellow-500/20 text-sm italic text-yellow-200">
        Lưu ý: Thông tin dựa trên dữ liệu Google Maps thực tế. Hãy kiểm tra kỹ thời gian mở cửa của các chợ hoa địa phương.
      </div>
    </div>
  );
};

export default FlowerMapSection;
