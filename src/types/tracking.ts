export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'safe' | 'danger';
  shape: 'circle' | 'polygon';
  center: Coordinates;
  radius: number; // in meters for circle
  polygonPoints?: Coordinates[];
  color: string;
  active: boolean;
  scheduleDescription?: string;
  description: string;
}

export interface WristbandTelemetry {
  deviceId: string;
  model: string;
  batteryLevel: number; // 0-100%
  isCharging: boolean;
  heartRate: number; // BPM
  isWorn: boolean; // skin contact sensor
  signalStrength: number; // 1-5 bars
  cellularType: '4G LTE' | '5G' | 'NB-IoT';
  satelliteCount: number;
  firmwareVersion: string;
  stepCount: number;
  ambientTempC: number;
  lastSyncTimestamp: number;
  isRinging: boolean;
  isSosActive: boolean;
  // Control Lock & Biometric Heart Rate Safety
  isControlLocked: boolean; // Remote safety lockout preventing child or unauthorized tampering
  lockMode: 'unlocked' | 'child_lock' | 'school_lock' | 'emergency_lockdown';
  heartRateThresholdMax: number; // BPM threshold triggering alert & auto-lock
  heartRateThresholdMin: number; // BPM lower threshold
  autoLockOnHeartSpike: boolean; // Automatically engages lockdown when heart rate spikes
  stressStatus: 'normal' | 'elevated' | 'critical';
  restingHeartRate: number;
  peakHeartRate: number;
  heartRateHistory: { timestamp: number; bpm: number }[];
}

export interface ParentLocationState {
  coords: Coordinates;
  accuracyMeters: number;
  isUsingRealGps: boolean;
  proximityTetherEnabled: boolean;
  proximityTetherRadiusMeters: number;
  distanceToSelectedChild: number;
  bearingToSelectedChild: number;
  compassDirection: string;
  walkingEtaMinutes: number;
}

export interface GPSBreadcrumb {
  id: string;
  timestamp: number;
  coords: Coordinates;
  speedKmh: number;
  accuracyMeters: number;
  isInsideSafeZone: boolean;
  activeZoneName?: string;
  batteryLevel: number;
}

export interface AlertNotification {
  id: string;
  childId: string;
  type: 'geofence_breach' | 'geofence_entry' | 'sos' | 'tamper_removed' | 'low_battery' | 'high_heart_rate';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  coords?: Coordinates;
  read: boolean;
  zoneName?: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  wristbandId: string;
  currentCoords: Coordinates;
  heading: number; // degrees 0-360
  speedKmh: number;
  isInsideSafeZone: boolean;
  currentZoneId?: string;
  currentZoneName?: string;
  status: 'safe' | 'warning' | 'breached' | 'sos';
  wristband: WristbandTelemetry;
  history: GPSBreadcrumb[];
  assignedGeofenceIds: string[];
}

export interface ReferenceLandmark {
  id: string;
  name: string;
  category: 'gate' | 'building' | 'play' | 'hazard' | 'muster';
  coords: Coordinates;
  iconName: string;
  description: string;
}

export interface SampleScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  category: 'school' | 'park' | 'residence' | 'themepark';
  center: Coordinates;
  zoom: number;
  overlayBounds: {
    northEast: Coordinates;
    southWest: Coordinates;
  };
  overlaySvgUrl: string;
  landmarks: ReferenceLandmark[];
  children: ChildProfile[];
  geofences: GeofenceZone[];
  wanderPath: Coordinates[];
}
