import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Play,
  Square,
  Wifi,
  WifiOff,
  Battery,
  Gauge,
  MapPin,
  Radio,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Navigation
} from 'lucide-react';
import { Tracker } from '../types';
import { API_BASE } from '../services/api';

interface MobileTrackerModeProps {
  trackers?: Tracker[];
  onRefresh?: () => void;
  isStandaloneMobileView?: boolean;
}

export const MobileTrackerMode: React.FC<MobileTrackerModeProps> = ({
  trackers = [],
  onRefresh,
  isStandaloneMobileView = false
}) => {
  const [selectedTrackerCode, setSelectedTrackerCode] = useState<string>(() => {
    return trackers[0]?.trackerCode || localStorage.getItem('trackx_mobile_code') || `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
  });
  const [trackingMode, setTrackingMode] = useState<'REAL_GPS' | 'SIMULATED'>('REAL_GPS');
  const [isTracking, setIsTracking] = useState(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // GPS accuracy threshold for satellite mode (meters)
  const GPS_ACCURACY_THRESHOLD = 40;
  // Threshold for network/cell-tower fallback (meters)
  const NETWORK_ACCURACY_THRESHOLD = 500;

  // Telemetry state
  const [battery, setBattery] = useState(90);

  // HTML5 Battery API integration for 100% accurate device battery status
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((bm: any) => {
        const syncBattery = () => {
          setBattery(Math.round(bm.level * 100));
        };
        syncBattery();
        bm.addEventListener('levelchange', syncBattery);
      }).catch(() => {});
    }
  }, []);

  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [locationSource, setLocationSource] = useState<'GPS' | 'NETWORK' | 'NONE'>('NONE');
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sentCount, setSentCount] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready to connect GPS');

  // Offline queue buffer
  const offlineQueueRef = useRef<any[]>([]);

  // Simulation timer & GPS watch refs
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const networkWatchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Listen for PWA installation prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Save selected tracker code locally
  useEffect(() => {
    if (selectedTrackerCode) {
      localStorage.setItem('trackx_mobile_code', selectedTrackerCode);
    }
  }, [selectedTrackerCode]);

  // Request WakeLock to prevent phone screen from sleeping while tracking
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.log('WakeLock error:', err);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // Send GPS payload to backend API
  const sendLocationPoint = async (
    lat: number,
    lng: number,
    currentSpeed: number,
    currentHeading: number,
    currentAccuracy: number,
    currentBattery: number
  ) => {
    const payload = {
      trackerCode: selectedTrackerCode,
      latitude: lat,
      longitude: lng,
      accuracy: currentAccuracy,
      speed: currentSpeed,
      heading: currentHeading,
      altitude: 210,
      battery: currentBattery,
      timestamp: new Date().toISOString()
    };

    if (isOfflineSimulated || !navigator.onLine) {
      offlineQueueRef.current.push(payload);
      setStatusMessage(`📡 GPS active — buffering offline (${offlineQueueRef.current.length} points queued)`);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSentCount(prev => prev + 1);
        setLastCoords({ lat, lng });
        setLastSentTime(new Date().toLocaleTimeString());
        setStatusMessage('GPS Vector Transmitted to TrackX Cloud');
      } else {
        offlineQueueRef.current.push(payload);
        setStatusMessage(`Backend sync error. Buffered #${offlineQueueRef.current.length}`);
      }
    } catch (err) {
      console.error('Location transmission error:', err);
      offlineQueueRef.current.push(payload);
      setStatusMessage(`Connection timeout. Buffered #${offlineQueueRef.current.length}`);
    }
  };

  // Flush offline queue when re-connecting
  const flushOfflineQueue = async () => {
    if (offlineQueueRef.current.length === 0) return;
    try {
      const queue = [...offlineQueueRef.current];
      offlineQueueRef.current = [];
      await fetch(`${API_BASE}/locations/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: queue })
      });
      setSentCount(prev => prev + queue.length);
      setStatusMessage(`Flushed ${queue.length} offline GPS points`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to flush offline queue:', err);
    }
  };

  useEffect(() => {
    if (!isOfflineSimulated && navigator.onLine) {
      flushOfflineQueue();
    }
  }, [isOfflineSimulated]);

  // Auto-flush buffered points when internet connection is restored
  useEffect(() => {
    const handleOnline = () => {
      setStatusMessage('Connection restored — syncing buffered GPS points...');
      flushOfflineQueue();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Start / Stop Tracking Logic
  const stopAllWatchers = () => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (networkWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(networkWatchIdRef.current);
      networkWatchIdRef.current = null;
    }
  };

  const toggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      setLocationSource('NONE');
      releaseWakeLock();
      stopAllWatchers();
      setStatusMessage('Tracking Paused');
    } else {
      setIsTracking(true);
      requestWakeLock();

      if (trackingMode === 'REAL_GPS') {
        if (!('geolocation' in navigator)) {
          alert('HTML5 Geolocation is not supported on this browser.');
          setIsTracking(false);
          return;
        }

        setStatusMessage('Acquiring GPS fix...');

        // === SATELLITE GPS (high accuracy) ===
        // GPS works WITHOUT internet — satellite signals are always available
        watchIdRef.current = navigator.geolocation.watchPosition(
          pos => {
            const { latitude, longitude, speed: spd, heading: hdg, accuracy: acc } = pos.coords;
            const currentSpeed = spd ? Math.round(spd * 3.6) : 0;
            const currentHeading = hdg || 0;
            const currentAccuracy = Math.round(acc);

            setAccuracy(currentAccuracy);

            if (currentAccuracy > GPS_ACCURACY_THRESHOLD) {
              setStatusMessage(`Satellite acquiring... ±${currentAccuracy}m (need ≤${GPS_ACCURACY_THRESHOLD}m)`);
              return;
            }

            // Got satellite GPS lock — stop the network fallback watcher
            if (networkWatchIdRef.current !== null) {
              navigator.geolocation.clearWatch(networkWatchIdRef.current);
              networkWatchIdRef.current = null;
            }

            setLocationSource('GPS');
            setSpeed(currentSpeed);
            setHeading(currentHeading);
            sendLocationPoint(latitude, longitude, currentSpeed, currentHeading, currentAccuracy, battery);
          },
          err => {
            // Satellite failed — stay on network fallback, don't stop tracking
            console.warn('Satellite GPS error:', err.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 30000
          }
        );

        // === NETWORK / CELL-TOWER FALLBACK ===
        // Works like "Where is My Train" — uses mobile network/WiFi triangulation
        // This kicks in when satellite GPS is not available (indoors, no sky view)
        // Location is less precise (±100-500m) but still usable
        networkWatchIdRef.current = navigator.geolocation.watchPosition(
          pos => {
            // Only use this if satellite GPS hasn't locked yet
            if (locationSource === 'GPS') return;

            const { latitude, longitude, speed: spd, heading: hdg, accuracy: acc } = pos.coords;
            const currentSpeed = spd ? Math.round(spd * 3.6) : 0;
            const currentHeading = hdg || 0;
            const currentAccuracy = Math.round(acc);

            setAccuracy(currentAccuracy);

            if (currentAccuracy > NETWORK_ACCURACY_THRESHOLD) {
              setStatusMessage(`Cell tower fix: ±${currentAccuracy}m — waiting for better signal`);
              return;
            }

            setLocationSource('NETWORK');
            setSpeed(currentSpeed);
            setHeading(currentHeading);
            setStatusMessage(`📶 Network location ±${currentAccuracy}m (satellite searching...)`);
            sendLocationPoint(latitude, longitude, currentSpeed, currentHeading, currentAccuracy, battery);
          },
          err => {
            if (err.code === 1) {
              setStatusMessage('Location permission denied. Please allow in browser settings.');
              setIsTracking(false);
              stopAllWatchers();
            }
          },
          {
            enableHighAccuracy: false, // Uses WiFi + cell towers — works even with mobile data off
            maximumAge: 10000,
            timeout: 15000
          }
        );
      } else {
        // Simulated Route Driving
        let step = 0;
        const baseLat = 28.6139;
        const baseLng = 77.2090;

        simTimerRef.current = setInterval(() => {
          step++;
          const lat = baseLat + step * 0.0005 + (Math.random() - 0.5) * 0.0002;
          const lng = baseLng + step * 0.0005 + (Math.random() - 0.5) * 0.0002;
          const simSpeed = Math.floor(40 + Math.random() * 20);
          const simHeading = (step * 25) % 360;

          setSpeed(simSpeed);
          setHeading(simHeading);
          sendLocationPoint(lat, lng, simSpeed, simHeading, 5, battery);
        }, 3000);
      }
    }
  };

  useEffect(() => {
    return () => {
      releaseWakeLock();
      stopAllWatchers();
    };
  }, []);

  const triggerPWAInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installed');
        }
        setInstallPrompt(null);
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-dark-900 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto font-sans">
      {/* PWA Install Banner Prompt */}
      {installPrompt && (
        <div className="w-full max-w-md bg-blue-600/20 border border-blue-500/40 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400 shrink-0" />
            <span>Install TrackX App on Home Screen for Background Tracking</span>
          </div>
          <button
            onClick={triggerPWAInstall}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shrink-0"
          >
            Install
          </button>
        </div>
      )}

      {/* Main Mobile App Card Container */}
      <div className="w-full max-w-md bg-dark-800 border border-dark-700 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <Navigation className="w-5 h-5 text-blue-400 transform -rotate-45" />
              </div>
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">TrackX Mobile Client</h2>
              <p className="text-[11px] text-slate-400">Phone Hardware Location Transmitter</p>
            </div>
          </div>
          <span className={`w-3 h-3 rounded-full ${isTracking ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
        </div>

        
        {/* Interactive Battery Level Calibrator / Slider */}
        <div className="bg-dark-900 p-3.5 rounded-2xl border border-dark-700 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <div className="flex items-center gap-1.5">
              <Battery className={`w-4 h-4 ${battery <= 20 ? 'text-rose-400' : battery <= 50 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>Connected Device Battery</span>
            </div>
            <span className={`font-mono font-extrabold ${battery <= 20 ? 'text-rose-400' : battery <= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {battery}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={battery}
            onChange={e => setBattery(Number(e.target.value))}
            className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <p className="text-[10px] text-slate-500">
            Adjust slider to set exact device battery percentage sent in live telemetry stream.
          </p>
        </div>

        {/* Device Code Input / Selector */}
        <div className="bg-dark-900 p-3.5 rounded-2xl border border-dark-700 space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase block">Paired Hardware Tracker Code</label>
          <input
            type="text"
            value={selectedTrackerCode}
            onChange={e => setSelectedTrackerCode(e.target.value.toUpperCase())}
            disabled={isTracking}
            placeholder="e.g. TRK-928374"
            className="w-full bg-dark-800 border border-dark-600 text-blue-400 font-mono font-extrabold rounded-xl px-3 py-2 text-sm focus:outline-none uppercase"
          />
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTrackingMode('REAL_GPS')}
            disabled={isTracking}
            className={`py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
              trackingMode === 'REAL_GPS'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-dark-900 text-slate-400 border-dark-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Real Phone GPS</span>
          </button>
          <button
            onClick={() => setTrackingMode('SIMULATED')}
            disabled={isTracking}
            className={`py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
              trackingMode === 'SIMULATED'
                ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40'
                : 'bg-dark-900 text-slate-400 border-dark-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Simulated Drive</span>
          </button>
        </div>

        {/* Big Animated Pulsing Telemetry Gauge */}
        <div className="bg-dark-900 p-5 rounded-2xl border border-dark-700 text-center space-y-3 relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">LIVE TELEMETRY STREAM</div>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-blue-400 font-sans">{speed}</div>
              <div className="text-[10px] text-slate-400 font-bold">KM/H SPEED</div>
            </div>
            <div className="w-px h-10 bg-dark-700" />
            <div className="text-center">
              <div className="text-3xl font-extrabold text-emerald-400 font-sans">{battery}%</div>
              <div className="text-[10px] text-slate-400 font-bold">BATTERY</div>
            </div>
            <div className="w-px h-10 bg-dark-700" />
            <div className="text-center">
              <div className="text-3xl font-extrabold text-cyan-400 font-sans">±{accuracy}m</div>
              <div className="text-[10px] text-slate-400 font-bold">ACCURACY</div>
            </div>
          </div>

          <div className="bg-dark-800/80 p-2.5 rounded-xl text-[11px] font-mono text-slate-300 space-y-1">
            <div>Coords: {lastCoords ? `${lastCoords.lat.toFixed(4)}, ${lastCoords.lng.toFixed(4)}` : 'Awaiting GPS Fix...'}</div>
            <div className="text-[10px] text-slate-400">
              Sent: <strong className="text-blue-400">{sentCount}</strong> | Buffer: <strong className="text-amber-400">{offlineQueueRef.current.length}</strong> | Last: {lastSentTime || '--'}
            </div>
          </div>

          {/* GPS / Network Quality Indicator */}
          {isTracking && trackingMode === 'REAL_GPS' && (
            <div className="flex items-center justify-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                locationSource === 'NONE' ? 'bg-slate-500 animate-pulse' :
                locationSource === 'GPS' && accuracy <= 10 ? 'bg-emerald-400 animate-pulse' :
                locationSource === 'GPS' ? 'bg-amber-400 animate-pulse' :
                'bg-blue-400 animate-pulse'
              }`} />
              <span className={`text-[10px] font-bold ${
                locationSource === 'NONE' ? 'text-slate-400' :
                locationSource === 'GPS' && accuracy <= 10 ? 'text-emerald-400' :
                locationSource === 'GPS' ? 'text-amber-400' :
                'text-blue-400'
              }`}>
                {locationSource === 'NONE' ? '🔍 Searching for GPS satellite...' :
                 locationSource === 'GPS' && accuracy <= 10 ? `✓ GPS Satellite Lock (±${accuracy}m)` :
                 locationSource === 'GPS' ? `⚡ Satellite GPS (±${accuracy}m)` :
                 `📶 Cell Tower / Network (±${accuracy}m)`}
              </span>
            </div>
          )}

          <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-center gap-1.5 pt-1">
            <Radio className={`w-3.5 h-3.5 ${isTracking ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
            <span>{statusMessage}</span>
          </div>
        </div>

        {/* Offline Simulation Toggle Button */}
        <button
          onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
            isOfflineSimulated
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-dark-900 text-slate-400 border-dark-700 hover:text-slate-200'
          }`}
        >
          {isOfflineSimulated ? <WifiOff className="w-4 h-4 text-rose-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
          <span>{isOfflineSimulated ? 'Network Disconnected (Buffering Offline)' : 'Network Connected'}</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={toggleTracking}
          className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-2xl transition transform active:scale-95 ${
            isTracking
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30'
          }`}
        >
          {isTracking ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          <span>{isTracking ? 'STOP GPS STREAMING' : 'START TRANSMITTING GPS'}</span>
        </button>
      </div>

      <footer className="text-center text-[10px] text-slate-500 pt-4">
        TrackX Enterprise Mobile Location Engine &copy; 2026
      </footer>
    </div>
  );
};
