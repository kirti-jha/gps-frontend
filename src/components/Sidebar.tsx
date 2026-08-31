import React from 'react';
import {
  MapPin,
  History,
  ShieldAlert,
  Bell,
  BarChart3,
  Smartphone,
  Layers,
  Route,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, unreadAlertsCount }) => {
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

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col justify-between z-20 shrink-0 select-none">
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
              onClick={() => setActiveTab(item.id)}
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

      {/* Fleet System Status Footer Card */}
      <div className="p-4 m-3 rounded-xl bg-gradient-to-b from-dark-700/80 to-dark-900 border border-dark-700 text-xs">
        <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
          <span>GPS Hardware Mode</span>
          <span className="text-[10px] text-emerald-400 font-mono">PHONE GPS</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Phones collect high-frequency GPS vectors & sync to PostGIS engine.
        </p>
        <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-full animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
