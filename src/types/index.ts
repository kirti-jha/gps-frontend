export type TrackingStatus = 'ONLINE' | 'IDLE' | 'OFFLINE';

export interface ProximitySnapshot {
  trackerId: string;
  deviceName: string;
  trackerCode: string;
  distanceKm: number;
  trackingStatus?: TrackingStatus;
}

// GeoJSON LineString returned by GET /api/v1/route
export interface RouteGeoJSON {
  type: 'LineString' | 'FeatureCollection';
  coordinates?: [number, number][]; // [lng, lat] pairs (GeoJSON spec)
  features?: Array<{
    type: 'Feature';
    geometry: { type: 'LineString'; coordinates: [number, number][] };
  }>;
}

export interface Tracker {
  id: string;
  trackerCode: string;
  organizationId: string;
  deviceName: string;
  platform: 'Android' | 'iOS' | 'Web Simulator';
  batteryLevel: number;
  trackingStatus: TrackingStatus;
  lastLatitude: number;
  lastLongitude: number;
  lastSpeed: number;
  lastHeading: number;
  lastAccuracy: number;
  lastSeen: string;
  createdAt: string;
  proximitySnapshot?: ProximitySnapshot[];
}

export interface LocationPoint {
  id: string;
  trackerId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  heading: number;
  altitude: number;
  battery: number;
  recordedAt: string;
  createdAt: string;
}

export interface Geofence {
  id: string;
  organizationId: string;
  name: string;
  type: 'CIRCLE' | 'POLYGON';
  coordinates: any;
  color: string;
  description?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  organizationId: string;
  trackerId: string;
  trackerCode: string;
  trackerName: string;
  type: 'GEOFENCE_ENTER' | 'GEOFENCE_EXIT' | 'OVERSPEED' | 'LOW_BATTERY' | 'OFFLINE';
  message: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

export interface RouteHistoryResponse {
  tracker: {
    id: string;
    trackerCode: string;
    deviceName: string;
  };
  stats: {
    totalDistanceKm: number;
    durationMinutes: number;
    maxSpeedKm: number;
    avgSpeedKm: number;
    pointCount: number;
    stopCount: number;
  };
  points: LocationPoint[];
}

export interface FleetSummary {
  totalTrackers: number;
  onlineCount: number;
  idleCount: number;
  offlineCount: number;
  movingCount: number;
  stoppedCount: number;
  fleetDistanceTodayKm: number;
  totalAlerts: number;
  unreadAlertsCount: number;
  totalGeofences: number;
}

export interface Trip {
  id: string;
  trackerId: string;
  startTime: string;
  endTime: string;
  startLocation: { lat: number; lng: number; address?: string };
  endLocation: { lat: number; lng: number; address?: string };
  distanceKm: number;
  durationMinutes: number;
  maxSpeedKm: number;
  avgSpeedKm: number;
  stopCount: number;
  points?: LocationPoint[];
}
