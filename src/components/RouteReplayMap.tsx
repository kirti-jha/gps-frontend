import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationPoint } from '../types';

const MapFitter: React.FC<{ points: LocationPoint[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(p => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [points]);
  return null;
};

// Create custom icons for Start Pin, End Pin, Stop Pin, and Active Playback Marker
const startIcon = L.divIcon({
  html: `<div style="width: 28px; height: 28px; border-radius: 50%; background: #10B981; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 11px;">A</div>`,
  className: 'route-pin-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const endIcon = L.divIcon({
  html: `<div style="width: 28px; height: 28px; border-radius: 50%; background: #EF4444; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 11px;">B</div>`,
  className: 'route-pin-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

function createReplayVehicleIcon(heading: number) {
  return L.divIcon({
    html: `
      <div style="width: 40px; height: 40px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(37,99,235,0.8); display: flex; align-items: center; justify-content: center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${heading}deg);">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      </div>
    `,
    className: 'replay-vehicle-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

interface RouteReplayMapProps {
  points: LocationPoint[];
  currentPointIndex: number;
}

export const RouteReplayMap: React.FC<RouteReplayMapProps> = ({ points, currentPointIndex }) => {
  if (points.length === 0) {
    return (
      <div className="w-full h-full bg-dark-900 flex items-center justify-center text-slate-500 text-sm">
        Select a date & tracker to load route history
      </div>
    );
  }

  const polylinePositions = points.map(p => [p.latitude, p.longitude] as [number, number]);
  const activePoint = points[Math.min(currentPointIndex, points.length - 1)];
  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[startPoint.latitude, startPoint.longitude]}
        zoom={13}
        className="w-full h-full dark-tiles"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        <MapFitter points={points} />

        {/* Historical Route Line */}
        <Polyline
          positions={polylinePositions}
          pathOptions={{
            color: '#3B82F6',
            weight: 5,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />

        {/* Start Point Pin */}
        <Marker position={[startPoint.latitude, startPoint.longitude]} icon={startIcon}>
          <Popup className="custom-popup">
            <div className="p-1 text-xs">
              <strong className="text-emerald-600">Trip Start Location</strong>
              <div>Time: {new Date(startPoint.recordedAt).toLocaleTimeString()}</div>
            </div>
          </Popup>
        </Marker>

        {/* End Point Pin */}
        <Marker position={[endPoint.latitude, endPoint.longitude]} icon={endIcon}>
          <Popup className="custom-popup">
            <div className="p-1 text-xs">
              <strong className="text-rose-600">Trip End Location</strong>
              <div>Time: {new Date(endPoint.recordedAt).toLocaleTimeString()}</div>
            </div>
          </Popup>
        </Marker>

        {/* Active Animated Playback Marker */}
        {activePoint && (
          <Marker
            position={[activePoint.latitude, activePoint.longitude]}
            icon={createReplayVehicleIcon(activePoint.heading || 0)}
          >
            <Popup className="custom-popup" autoPan={false}>
              <div className="p-1 text-xs space-y-0.5 text-slate-800">
                <div className="font-bold">Playback Telemetry</div>
                <div>Speed: {Math.round(activePoint.speed)} km/h</div>
                
                <div>Recorded: {new Date(activePoint.recordedAt).toLocaleTimeString()}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
