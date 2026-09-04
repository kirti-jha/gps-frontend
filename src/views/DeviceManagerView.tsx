import React, { useState } from 'react';
import { Smartphone, Plus, QrCode, Shield, CheckCircle, RefreshCw, Battery, Radio, Trash2, AlertTriangle, X } from 'lucide-react';
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

  // Remove device state & confirmation popup
  const [deviceToRemove, setDeviceToRemove] = useState<Tracker | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleConfirmDelete = async () => {
    if (!deviceToRemove) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await apiRequest(`/trackers/${deviceToRemove.id}`, { method: 'DELETE' });
      setDeviceToRemove(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to remove tracker device:', err);
      setDeleteError(err.message || 'Failed to remove device. Please try again.');
    } finally {
      setIsDeleting(false);
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
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                  tracker.trackingStatus === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  tracker.trackingStatus === 'IDLE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}>
                  {tracker.trackingStatus}
                </span>

                {/* Trash / Delete Button */}
                <button
                  onClick={() => setDeviceToRemove(tracker)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition"
                  title="Remove Device"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-dark-900/60 p-3 rounded-xl border border-dark-700/50 text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Platform OS:</span>
                <span className="font-semibold">{tracker.platform}</span>
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

      {/* Registration Modal */}
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
                    placeholder="e.g. Apple iPhone (Kirti - Asset #1)"
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
                    <option value="iOS">iOS (Apple iPhone)</option>
                    <option value="Android">Android</option>
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
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
                  >
                    Generate Tracker
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Device Identity Registered Successfully!
                  </div>
                  <div>Device: <strong>{newTracker.deviceName}</strong></div>
                  <div>Code: <strong className="font-mono">{newTracker.trackerCode}</strong></div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Device API Key (Device Secret)</label>
                  <div className="p-3 bg-dark-950 border border-dark-700 rounded-xl font-mono text-cyan-300 text-[11px] break-all select-all">
                    {(newTracker as any).apiKey}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Save this API key into the mobile device app settings. It will not be shown again.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Removing Device */}
      {deviceToRemove && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-dark-900 border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setDeviceToRemove(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-dark-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Remove Tracker Device?</h3>
                <p className="text-xs text-rose-400 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-dark-950 border border-dark-700 rounded-xl text-xs text-slate-300 space-y-2">
              <p>
                Are you sure you want to remove <strong className="text-white">{deviceToRemove.deviceName}</strong> (<span className="font-mono text-cyan-400">{deviceToRemove.trackerCode}</span>)?
              </p>
              <ul className="list-disc pl-4 text-[11px] text-slate-400 space-y-1">
                <li>Device pairing and API keys will be deleted.</li>
                <li>Location telemetry from this mobile phone will stop.</li>
              </ul>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeviceToRemove(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Removing...' : 'Yes, Remove Device'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
