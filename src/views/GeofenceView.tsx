import React, { useState } from 'react';
import { Layers, Plus, Trash2, ShieldCheck, MapPin } from 'lucide-react';
import { Geofence } from '../types';
import { apiRequest } from '../services/api';

interface GeofenceViewProps {
  geofences: Geofence[];
  onRefresh: () => void;
}

export const GeofenceView: React.FC<GeofenceViewProps> = ({ geofences, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'CIRCLE' | 'POLYGON'>('CIRCLE');
  const [radius, setRadius] = useState(1000);
  const [centerLat, setCenterLat] = useState(28.6139);
  const [centerLng, setCenterLng] = useState(77.2090);
  const [color, setColor] = useState('#3B82F6');
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const coordinates = type === 'CIRCLE'
        ? { center: { lat: centerLat, lng: centerLng }, radius }
        : {
            points: [
              { lat: centerLat - 0.01, lng: centerLng - 0.01 },
              { lat: centerLat + 0.01, lng: centerLng - 0.01 },
              { lat: centerLat + 0.01, lng: centerLng + 0.01 },
              { lat: centerLat - 0.01, lng: centerLng + 0.01 }
            ]
          };

      await apiRequest('/geofences', {
        method: 'POST',
        body: JSON.stringify({
          name,
          type,
          coordinates,
          color,
          description
        })
      });

      setShowModal(false);
      setName('');
      onRefresh();
    } catch (err) {
      console.error('Failed to create geofence:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/geofences/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      console.error('Failed to delete geofence:', err);
    }
  };

  return (
    <div className="w-full h-full p-6 bg-dark-900 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Geofence Zones ({geofences.length})</h1>
          <p className="text-xs text-slate-400">
            Define virtual perimeters on map. Automated alerts trigger when trackers enter or exit.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Geofence Zone</span>
        </button>
      </div>

      {/* Geofence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {geofences.map(gf => (
          <div
            key={gf.id}
            className="bg-dark-800 border border-dark-700 p-5 rounded-2xl space-y-3 relative group hover:border-blue-500/40 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-inner"
                  style={{ backgroundColor: `${gf.color}25`, border: `1px solid ${gf.color}` }}
                >
                  <Layers className="w-5 h-5" style={{ color: gf.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{gf.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-dark-900 border border-dark-600 rounded text-slate-300">
                    {gf.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(gf.id)}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-dark-700 transition"
                title="Delete Geofence"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">{gf.description || 'No description provided.'}</p>

            <div className="bg-dark-900/60 p-2.5 rounded-xl border border-dark-700/50 text-[11px] text-slate-300 font-mono space-y-0.5">
              {gf.type === 'CIRCLE' ? (
                <>
                  <div>Center: {(gf.coordinates as any).center.lat.toFixed(4)}, {(gf.coordinates as any).center.lng.toFixed(4)}</div>
                  <div>Radius: {(gf.coordinates as any).radius} meters</div>
                </>
              ) : (
                <div>Polygon Vertices: {(gf.coordinates as any).points?.length || 4} coordinate points</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Geofence Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">New Geofence Zone</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Connaught Place Office"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="CIRCLE">Circle (Center + Radius)</option>
                  <option value="POLYGON">Polygon Area</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Center Lat</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={centerLat}
                    onChange={e => setCenterLat(Number(e.target.value))}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Center Lng</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={centerLng}
                    onChange={e => setCenterLng(Number(e.target.value))}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              {type === 'CIRCLE' && (
                <div>
                  <label className="block text-slate-400 mb-1">Radius (meters)</label>
                  <input
                    type="number"
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Optional note"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
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
                Save Geofence
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
