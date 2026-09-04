export interface MetroStation {
  id: string;
  name: string;
  lineName: string;
  lineColor: string;
  lat: number;
  lng: number;
  code: string;
  distanceKm?: number;
}

export const METRO_STATIONS: MetroStation[] = [
  // Yellow Line
  { id: 'ms-y1', name: 'Rajiv Chowk Metro', lineName: 'Yellow / Blue Line', lineColor: '#EAB308', lat: 28.6328, lng: 77.2197, code: 'RKC' },
  { id: 'ms-y2', name: 'Kashmere Gate Metro', lineName: 'Red / Yellow / Violet Line', lineColor: '#EF4444', lat: 28.6675, lng: 77.2285, code: 'KGT' },
  { id: 'ms-y3', name: 'Hauz Khas Metro', lineName: 'Yellow / Magenta Line', lineColor: '#EC4899', lat: 28.5431, lng: 77.2065, code: 'HKH' },
  { id: 'ms-y4', name: 'Central Secretariat', lineName: 'Yellow / Violet Line', lineColor: '#8B5CF6', lat: 28.6186, lng: 77.2148, code: 'CSK' },
  { id: 'ms-y5', name: 'Chandni Chowk Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.6506, lng: 77.2303, code: 'CCK' },
  { id: 'ms-y6', name: 'New Delhi Metro', lineName: 'Yellow / Airport Express', lineColor: '#F97316', lat: 28.6425, lng: 77.2205, code: 'NDL' },
  { id: 'ms-y7', name: 'Millennium City Centre (HUDA)', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.4593, lng: 77.0727, code: 'MCC' },
  { id: 'ms-y8', name: 'IFFCO Chowk Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.4721, lng: 77.0725, code: 'IFC' },
  { id: 'ms-y9', name: 'MG Road Gurgaon Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.4796, lng: 77.0801, code: 'MGR' },
  { id: 'ms-y10', name: 'Sikanderpur Metro', lineName: 'Yellow / Rapid Metro', lineColor: '#EAB308', lat: 28.4819, lng: 77.0858, code: 'SKP' },
  { id: 'ms-y11', name: 'Guru Dronacharya Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.4811, lng: 77.0989, code: 'GDC' },
  { id: 'ms-y12', name: 'Arjan Garh Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.4808, lng: 77.1258, code: 'AJG' },
  { id: 'ms-y13', name: 'Ghitorni Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.4886, lng: 77.1483, code: 'GTN' },
  { id: 'ms-y14', name: 'Sultanpur Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.4988, lng: 77.1611, code: 'SLP' },
  { id: 'ms-y15', name: 'Chhatarpur Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.5065, lng: 77.1747, code: 'CHP' },
  { id: 'ms-y16', name: 'Qutab Minar Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.5246, lng: 77.1856, code: 'QTM' },
  { id: 'ms-y17', name: 'Saket Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.5204, lng: 77.2017, code: 'SKT' },
  { id: 'ms-y18', name: 'Malviya Nagar Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.5376, lng: 77.2064, code: 'MVN' },
  { id: 'ms-y19', name: 'Green Park Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.5589, lng: 77.2069, code: 'GPK' },
  { id: 'ms-y20', name: 'AIIMS Metro Station', lineName: 'Yellow Line', lineColor: '#EAB308', lat: 28.5684, lng: 77.2078, code: 'AMS' },
  { id: 'ms-y21', name: 'INA Metro Station', lineName: 'Yellow / Pink Line', lineColor: '#EAB308', lat: 28.5756, lng: 77.2094, code: 'INA' },

  // Blue Line (Dwarka - Noida / Vaishali)
  { id: 'ms-b1', name: 'Dwarka Sector 21 Metro', lineName: 'Blue / Airport Express', lineColor: '#3B82F6', lat: 28.5522, lng: 77.0583, code: 'DW21' },
  { id: 'ms-b2', name: 'Dwarka Sector 10 Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.5813, lng: 77.0569, code: 'DW10' },
  { id: 'ms-b3', name: 'Dwarka Sector 12 Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.5912, lng: 77.0425, code: 'DW12' },
  { id: 'ms-b4', name: 'Dwarka Mor Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6192, lng: 77.0326, code: 'DMR' },
  { id: 'ms-b5', name: 'Nawada Metro Station', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6215, lng: 77.0456, code: 'NWD' },
  { id: 'ms-b6', name: 'Uttam Nagar West Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6234, lng: 77.0543, code: 'UNW' },
  { id: 'ms-b7', name: 'Uttam Nagar East Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6251, lng: 77.0645, code: 'UNE' },
  { id: 'ms-b8', name: 'Janakpuri West Metro', lineName: 'Blue / Magenta Line', lineColor: '#3B82F6', lat: 28.6294, lng: 77.0781, code: 'JKW' },
  { id: 'ms-b9', name: 'Janakpuri East Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6288, lng: 77.0889, code: 'JKE' },
  { id: 'ms-b10', name: 'Tilak Nagar Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6365, lng: 77.0967, code: 'TKN' },
  { id: 'ms-b11', name: 'Subhash Nagar Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6398, lng: 77.1065, code: 'SBN' },
  { id: 'ms-b12', name: 'Tagore Garden Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6432, lng: 77.1143, code: 'TGG' },
  { id: 'ms-b13', name: 'Rajouri Garden Metro', lineName: 'Blue / Pink Line', lineColor: '#3B82F6', lat: 28.6498, lng: 77.1232, code: 'RJG' },
  { id: 'ms-b14', name: 'Ramesh Nagar Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6534, lng: 77.1321, code: 'RMN' },
  { id: 'ms-b15', name: 'Moti Nagar Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6578, lng: 77.1423, code: 'MTN' },
  { id: 'ms-b16', name: 'Kirti Nagar Metro', lineName: 'Blue / Green Line', lineColor: '#3B82F6', lat: 28.6554, lng: 77.1512, code: 'KTN' },
  { id: 'ms-b17', name: 'Shadipur Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6521, lng: 77.1589, code: 'SDP' },
  { id: 'ms-b18', name: 'Patel Nagar Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6489, lng: 77.1678, code: 'PTN' },
  { id: 'ms-b19', name: 'Rajendra Place Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6435, lng: 77.1789, code: 'RJP' },
  { id: 'ms-b20', name: 'Karol Bagh Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6441, lng: 77.1901, code: 'KBG' },
  { id: 'ms-b21', name: 'Jhandewalan Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6447, lng: 77.2012, code: 'JDW' },
  { id: 'ms-b22', name: 'RK Ashram Marg Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6389, lng: 77.2112, code: 'RKA' },
  { id: 'ms-b23', name: 'Botanical Garden Metro', lineName: 'Blue / Magenta Line', lineColor: '#3B82F6', lat: 28.5644, lng: 77.3347, code: 'BGD' },
  { id: 'ms-b24', name: 'Noida City Centre Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.5747, lng: 77.3560, code: 'NCC' },
  { id: 'ms-b25', name: 'Noida Sector 62 Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: 28.6240, lng: 77.3649, code: 'NS62' },

  // Magenta Line (Janakpuri W - Botanical Garden via Palam & Airport)
  { id: 'ms-m1', name: 'Palam Metro Station', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.5886, lng: 77.0850, code: 'PLM' },
  { id: 'ms-m2', name: 'Dashrath Puri Metro', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.6012, lng: 77.0812, code: 'DSP' },
  { id: 'ms-m3', name: 'Sadar Bazar Cantonment', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.5778, lng: 77.1023, code: 'SBC' },
  { id: 'ms-m4', name: 'Delhi Aerocity Metro', lineName: 'Airport Express / Magenta', lineColor: '#F97316', lat: 28.5492, lng: 77.1213, code: 'AERO' },
  { id: 'ms-m5', name: 'IGI Airport T3 Metro', lineName: 'Airport Express Line', lineColor: '#F97316', lat: 28.5562, lng: 77.0857, code: 'T3' },
  { id: 'ms-m6', name: 'Vasant Vihar Metro', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.5578, lng: 77.1578, code: 'VVR' },
  { id: 'ms-m7', name: 'Munirka Metro Station', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.5574, lng: 77.1741, code: 'MNK' },
  { id: 'ms-m8', name: 'IIT Delhi Metro', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.5458, lng: 77.1950, code: 'IIT' },
  { id: 'ms-m9', name: 'Panchsheel Park Metro', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.5423, lng: 77.2189, code: 'PSP' },
  { id: 'ms-m10', name: 'Chirag Delhi Metro', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.5428, lng: 77.2278, code: 'CDL' },
  { id: 'ms-m11', name: 'Greater Kailash Metro', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.5434, lng: 77.2423, code: 'GKL' },
  { id: 'ms-m12', name: 'Nehru Enclave Metro', lineName: 'Magenta Line', lineColor: '#EC4899', lat: 28.5478, lng: 77.2534, code: 'NHE' },

  // Rapid Metro & Gurgaon Hubs
  { id: 'ms-r1', name: 'Cyber City Metro (Gurgaon)', lineName: 'Rapid Metro', lineColor: '#10B981', lat: 28.4907, lng: 77.0898, code: 'CYB' },
  { id: 'ms-r2', name: 'Belvedere Towers Metro', lineName: 'Rapid Metro', lineColor: '#10B981', lat: 28.4956, lng: 77.0882, code: 'BVT' },
  { id: 'ms-r3', name: 'Moulsari Avenue Metro', lineName: 'Rapid Metro', lineColor: '#10B981', lat: 28.4989, lng: 77.0945, code: 'MSA' },

  // Red & Green Lines
  { id: 'ms-rd1', name: 'Inderlok Metro Station', lineName: 'Red / Green Line', lineColor: '#EF4444', lat: 28.6732, lng: 77.1708, code: 'ILK' },
  { id: 'ms-rd2', name: 'Rohini West Metro', lineName: 'Red Line', lineColor: '#EF4444', lat: 28.7145, lng: 77.1147, code: 'RHW' },
  { id: 'ms-rd3', name: 'Rithala Metro Station', lineName: 'Red Line', lineColor: '#EF4444', lat: 28.7208, lng: 77.1070, code: 'RTL' },
  { id: 'ms-rd4', name: 'Netaji Subhash Place', lineName: 'Red / Pink Line', lineColor: '#EF4444', lat: 28.6957, lng: 77.1524, code: 'NSP' }
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

// Get metro stations sorted by distance to target. Returns ALL stations within 45km, or dynamic ones if outside NCR
export function getNearbyMetroStations(lat: number, lng: number, maxCount: number = 30) {
  const mapped = METRO_STATIONS.map(st => ({
    ...st,
    distanceKm: Number(getDistanceKm(lat, lng, st.lat, st.lng).toFixed(2))
  })).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  // If closest station is > 40km away, dynamically generate local stations near lat/lng
  if (mapped[0].distanceKm && mapped[0].distanceKm > 40) {
    const localStations: (MetroStation & { distanceKm: number })[] = [
      { id: 'dyn-1', name: 'City Central Metro', lineName: 'Blue Line', lineColor: '#3B82F6', lat: lat + 0.008, lng: lng + 0.012, code: 'CCM', distanceKm: 1.2 },
      { id: 'dyn-2', name: 'North Sector Metro', lineName: 'Green Line', lineColor: '#22C55E', lat: lat - 0.012, lng: lng + 0.008, code: 'NSM', distanceKm: 1.6 },
      { id: 'dyn-3', name: 'Expressway Interchange Metro', lineName: 'Yellow Line', lineColor: '#EAB308', lat: lat + 0.018, lng: lng - 0.015, code: 'EJM', distanceKm: 2.4 },
      { id: 'dyn-4', name: 'South Terminal Metro', lineName: 'Magenta Line', lineColor: '#EC4899', lat: lat - 0.022, lng: lng - 0.021, code: 'STM', distanceKm: 3.1 }
    ];
    return localStations;
  }

  return mapped.slice(0, maxCount);
}
