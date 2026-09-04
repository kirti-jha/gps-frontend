import { getDistanceKm, getNearbyMetroStations, MetroStation } from './metroStations';

export type TransitMode = 'bike' | 'metro' | 'bus' | 'car';

export interface RouteOption {
  id: TransitMode;
  title: string;
  modeLabel: string;
  iconName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  distanceKm: number;
  durationMinutes: number;
  costEstimate: string;
  summary: string;
  steps: string[];
  polylineCoords: [number, number][];
  googleMapsUrl: string;
  metroDetails?: {
    originStation: MetroStation;
    destStation: MetroStation;
    totalStations: number;
    interchange?: string;
  };
  busDetails?: {
    busNumber: string;
    originBusStop: string;
    destBusStop: string;
    totalStops: number;
  };
}

export function calculateWaysToReach(
  origin: { lat: number; lng: number; label?: string },
  dest: { lat: number; lng: number; label?: string }
): Record<TransitMode, RouteOption> {
  const dist = getDistanceKm(origin.lat, origin.lng, dest.lat, dest.lng);
  const roundedDist = Number(dist.toFixed(1));

  const generatePolyline = (curvedFactor: number = 0, waypointsCount: number = 5): [number, number][] => {
    const coords: [number, number][] = [];
    for (let i = 0; i <= waypointsCount; i++) {
      const t = i / waypointsCount;
      const lat = origin.lat + (dest.lat - origin.lat) * t + Math.sin(t * Math.PI) * curvedFactor * 0.005;
      const lng = origin.lng + (dest.lng - origin.lng) * t + Math.cos(t * Math.PI) * curvedFactor * 0.005;
      coords.push([lat, lng]);
    }
    return coords;
  };

  const originMetro = getNearbyMetroStations(origin.lat, origin.lng, 1)[0];
  const destMetro = getNearbyMetroStations(dest.lat, dest.lng, 1)[0];
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&travelmode=driving`;

  const bikeDuration = Math.max(3, Math.round(dist * 2.2 + 2));
  const bikeRoute: RouteOption = {
    id: 'bike',
    title: 'Motorcycle / Bike Route',
    modeLabel: 'Bike 🏍️',
    iconName: 'Bike',
    color: '#10B981',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeText: 'Fastest in Traffic',
    distanceKm: roundedDist,
    durationMinutes: bikeDuration,
    costEstimate: `~₹${Math.max(10, Math.round(dist * 3.5))} (Fuel)`,
    summary: 'Fastest 2-wheeler route via city arterial roads with low traffic delay.',
    steps: [
      `Start at origin (${origin.label || 'Current Position'})`,
      `Ride via main arterial road (${(dist * 0.4).toFixed(1)} km)`,
      `Merge on fast lane towards destination zone (${(dist * 0.4).toFixed(1)} km)`,
      `Arrive at target asset location (${dest.label || 'Target Asset'})`
    ],
    polylineCoords: generatePolyline(1, 6),
    googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&travelmode=bicycling`
  };

  const metroStationsCount = Math.max(3, Math.round(dist * 1.5 + 2));
  const metroDuration = Math.max(10, Math.round(dist * 2.5 + 8));
  const metroRoute: RouteOption = {
    id: 'metro',
    title: 'Metro Rapid Transit',
    modeLabel: 'Metro 🚇',
    iconName: 'Train',
    color: '#8B5CF6',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    badgeText: 'Eco & Traffic-Free',
    distanceKm: Number((dist * 1.15).toFixed(1)),
    durationMinutes: metroDuration,
    costEstimate: `₹${Math.min(60, Math.max(20, Math.round(dist * 4 + 10)))}`,
    summary: `Board at ${originMetro.name} (${originMetro.lineName}) and exit at ${destMetro.name}.`,
    steps: [
      `Walk / Auto to ${originMetro.name} (${originMetro.distanceKm} km away)`,
      `Board train on ${originMetro.lineName} (${metroStationsCount} stations, ~${Math.round(dist * 2)} mins)`,
      `Exit at ${destMetro.name}`,
      `Walk ${destMetro.distanceKm} km to target asset (${dest.label || 'Destination'})`
    ],
    polylineCoords: [
      [origin.lat, origin.lng],
      [originMetro.lat, originMetro.lng],
      ...generatePolyline(2, 4),
      [destMetro.lat, destMetro.lng],
      [dest.lat, dest.lng]
    ],
    googleMapsUrl,
    metroDetails: {
      originStation: originMetro,
      destStation: destMetro,
      totalStations: metroStationsCount,
      interchange: originMetro.lineName !== destMetro.lineName ? 'Interchange at Central Station' : undefined
    }
  };

  const busDuration = Math.max(15, Math.round(dist * 3.8 + 10));
  const busNumber = `Bus #${Math.floor(100 + Math.random() * 850)}`;
  const busRoute: RouteOption = {
    id: 'bus',
    title: 'City Bus Transit',
    modeLabel: 'Bus 🚌',
    iconName: 'Bus',
    color: '#F59E0B',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    badgeText: 'Most Budget Friendly',
    distanceKm: Number((dist * 1.2).toFixed(1)),
    durationMinutes: busDuration,
    costEstimate: `₹${Math.min(30, Math.max(10, Math.round(dist * 2.5 + 5)))}`,
    summary: `Take ${busNumber} from nearest Bus Stop directly to destination sector.`,
    steps: [
      `Walk 200m to nearest Bus Stop (${origin.label || 'Origin'})`,
      `Board ${busNumber} (Departs every 8 mins)`,
      `Transit 6 stops (${(dist * 1.1).toFixed(1)} km, ~${busDuration - 8} mins)`,
      `Alight at Destination Bus Stand and walk 150m to asset`
    ],
    polylineCoords: generatePolyline(-1.5, 7),
    googleMapsUrl,
    busDetails: {
      busNumber,
      originBusStop: `${origin.label || 'Origin'} Main Stop`,
      destBusStop: `${dest.label || 'Target'} Gate Stop`,
      totalStops: Math.max(4, Math.round(dist * 1.8))
    }
  };

  const carDuration = Math.max(5, Math.round(dist * 2.8 + 3));
  const carRoute: RouteOption = {
    id: 'car',
    title: 'Car / Driving Route',
    modeLabel: 'Car 🚗',
    iconName: 'Car',
    color: '#3B82F6',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    badgeText: 'Comfort & Cab',
    distanceKm: roundedDist,
    durationMinutes: carDuration,
    costEstimate: `~₹${Math.max(50, Math.round(dist * 18))} (Cab/Fuel)`,
    summary: 'Standard driving route with live traffic condition estimate.',
    steps: [
      `Start at origin location (${origin.label || 'Current Position'})`,
      `Drive via Ring Road / Main Highway (${(dist * 0.7).toFixed(1)} km)`,
      `Take Exit towards destination area (${(dist * 0.3).toFixed(1)} km)`,
      `Arrive at destination (${dest.label || 'Target Location'})`
    ],
    polylineCoords: generatePolyline(0.5, 5),
    googleMapsUrl
  };

  return {
    bike: bikeRoute,
    metro: metroRoute,
    bus: busRoute,
    car: carRoute
  };
}
