import React from 'react';
import {
  MapPin,
  History,
  Bell,
  BarChart3,
  Smartphone,
  Layers,
  Route,
  Cpu,
  X,
  Radio
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertsCount: number;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen
}) => {
  const menuItems = [
    { id: 'live', label: 'Live Fleet Tracking', icon: MapPin, badge: null },
    { id: 'trips', label: 'Automated Trips', icon: Route, badge: 'NEW' },
    { id: 'history', label: 'Route History & Replay', icon: History, badge: null },
    { id: 'geofence', label: 'Geofences & Zones', icon: Layers, badge: null },
    { id: 'alerts', label: 'Alerts & Breach Log', icon: Bell, badge: unreadAlertsCount > 0 ? unreadAlertsCount : null },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3, badge: null },
    { id: 'devices', label: 'Tracker Device Studio', icon: Cpu, badge: null },
    { id: 'simulator', label: 'Mobile Tracker Mode', icon: Smartphone, badge: 'PWA' }
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* 1. Desktop & Tablet Sidebar (≥768px) */}
      <aside className="hidden md:flex w-64 bg-dark-800 border-r border-dark-700 flex-col justify-between z-20 shrink-0 select-none">
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            FLEET MANAGEMENT
          </div>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      typeof item.badge === 'number'
                        ? 'bg-rose-500 text-white'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 m-3 rounded-xl bg-gradient-to-b from-dark-700/80 to-dark-900 border border-dark-700 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
            <span>GPS Hardware Mode</span>
            <span className="text-[10px] text-emerald-400 font-mono">PHONE GPS</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Phones collect high-frequency GPS vectors &amp; sync to PostGIS engine.
          </p>
          <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-full animate-pulse" />
          </div>
        </div>
      </aside>

      {/* 2. Mobile Slide-Over Drawer Overlay (<768px) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
          <div className="w-72 bg-dark-800 border-r border-dark-700 h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-dark-700 pb-3">
                <span className="font-extrabold text-white text-base">Fleet Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-dark-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'text-slate-300 hover:bg-dark-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-dark-900 text-cyan-400 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* 3. Mobile Bottom Touch Bar (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-800/95 backdrop-blur-md border-t border-dark-700 flex items-center justify-around py-2 px-1">
        {[
          { id: 'live', label: 'Live Map', icon: MapPin },
          { id: 'trips', label: 'Trips', icon: Route },
          { id: 'history', label: 'History', icon: History },
          { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlertsCount > 0 ? unreadAlertsCount : null },
          { id: 'simulator', label: 'Mobile App', icon: Smartphone }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 relative px-3 py-1 rounded-xl transition ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-none">{item.label}</span>
              {item.badge && (
                <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
