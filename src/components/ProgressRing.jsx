import { motion } from 'framer-motion';
import { useId } from 'react';

export default function ProgressRing({ percent = 0, size = 240, stroke = 14, children, className = '' }) {
  const gradId = useId().replace(/[:]/g, '');
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(271 92% 70%)" />
            <stop offset="100%" stopColor="hsl(320 86% 66%)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="hsl(0 0% 100% / 0.07)" strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={`url(#${gradId})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * clamped) / 100 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          style={{ filter: 'drop-shadow(0 0 10px hsl(275 88% 62% / 0.6))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}