import React, { useState } from 'react';
import { Smartphone, Plus, QrCode, Shield, CheckCircle, RefreshCw, Battery, Radio } from 'lucide-react';
import { Tracker } from '../types';
import { apiRequest } from '../services/api';

interface DeviceManagerViewProps {
  trackers: Tracker[];
  onRefresh: () => void;
}


function detectPlatform(): 'Android' | 'iOS' | 'Web Simulator' {
  if (typeof navigator === 'undefined') return 'Android';
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  if (/iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'iOS';
  }
  if (/Android/i.test(ua)) return 'Android';
  return 'Android';
}

export const DeviceManagerView: React.FC<DeviceManagerViewProps> = ({ trackers, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [platform, setPlatform] = useState<'Android' | 'iOS' | 'Web Simulator'>(detectPlatform());
  const [newTracker, setNewTracker] = useState<Tracker | null>(null);

  const handleCreateTracker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<Tracker>('/trackers', {
        method: 'POST',
        body: JSON.stringify({ deviceName, platform })
      });
      setNewTracker(res);
      onRefresh();
    } catch (err) {
      console.error('Failed to register tracker:', err);
    }
  };

  return (
    <div className="w-full h-full p-6 bg-dark-900 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Tracker Devices & Pairing Studio ({trackers.length})</h1>
          <p className="text-xs text-slate-400">
            Each mobile phone acts as a hardware tracker identity. Generate pairing keys and manage telemetry intervals.
          </p>
        </div>
        <button
          onClick={() => {
            setNewTracker(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Mobile Tracker</span>
        </button>
      </div>

      {/* Tracker Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trackers.map(tracker => (
          <div
            key={tracker.id}
            className="bg-dark-800 border border-dark-700 p-5 rounded-2xl space-y-3 relative group hover:border-blue-500/40 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{tracker.deviceName}</h3>
                  <span className="font-mono text-xs text-blue-400 font-bold">{tracker.trackerCode}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                tracker.trackingStatus === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                tracker.trackingStatus === 'IDLE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {tracker.trackingStatus}
              </span>
            </div>

            <div className="bg-dark-900/60 p-3 rounded-xl border border-dark-700/50 text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Platform OS:</span>
                <span className="font-semibold">{tracker.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Battery Level:</span>
                <span className="font-semibold">{tracker.batteryLevel}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telemetry Rate:</span>
                <span className="font-mono text-cyan-400 font-bold">Adaptive (3s - 30s)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono text-right">
              Registered: {new Date(tracker.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">
              {newTracker ? 'Mobile Tracker Generated!' : 'Register Hardware Tracker Identity'}
            </h2>

            {!newTracker ? (
              <form onSubmit={handleCreateTracker} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Device Name / Driver Asset</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samsung Galaxy S24 (Rahul - Van #4)"
                    value={deviceName}
                    onChange={e => setDeviceName(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Platform OS</label>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value as any)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Android">Android</option>
                    <option value="iOS">iOS (Apple iPhone)</option>
                    <option value="Web Simulator">Web Tracker PWA</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-dark-700 text-slate-300 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                  >
                    Generate Tracker Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-dark-900 p-4 rounded-2xl border border-dark-700 space-y-2">
                  <div className="text-xs text-slate-400 font-bold uppercase">PAIRED TRACKER CODE</div>
                  <div className="text-2xl font-mono font-extrabold text-blue-400">{newTracker.trackerCode}</div>
                  <div className="text-[11px] text-slate-400">{newTracker.deviceName}</div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
                  Enter this code into the Mobile Tracker Client app or PWA to pair this phone as hardware.
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
