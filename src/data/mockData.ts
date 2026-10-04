import { ChildProfile, GeofenceZone, GPSBreadcrumb } from '../types/tracking';

// Base Anchor Point: Maplewood Park & Oakridge School District (Palo Alto area)
export const DEFAULT_MAP_CENTER = {
  lat: 37.4445,
  lng: -122.1495,
};

export const INITIAL_GEOFENCES: GeofenceZone[] = [
  {
    id: 'zone-school',
    name: 'Oakridge Elementary & Playground',
    type: 'safe',
    shape: 'circle',
    center: { lat: 37.4452, lng: -122.152 },
    radius: 220,
    color: '#10b981', // emerald
    active: true,
    scheduleDescription: 'Mon-Fri 08:00 - 15:30',
    description: 'School campus perimeter, athletic field, and supervised drop-off lane.',
  },
  {
    id: 'zone-home',
    name: 'Home & Sunnyvale Cul-de-sac',
    type: 'safe',
    shape: 'circle',
    center: { lat: 37.4418, lng: -122.1448 },
    radius: 150,
    color: '#06b6d4', // cyan
    active: true,
    scheduleDescription: '24/7 Home Sanctuary',
    description: 'Family residence, front lawn, and neighbor cul-de-sac play zone.',
  },
  {
    id: 'zone-park',
    name: 'Evergreen Community Park',
    type: 'safe',
    shape: 'circle',
    center: { lat: 37.4485, lng: -122.1465 },
    radius: 280,
    color: '#3b82f6', // blue
    active: true,
    scheduleDescription: 'After-school & Weekends',
    description: 'Public community park with swings, duck pond perimeter, and soccer pitch.',
  },
  {
    id: 'zone-danger-canal',
    name: 'Prohibited: Canal & Railway Corridor',
    type: 'danger',
    shape: 'circle',
    center: { lat: 37.4395, lng: -122.1565 },
    radius: 180,
    color: '#f43f5e', // rose
    active: true,
    scheduleDescription: 'Strict Exclusion 24/7',
    description: 'Steep drainage canal embankment and industrial freight railway line.',
  },
];

// Generate 45 historical breadcrumbs representing Emma's morning journey
const generateEmmaHistory = (): GPSBreadcrumb[] => {
  const breadcrumbs: GPSBreadcrumb[] = [];
  const baseTime = Date.now() - 4 * 60 * 60 * 1000; // 4 hours ago

  // 1. At Home (0 - 45 min)
  for (let i = 0; i < 8; i++) {
    breadcrumbs.push({
      id: `bc-home-${i}`,
      timestamp: baseTime + i * 5 * 60 * 1000,
      coords: {
        lat: 37.4418 + (Math.sin(i) * 0.00015),
        lng: -122.1448 + (Math.cos(i) * 0.00015),
      },
      speedKmh: 0.8 + Math.random() * 0.5,
      accuracyMeters: 4.2,
      isInsideSafeZone: true,
      activeZoneName: 'Home & Sunnyvale Cul-de-sac',
      batteryLevel: 98 - Math.floor(i * 0.3),
    });
  }

  // 2. Walking towards Oakridge Elementary
  const waypoints = [
    { lat: 37.4426, lng: -122.146 },
    { lat: 37.4435, lng: -122.1478 },
    { lat: 37.4442, lng: -122.1495 },
    { lat: 37.4448, lng: -122.151 },
    { lat: 37.4452, lng: -122.152 }, // arrived at school
  ];

  waypoints.forEach((pt, idx) => {
    breadcrumbs.push({
      id: `bc-transit-${idx}`,
      timestamp: baseTime + (8 + idx * 3) * 5 * 60 * 1000,
      coords: {
        lat: pt.lat + (Math.random() - 0.5) * 0.0001,
        lng: pt.lng + (Math.random() - 0.5) * 0.0001,
      },
      speedKmh: 4.2 + (Math.random() * 1.5),
      accuracyMeters: 3.8,
      isInsideSafeZone: idx === waypoints.length - 1,
      activeZoneName: idx === waypoints.length - 1 ? 'Oakridge Elementary & Playground' : 'Transit Corridor',
      batteryLevel: 94 - idx,
    });
  });

  // 3. At School & Recess Playground
  for (let i = 0; i < 15; i++) {
    breadcrumbs.push({
      id: `bc-school-${i}`,
      timestamp: baseTime + (24 + i * 4) * 5 * 60 * 1000,
      coords: {
        lat: 37.4452 + (Math.sin(i * 0.8) * 0.0007),
        lng: -122.152 + (Math.cos(i * 0.8) * 0.0007),
      },
      speedKmh: i % 3 === 0 ? 7.8 : 2.1,
      accuracyMeters: 3.5,
      isInsideSafeZone: true,
      activeZoneName: 'Oakridge Elementary & Playground',
      batteryLevel: 88 - Math.floor(i * 0.4),
    });
  }

  return breadcrumbs;
};

export const INITIAL_CHILDREN: ChildProfile[] = [
  {
    id: 'child-emma',
    name: 'Emma Chen',
    age: 7,
    avatar: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=256&q=80',
    wristbandId: 'KP-702-EMMA',
    currentCoords: {
      lat: 37.4453,
      lng: -122.1521,
    },
    heading: 45,
    speedKmh: 3.2,
    isInsideSafeZone: true,
    currentZoneId: 'zone-school',
    currentZoneName: 'Oakridge Elementary & Playground',
    status: 'safe',
    wristband: {
      deviceId: 'KP-702-EMMA',
      model: 'KidPulse Pro v3 (OLED + Cellular)',
      batteryLevel: 84,
      isCharging: false,
      heartRate: 88,
      isWorn: true,
      signalStrength: 5,
      cellularType: '4G LTE',
      satelliteCount: 11,
      firmwareVersion: 'v2.8.4-rel',
      stepCount: 4620,
      ambientTempC: 22.4,
      lastSyncTimestamp: Date.now() - 4000,
      isRinging: false,
      isSosActive: false,
    },
    history: generateEmmaHistory(),
    assignedGeofenceIds: ['zone-school', 'zone-home', 'zone-park', 'zone-danger-canal'],
  },
  {
    id: 'child-lucas',
    name: 'Lucas Morales',
    age: 10,
    avatar: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=256&q=80',
    wristbandId: 'SB-441-LUCAS',
    currentCoords: {
      lat: 37.4484,
      lng: -122.1462,
    },
    heading: 120,
    speedKmh: 6.5,
    isInsideSafeZone: true,
    currentZoneId: 'zone-park',
    currentZoneName: 'Evergreen Community Park',
    status: 'safe',
    wristband: {
      deviceId: 'SB-441-LUCAS',
      model: 'SafeBand Sport 4G',
      batteryLevel: 62,
      isCharging: false,
      heartRate: 102,
      isWorn: true,
      signalStrength: 4,
      cellularType: '4G LTE',
      satelliteCount: 10,
      firmwareVersion: 'v3.1.0',
      stepCount: 8190,
      ambientTempC: 23.1,
      lastSyncTimestamp: Date.now() - 2500,
      isRinging: false,
      isSosActive: false,
    },
    history: [
      {
        id: 'bc-l-1',
        timestamp: Date.now() - 3600000,
        coords: { lat: 37.4418, lng: -122.1448 },
        speedKmh: 1.2,
        accuracyMeters: 4.0,
        isInsideSafeZone: true,
        activeZoneName: 'Home & Sunnyvale Cul-de-sac',
        batteryLevel: 75,
      },
      {
        id: 'bc-l-2',
        timestamp: Date.now() - 1800000,
        coords: { lat: 37.4484, lng: -122.1462 },
        speedKmh: 5.4,
        accuracyMeters: 3.5,
        isInsideSafeZone: true,
        activeZoneName: 'Evergreen Community Park',
        batteryLevel: 64,
      },
    ],
    assignedGeofenceIds: ['zone-school', 'zone-home', 'zone-park', 'zone-danger-canal'],
  },
  {
    id: 'child-maya',
    name: 'Maya Patel',
    age: 5,
    avatar: 'https://images.unsplash.com/photo-1595454223600-91fb5591eb36?auto=format&fit=crop&w=256&q=80',
    wristbandId: 'GB-108-MAYA',
    currentCoords: {
      lat: 37.4419,
      lng: -122.1447,
    },
    heading: 270,
    speedKmh: 0.0,
    isInsideSafeZone: true,
    currentZoneId: 'zone-home',
    currentZoneName: 'Home & Sunnyvale Cul-de-sac',
    status: 'safe',
    wristband: {
      deviceId: 'GB-108-MAYA',
      model: 'GuardianBand Mini (Kid-Lock Clasp)',
      batteryLevel: 91,
      isCharging: false,
      heartRate: 78,
      isWorn: true,
      signalStrength: 5,
      cellularType: 'NB-IoT',
      satelliteCount: 12,
      firmwareVersion: 'v1.4.2',
      stepCount: 2310,
      ambientTempC: 22.0,
      lastSyncTimestamp: Date.now() - 5000,
      isRinging: false,
      isSosActive: false,
    },
    history: [
      {
        id: 'bc-m-1',
        timestamp: Date.now() - 1200000,
        coords: { lat: 37.4419, lng: -122.1447 },
        speedKmh: 0.2,
        accuracyMeters: 3.0,
        isInsideSafeZone: true,
        activeZoneName: 'Home & Sunnyvale Cul-de-sac',
        batteryLevel: 92,
      },
    ],
    assignedGeofenceIds: ['zone-home', 'zone-park'],
  },
];
