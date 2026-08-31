import React from 'react';
import { Bell, CheckCheck, Trash2, AlertTriangle, ShieldAlert, BatteryLow, Gauge } from 'lucide-react';
import { Alert } from '../types';
import { apiRequest } from '../services/api';

interface AlertsViewProps {
  alerts: Alert[];
  onRefresh: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, onRefresh }) => {
  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequest(`/alerts/${id}/read`, { method: 'PUT' });
      onRefresh();
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await apiRequest('/alerts/clear', { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      console.error('Failed to clear alerts:', err);
    }
  };

  return (
    <div className="w-full h-full p-6 bg-dark-900 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Alerts & Breach Log ({alerts.length})</h1>
          <p className="text-xs text-slate-400">
            Real-time notifications for geofence entry/exit, overspeeding, low battery, and offline status.
          </p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-dark-700 font-bold text-xs rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Alerts</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {alerts.map(alert => {
          const isGeofence = alert.type.startsWith('GEOFENCE');
          const isSpeed = alert.type === 'OVERSPEED';
          const isBattery = alert.type === 'LOW_BATTERY';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                !alert.isRead
                  ? 'bg-dark-800 border-blue-500/40 shadow-md'
                  : 'bg-dark-900/60 border-dark-700/60 opacity-80'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  isGeofence ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  isSpeed ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  isBattery ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {isGeofence && <ShieldAlert className="w-5 h-5" />}
                  {isSpeed && <Gauge className="w-5 h-5" />}
                  {isBattery && <BatteryLow className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{alert.trackerName}</span>
                    <span className="font-mono text-[10px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {alert.trackerCode}
                    </span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{alert.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!alert.isRead && (
                <button
                  onClick={() => handleMarkAsRead(alert.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-900 hover:bg-dark-700 border border-dark-700 text-xs font-semibold text-slate-300 rounded-xl transition"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-sm bg-dark-800/40 rounded-2xl border border-dark-700">
            No alerts logged. All fleet trackers operating within parameters.
          </div>
        )}
      </div>
    </div>
  );
};
