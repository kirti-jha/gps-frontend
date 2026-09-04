import React from 'react';
import { ShieldCheck, Zap, AlertCircle, Fuel, Award, Gauge } from 'lucide-react';
import { Tracker } from '../types';

interface DriverSafetyScoreProps {
  tracker: Tracker;
}

export const DriverSafetyScore: React.FC<DriverSafetyScoreProps> = ({ tracker }) => {
  const speed = Math.round(tracker.lastSpeed || 0);
  const safetyScore = speed > 80 ? 78 : speed > 50 ? 89 : 96;

  return (
    <div className="bg-dark-800/80 border border-dark-700 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-white">AI Driving & Eco Safety Analytics</h4>
            <p className="text-[10px] text-slate-400">Real-time driver rating & fuel metrics</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-black rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          Score: {safetyScore} / 100
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-dark-900/90 p-2 rounded-xl border border-dark-700">
          <div className="text-[9px] text-slate-400 font-bold">HARSH BRAKES</div>
          <div className="font-extrabold text-emerald-400">0 events</div>
        </div>
        <div className="bg-dark-900/90 p-2 rounded-xl border border-dark-700">
          <div className="text-[9px] text-slate-400 font-bold">OVERSPEED</div>
          <div className={`font-extrabold ${speed > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {speed > 80 ? '1 Breach' : '0 Breaches'}
          </div>
        </div>
        <div className="bg-dark-900/90 p-2 rounded-xl border border-dark-700">
          <div className="text-[9px] text-slate-400 font-bold">FUEL SAVED</div>
          <div className="font-extrabold text-cyan-400">~1.4 L</div>
        </div>
      </div>
    </div>
  );
};
