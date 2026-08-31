import React, { useState } from 'react';
import { Search, Filter, Battery, Gauge, Clock, ShieldCheck, Wifi, RefreshCw } from 'lucide-react';
import { LiveMap } from '../components/LiveMap';
import { Tracker, Geofence } from '../types';

interface LiveFleetViewProps {
  trackers: Tracker[];
  selectedTrackerId: string | null;
  setSelectedTrackerId: (id: string | null) => void;
  geofences: Geofence[];
  onRefresh: () => void;
}

export const LiveFleetView: React.FC<LiveFleetViewProps> = ({
  trackers,
  selectedTrackerId,
  setSelectedTrackerId,
  geofences,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'IDLE' | 'OFFLINE'>('ALL');

  const filteredTrackers = trackers.filter(t => {
    const matchesSearch = t.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.trackerCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.trackingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedTracker = trackers.find(t => t.id === selectedTrackerId);

  return (
    <div className="w-full h-full flex relative overflow-hidden">
      {/* Left Sidebar: Tracker Cards & Filter */}
      <div className="w-96 bg-dark-800 border-r border-dark-700 flex flex-col z-10 shrink-0">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-dark-700 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 font-sans">Fleet Assets ({filteredTrackers.length})</h2>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-dark-700 text-slate-400 hover:text-white transition"
              title="Refresh Fleet Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code or device name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-dark-900 p-1 rounded-xl border border-dark-700 text-xs">
            {(['ALL', 'ONLINE', 'IDLE', 'OFFLINE'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tracker List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTrackers.map(tracker => {
            const isSelected = tracker.id === selectedTrackerId;
            const statusColor =
              tracker.trackingStatus === 'ONLINE'
                ? 'bg-emerald-500'
                : tracker.trackingStatus === 'IDLE'
                ? 'bg-amber-500'
                : 'bg-slate-500';

            return (
              <div
                key={tracker.id}
                onClick={() => setSelectedTrackerId(tracker.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-md'
                    : 'bg-dark-900/60 border-dark-700/60 hover:bg-dark-700/40 hover:border-dark-600'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusColor} ${tracker.trackingStatus === 'ONLINE' ? 'animate-ping' : ''}`} />
                    <span className="font-semibold text-sm text-slate-100 leading-tight">{tracker.deviceName}</span>
                  </div>
                  <span className="font-mono text-[11px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                    {tracker.trackerCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                    <span>{Math.round(tracker.lastSpeed)} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Battery className={`w-3.5 h-3.5 ${tracker.batteryLevel < 20 ? 'text-rose-500' : 'text-emerald-400'}`} />
                    <span>{tracker.batteryLevel}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 border-t border-dark-700/50 pt-1.5">
                  <span>Platform: {tracker.platform}</span>
                  <span>Seen {new Date(tracker.lastSeen).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Area: Map + Floating Telemetry Card */}
      <div className="flex-1 relative h-full">
        <LiveMap
          trackers={filteredTrackers}
          selectedTrackerId={selectedTrackerId}
          onSelectTracker={setSelectedTrackerId}
          geofences={geofences}
        />

        {/* Selected Tracker Telemetry Floating Card */}
        {selectedTracker && (
          <div className="absolute bottom-6 left-6 z-20 w-80 glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div>
                <h3 className="font-bold text-sm text-white">{selectedTracker.deviceName}</h3>
                <span className="font-mono text-[11px] text-blue-400 font-semibold">{selectedTracker.trackerCode}</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                selectedTracker.trackingStatus === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                selectedTracker.trackingStatus === 'IDLE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {selectedTracker.trackingStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div className="bg-dark-900/80 p-2 rounded-xl border border-dark-700">
                <div className="text-[10px] text-slate-400">SPEED</div>
                <div className="font-extrabold text-sm text-blue-400">{Math.round(selectedTracker.lastSpeed)} <span className="text-[10px]">km/h</span></div>
              </div>
              <div className="bg-dark-900/80 p-2 rounded-xl border border-dark-700">
                <div className="text-[10px] text-slate-400">BATTERY</div>
                <div className={`font-extrabold text-sm ${selectedTracker.batteryLevel < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedTracker.batteryLevel}%
                </div>
              </div>
              <div className="bg-dark-900/80 p-2 rounded-xl border border-dark-700">
                <div className="text-[10px] text-slate-400">ACCURACY</div>
                <div className="font-extrabold text-sm text-cyan-400">±{selectedTracker.lastAccuracy}m</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 bg-dark-900/40 p-2.5 rounded-xl">
              <div className="flex justify-between">
                <span>Latitude / Longitude:</span>
                <span className="font-mono text-slate-200">{selectedTracker.lastLatitude.toFixed(4)}, {selectedTracker.lastLongitude.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Heading Vector:</span>
                <span className="font-mono text-slate-200">{selectedTracker.lastHeading}°</span>
              </div>
              <div className="flex justify-between">
                <span>Last GPS Signal:</span>
                <span className="text-slate-200">{new Date(selectedTracker.lastSeen).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
