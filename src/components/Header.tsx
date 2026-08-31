import React from 'react';
import { Navigation, Bell, Smartphone, Radio, LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertsCount: number;
  isSocketConnected: boolean;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  onReturnToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  isSocketConnected,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
  onReturnToLanding
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-dark-800 border-b border-dark-700 px-3 sm:px-6 flex items-center justify-between z-30 relative shrink-0">
      {/* Left: Mobile Drawer Button & Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Drawer Button */}
        {setIsMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl bg-dark-900 border border-dark-700"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-2 cursor-pointer" onClick={onReturnToLanding}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 transform -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Track<span className="text-blue-500">X</span>
              </span>
              <span className="hidden xs:inline-block px-2 py-0.5 text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                GPS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden lg:block leading-none">
              {user?.organizationName || 'ABC Logistics Pvt Ltd'}
            </p>
          </div>
        </div>
      </div>

      {/* Center Stream Telemetry Status & Mobile Mode Toggle */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-dark-900 border border-dark-700 text-xs">
          <Radio className={`w-3.5 h-3.5 ${isSocketConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}`} />
          <span className="text-slate-300 font-medium">
            {isSocketConnected ? 'Live Active' : 'Connecting...'}
          </span>
        </div>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'simulator'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-dark-900 hover:bg-dark-700 text-slate-200 border border-dark-700'
          }`}
        >
          <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="hidden xs:inline">Mobile App</span>
        </button>
      </div>

      {/* Right: Alerts & Logout */}
      <div className="flex items-center gap-2">
        {onReturnToLanding && (
          <button
            onClick={onReturnToLanding}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-dark-900 border border-dark-700 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('alerts')}
          className="relative p-2 rounded-xl bg-dark-900 border border-dark-700 text-slate-300 hover:text-white"
          title="Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 rounded-xl bg-dark-900 border border-dark-700"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
