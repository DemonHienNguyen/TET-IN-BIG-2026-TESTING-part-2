
import React from 'react';

const TraditionSection: React.FC = () => {
  const traditions = [
    { 
      title: "Cúng Ông Công Ông Táo", 
      date: "23 tháng Chạp", 
      desc: "Tiễn vị thần bếp về trời báo cáo tình hình gia đình trong năm qua. Thường có tục thả cá chép.",
      img: "https://picsum.photos/400/250?random=1"
    },
    { 
      title: "Gói Bánh Chưng, Bánh Tét", 
      date: "27-29 Tết", 
      desc: "Nét văn hóa đặc sắc với gạo nếp, đỗ xanh, thịt mỡ gói trong lá dong/lá chuối, tượng trưng cho Đất và Trời.",
      img: "https://picsum.photos/400/250?random=2"
    },
    { 
      title: "Lễ Tất Niên", 
      date: "Chiều 30 Tết", 
      desc: "Bữa cơm đoàn viên cuối năm để con cháu tề tựu, báo hiếu tổ tiên và tổng kết một năm đã qua.",
      img: "https://picsum.photos/400/250?random=3"
    },
    { 
      title: "Xông Đất Đầu Năm", 
      date: "Sáng Mùng 1", 
      desc: "Người khách đầu tiên đến nhà sau giao thừa được tin là mang lại vận may cho cả gia đình trong năm mới.",
      img: "https://picsum.photos/400/250?random=4"
    }
  ];

  return (
    <div className="space-y-12 animate-fadeIn pb-12">
      <div className="text-center">
        <h2 className="text-4xl font-cursive text-yellow-400 mb-2">Phong Tục Tết Việt</h2>
        <p className="text-red-200">Gìn giữ nét đẹp văn hóa truyền thống ngàn đời</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {traditions.map((item, idx) => (
          <div key={idx} className="bg-red-900/20 rounded-3xl overflow-hidden border border-yellow-600/20 hover:border-yellow-600/50 transition-all flex flex-col group">
            <img src={item.img} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-yellow-400 font-cursive">{item.title}</h3>
                <span className="text-xs bg-red-700 px-3 py-1 rounded-full">{item.date}</span>
              </div>
              <p className="text-red-100/80 leading-relaxed italic">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-yellow-600/10 p-8 rounded-3xl border border-yellow-600/30 text-center">
        <h4 className="text-xl font-bold text-yellow-400 mb-4">Bạn có biết?</h4>
        <p className="max-w-2xl mx-auto text-red-100 italic">
          "Tết" là từ Hán Việt, đọc chệch từ chữ "Tiết", có nghĩa là thời khắc giao mùa. Tết Nguyên Đán đánh dấu sự bắt đầu của một chu kỳ canh tác mới và hy vọng về một cuộc sống ấm no hơn.
        </p>
      </div>
    </div>
  );
};

export default TraditionSection;
