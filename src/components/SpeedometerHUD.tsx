import React from 'react';
import { Gauge, Compass, Radio, ShieldCheck, Zap } from 'lucide-react';
import { Tracker } from '../types';

interface SpeedometerHUDProps {
  tracker: Tracker;
  onClose: () => void;
}

export const SpeedometerHUD: React.FC<SpeedometerHUDProps> = ({ tracker, onClose }) => {
  const speed = Math.round(tracker.lastSpeed || 0);
  const maxGaugeSpeed = 180;
  const speedRatio = Math.min(1, speed / maxGaugeSpeed);
  const strokeDashoffset = 283 - 283 * speedRatio * 0.75; // 270 degree arc

  // Compass directions
  const heading = tracker.lastHeading || 0;
  const getCompassDir = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(deg / 45) % 8;
    return dirs[idx];
  };

  return (
    <div className="absolute top-4 left-4 z-20 bg-dark-900/90 border border-cyan-500/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl w-64 space-y-3 animate-fadeIn text-slate-100">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-dark-700 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[10px] font-extrabold text-cyan-400 tracking-wider uppercase">COCKPIT SPEED HUD</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold">
          ✕
        </button>
      </div>

      {/* Circular Speedometer Gauge */}
      <div className="relative flex items-center justify-center py-1">
        <svg className="w-36 h-36 transform -rotate-135">
          {/* Background Arc */}
          <circle
            cx="72"
            cy="72"
            r="45"
            stroke="#1E293B"
            strokeWidth="8"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset="70"
            strokeLinecap="round"
          />
          {/* Glowing Speed Pointer Arc */}
          <circle
            cx="72"
            cy="72"
            r="45"
            stroke="url(#speedGradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Digital Speed Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-black font-sans text-white tracking-tighter drop-shadow-md">
            {speed}
          </div>
          <div className="text-[9px] font-extrabold text-cyan-400 tracking-widest uppercase">KM/H</div>
        </div>
      </div>

      {/* Grid Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-dark-950/80 p-2 rounded-xl border border-dark-700 flex items-center justify-between px-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>HEADING</span>
          </div>
          <span className="font-extrabold text-indigo-300 font-mono">
            {heading}° {getCompassDir(heading)}
          </span>
        </div>

        <div className="bg-dark-950/80 p-2 rounded-xl border border-dark-700 flex items-center justify-between px-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPS LOG</span>
          </div>
          <span className="font-extrabold text-cyan-300 font-mono">
            ±{tracker.lastAccuracy || 5}m
          </span>
        </div>
      </div>

      {/* Safety Score Indicator */}
      <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[10px]">
        <div className="flex items-center gap-1 text-emerald-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AI DRIVING RATING</span>
        </div>
        <span className="font-black text-emerald-300">96 / 100 (A+)</span>
      </div>

    </div>
  );
};
