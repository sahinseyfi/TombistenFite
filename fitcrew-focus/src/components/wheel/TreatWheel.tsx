import { motion } from 'framer-motion';
import { useState } from 'react';
import { TreatItem } from '@/types';

interface TreatWheelProps {
  items: TreatItem[];
  onSpinComplete: (item: TreatItem) => void;
  disabled?: boolean;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--primary-glow))',
  'hsl(var(--muted))',
  'hsl(var(--success))',
];

export default function TreatWheel({ items, onSpinComplete, disabled }: TreatWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    if (disabled || isSpinning || items.length < 3) return;

    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * items.length);
    const degreesPerSlice = 360 / items.length;
    const targetRotation = 360 * 5 + (360 - (randomIndex * degreesPerSlice + degreesPerSlice / 2));
    
    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinComplete(items[randomIndex]);
    }, 3000);
  };

  const degreesPerSlice = 360 / items.length;

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-primary drop-shadow-lg" />
      </div>

      {/* Wheel */}
      <motion.div
        className="relative w-full aspect-square rounded-full shadow-glow overflow-hidden"
        animate={{ rotate: rotation }}
        transition={{ duration: 3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {items.map((item, index) => {
            const startAngle = index * degreesPerSlice;
            const endAngle = (index + 1) * degreesPerSlice;
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const x1 = 50 + 50 * Math.cos(startRad);
            const y1 = 50 + 50 * Math.sin(startRad);
            const x2 = 50 + 50 * Math.cos(endRad);
            const y2 = 50 + 50 * Math.sin(endRad);

            const largeArcFlag = degreesPerSlice > 180 ? 1 : 0;

            return (
              <g key={item.id}>
                <path
                  d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(var(--background))"
                  strokeWidth="0.5"
                />
                <text
                  x="50"
                  y="50"
                  fill="hsl(var(--background))"
                  fontSize="4"
                  fontWeight="600"
                  textAnchor="middle"
                  transform={`rotate(${startAngle + degreesPerSlice / 2} 50 50) translate(0 -30)`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-background border-4 border-primary shadow-lg" />
        </div>
      </motion.div>

      {/* Spin Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSpin}
          disabled={disabled || isSpinning || items.length < 3}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-glow transition-all hover:scale-105 active:scale-95"
        >
          {isSpinning ? 'Dönüyor...' : 'ÇEVİR'}
        </button>
      </div>
    </div>
  );
}
