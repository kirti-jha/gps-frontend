import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, MapPin, Gauge, Search, Calendar, ChevronRight, Battery, Navigation } from 'lucide-react';
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

  // Date & time filter
  const today = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(today);
  const [filterStartTime, setFilterStartTime] = useState('00:00');
  const [filterEndTime, setFilterEndTime] = useState('23:59');

  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Point in time query
  const [queryDate, setQueryDate] = useState(today);
  const [queryTime, setQueryTime] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // Timeline panel
  const [showTimeline, setShowTimeline] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (trackers.length > 0 && !selectedTrackerId) {
      setSelectedTrackerId(trackers[0].id);
    }
  }, [trackers]);

  const loadHistory = async (id: string, startTime?: string, endTime?: string) => {
    if (!id) return;
    setLoading(true);
    setIsPlaying(false);
    setCurrentIndex(0);
    setQueryResult(null);
    try {
      let url = `/trackers/${id}/history`;
      const params: string[] = [];
      if (startTime) params.push(`startTime=${encodeURIComponent(startTime)}`);
      if (endTime) params.push(`endTime=${encodeURIComponent(endTime)}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      const data = await apiRequest<RouteHistoryResponse>(url);
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

  const handleApplyFilter = () => {
    const startISO = `${filterDate}T${filterStartTime}:00`;
    const endISO = `${filterDate}T${filterEndTime}:59`;
    loadHistory(selectedTrackerId, startISO, endISO);
  };

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
          // Scroll timeline
          const el = document.getElementById(`tl-point-${prev + 1}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, playbackSpeed, historyData]);

  const points = historyData?.points || [];
  const currentPoint = points[currentIndex];

  // Execute Point in time query
  const handleQueryAtTime = async () => {
    if (!selectedTrackerId || !queryTime) return;
    setQueryLoading(true);
    try {
      const fullTargetTime = `${queryDate}T${queryTime}:00`;
      const res = await apiRequest<any>(`/trackers/${selectedTrackerId}/at-time?time=${encodeURIComponent(fullTargetTime)}`);
      setQueryResult(res);
      // Jump to nearest point in timeline
      if (res?.closestPoint && points.length > 0) {
        const targetMs = new Date(res.closestPoint.recordedAt).getTime();
        let nearestIdx = 0;
        let minDiff = Infinity;
        points.forEach((p, i) => {
          const diff = Math.abs(new Date(p.recordedAt).getTime() - targetMs);
          if (diff < minDiff) { minDiff = diff; nearestIdx = i; }
        });
        setCurrentIndex(nearestIdx);
        const el = document.getElementById(`tl-point-${nearestIdx}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error('Point in time query failed:', err);
    } finally {
      setQueryLoading(false);
    }
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full h-full flex flex-col relative bg-dark-900">

      {/* ── Top Controls Bar ── */}
      <div className="bg-dark-800 border-b border-dark-700 p-3 flex flex-wrap items-end gap-3 z-10 shrink-0">

        {/* Asset Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Asset</label>
          <select
            value={selectedTrackerId}
            onChange={e => setSelectedTrackerId(e.target.value)}
            className="bg-dark-900 border border-dark-600 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
          >
            {trackers.map(t => (
              <option key={t.id} value={t.id}>{t.deviceName} ({t.trackerCode})</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-dark-900 border border-dark-600 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Time Range */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> From
          </label>
          <input
            type="time"
            value={filterStartTime}
            onChange={e => setFilterStartTime(e.target.value)}
            className="bg-dark-900 border border-dark-600 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">To</label>
          <input
            type="time"
            value={filterEndTime}
            onChange={e => setFilterEndTime(e.target.value)}
            className="bg-dark-900 border border-dark-600 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <button
          onClick={handleApplyFilter}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" />
          {loading ? 'Loading...' : 'Search Route'}
        </button>

        {/* Quick shortcuts */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => { setFilterDate(today); setFilterStartTime('00:00'); setFilterEndTime('23:59'); setTimeout(handleApplyFilter, 50); }}
            className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-300 border border-dark-600 rounded-xl text-xs font-semibold transition"
          >
            Today
          </button>
          <button
            onClick={() => {
              const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
              const y = yesterday.toISOString().split('T')[0];
              setFilterDate(y); setFilterStartTime('00:00'); setFilterEndTime('23:59');
              setTimeout(() => loadHistory(selectedTrackerId, `${y}T00:00:00`, `${y}T23:59:59`), 50);
            }}
            className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-300 border border-dark-600 rounded-xl text-xs font-semibold transition"
          >
            Yesterday
          </button>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              showTimeline ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40' : 'bg-dark-700 text-slate-300 border-dark-600'
            }`}
          >
            <MapPin className="w-3 h-3" />
            Timeline
          </button>
        </div>

        {/* Stats Pills */}
        {historyData?.stats && (
          <div className="w-full flex items-center gap-2 text-xs flex-wrap pt-1 border-t border-dark-700/50">
            <span className="text-slate-500">Route stats:</span>
            <span className="bg-dark-900 border border-dark-700 px-2 py-0.5 rounded-lg">
              <span className="text-slate-400">Distance: </span><strong className="text-blue-400">{historyData.stats.totalDistanceKm} km</strong>
            </span>
            <span className="bg-dark-900 border border-dark-700 px-2 py-0.5 rounded-lg">
              <span className="text-slate-400">Duration: </span><strong className="text-slate-200">{historyData.stats.durationMinutes} min</strong>
            </span>
            <span className="bg-dark-900 border border-dark-700 px-2 py-0.5 rounded-lg">
              <span className="text-slate-400">Max Speed: </span><strong className="text-amber-400">{historyData.stats.maxSpeedKm} km/h</strong>
            </span>
            <span className="bg-dark-900 border border-dark-700 px-2 py-0.5 rounded-lg">
              <span className="text-slate-400">Points: </span><strong className="text-emerald-400">{historyData.stats.pointCount}</strong>
            </span>
            <span className="bg-dark-900 border border-dark-700 px-2 py-0.5 rounded-lg">
              <span className="text-slate-400">Stops: </span><strong className="text-rose-400">{historyData.stats.stopCount}</strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Main Content: Map + optional Timeline panel ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Map */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-30 bg-dark-900/70 flex items-center justify-center">
              <div className="text-slate-300 text-sm font-semibold animate-pulse">Loading route history...</div>
            </div>
          )}

          {points.length === 0 && !loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="text-center space-y-2">
                <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-slate-500 text-sm">No location data for this filter.</p>
                <p className="text-slate-600 text-xs">Start streaming GPS from the Mobile Tracker, then check back here.</p>
              </div>
            </div>
          )}

          <RouteReplayMap points={points} currentPointIndex={currentIndex} />

          {/* Playback controls */}
          {points.length > 0 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-[92%] max-w-3xl glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl space-y-3">
              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                  <span>{currentPoint ? formatDateTime(currentPoint.recordedAt) : '--'}</span>
                  <span className="text-slate-500">
                    Point {currentIndex + 1}/{points.length} · {Math.round(currentPoint?.speed || 0)} km/h · Bat {currentPoint?.battery ?? '--'}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={points.length - 1}
                  value={currentIndex}
                  onChange={e => {
                    setCurrentIndex(Number(e.target.value));
                    const el = document.getElementById(`tl-point-${Number(e.target.value)}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                  className="w-full h-2 bg-dark-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 transition"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={() => { setIsPlaying(false); setCurrentIndex(0); }}
                    className="p-2.5 rounded-xl bg-dark-900 hover:bg-dark-700 text-slate-300 border border-dark-700 transition"
                    title="Reset to Start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-dark-900 p-1 rounded-xl border border-dark-700 text-xs">
                  {[1, 2, 5, 10].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-3 py-1 font-bold rounded-lg transition ${
                        playbackSpeed === spd ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Point-in-Time Query Card */}
          <div className="absolute top-4 right-4 z-20 w-72 glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-700/60 pb-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Where was it at...?</span>
            </div>

            <div className="space-y-2">
              <input
                type="date"
                value={queryDate}
                onChange={e => setQueryDate(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={queryTime}
                  onChange={e => setQueryTime(e.target.value)}
                  className="flex-1 bg-dark-900 border border-dark-600 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="HH:MM"
                />
                <button
                  onClick={handleQueryAtTime}
                  disabled={queryLoading || !queryTime}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
                >
                  {queryLoading ? '...' : 'Find'}
                </button>
              </div>
            </div>

            {queryResult && (
              <div className="bg-dark-900/90 p-3 rounded-xl border border-emerald-500/30 text-xs space-y-1.5 text-slate-300">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" /> Nearest match found
                </div>
                <div>🕐 <strong className="text-white">{formatTime(queryResult.closestPoint.recordedAt)}</strong></div>
                <div>📍 <span className="font-mono text-white">{queryResult.closestPoint.latitude.toFixed(5)}, {queryResult.closestPoint.longitude.toFixed(5)}</span></div>
                <div>🚗 <strong className="text-blue-400">{Math.round(queryResult.closestPoint.speed)} km/h</strong></div>
                <div>🔋 <strong className="text-emerald-400">{queryResult.closestPoint.battery}%</strong></div>
                {queryResult.timeDifferenceSeconds > 0 && (
                  <div className="text-slate-500 text-[10px]">
                    ≈ {queryResult.timeDifferenceSeconds}s from requested time
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Timeline Panel (slide in from right) ── */}
        {showTimeline && (
          <div className="w-80 shrink-0 bg-dark-800 border-l border-dark-700 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-dark-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Location Timeline ({points.length} points)
              </h3>
              <button onClick={() => setShowTimeline(false)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
            </div>

            <div ref={timelineRef} className="flex-1 overflow-y-auto p-2 space-y-1">
              {points.length === 0 && (
                <p className="text-slate-500 text-xs text-center p-4">No points to display</p>
              )}
              {points.map((pt, i) => {
                const isActive = i === currentIndex;
                return (
                  <div
                    key={pt.id}
                    id={`tl-point-${i}`}
                    onClick={() => setCurrentIndex(i)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all border text-xs ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500/50 shadow-md'
                        : 'bg-dark-900/40 border-dark-700/40 hover:bg-dark-700/50 hover:border-dark-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono font-bold text-[11px] ${isActive ? 'text-blue-300' : 'text-slate-300'}`}>
                        {formatTime(pt.recordedAt)}
                      </span>
                      {isActive && <ChevronRight className="w-3 h-3 text-blue-400" />}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Gauge className="w-3 h-3 text-blue-400" /> {Math.round(pt.speed)} km/h
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Battery className={`w-3 h-3 ${pt.battery < 20 ? 'text-rose-400' : 'text-emerald-400'}`} /> {pt.battery}%
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" /> ±{pt.accuracy}m
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-600 font-mono mt-0.5">
                      {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
