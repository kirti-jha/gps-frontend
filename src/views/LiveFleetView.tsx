import { WaysToReachModal } from '../components/WaysToReachModal';
import { RouteOption } from '../utils/waysToReach';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Gauge, Battery, RefreshCw, ChevronDown, List, Navigation,
  MapPin, Route, X, Loader2, Wifi, WifiOff, ChevronRight
} from 'lucide-react';
import { LiveMap } from '../components/LiveMap';
import { Tracker, Geofence } from '../types';
import { fetchShortestRoute } from '../services/api';

interface LiveFleetViewProps {
  trackers: Tracker[];
  selectedTrackerId: string | null;
  setSelectedTrackerId: (id: string | null) => void;
  geofences: Geofence[];
  onRefresh: () => void;
}

// Haversine distance in km between two lat/lng points
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

// Battery helpers
const getBatteryColor = (level: number) => {
  if (level <= 10) return 'text-rose-500';
  if (level <= 30) return 'text-amber-400';
  return 'text-emerald-400';
};

const getBatteryDisplay = (level: number) => {
  const clamped = Math.min(100, Math.max(0, Math.round(level)));
  return `${clamped}%`;
};

// Status dot color
const statusDotClass = (status: string) =>
  status === 'ONLINE'
    ? 'bg-emerald-500'
    : status === 'IDLE'
    ? 'bg-amber-500'
    : 'bg-slate-500';

export const LiveFleetView: React.FC<LiveFleetViewProps> = ({
  trackers,
  selectedTrackerId,
  setSelectedTrackerId,
  geofences,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'IDLE' | 'OFFLINE'>('ALL');
  const [isAssetListOpenMobile, setIsAssetListOpenMobile] = useState(false);

  // Viewer's own location (dashboard user's device location)
  const [viewerLocation, setViewerLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Route state
  const [routeCoords, setRouteCoords] = useState<[number, number][] | undefined>(undefined);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Proximity panel collapse
  const [proximityExpanded, setProximityExpanded] = useState(true);
  const [isWaysToReachOpen, setIsWaysToReachOpen] = useState(false);
  const [showMetroStations, setShowMetroStations] = useState(true);


  // Get dashboard user's location once (for distance calculations)
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setViewerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}, // Silent fail — distance feature just won't show
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Clear route when selected tracker changes
  useEffect(() => {
    setRouteCoords(undefined);
    setRouteError(null);
  }, [selectedTrackerId]);

  const handleShowRoute = useCallback(async () => {
    if (!selectedTrackerId) return;
    setRouteLoading(true);
    setRouteError(null);
    try {
      const params: { trackerId: string; fromLat?: number; fromLng?: number } = { trackerId: selectedTrackerId };
      if (viewerLocation) {
        params.fromLat = viewerLocation.lat;
        params.fromLng = viewerLocation.lng;
      }
      const coords = await fetchShortestRoute(params);
      setRouteCoords(coords);
    } catch (err: any) {
      setRouteError(err?.message || 'Could not fetch route');
      setRouteCoords(undefined);
    } finally {
      setRouteLoading(false);
    }
  }, [selectedTrackerId, viewerLocation]);

  const handleClearRoute = () => {
    setRouteCoords(undefined);
    setRouteError(null);
  };

  const filteredTrackers = trackers.filter(t => {
    const matchesSearch = t.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.trackerCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.trackingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedTracker = trackers.find(t => t.id === selectedTrackerId);

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative overflow-hidden bg-dark-900">
      {/* 1. Left Asset Sidebar (Desktop) / Mobile Slide-up Sheet */}
      <div className={`
        md:w-96 bg-dark-800 border-r border-dark-700 flex flex-col z-20 shrink-0 transition-all duration-300
        ${isAssetListOpenMobile ? 'fixed inset-x-0 bottom-14 top-16 z-40 flex' : 'hidden md:flex'}
      `}>
        {/* Search & Filter Header */}
        <div className="p-3.5 sm:p-4 border-b border-dark-700 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-100 font-sans">Fleet Assets ({filteredTrackers.length})</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                className="p-1.5 rounded-lg bg-dark-700 text-slate-400 hover:text-white transition"
                title="Refresh Fleet Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsAssetListOpenMobile(false)}
                className="md:hidden p-1.5 rounded-lg bg-dark-700 text-slate-400 hover:text-white"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
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
                className={`flex-1 py-1 text-[10px] sm:text-[11px] font-semibold rounded-lg transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Viewer location indicator */}
          {viewerLocation && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Navigation className="w-3 h-3 text-blue-400" />
              <span>Your location detected — showing distances</span>
            </div>
          )}
        </div>

        {/* Tracker List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTrackers.map(tracker => {
            const isSelected = tracker.id === selectedTrackerId;
            const statusColor = statusDotClass(tracker.trackingStatus);

            // Distance from dashboard viewer to tracker
            const dist = viewerLocation && tracker.lastLatitude
              ? distanceKm(viewerLocation.lat, viewerLocation.lng, tracker.lastLatitude, tracker.lastLongitude)
              : null;

            // Clamp battery to valid range (backend may send raw sensor data)
            const batteryDisplay = getBatteryDisplay(tracker.batteryLevel);
            const batteryColor = getBatteryColor(tracker.batteryLevel);

            return (
              <div
                key={tracker.id}
                onClick={() => {
                  setSelectedTrackerId(tracker.id);
                  setIsAssetListOpenMobile(false);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-md'
                    : 'bg-dark-900/60 border-dark-700/60 hover:bg-dark-700/40 hover:border-dark-600'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusColor} ${tracker.trackingStatus === 'ONLINE' ? 'animate-ping' : ''}`} />
                    <span className="font-semibold text-xs sm:text-sm text-slate-100 leading-tight">{tracker.deviceName}</span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                    {tracker.trackerCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                    <span>{Math.round(tracker.lastSpeed)} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Battery className={`w-3.5 h-3.5 ${batteryColor}`} />
                    <span className={batteryColor}>{batteryDisplay}</span>
                  </div>
                </div>

                {/* Distance from viewer */}
                {dist !== null && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
                    <MapPin className="w-3 h-3 text-cyan-500" />
                    <span className="text-cyan-400 font-semibold">{formatDistance(dist)}</span>
                    <span className="text-slate-600">from you</span>
                  </div>
                )}

                {/* Proximity badges from WS event (compact in list) */}
                {isSelected && tracker.proximitySnapshot && tracker.proximitySnapshot.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tracker.proximitySnapshot.slice(0, 3).map(p => (
                      <span
                        key={p.trackerId}
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                      >
                        {p.deviceName} · {p.distanceKm < 1 ? `${Math.round(p.distanceKm * 1000)}m` : `${p.distanceKm.toFixed(1)}km`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Area: Fullscreen Map & Floating Mobile Controls */}
      <div className="flex-1 relative h-full">
        {/* Mobile Asset List Toggle Button */}
        <button
          onClick={() => setIsAssetListOpenMobile(!isAssetListOpenMobile)}
          className="md:hidden absolute top-4 left-4 z-30 px-3.5 py-2 rounded-xl bg-dark-800/90 border border-dark-600 text-xs font-bold text-slate-200 shadow-xl flex items-center gap-2 backdrop-blur-md"
        >
          <List className="w-4 h-4 text-blue-400" />
          <span>Asset Roster ({filteredTrackers.length})</span>
        </button>

        <LiveMap
        showMetroStations={showMetroStations}
          trackers={filteredTrackers}
          selectedTrackerId={selectedTrackerId}
          onSelectTracker={setSelectedTrackerId}
          geofences={geofences}
          routeCoords={routeCoords}
        />

        {/* Selected Tracker Telemetry Floating Card */}
        {selectedTracker && (
          <div className="absolute bottom-16 sm:bottom-6 left-3 right-3 sm:right-auto sm:left-6 z-20 sm:w-80 glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl space-y-3">

            {/* ── Header ── */}
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white">{selectedTracker.deviceName}</h3>
                <span className="font-mono text-[10px] text-blue-400 font-semibold">{selectedTracker.trackerCode}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Live status dot + badge */}
                <span className={`flex items-center gap-1.5 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold rounded-full ${
                  selectedTracker.trackingStatus === 'ONLINE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : selectedTracker.trackingStatus === 'IDLE'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(selectedTracker.trackingStatus)} ${selectedTracker.trackingStatus === 'ONLINE' ? 'animate-pulse' : ''}`} />
                  {selectedTracker.trackingStatus}
                </span>
              </div>
            </div>

            {/* ── Telemetry Grid ── */}
            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div className="bg-dark-900/80 p-1.5 sm:p-2 rounded-xl border border-dark-700">
                <div className="text-[9px] sm:text-[10px] text-slate-400">SPEED</div>
                <div className="font-extrabold text-xs sm:text-sm text-blue-400">{Math.round(selectedTracker.lastSpeed)} <span className="text-[9px]">km/h</span></div>
              </div>
              <div className="bg-dark-900/80 p-1.5 sm:p-2 rounded-xl border border-dark-700">
                <div className="text-[9px] sm:text-[10px] text-slate-400">BATTERY</div>
                <div className={`font-extrabold text-xs sm:text-sm ${getBatteryColor(selectedTracker.batteryLevel)}`}>
                  {getBatteryDisplay(selectedTracker.batteryLevel)}
                </div>
              </div>
              <div className="bg-dark-900/80 p-1.5 sm:p-2 rounded-xl border border-dark-700">
                <div className="text-[9px] sm:text-[10px] text-slate-400">GPS ±</div>
                <div className="font-extrabold text-xs sm:text-sm text-cyan-400">±{selectedTracker.lastAccuracy}m</div>
              </div>
            </div>

            {/* ── Distance from viewer to selected tracker ── */}
            {viewerLocation && selectedTracker.lastLatitude && (
              <div className="flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl py-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-cyan-300">
                  {formatDistance(distanceKm(viewerLocation.lat, viewerLocation.lng, selectedTracker.lastLatitude, selectedTracker.lastLongitude))}
                </span>
                <span className="text-slate-400">from your location</span>
              </div>
            )}

            {/* ── Proximity Snapshot (Real-time from WS) ── */}
            {selectedTracker.proximitySnapshot && selectedTracker.proximitySnapshot.length > 0 && (
              <div className="bg-dark-900/60 border border-dark-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setProximityExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-300 hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3 text-indigo-400" />
                    <span>Nearby Assets</span>
                    <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 rounded text-[9px] font-bold">
                      {selectedTracker.proximitySnapshot.length}
                    </span>
                  </div>
                  <ChevronRight className={`w-3 h-3 text-slate-500 transition-transform ${proximityExpanded ? 'rotate-90' : ''}`} />
                </button>

                {proximityExpanded && (
                  <div className="px-3 pb-2.5 space-y-1.5 border-t border-dark-700">
                    {selectedTracker.proximitySnapshot.map(p => (
                      <div key={p.trackerId} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${p.trackingStatus ? statusDotClass(p.trackingStatus) : 'bg-slate-500'}`} />
                          <span className="text-slate-300 font-medium">{p.deviceName}</span>
                          <span className="font-mono text-slate-500">{p.trackerCode}</span>
                        </div>
                        <span className="text-indigo-300 font-bold tabular-nums">
                          {p.distanceKm < 1
                            ? `${Math.round(p.distanceKm * 1000)} m`
                            : `${p.distanceKm.toFixed(2)} km`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Shortest Route Controls ── */}
            <div className="space-y-1.5">
              {/* Route error */}
              {routeError && (
                <div className="flex items-center gap-1.5 text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-1.5">
                  <WifiOff className="w-3 h-3 shrink-0" />
                  <span>{routeError}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Show / Refresh route button */}
                <button
                  onClick={handleShowRoute}
                  disabled={routeLoading}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition ${
                    routeCoords
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  }`}
                >
                  {routeLoading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching Route…</>
                    : routeCoords
                    ? <><Route className="w-3.5 h-3.5" /> Refresh Route</>
                    : <><Route className="w-3.5 h-3.5" /> Show Shortest Route</>
                  }
                </button>

                {/* Clear route button */}
                {routeCoords && (
                  <button
                    onClick={handleClearRoute}
                    className="p-2 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-600 text-slate-400 hover:text-white transition"
                    title="Clear route"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Route length info */}
              {routeCoords && routeCoords.length > 1 && (
                <div className="flex items-center gap-1.5 justify-center text-[9px] text-slate-500">
                  <span className="w-3 h-0.5 bg-indigo-400 rounded inline-block" />
                  <span>Route drawn via OSRM · {routeCoords.length} waypoints</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
