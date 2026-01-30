
import React, { useState, useEffect } from 'react';

const TetCountdown: React.FC = () => {
  // Lunar New Year 2026 is Feb 17, 2026
  const targetDate = new Date('2026-02-17T00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2 lg:gap-4 justify-center text-white mb-8 px-2">
      {[
        { label: 'Ngày', val: timeLeft.days },
        { label: 'Giờ', val: timeLeft.hours },
        { label: 'Phút', val: timeLeft.minutes },
        { label: 'Giây', val: timeLeft.seconds }
      ].map((item, idx) => (
        <div key={idx} className="bg-red-900/50 backdrop-blur-md p-3 lg:p-4 rounded-xl border border-yellow-500/30 w-20 lg:w-24 text-center shadow-2xl">
          <div className="text-2xl lg:text-3xl font-bold text-yellow-400">{item.val}</div>
          <div className="text-[10px] lg:text-xs uppercase tracking-widest">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default TetCountdown;
