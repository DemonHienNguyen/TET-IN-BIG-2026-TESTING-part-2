
import React, { useState, useEffect } from 'react';
import { Home, Sparkles, Image as ImageIcon, Gift, BookOpen, Menu, X, Phone, PenTool, Utensils, Map, Users, Target, Dices, HelpCircle, ChevronDown, Layout } from 'lucide-react';
import { Page } from './types';
import Petals from './components/Petals';
import TetCountdown from './components/TetCountdown';
import FortuneSection from './components/FortuneSection';
import GreetingCardSection from './components/GreetingCardSection';
import LuckyMoneySection from './components/LuckyMoneySection';
import TraditionSection from './components/TraditionSection';
import LiveCallSection from './components/LiveCallSection';
import PoetrySection from './components/PoetrySection';
import FoodExplorerSection from './components/FoodExplorerSection';
import FlowerMapSection from './components/FlowerMapSection';
import ZodiacCompatibilitySection from './components/ZodiacCompatibilitySection';
import DragonHuntSection from './components/DragonHuntSection';
import BauCuaSection from './components/BauCuaSection';
import TetQuizSection from './components/TetQuizSection';
import TetDecorateSection from './components/TetDecorateSection';
import { playSound } from './services/audioService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: Page) => {
    playSound('click');
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: Page.HOME, label: 'Trang Chủ', icon: Home, category: 'Chính' },
    { id: Page.DECORATE, label: 'Trang Trí', icon: Layout, category: 'Sáng Tạo' },
    { id: Page.BAU_CUA, label: 'Bầu Cua', icon: Dices, category: 'Trò Chơi' },
    { id: Page.DRAGON_HUNT, label: 'Săn Long', icon: Target, category: 'Trò Chơi' },
    { id: Page.LUCKY_MONEY, label: 'Hái Lộc', icon: Gift, category: 'Tương Tác' },
    { id: Page.VIRTUAL_CALL, label: 'Gọi AI', icon: Phone, category: 'Tương Tác' },
    { id: Page.QUIZ, label: 'Thử Thách', icon: HelpCircle, category: 'Khám Phá' },
    { id: Page.FORTUNE, label: 'Xin Quẻ', icon: Sparkles, category: 'Khám Phá' },
    { id: Page.ZODIAC, label: 'Xông Đất', icon: Users, category: 'Văn Hóa' },
    { id: Page.MAPS, label: 'Chợ Hoa', icon: Map, category: 'Văn Hóa' },
    { id: Page.POETRY, label: 'Thơ Xuân', icon: PenTool, category: 'Sáng Tạo' },
    { id: Page.CARDS, label: 'Thiệp AI', icon: ImageIcon, category: 'Sáng Tạo' },
    { id: Page.FOOD, label: 'Mâm Cỗ', icon: Utensils, category: 'Văn Hóa' },
  ];

  return (
    <div className="min-h-screen text-white relative bg-[#5a0b0b] selection:bg-yellow-500 selection:text-red-900">
      <Petals />

      {/* Modern Top Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'py-2 bg-red-950/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-yellow-600/30' : 'py-6 bg-transparent'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
          <button 
            onClick={() => handleNavClick(Page.HOME)}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)] group-hover:scale-110 transition-transform border-2 border-red-900">
              <span className="text-red-900 font-black text-xl">BN</span>
            </div>
            <div className="text-left">
              <h1 className="font-cursive text-2xl lg:text-3xl text-yellow-400 leading-none drop-shadow-md">Tết Bính Ngọ</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-red-200 opacity-70">Xuân Vạn Phúc 2026</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-5 py-2 rounded-full flex items-center gap-2 transition-all font-medium text-sm ${
                    currentPage === item.id 
                    ? 'bg-yellow-500 text-red-950 shadow-lg' 
                    : 'text-red-100 hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
            
            <div className="relative group ml-2">
              <button className="px-5 py-2 rounded-full flex items-center gap-2 text-red-100 hover:bg-white/10 transition-all font-medium text-sm">
                Khám Phá <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                <div className="bg-red-950 border border-yellow-600/30 rounded-2xl shadow-2xl p-4 w-64 grid grid-cols-1 gap-1">
                  {navItems.slice(6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-900 text-left text-sm transition-colors"
                    >
                      <item.icon size={16} className="text-yellow-500" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 bg-red-900/50 rounded-2xl border border-yellow-600/30 text-yellow-400"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[90] bg-red-950 transition-all duration-500 lg:hidden ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="pt-32 px-8 h-full overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${
                  currentPage === item.id 
                  ? 'bg-yellow-500 text-red-950 border-yellow-400' 
                  : 'bg-red-900/40 border-yellow-600/20 text-red-100'
                }`}
              >
                <item.icon size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="min-h-screen pt-32 lg:pt-40 pb-20 relative z-10">
        <div className={`mx-auto transition-all duration-700 ${
          currentPage === Page.LUCKY_MONEY || currentPage === Page.DRAGON_HUNT || currentPage === Page.DECORATE ? 'max-w-full px-0' : 'max-w-6xl px-6'
        }`}>
          {currentPage === Page.HOME && (
            <div className="text-center space-y-12 animate-fadeIn">
              <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-radial-gradient from-yellow-500/5 via-transparent to-transparent pointer-events-none -z-10" />
                <h1 className="text-6xl lg:text-[10rem] font-cursive text-yellow-400 mb-6 drop-shadow-2xl animate-title-float">
                  Cung Chúc Tân Xuân
                </h1>
                <p className="text-xl lg:text-3xl text-red-100 max-w-3xl mx-auto opacity-90 italic font-light tracking-wide">
                  Chào mừng bạn đến với không gian Tết Bính Ngọ 2026 rực rỡ sắc xuân
                </p>
              </div>

              <TetCountdown />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                <ModernCard 
                  title="Trang Trí Phòng" 
                  desc="Tạo không gian Tết riêng biệt của bạn." 
                  icon={<Layout />}
                  onClick={() => handleNavClick(Page.DECORATE)}
                  color="from-teal-600 to-teal-800"
                />
                <ModernCard 
                  title="Hái Lộc Đầu Xuân" 
                  desc="Xoay cây Đào tiên rước lộc về nhà." 
                  icon={<Gift />}
                  onClick={() => handleNavClick(Page.LUCKY_MONEY)}
                  color="from-pink-600 to-pink-800"
                />
                <ModernCard 
                  title="Săn Long Đoạt Lộc" 
                  desc="Thử thách phục rồng đón xuân Bính Ngọ." 
                  icon={<Target />}
                  onClick={() => handleNavClick(Page.DRAGON_HUNT)}
                  color="from-orange-600 to-orange-800"
                />
                <ModernCard 
                  title="Gọi Chúc Tết AI" 
                  desc="Trò chuyện chúc Tết cùng Ông Đồ AI." 
                  icon={<Phone />}
                  onClick={() => handleNavClick(Page.VIRTUAL_CALL)}
                  color="from-blue-600 to-blue-800"
                />
              </div>
            </div>
          )}

          <div className="animate-page-entry">
            {currentPage === Page.DECORATE && <TetDecorateSection />}
            {currentPage === Page.DRAGON_HUNT && <DragonHuntSection />}
            {currentPage === Page.BAU_CUA && <BauCuaSection />}
            {currentPage === Page.QUIZ && <TetQuizSection />}
            {currentPage === Page.VIRTUAL_CALL && <LiveCallSection />}
            {currentPage === Page.ZODIAC && <ZodiacCompatibilitySection />}
            {currentPage === Page.MAPS && <FlowerMapSection />}
            {currentPage === Page.FORTUNE && <FortuneSection />}
            {currentPage === Page.POETRY && <PoetrySection />}
            {currentPage === Page.FOOD && <FoodExplorerSection />}
            {currentPage === Page.CARDS && <GreetingCardSection />}
            {currentPage === Page.LUCKY_MONEY && <LuckyMoneySection />}
            {currentPage === Page.TRADITIONS && <TraditionSection />}
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-yellow-900/30 text-center bg-red-950/40 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-yellow-500 font-cursive text-3xl mb-4 italic">Bính Ngọ 2026 - Mã Đáo Thành Công</p>
          <p className="text-red-300 text-sm opacity-60">© 2026 Ứng dụng Tết Việt Cao Cấp - Trải nghiệm Xuân bằng AI</p>
        </div>
      </footer>
    </div>
  );
};

const ModernCard: React.FC<{title: string, desc: string, icon: React.ReactElement<any>, onClick: () => void, color: string}> = ({title, desc, icon, onClick, color}) => (
  <button 
    onClick={onClick}
    className={`group relative overflow-hidden p-8 rounded-[2.5rem] text-left transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-40 group-hover:opacity-60 transition-opacity`} />
    <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:text-yellow-400/20 transition-colors transform group-hover:scale-110 duration-500">
      {React.cloneElement(icon, { size: 100 })}
    </div>
    
    <div className="relative z-10">
      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20 group-hover:bg-yellow-500 group-hover:text-red-900 transition-all">
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-300 transition-colors">{title}</h3>
      <p className="text-sm text-red-100/70 leading-relaxed">{desc}</p>
    </div>
  </button>
);

export default App;
