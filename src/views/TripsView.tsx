import React, { useState, useEffect } from 'react';
import { Route, Clock, Gauge, MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { RouteReplayMap } from '../components/RouteReplayMap';
import { apiRequest } from '../services/api';
import { Tracker, Trip } from '../types';

interface TripsViewProps {
  trackers: Tracker[];
}

export const TripsView: React.FC<TripsViewProps> = ({ trackers }) => {
  const [selectedTrackerId, setSelectedTrackerId] = useState<string>(trackers[0]?.id || '');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trackers.length > 0 && !selectedTrackerId) {
      setSelectedTrackerId(trackers[0].id);
    }
  }, [trackers]);

  useEffect(() => {
    async function loadTrips() {
      if (!selectedTrackerId) return;
      setLoading(true);
      try {
        const data = await apiRequest<Trip[]>(`/trips/${selectedTrackerId}`);
        setTrips(data);
        if (data.length > 0) {
          setSelectedTripId(data[0].id);
        } else {
          setSelectedTripId(null);
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, [selectedTrackerId]);

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="w-full h-full flex relative overflow-hidden bg-dark-900">
      {/* Left Sidebar: Trips List & Tracker Selector */}
      <div className="w-96 bg-dark-800 border-r border-dark-700 flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-dark-700 space-y-3">
          <h2 className="text-base font-bold text-slate-100">Automated Trips & Journeys</h2>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Select Tracker Asset</label>
            <select
              value={selectedTrackerId}
              onChange={e => setSelectedTrackerId(e.target.value)}
              className="bg-dark-900 border border-dark-600 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              {trackers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.deviceName} ({t.trackerCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trips List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {trips.map((trip, idx) => {
            const isSelected = trip.id === selectedTripId;
            return (
              <div
                key={trip.id}
                onClick={() => setSelectedTripId(trip.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-md'
                    : 'bg-dark-900/60 border-dark-700/60 hover:bg-dark-700/40 hover:border-dark-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Trip #{idx + 1}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ➔ {new Date(trip.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{trip.startLocation.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{trip.endLocation.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400 mt-3 pt-2 border-t border-dark-700/50">
                  <div>
                    <div>DISTANCE</div>
                    <div className="font-extrabold text-blue-400 text-xs">{trip.distanceKm} km</div>
                  </div>
                  <div>
                    <div>DURATION</div>
                    <div className="font-extrabold text-slate-200 text-xs">{trip.durationMinutes}m</div>
                  </div>
                  <div>
                    <div>MAX SPEED</div>
                    <div className="font-extrabold text-amber-400 text-xs">{trip.maxSpeedKm} km/h</div>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && trips.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs bg-dark-900/40 rounded-xl border border-dark-700">
              No completed trips detected for this tracker today.
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Trip Route Map & Telemetry Card */}
      <div className="flex-1 relative">
        <RouteReplayMap points={selectedTrip?.points || []} currentPointIndex={0} />

        {selectedTrip && (
          <div className="absolute top-6 left-6 z-20 w-96 glass-panel p-5 rounded-2xl border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <h3 className="font-extrabold text-sm text-white">Trip Segment Details</h3>
              <span className="text-xs font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {selectedTrip.distanceKm} KM
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-dark-900/80 p-2.5 rounded-xl border border-dark-700 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">START LOCATION & TIME</div>
                <div className="font-semibold text-emerald-400">{selectedTrip.startLocation.address}</div>
                <div className="text-[10px] text-slate-400">{new Date(selectedTrip.startTime).toLocaleString()}</div>
              </div>

              <div className="bg-dark-900/80 p-2.5 rounded-xl border border-dark-700 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">DESTINATION & END TIME</div>
                <div className="font-semibold text-rose-400">{selectedTrip.endLocation.address}</div>
                <div className="text-[10px] text-slate-400">{new Date(selectedTrip.endTime).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-dark-900/80 p-2 rounded-xl border border-dark-700">
                <div className="text-[10px] text-slate-400">AVG SPEED</div>
                <div className="font-bold text-sm text-slate-200">{selectedTrip.avgSpeedKm} <span className="text-[10px]">km/h</span></div>
              </div>
              <div className="bg-dark-900/80 p-2 rounded-xl border border-dark-700">
                <div className="text-[10px] text-slate-400">MAX SPEED</div>
                <div className="font-bold text-sm text-amber-400">{selectedTrip.maxSpeedKm} <span className="text-[10px]">km/h</span></div>
              </div>
              <div className="bg-dark-900/80 p-2 rounded-xl border border-dark-700">
                <div className="text-[10px] text-slate-400">STOPS</div>
                <div className="font-bold text-sm text-rose-400">{selectedTrip.stopCount}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
