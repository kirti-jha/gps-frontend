import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Tracker, Geofence } from '../types';

// Custom Map Centering Helper
const MapController: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center[0], center[1], zoom]);
  return null;
};

// Create SVG vehicle / tracker marker icon with heading rotation & pulse
function createTrackerIcon(tracker: Tracker, isSelected: boolean) {
  const color = tracker.trackingStatus === 'ONLINE' ? '#10B981' : tracker.trackingStatus === 'IDLE' ? '#F59E0B' : '#64748B';
  const heading = tracker.lastHeading || 0;

  const svg = `
    <div style="position: relative; width: 44px; height: 44px; display: flex; items-center; justify-content: center;">
      ${tracker.trackingStatus === 'ONLINE' ? `<div style="position: absolute; inset: 0; border-radius: 50%; background: ${color}; opacity: 0.35; animation: pulse-ring 2s infinite;"></div>` : ''}
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #111827;
        border: 2px solid ${isSelected ? '#3B82F6' : color};
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(${isSelected ? 1.15 : 1});
        transition: all 0.2s ease;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${heading}deg); transition: transform 0.3s ease;">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-tracker-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
}

interface LiveMapProps {
  trackers: Tracker[];
  selectedTrackerId: string | null;
  onSelectTracker: (id: string) => void;
  geofences: Geofence[];
}

export const LiveMap: React.FC<LiveMapProps> = ({
  trackers,
  selectedTrackerId,
  onSelectTracker,
  geofences
}) => {
  const selectedTracker = trackers.find(t => t.id === selectedTrackerId);

  const defaultCenter: [number, number] = selectedTracker
    ? [selectedTracker.lastLatitude, selectedTracker.lastLongitude]
    : trackers.length > 0
    ? [trackers[0].lastLatitude, trackers[0].lastLongitude]
    : [28.6139, 77.2090]; // Delhi NCR default center

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="w-full h-full dark-tiles"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {selectedTracker && (
          <MapController center={[selectedTracker.lastLatitude, selectedTracker.lastLongitude]} />
        )}

        {/* Render Geofences */}
        {geofences.map(gf => {
          if (gf.type === 'CIRCLE') {
            const circle = gf.coordinates as any;
            return (
              <Circle
                key={gf.id}
                center={[circle.center.lat, circle.center.lng]}
                radius={circle.radius}
                pathOptions={{
                  color: gf.color || '#3B82F6',
                  fillColor: gf.color || '#3B82F6',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '6, 6'
                }}
              />
            );
          } else if (gf.type === 'POLYGON') {
            const poly = gf.coordinates as any;
            const positions = poly.points.map((p: any) => [p.lat, p.lng] as [number, number]);
            return (
              <Polygon
                key={gf.id}
                positions={positions}
                pathOptions={{
                  color: gf.color || '#3B82F6',
                  fillColor: gf.color || '#3B82F6',
                  fillOpacity: 0.15,
                  weight: 2
                }}
              />
            );
          }
          return null;
        })}

        {/* Selected Tracker Accuracy Circle Overlay */}
        {selectedTracker && (
          <Circle
            center={[selectedTracker.lastLatitude, selectedTracker.lastLongitude]}
            radius={selectedTracker.lastAccuracy || 10}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              weight: 1
            }}
          />
        )}

        {/* Render Trackers */}
        {trackers.map(tracker => {
          const isSelected = tracker.id === selectedTrackerId;
          return (
            <Marker
              key={tracker.id}
              position={[tracker.lastLatitude, tracker.lastLongitude]}
              icon={createTrackerIcon(tracker, isSelected)}
              eventHandlers={{
                click: () => onSelectTracker(tracker.id)
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 text-xs space-y-1 text-slate-800 font-sans">
                  <div className="font-bold text-sm text-slate-900">{tracker.deviceName}</div>
                  <div className="font-mono text-[10px] text-blue-600 font-semibold">{tracker.trackerCode}</div>
                  <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-1">
                    <span>Speed: <strong>{Math.round(tracker.lastSpeed)} km/h</strong></span>
                    <span>Battery: <strong>{tracker.batteryLevel}%</strong></span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Accuracy: ±{tracker.lastAccuracy}m | Last seen: {new Date(tracker.lastSeen).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
