import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Calendar, Clock, MapPin, Gauge, Shield, Search } from 'lucide-react';
import { RouteReplayMap } from '../components/RouteReplayMap';
import { apiRequest } from '../services/api';
import { Tracker, LocationPoint, RouteHistoryResponse } from '../types';

interface HistoryReplayViewProps {
  trackers: Tracker[];
}

export const HistoryReplayView: React.FC<HistoryReplayViewProps> = ({ trackers }) => {
  const [selectedTrackerId, setSelectedTrackerId] = useState<string>(trackers[0]?.id || '');
  const [historyData, setHistoryData] = useState<RouteHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Point in time query states
  const [queryTime, setQueryTime] = useState('14:30');
  const [queryResult, setQueryResult] = useState<any>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (trackers.length > 0 && !selectedTrackerId) {
      setSelectedTrackerId(trackers[0].id);
    }
  }, [trackers]);

  const loadHistory = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setIsPlaying(false);
    setCurrentIndex(0);
    try {
      const data = await apiRequest<RouteHistoryResponse>(`/trackers/${id}/history`);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTrackerId) {
      loadHistory(selectedTrackerId);
    }
  }, [selectedTrackerId]);

  // Animated Playback loop
  useEffect(() => {
    if (isPlaying && historyData && historyData.points.length > 0) {
      const intervalMs = Math.max(100, 1000 / playbackSpeed);
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= historyData.points.length - 1) {
            setIsPlaying(false);
            return historyData.points.length - 1;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, historyData]);

  const points = historyData?.points || [];
  const currentPoint = points[currentIndex];

  // Execute Point in time query
  const handleQueryAtTime = async () => {
    if (!selectedTrackerId || !queryTime) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const fullTargetTime = `${today}T${queryTime}:00Z`;
      const res = await apiRequest<any>(`/trackers/${selectedTrackerId}/at-time?time=${fullTargetTime}`);
      setQueryResult(res);
    } catch (err) {
      console.error('Point in time query failed:', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-dark-900">
      {/* Top Controls Bar */}
      <div className="bg-dark-800 border-b border-dark-700 p-4 flex flex-wrap items-center justify-between gap-4 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Asset</label>
            <select
              value={selectedTrackerId}
              onChange={e => setSelectedTrackerId(e.target.value)}
              className="bg-dark-900 border border-dark-600 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              {trackers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.deviceName} ({t.trackerCode})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 pt-4">
            <button
              onClick={() => selectedTrackerId && loadHistory(selectedTrackerId)}
              className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold hover:bg-blue-600/30 transition"
            >
              Today's Route
            </button>
          </div>
        </div>

        {/* Stats Pills Header */}
        {historyData?.stats && (
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Total Distance:</span>{' '}
              <strong className="text-blue-400 font-extrabold">{historyData.stats.totalDistanceKm} km</strong>
            </div>
            <div className="bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Duration:</span>{' '}
              <strong className="text-slate-200 font-bold">{historyData.stats.durationMinutes} mins</strong>
            </div>
            <div className="bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Max Speed:</span>{' '}
              <strong className="text-amber-400 font-bold">{historyData.stats.maxSpeedKm} km/h</strong>
            </div>
            <div className="bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Stops:</span>{' '}
              <strong className="text-rose-400 font-bold">{historyData.stats.stopCount}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Main Map & Interactive Replay Area */}
      <div className="flex-1 relative">
        <RouteReplayMap points={points} currentPointIndex={currentIndex} />

        {/* Bottom Interactive Playback Controls Floating Console */}
        {points.length > 0 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-[92%] max-w-4xl glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl space-y-3">
            {/* Progress Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>
                  Recorded: {currentPoint ? new Date(currentPoint.recordedAt).toLocaleTimeString() : '--'}
                </span>
                <span>
                  Point {currentIndex + 1} of {points.length} ({Math.round(currentPoint?.speed || 0)} km/h)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={points.length - 1}
                value={currentIndex}
                onChange={e => setCurrentIndex(Number(e.target.value))}
                className="w-full h-2 bg-dark-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Controls Button Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 transition"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentIndex(0);
                  }}
                  className="p-2.5 rounded-xl bg-dark-900 hover:bg-dark-700 text-slate-300 border border-dark-700 transition"
                  title="Reset to Start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Multiplier Selectors */}
              <div className="flex items-center gap-1 bg-dark-900 p-1 rounded-xl border border-dark-700 text-xs">
                {[1, 2, 5, 10].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-3 py-1 font-bold rounded-lg transition ${
                      playbackSpeed === speed ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating "Where was Rahul at X time?" Query Card */}
        <div className="absolute top-6 right-6 z-20 w-80 glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-700/60 pb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Point-in-Time Location Query</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Query exact location recorded at any timestamp during the day.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={queryTime}
              onChange={e => setQueryTime(e.target.value)}
              className="flex-1 bg-dark-900 border border-dark-600 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              onClick={handleQueryAtTime}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Lookup
            </button>
          </div>

          {queryResult && (
            <div className="bg-dark-900/90 p-3 rounded-xl border border-dark-700 text-xs space-y-1 text-slate-300">
              <div className="font-bold text-emerald-400">Matched Nearest Location</div>
              <div>Lat/Lng: <span className="font-mono text-white">{queryResult.closestPoint.latitude.toFixed(4)}, {queryResult.closestPoint.longitude.toFixed(4)}</span></div>
              <div>Speed: <strong className="text-white">{Math.round(queryResult.closestPoint.speed)} km/h</strong></div>
              <div>Recorded At: {new Date(queryResult.closestPoint.recordedAt).toLocaleTimeString()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
