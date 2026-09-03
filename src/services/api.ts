import { io, Socket } from 'socket.io-client';
import { RouteGeoJSON } from '../types';

export const BACKEND_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://gps-backend-eta.vercel.app');

export const API_BASE = `${BACKEND_URL}/api/v1`;

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('trackx_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'API Request Failed');
  }

  return json.data as T;
}

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(BACKEND_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });
  }
  return socketInstance;
}

/**
 * Fetch the shortest route from the backend (OSRM-backed).
 * Returns Leaflet-compatible [lat, lng][] coordinate pairs.
 * Supports both trackerId-based and explicit point-to-point queries.
 */
export async function fetchShortestRoute(params: {
  trackerId?: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}): Promise<[number, number][]> {
  const query = new URLSearchParams();
  if (params.trackerId) query.set('trackerId', params.trackerId);
  // Pass as userLat/userLng so backend treats it as the user's origin point
  if (params.fromLat !== undefined) query.set('userLat', String(params.fromLat));
  if (params.fromLng !== undefined) query.set('userLng', String(params.fromLng));
  if (params.toLat !== undefined) query.set('toLat', String(params.toLat));
  if (params.toLng !== undefined) query.set('toLng', String(params.toLng));

  const geoJson = await apiRequest<RouteGeoJSON>(`/route?${query.toString()}`);

  // Normalize: extract coordinates from LineString or FeatureCollection
  let coords: [number, number][] = [];
  if (geoJson.type === 'LineString' && geoJson.coordinates) {
    coords = geoJson.coordinates;
  } else if (geoJson.type === 'FeatureCollection' && geoJson.features?.length) {
    coords = geoJson.features[0].geometry.coordinates;
  }

  // GeoJSON uses [lng, lat] — flip to [lat, lng] for Leaflet
  return coords.map(([lng, lat]) => [lat, lng]);
}
