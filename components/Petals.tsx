
import React, { useEffect, useState } from 'react';

const Petals: React.FC = () => {
  const [petals, setPetals] = useState<{ id: number; left: string; delay: string; duration: string; size: string; color: string }[]>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      delay: `${Math.random() * 10}s`,
      duration: `${10 + Math.random() * 15}s`,
      size: `${10 + Math.random() * 10}px`,
      color: Math.random() > 0.5 ? '#facc15' : '#f472b6' // Yellow for Mai, Pink for Dao
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {petals.map(p => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50% 0 50% 50%'
          }}
        />
      ))}
    </div>
  );
};

export default Petals;
