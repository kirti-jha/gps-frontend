import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Play, Square, Wifi, WifiOff, Battery, Gauge, MapPin, Radio, Shield, RefreshCw } from 'lucide-react';
import { Tracker } from '../types';
import { apiRequest } from '../services/api';

interface MobileTrackerModeProps {
  trackers: Tracker[];
  onRefresh: () => void;
}

export const MobileTrackerMode: React.FC<MobileTrackerModeProps> = ({ trackers, onRefresh }) => {
  const [selectedTrackerCode, setSelectedTrackerCode] = useState<string>(trackers[0]?.trackerCode || 'TRK-928374');
  const [trackingMode, setTrackingMode] = useState<'SIMULATED' | 'REAL_GPS'>('SIMULATED');
  const [isTracking, setIsTracking] = useState(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);

  // Telemetry state
  const [battery, setBattery] = useState(88);
  const [speed, setSpeed] = useState(45);
  const [heading, setHeading] = useState(120);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>({ lat: 28.6139, lng: 77.2090 });
  const [sentCount, setSentCount] = useState(0);

  // Offline queue buffer
  const offlineQueueRef = useRef<any[]>([]);

  // Simulation timer ref
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Route presets around Delhi/NCR
  const routes = [
    {
      name: 'Delhi Express Logistics Loop (Noida ➔ CP)',
      start: { lat: 28.5355, lng: 77.3910 },
      end: { lat: 28.6139, lng: 77.2090 }
    },
    {
      name: 'Gurgaon Highway Freight Corridor',
      start: { lat: 28.4595, lng: 77.0266 },
      end: { lat: 28.6315, lng: 77.2167 }
    }
  ];
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // Function to send GPS payload to backend
  const sendLocationPoint = async (lat: number, lng: number, currentSpeed: number, currentHeading: number, currentBattery: number) => {
    const payload = {
      trackerCode: selectedTrackerCode,
      latitude: lat,
      longitude: lng,
      accuracy: 6,
      speed: currentSpeed,
      heading: currentHeading,
      altitude: 212,
      battery: currentBattery,
      timestamp: new Date().toISOString()
    };

    if (isOfflineSimulated) {
      offlineQueueRef.current.push(payload);
      console.log(`[Mobile Tracker] Connection offline! Queued point #${offlineQueueRef.current.length}`);
      return;
    }

    try {
      await fetch('/api/v1/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSentCount(prev => prev + 1);
      setLastCoords({ lat, lng });
    } catch (err) {
      console.error('Failed to post location:', err);
      offlineQueueRef.current.push(payload);
    }
  };

  // Flush offline queue when re-connecting
  const flushOfflineQueue = async () => {
    if (offlineQueueRef.current.length === 0) return;
    try {
      const queue = [...offlineQueueRef.current];
      offlineQueueRef.current = [];
      await fetch('/api/v1/locations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: queue })
      });
      console.log(`[Mobile Tracker] Flushed ${queue.length} queued points to backend`);
      setSentCount(prev => prev + queue.length);
      onRefresh();
    } catch (err) {
      console.error('Failed to flush offline queue:', err);
    }
  };

  useEffect(() => {
    if (!isOfflineSimulated) {
      flushOfflineQueue();
    }
  }, [isOfflineSimulated]);

  // Start / Stop Tracking Logic
  const toggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    } else {
      setIsTracking(true);
      if (trackingMode === 'SIMULATED') {
        const route = routes[selectedRouteIndex];
        let step = 0;
        const totalSteps = 60;

        simTimerRef.current = setInterval(() => {
          step = (step + 1) % totalSteps;
          const progress = step / totalSteps;

          const lat = route.start.lat + (route.end.lat - route.start.lat) * progress + (Math.random() - 0.5) * 0.002;
          const lng = route.start.lng + (route.end.lng - route.start.lng) * progress + (Math.random() - 0.5) * 0.002;
          const currentSpeed = Math.floor(35 + Math.random() * 25);
          const currentHeading = Math.floor((progress * 360) % 360);
          const currentBattery = Math.max(10, battery - Math.floor(step / 20));

          setSpeed(currentSpeed);
          setHeading(currentHeading);
          setBattery(currentBattery);
          sendLocationPoint(lat, lng, currentSpeed, currentHeading, currentBattery);
        }, 3000); // 3 seconds transmission frequency
      } else {
        // Real HTML5 Geolocation API
        if ('geolocation' in navigator) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            pos => {
              const { latitude, longitude, speed, heading, accuracy, altitude } = pos.coords;
              const spd = speed ? Math.round(speed * 3.6) : 25;
              const hdg = heading || 90;
              sendLocationPoint(latitude, longitude, spd, hdg, battery);
            },
            err => console.error('GPS Watch error:', err),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
          );
        } else {
          alert('HTML5 Geolocation is not supported in this browser environment.');
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-full p-6 bg-dark-900 overflow-y-auto flex flex-col items-center justify-center">
      {/* Mobile Device Frame UI */}
      <div className="w-full max-w-sm bg-dark-800 border-4 border-dark-700 rounded-[40px] p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Phone Notch */}
        <div className="w-32 h-4 bg-dark-900 rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-dark-800" />
        </div>

        {/* Tracker Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>TrackX Hardware Emulator</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Mobile Tracker Client</h2>
          <p className="text-[11px] text-slate-400">
            Transmits high-precision GPS vectors to backend engine
          </p>
        </div>

        {/* Device Select */}
        <div className="bg-dark-900 p-3 rounded-2xl border border-dark-700 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase block">Paired Device Code</label>
          <select
            value={selectedTrackerCode}
            onChange={e => setSelectedTrackerCode(e.target.value)}
            disabled={isTracking}
            className="w-full bg-dark-800 border border-dark-600 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
          >
            {trackers.map(t => (
              <option key={t.id} value={t.trackerCode}>
                {t.deviceName} ({t.trackerCode})
              </option>
            ))}
          </select>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setTrackingMode('SIMULATED')}
            disabled={isTracking}
            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
              trackingMode === 'SIMULATED'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-dark-900 text-slate-400 border-dark-700'
            }`}
          >
            Simulated Route
          </button>
          <button
            onClick={() => setTrackingMode('REAL_GPS')}
            disabled={isTracking}
            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
              trackingMode === 'REAL_GPS'
                ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40'
                : 'bg-dark-900 text-slate-400 border-dark-700'
            }`}
          >
            Real Phone GPS
          </button>
        </div>

        {/* Route Preset Dropdown if SIMULATED */}
        {trackingMode === 'SIMULATED' && (
          <div className="bg-dark-900 p-3 rounded-2xl border border-dark-700 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Driving Route Scenario</label>
            <select
              value={selectedRouteIndex}
              onChange={e => setSelectedRouteIndex(Number(e.target.value))}
              disabled={isTracking}
              className="w-full bg-dark-800 border border-dark-600 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs"
            >
              {routes.map((r, i) => (
                <option key={i} value={i}>{r.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Live Telemetry Display Gauge */}
        <div className="bg-dark-900 p-4 rounded-2xl border border-dark-700 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-dark-700 pb-2">
            <div className="flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${isTracking ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="font-bold text-slate-200">{isTracking ? 'STREAMING ACTIVE' : 'PAUSED'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">FREQ: 3 SEC</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-dark-800 p-2.5 rounded-xl border border-dark-700">
              <div className="text-[10px] text-slate-400">SPEED</div>
              <div className="text-lg font-extrabold text-blue-400">{isTracking ? speed : 0} <span className="text-[10px]">km/h</span></div>
            </div>
            <div className="bg-dark-800 p-2.5 rounded-xl border border-dark-700">
              <div className="text-[10px] text-slate-400">BATTERY</div>
              <div className="text-lg font-extrabold text-emerald-400">{battery}%</div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 space-y-1 bg-dark-800/60 p-2 rounded-xl">
            <div>Lat/Lng: {lastCoords ? `${lastCoords.lat.toFixed(4)}, ${lastCoords.lng.toFixed(4)}` : '--'}</div>
            <div>Sent Vectors: <span className="text-blue-400 font-bold">{sentCount}</span> | Queued: <span className="text-amber-400 font-bold">{offlineQueueRef.current.length}</span></div>
          </div>
        </div>

        {/* Offline Simulation Toggle */}
        <button
          onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition ${
            isOfflineSimulated
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-dark-900 text-slate-400 border-dark-700 hover:text-slate-200'
          }`}
        >
          {isOfflineSimulated ? <WifiOff className="w-4 h-4 text-rose-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
          <span>{isOfflineSimulated ? 'Network Disconnected (Queueing)' : 'Network Connected'}</span>
        </button>

        {/* Start / Stop Big Button */}
        <button
          onClick={toggleTracking}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
            isTracking
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          }`}
        >
          {isTracking ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          <span>{isTracking ? 'STOP TRACKING SERVICE' : 'START TRANSMITTING GPS'}</span>
        </button>
      </div>
    </div>
  );
};
