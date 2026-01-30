
import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, ArrowRight, RefreshCcw, BookOpen } from 'lucide-react';
import { playSound } from '../services/audioService';

interface Question {
  q: string;
  options: string[];
  correct: number;
  fact: string;
}

const QUESTIONS_POOL: Question[] = [
  { q: "Trong phong tục Việt Nam, lễ cúng Ông Công Ông Táo diễn ra vào ngày nào?", options: ["20 tháng Chạp", "23 tháng Chạp", "30 Tết", "Mùng 1 Tết"], correct: 1, fact: "Cá chép là phương tiện để các vị thần bếp về trời." },
  { q: "Bánh chưng hình vuông tượng trưng cho điều gì trong quan niệm xưa?", options: ["Đất", "Trời", "Mặt trời", "Mặt trăng"], correct: 0, fact: "Bánh chưng tượng trưng cho Đất (vuông), bánh giầy tượng trưng cho Trời (tròn)." },
  { q: "Năm 2026 là năm con gì?", options: ["Thìn (Rồng)", "Tỵ (Rắn)", "Ngọ (Ngựa)", "Mùi (Dê)"], correct: 2, fact: "Năm 2026 là năm Bính Ngọ." },
  { q: "Tục lệ 'xông đất' có ý nghĩa quan trọng nhất vào thời điểm nào?", options: ["Đêm Giao thừa", "Sáng Mùng 1", "Chiều Mùng 2", "Ngày Hóa vàng"], correct: 1, fact: "Người đầu tiên đến nhà đầu năm được tin là mang lại vận may cho cả năm." },
  { q: "Loại hoa nào thường được dùng trang trí Tết ở miền Nam Việt Nam?", options: ["Hoa Đào", "Hoa Mai", "Hoa Cúc", "Hoa Lan"], correct: 1, fact: "Hoa Mai vàng tượng trưng cho sự phú quý, hy vọng." },
  { q: "Loại hoa nào thường được dùng trang trí Tết ở miền Bắc Việt Nam?", options: ["Hoa Mai", "Hoa Đào", "Hoa Súng", "Hoa Sen"], correct: 1, fact: "Hoa Đào được coi là tinh hoa của ngũ hành, xua đuổi bách quỷ." },
  { q: "Món ăn nào không thể thiếu trong mâm cỗ Tết miền Bắc?", options: ["Bánh Tét", "Bánh Chưng", "Canh khổ qua", "Thịt kho hột vịt"], correct: 1, fact: "Bánh Chưng xanh gắn liền với sự tích Lang Liêu." },
  { q: "Món ăn nào đặc trưng trong dịp Tết của miền Nam?", options: ["Bánh Chưng", "Thịt kho hột vịt", "Dưa hành", "Giò xào"], correct: 1, fact: "Thịt kho hột vịt (thịt kho tàu) thể hiện sự sum vầy, màu sắc ấm cúng." },
  { q: "Quả nào thường có trong mâm ngũ quả miền Nam với ý nghĩa 'cầu vừa đủ xài'?", options: ["Mãng cầu, Dừa, Đu đủ, Xoài", "Chuối, Bưởi, Quất, Lựu", "Cam, Quýt, Lê, Táo", "Dưa hấu, Sung, Nho"], correct: 0, fact: "Tên các loại quả ghép lại thành lời cầu chúc: Cầu - Dừa - Đủ - Xài (Xoài)." },
  { q: "Phong tục 'Hóa vàng' thường được thực hiện vào lúc nào?", options: ["Trước Giao thừa", "Sáng mùng 1", "Khi kết thúc Tết (thường mùng 3-5)", "Ngày rằm tháng Giêng"], correct: 2, fact: "Lễ hóa vàng là để tiễn đưa ông bà, tổ tiên về trời sau những ngày vui Tết cùng con cháu." },
  { q: "Trái cây nào tượng trưng cho sự sung túc, thường có trong mâm ngũ quả miền Bắc?", options: ["Dừa", "Bưởi", "Chuối", "Cả Bưởi và Chuối"], correct: 3, fact: "Nải chuối như bàn tay che chở, bưởi tượng trưng cho sự viên mãn." },
  { q: "Theo quan niệm dân gian, quét nhà vào ngày mùng 1 Tết sẽ dẫn đến điều gì?", options: ["Mang lại may mắn", "Quét hết tài lộc ra khỏi nhà", "Giúp nhà cửa sạch sẽ", "Xua đuổi vận đen"], correct: 1, fact: "Người Việt kiêng quét nhà mùng 1 để tránh 'quét' đi lộc lá cả năm." },
  { q: "Tên của vị thần bảo vệ gia đình trong văn hóa Việt Nam là?", options: ["Thần Tài", "Thổ Địa", "Táo Quân", "Cả 3 phương án trên"], correct: 3, fact: "Mỗi vị thần đều có vai trò riêng trong việc giữ gìn gia đạo và tài lộc." },
  { q: "Chữ nào thường được dán trên cửa nhà vào dịp Tết để cầu mong may mắn?", options: ["Chữ Tâm", "Chữ Phúc", "Chữ Lộc", "Chữ Thọ"], correct: 1, fact: "Chữ Phúc tượng trưng cho sự may mắn, hạnh phúc viên mãn." },
  { q: "Trong 12 con giáp, con vật nào đứng đầu?", options: ["Con Trâu", "Con Hổ", "Con Chuột", "Con Rồng"], correct: 2, fact: "Tý (Chuột) là con vật khởi đầu cho chu kỳ 12 con giáp." },
  { q: "Thịt mỡ, dưa hành, câu đối đỏ / Cây nêu, tràng pháo, ... xanh. Từ còn thiếu là gì?", options: ["Bánh Tét", "Bánh Chưng", "Lá dong", "Cây quất"], correct: 1, fact: "Đây là câu đối kinh điển mô tả trọn vẹn hương vị Tết xưa." },
  { q: "Giao thừa là thời khắc chuyển giao giữa?", options: ["Ngày mùng 1 và mùng 2", "Tháng 12 và tháng 1", "Năm cũ và năm mới", "Sáng và tối"], correct: 2, fact: "Giao thừa là thời điểm thiêng liêng nhất trong năm." },
  { q: "Người Việt thường đi lễ đâu vào đầu năm mới để cầu bình an?", options: ["Đi xem phim", "Đi siêu thị", "Đi Chùa/Đền", "Đi công viên"], correct: 2, fact: "Đi lễ chùa đầu năm là nét đẹp văn hóa tâm linh của người Việt." },
  { q: "Lì xì thường được đựng trong phong bao màu gì để tượng trưng cho may mắn?", options: ["Màu Xanh", "Màu Vàng", "Màu Đỏ", "Màu Trắng"], correct: 2, fact: "Màu đỏ tượng trưng cho sự rực rỡ, may mắn và xua đuổi điều xấu." },
  { q: "Tục lệ 'Khai bút' đầu xuân thường dành cho ai?", options: ["Học sinh, sinh viên, người làm nghề chữ nghĩa", "Nông dân", "Công nhân", "Thương nhân"], correct: 0, fact: "Khai bút để cầu mong một năm học hành, làm việc hanh thông, trí tuệ." },
  { q: "Bánh Tét là đặc sản của vùng miền nào?", options: ["Miền Bắc", "Miền Trung và Miền Nam", "Miền Tây Nguyên", "Miền núi phía Bắc"], correct: 1, fact: "Bánh Tét có hình trụ dài, tương tự như ý nghĩa của Bánh Chưng nhưng cách gói khác nhau." },
  { q: "Vào ngày Tết, trẻ em thường mong đợi điều gì nhất?", options: ["Được đi học", "Được ăn bánh chưng", "Được nhận lì xì", "Được ngủ nướng"], correct: 2, fact: "Tiền lì xì (tiền mừng tuổi) là niềm vui lớn của trẻ nhỏ." },
  { q: "Ngày mùng 1 Tết thường được ưu tiên để thăm hỏi ai?", options: ["Bạn bè", "Thầy cô", "Họ hàng bên nội", "Đồng nghiệp"], correct: 2, fact: "Mùng 1 Tết cha, mùng 2 Tết mẹ, mùng 3 Tết thầy." },
  { q: "Cây nêu ngày Tết thường được dựng lên vào ngày nào?", options: ["23 tháng Chạp", "25 tháng Chạp", "30 Tết", "Mùng 1 Tết"], correct: 0, fact: "Cây nêu được dựng để ngăn quỷ dữ vào nhà trong thời gian các thần về trời." },
  { q: "Con vật nào là biểu tượng của năm 2026?", options: ["Con Rắn", "Con Ngựa", "Con Khỉ", "Con Dê"], correct: 1, fact: "Năm 2026 là năm Bính Ngọ (Ngựa)." },
];

const TetQuizSection: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hàm xáo trộn mảng và lấy 10 câu
  const initializeQuiz = () => {
    const shuffled = [...QUESTIONS_POOL].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
    setIsInitialized(true);
  };

  useEffect(() => {
    initializeQuiz();
  }, []);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct) {
      setScore(prev => prev + 1);
      playSound('hit');
    } else {
      playSound('miss');
    }
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent(prev => prev + 1);
      setSelected(null);
    } else {
      setShowResult(true);
      playSound('victory');
    }
  };

  if (!isInitialized || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-yellow-500">
         <RefreshCcw className="animate-spin mb-4" size={48} />
         <p className="font-bold animate-pulse">ĐANG CHUẨN BỊ THỬ THÁCH...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-12 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-4xl lg:text-5xl font-cursive text-yellow-400 drop-shadow-lg">Thử Thách Sĩ Tử</h2>
        <p className="text-red-200 opacity-80 italic">Vượt qua 10 câu hỏi ngẫu nhiên để chứng minh bạn là "Bậc thầy Tết Việt"</p>
      </div>

      {!showResult ? (
        <div className="relative group">
          {/* Progress Bar */}
          <div className="absolute -top-4 inset-x-0 h-1.5 bg-red-950 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="bg-red-950/60 backdrop-blur-xl p-8 lg:p-12 rounded-[3rem] border border-yellow-600/30 shadow-2xl space-y-8 relative">
            <div className="flex justify-between items-center text-xs font-black text-yellow-500/80 tracking-widest uppercase">
              <span className="flex items-center gap-2">
                <BookOpen size={14} /> CÂU HỎI {current + 1} / {questions.length}
              </span>
              <span className="bg-red-900/50 px-3 py-1 rounded-full border border-yellow-500/20">
                ĐIỂM: {score}
              </span>
            </div>
            
            <h3 className="text-2xl lg:text-3xl font-bold leading-tight text-white drop-shadow-sm min-h-[80px]">
              {questions[current].q}
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {questions[current].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`group p-5 lg:p-6 rounded-2xl text-left font-bold transition-all border-2 flex justify-between items-center relative overflow-hidden ${
                    selected === null 
                      ? 'bg-red-900/20 border-white/10 hover:bg-red-800/40 hover:border-yellow-500/50 active:scale-[0.98]' 
                      : idx === questions[current].correct 
                        ? 'bg-green-600/30 border-green-500 text-green-100'
                        : selected === idx ? 'bg-red-600/30 border-red-500 text-red-100' : 'bg-red-950/20 border-white/5 opacity-40'
                  }`}
                >
                  <span className="relative z-10">{opt}</span>
                  <div className="relative z-10">
                    {selected !== null && idx === questions[current].correct && <CheckCircle2 className="text-green-400" size={24} />}
                    {selected === idx && idx !== questions[current].correct && <XCircle className="text-red-400" size={24} />}
                  </div>
                  {/* Hover effect background */}
                  {selected === null && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
                </button>
              ))}
            </div>

            {selected !== null && (
              <div className="animate-slideUp space-y-6 pt-4">
                <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl italic text-yellow-200 text-sm leading-relaxed shadow-inner">
                  <strong className="text-yellow-400 not-italic uppercase tracking-tighter mr-2">Kiến thức:</strong> 
                  {questions[current].fact}
                </div>
                <button
                  onClick={nextQuestion}
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:brightness-110 py-5 rounded-2xl font-black text-red-950 flex justify-center items-center gap-3 shadow-xl active:scale-95 transition-all"
                >
                  {current < questions.length - 1 ? 'TIẾP THEO' : 'XEM KẾT QUẢ'}
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-red-950/80 backdrop-blur-2xl p-12 lg:p-16 rounded-[4rem] border-4 border-yellow-600 text-center space-y-10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
          
          <Award className="mx-auto text-yellow-400 animate-bounce" size={120} />
          
          <div className="space-y-4 relative z-10">
            <h3 className="text-6xl font-cursive text-yellow-400">Kết Quả Khai Xuân</h3>
            <div className="flex items-center justify-center gap-4">
               <div className="h-0.5 w-12 bg-yellow-600/50" />
               <p className="text-3xl font-black">
                 Bạn đúng <span className="text-yellow-400 text-5xl">{score}</span> / {questions.length}
               </p>
               <div className="h-0.5 w-12 bg-yellow-600/50" />
            </div>
          </div>
          
          <p className="text-red-100/70 italic text-xl max-w-lg mx-auto leading-relaxed">
            {score === questions.length 
              ? "Trạng Nguyên đắc đạo! Bạn có kiến thức cực kỳ sâu rộng về phong tục Tết Việt." 
              : score >= 7 
              ? "Rất ấn tượng! Bạn đã am hiểu hầu hết các nét đẹp truyền thống dân tộc."
              : "Khởi đầu khá tốt! Hãy tiếp tục khám phá thêm nhiều điều thú vị về Tết nhé."}
          </p>
          
          <button
            onClick={initializeQuiz}
            className="group bg-yellow-500 hover:bg-yellow-400 text-red-950 px-16 py-5 rounded-full font-black text-2xl shadow-2xl transition-all active:scale-90 flex items-center gap-3 mx-auto"
          >
            <RefreshCcw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            THỬ THÁCH MỚI
          </button>
        </div>
      )}
    </div>
  );
};

export default TetQuizSection;
