import React from 'react';
import { Navigation, Bell, Smartphone, Shield, LogOut, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertsCount: number;
  isSocketConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  isSocketConnected
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-dark-800 border-b border-dark-700 px-6 flex items-center justify-between z-30 relative">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
          <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
            <Navigation className="w-5 h-5 text-blue-400 transform -rotate-45" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-sans">
              Track<span className="text-blue-500">X</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              ENTERPRISE GPS
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {user?.organizationName || 'ABC Logistics Pvt Ltd'}
          </p>
        </div>
      </div>

      {/* Center Actions & System Telemetry Status */}
      <div className="flex items-center gap-4">
        {/* Real-time Socket Engine Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900 border border-dark-700 text-xs">
          <Radio className={`w-3.5 h-3.5 ${isSocketConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}`} />
          <span className="text-slate-300 font-medium">
            {isSocketConnected ? 'Live Stream Active' : 'Connecting Engine...'}
          </span>
        </div>

        {/* Tracker Phone Simulator Toggle Button */}
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'simulator'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-dark-700 hover:bg-dark-600 text-slate-200 border border-dark-600'
          }`}
        >
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Mobile Tracker Mode</span>
        </button>
      </div>

      {/* Right User Actions & Alert Bell */}
      <div className="flex items-center gap-3">
        {/* Alerts Bell */}
        <button
          onClick={() => setActiveTab('alerts')}
          className="relative p-2 rounded-lg bg-dark-900 border border-dark-700 text-slate-300 hover:text-white hover:bg-dark-700 transition"
          title="Notifications & Geofence Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-dark-700">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-slate-200 leading-tight">{user?.name || 'Admin'}</div>
            <div className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">{user?.role || 'ORG_ADMIN'}</div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 transition hover:bg-dark-700 rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
