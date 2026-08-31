import React, { useEffect, useState } from 'react';
import { Download, BarChart2, PieChart, ShieldCheck, Gauge, Route, Users } from 'lucide-react';
import { FleetSummary, Tracker } from '../types';
import { apiRequest } from '../services/api';

interface ReportsViewProps {
  trackers: Tracker[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ trackers }) => {
  const [summary, setSummary] = useState<FleetSummary | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await apiRequest<FleetSummary>('/reports/summary');
        setSummary(data);
      } catch (err) {
        console.error('Failed to load fleet summary:', err);
      }
    }
    loadSummary();
  }, []);

  const exportCSV = () => {
    const headers = ['Tracker Code', 'Device Name', 'Platform', 'Status', 'Speed (km/h)', 'Battery (%)', 'Last Latitude', 'Last Longitude', 'Last Seen'];
    const rows = trackers.map(t => [
      t.trackerCode,
      `"${t.deviceName}"`,
      t.platform,
      t.trackingStatus,
      t.lastSpeed,
      t.batteryLevel,
      t.lastLatitude,
      t.lastLongitude,
      `"${t.lastSeen}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trackx_fleet_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full p-6 bg-dark-900 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Analytics & Fleet Reports</h1>
          <p className="text-xs text-slate-400">
            Export complete telemetry logs and review operational fleet performance indicators.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Telemetry Report</span>
        </button>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-800 border border-dark-700 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>TOTAL FLEET TRACKERS</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{summary?.totalTrackers || trackers.length}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">{summary?.onlineCount || 0} Online & Streaming</div>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>FLEET DISTANCE TODAY</span>
            <Route className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400">{summary?.fleetDistanceTodayKm || 0} <span className="text-base font-normal text-slate-300">km</span></div>
          <div className="text-[11px] text-slate-400">Cumulative GPS distance covered</div>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>MOVING ASSETS</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{summary?.movingCount || 0}</div>
          <div className="text-[11px] text-slate-400">Speed &gt; 5 km/h currently</div>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ACTIVE GEOFENCE ZONES</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{summary?.totalGeofences || 0}</div>
          <div className="text-[11px] text-slate-400">Continuous perimeter monitoring</div>
        </div>
      </div>

      {/* Fleet Telemetry Data Table */}
      <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-dark-700 font-bold text-sm text-white">
          Active Tracker Roster & Telemetry Logs
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-dark-700">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Device Name</th>
                <th className="p-3.5">Platform</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Speed</th>
                <th className="p-3.5">Battery</th>
                <th className="p-3.5">Coordinates</th>
                <th className="p-3.5">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/60">
              {trackers.map(t => (
                <tr key={t.id} className="hover:bg-dark-700/40 transition">
                  <td className="p-3.5 font-mono text-blue-400 font-bold">{t.trackerCode}</td>
                  <td className="p-3.5 font-semibold text-slate-100">{t.deviceName}</td>
                  <td className="p-3.5">{t.platform}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      t.trackingStatus === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' :
                      t.trackingStatus === 'IDLE' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {t.trackingStatus}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold">{Math.round(t.lastSpeed)} km/h</td>
                  <td className="p-3.5">{t.batteryLevel}%</td>
                  <td className="p-3.5 font-mono text-slate-400">{t.lastLatitude.toFixed(4)}, {t.lastLongitude.toFixed(4)}</td>
                  <td className="p-3.5 text-slate-400">{new Date(t.lastSeen).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
