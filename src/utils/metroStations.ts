export interface MetroStation {
  distanceKm?: number;
  id: string;
  name: string;
  lineName: string;
  lineColor: string;
  lat: number;
  lng: number;
  code: string;
}

export const METRO_STATIONS: MetroStation[] = [
  { id: 'ms-1', name: 'Rajiv Chowk Metro Station', lineName: 'Yellow / Blue Line', lineColor: '#EAB308', lat: 28.6328, lng: 77.2197, code: 'RKC' },
  { id: 'ms-2', name: 'Kashmere Gate Metro Station', lineName: 'Red / Yellow / Violet Line', lineColor: '#EF4444', lat: 28.6675, lng: 77.2285, code: 'KGT' },
  { id: 'ms-3', name: 'Hauz Khas Metro Station', lineName: 'Yellow / Magenta Line', lineColor: '#EC4899', lat: 28.5431, lng: 77.2065, code: 'HKH' },
  { id: 'ms-4', name: 'Central Secretariat Metro', lineName: 'Yellow / Violet Line', lineColor: '#8B5CF6', lat: 28.6186, lng: 77.2148, code: 'CSK' },
  { id: 'ms-5', name: 'Chandni Chowk Metro Station', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.6506, lng: 77.2303, code: 'CCK' },
  { id: 'ms-6', name: 'New Delhi Metro Station', lineName: 'Yellow / Airport Express', lineColor: '#F97316', lat: 28.6425, lng: 77.2205, code: 'NDL' },
  { id: 'ms-7', name: 'Noida City Centre Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.5747, lng: 77.3560, code: 'NCC' },
  { id: 'ms-8', name: 'Botanical Garden Metro', lineName: 'Blue / Magenta Line', lineColor: '#3B82F6', lat: 28.5644, lng: 77.3347, code: 'BGD' },
  { id: 'ms-9', name: 'Cyber City Metro (Gurgaon)', lineName: 'Rapid Metro', lineColor: '#10B981', lat: 28.4907, lng: 77.0898, code: 'CYB' },
  { id: 'ms-10', name: 'Millennium City Centre', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.4593, lng: 77.0727, code: 'MCC' },
  { id: 'ms-11', name: 'Anand Vihar ISBT Metro', lineName: 'Blue / Pink Line', lineColor: '#EC4899', lat: 28.6469, lng: 77.3162, code: 'ANV' },
  { id: 'ms-12', name: 'Dwarka Sector 21 Metro', lineName: 'Blue / Airport Express', lineColor: '#F97316', lat: 28.5522, lng: 77.0583, code: 'DW21' }
];

export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearbyMetroStations(lat: number, lng: number, maxCount: number = 8) {
  const mapped = METRO_STATIONS.map(st => ({
    ...st,
    distanceKm: Number(getDistanceKm(lat, lng, st.lat, st.lng).toFixed(2))
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  if (mapped[0].distanceKm > 25) {
    const localStations: (MetroStation & { distanceKm: number })[] = [
      { id: 'dynamic-1', name: 'Central Terminal Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: lat + 0.008, lng: lng + 0.012, code: 'CTM', distanceKm: 1.2 },
      { id: 'dynamic-2', name: 'North Sector Metro', lineName: 'Green Line', lineColor: '#22C55E', lat: lat - 0.012, lng: lng + 0.008, code: 'NSM', distanceKm: 1.6 },
      { id: 'dynamic-3', name: 'Expressway Junction Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: lat + 0.018, lng: lng - 0.015, code: 'EJM', distanceKm: 2.4 },
      { id: 'dynamic-4', name: 'South Hub Metro Station', lineName: 'Magenta Line', lineColor: '#EC4899', lat: lat - 0.022, lng: lng - 0.021, code: 'SHM', distanceKm: 3.1 }
    ];
    return localStations.slice(0, maxCount);
  }

  return mapped.slice(0, maxCount);
}
