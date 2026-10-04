import { SampleScenario, ChildProfile, GeofenceZone, GPSBreadcrumb } from '../types/tracking';
import { INITIAL_CHILDREN, INITIAL_GEOFENCES } from './mockData';

// Helper to generate SVG blueprint data URL for Campus Plan
const createSchoolBlueprintSvg = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#06b6d4" stroke-width="0.75" stroke-opacity="0.15"/>
      </pattern>
      <linearGradient id="yardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.08"/>
      </linearGradient>
      <linearGradient id="dangerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.1"/>
      </linearGradient>
    </defs>
    
    <!-- Background grid -->
    <rect width="800" height="600" fill="url(#grid)" />
    
    <!-- Outer Campus Fence Perimeter -->
    <rect x="50" y="50" width="700" height="500" rx="24" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="10, 6" stroke-opacity="0.8"/>
    <text x="70" y="80" fill="#10b981" font-family="monospace" font-size="14" font-weight="bold" letter-spacing="1">CAMPUS SECURITY PERIMETER - SAFE ZONE A</text>

    <!-- Main Academic Building Block -->
    <rect x="100" y="120" width="280" height="180" rx="12" fill="#0f172a" fill-opacity="0.7" stroke="#06b6d4" stroke-width="2.5"/>
    <text x="120" y="155" fill="#38bdf8" font-family="sans-serif" font-size="15" font-weight="bold">MAIN ACADEMIC WING</text>
    <text x="120" y="180" fill="#94a3b8" font-family="sans-serif" font-size="11">Classrooms 101 - 224 · Library</text>
    <rect x="120" y="200" width="100" height="80" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.6"/>
    <text x="135" y="245" fill="#cbd5e1" font-family="sans-serif" font-size="11">ADMIN / CLINIC</text>

    <!-- Gymnasium & Cafeteria Block -->
    <rect x="100" y="330" width="220" height="160" rx="12" fill="#0f172a" fill-opacity="0.7" stroke="#06b6d4" stroke-width="2.5"/>
    <text x="120" y="365" fill="#38bdf8" font-family="sans-serif" font-size="15" font-weight="bold">GYMNASIUM & CAFETERIA</text>
    <text x="120" y="390" fill="#94a3b8" font-family="sans-serif" font-size="11">Indoor Assembly · Shelter Area</text>
    
    <!-- Recess Playground & Turf Field -->
    <rect x="420" y="120" width="300" height="370" rx="16" fill="url(#yardGrad)" stroke="#10b981" stroke-width="2"/>
    <text x="440" y="155" fill="#34d399" font-family="sans-serif" font-size="15" font-weight="bold">ATHLETIC FIELD & PLAYGROUND</text>
    
    <!-- Playground Equipment Circles -->
    <circle cx="480" cy="220" r="35" fill="#06b6d4" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="455" y="225" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="600">JUNGLE GYM</text>

    <circle cx="580" cy="220" r="30" fill="#06b6d4" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="560" y="225" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="600">SWINGS</text>

    <rect x="450" y="290" width="240" height="160" rx="8" fill="none" stroke="#34d399" stroke-width="1.5" stroke-dasharray="6,4"/>
    <text x="530" y="375" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">SOCCER TURF</text>

    <!-- Gates & Entry Points -->
    <rect x="20" y="250" width="40" height="80" fill="#38bdf8" fill-opacity="0.8" rx="4"/>
    <text x="5" y="240" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">WEST GATE (PEDESTRIAN)</text>

    <rect x="360" y="520" width="100" height="40" fill="#f59e0b" fill-opacity="0.8" rx="4"/>
    <text x="340" y="580" fill="#fbbf24" font-family="monospace" font-size="12" font-weight="bold">BUS DROP-OFF & PICKUP LANE</text>

    <!-- Hazard Warning: Roadside Crossing outside fence -->
    <rect x="40" y="10" width="720" height="30" fill="url(#dangerGrad)" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="400" y="30" fill="#fda4af" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">⚠️ PUBLIC TRANSIT AVENUE - STRICT EXCLUSION OUTSIDE GATE</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Helper for Theme Park Blueprint SVG
const createThemeParkBlueprintSvg = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <pattern id="tpGrid" width="50" height="50" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#38bdf8" fill-opacity="0.2"/>
      </pattern>
    </defs>
    <rect width="800" height="600" fill="url(#tpGrid)" />

    <!-- Outer Park Boundary -->
    <polygon points="50,100 400,30 750,100 750,550 50,550" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="10, 5"/>
    <text x="80" y="90" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold">STARLIGHT ADVENTURE PARK - VISITOR SAFE RADIUS</text>

    <!-- Central Carousel Plaza -->
    <circle cx="400" cy="300" r="100" fill="#0f172a" fill-opacity="0.75" stroke="#ec4899" stroke-width="3"/>
    <circle cx="400" cy="300" r="40" fill="#ec4899" fill-opacity="0.3" stroke="#f472b6" stroke-width="2"/>
    <text x="400" y="305" fill="#fbcfe8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">GRAND CAROUSEL PLAZA</text>

    <!-- Wonder Wheel -->
    <circle cx="620" cy="220" r="70" fill="#0f172a" fill-opacity="0.7" stroke="#8b5cf6" stroke-width="2"/>
    <text x="620" y="225" fill="#ddd6fe" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">GIANT SKY WHEEL</text>

    <!-- Children Splash Pad -->
    <rect x="150" y="160" width="160" height="130" rx="16" fill="#0284c7" fill-opacity="0.25" stroke="#38bdf8" stroke-width="2"/>
    <text x="230" y="230" fill="#e0f2fe" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">KIDS WATER PLAY</text>

    <!-- First Aid & Lost Child Station -->
    <rect x="240" y="440" width="140" height="80" rx="8" fill="#10b981" fill-opacity="0.3" stroke="#34d399" stroke-width="2"/>
    <text x="310" y="485" fill="#a7f3d0" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">LOST CHILD MUSTER</text>

    <!-- Restricted Backstage Hazard -->
    <rect x="520" y="420" width="210" height="110" rx="8" fill="#f43f5e" fill-opacity="0.3" stroke="#f43f5e" stroke-width="2" stroke-dasharray="6,4"/>
    <text x="625" y="475" fill="#fecdd3" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">⛔ RESTRICTED BACKSTAGE</text>
    <text x="625" y="495" fill="#fecdd3" font-family="sans-serif" font-size="10" text-anchor="middle">High-Voltage Machinery</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const SAMPLE_MAP_SCENARIOS: SampleScenario[] = [
  {
    id: 'scenario-school',
    name: 'Oakridge Elementary & Recess Field',
    badge: 'School Campus',
    description: 'Structured school perimeter with classroom buildings, enclosed playground, sports turf, and street crossing hazard.',
    category: 'school',
    center: { lat: 37.4452, lng: -122.152 },
    zoom: 17,
    overlayBounds: {
      northEast: { lat: 37.4475, lng: -122.1485 },
      southWest: { lat: 37.443, lng: -122.1555 },
    },
    overlaySvgUrl: createSchoolBlueprintSvg(),
    landmarks: [
      {
        id: 'lm-gate-main',
        name: 'Main Campus Gate (Security Checkpoint)',
        category: 'gate',
        coords: { lat: 37.4451, lng: -122.1538 },
        iconName: 'DoorClosed',
        description: 'Primary supervised student entry gate with biometric badge scanner.',
      },
      {
        id: 'lm-playground',
        name: 'Recess Jungle Gym & Swings',
        category: 'play',
        coords: { lat: 37.4455, lng: -122.1513 },
        iconName: 'Smile',
        description: 'Supervised soft-turf play area for Grades K-5.',
      },
      {
        id: 'lm-muster',
        name: 'Emergency Evacuation Muster Point',
        category: 'muster',
        coords: { lat: 37.4458, lng: -122.1508 },
        iconName: 'Shield',
        description: 'Designated parent-child reunification point for emergency drills.',
      },
      {
        id: 'lm-hazard-street',
        name: 'Unregulated Traffic Intersection',
        category: 'hazard',
        coords: { lat: 37.4465, lng: -122.1482 },
        iconName: 'AlertTriangle',
        description: 'Busy 4-lane arterial road without pedestrian crossing guard.',
      },
    ],
    children: INITIAL_CHILDREN,
    geofences: INITIAL_GEOFENCES,
    wanderPath: [
      { lat: 37.4452, lng: -122.152 },
      { lat: 37.4455, lng: -122.151 },
      { lat: 37.4459, lng: -122.1495 },
      { lat: 37.4464, lng: -122.148 },
      { lat: 37.447, lng: -122.1465 },
    ],
  },
  {
    id: 'scenario-themepark',
    name: 'Starlight Adventure & Theme Park',
    badge: 'Amusement Park',
    description: 'High-density family amusement park with carousel plaza, ride concourses, and strictly monitored backstage exclusion zones.',
    category: 'themepark',
    center: { lat: 37.4485, lng: -122.1465 },
    zoom: 17,
    overlayBounds: {
      northEast: { lat: 37.451, lng: -122.1425 },
      southWest: { lat: 37.446, lng: -122.1505 },
    },
    overlaySvgUrl: createThemeParkBlueprintSvg(),
    landmarks: [
      {
        id: 'lm-carousel',
        name: 'Grand Carousel Plaza',
        category: 'play',
        coords: { lat: 37.4485, lng: -122.1465 },
        iconName: 'FerrisWheel',
        description: 'Central landmark carousel with seating and shaded gazebo.',
      },
      {
        id: 'lm-lost-station',
        name: 'Park Information & Lost Child Station',
        category: 'muster',
        coords: { lat: 37.4478, lng: -122.148 },
        iconName: 'HelpCircle',
        description: 'Staffed 24/7 with park rangers and wristband RFID scanners.',
      },
      {
        id: 'lm-backstage-hazard',
        name: 'Backstage Coaster Mechanics (Strict Hazard)',
        category: 'hazard',
        coords: { lat: 37.4495, lng: -122.144 },
        iconName: 'AlertOctagon',
        description: 'Heavy machinery, high-voltage substations, and maintenance vehicles.',
      },
    ],
    children: [
      {
        ...INITIAL_CHILDREN[0],
        currentCoords: { lat: 37.4485, lng: -122.1465 },
        currentZoneId: 'zone-tp-main',
        currentZoneName: 'Grand Carousel Safe Perimeter',
      },
      {
        ...INITIAL_CHILDREN[1],
        currentCoords: { lat: 37.449, lng: -122.145 },
        currentZoneId: 'zone-tp-main',
        currentZoneName: 'Grand Carousel Safe Perimeter',
      },
    ],
    geofences: [
      {
        id: 'zone-tp-main',
        name: 'Starlight Park Visitor Zone',
        type: 'safe',
        shape: 'circle',
        center: { lat: 37.4485, lng: -122.1465 },
        radius: 260,
        color: '#06b6d4',
        active: true,
        scheduleDescription: 'Park Open Hours 09:00 - 21:00',
        description: 'Public visitor pathways, rides, food stalls, and restrooms.',
      },
      {
        id: 'zone-tp-hazard',
        name: 'Prohibited: Backstage Coaster Yard',
        type: 'danger',
        shape: 'circle',
        center: { lat: 37.4495, lng: -122.144 },
        radius: 110,
        color: '#f43f5e',
        active: true,
        scheduleDescription: 'Restricted Staff Only 24/7',
        description: 'Hazardous machinery, high-speed rail tracks, and electrical transformers.',
      },
    ],
    wanderPath: [
      { lat: 37.4485, lng: -122.1465 },
      { lat: 37.4488, lng: -122.1455 },
      { lat: 37.4493, lng: -122.1445 }, // wandering into backstage hazard!
      { lat: 37.4496, lng: -122.1438 },
    ],
  },
  {
    id: 'scenario-neighborhood',
    name: 'Sunnyvale Residential Cul-de-Sac',
    badge: 'Home Sanctuary',
    description: 'Residential community with family home, neighbor lawn play area, community swimming pool, and creek hazard.',
    category: 'residence',
    center: { lat: 37.4418, lng: -122.1448 },
    zoom: 17,
    overlayBounds: {
      northEast: { lat: 37.444, lng: -122.141 },
      southWest: { lat: 37.4395, lng: -122.1485 },
    },
    overlaySvgUrl: createSchoolBlueprintSvg(),
    landmarks: [
      {
        id: 'lm-home',
        name: 'Family Residence #42',
        category: 'building',
        coords: { lat: 37.4418, lng: -122.1448 },
        iconName: 'Home',
        description: 'Home sanctuary base with Wi-Fi mesh beacon.',
      },
      {
        id: 'lm-pool',
        name: 'Community Swimming Pool (Gated)',
        category: 'muster',
        coords: { lat: 37.4426, lng: -122.1435 },
        iconName: 'LifeBuoy',
        description: 'Neighborhood pool with self-latching safety gate.',
      },
      {
        id: 'lm-creek',
        name: 'Steep Creek Embankment Hazard',
        category: 'hazard',
        coords: { lat: 37.4402, lng: -122.146 },
        iconName: 'AlertTriangle',
        description: 'Unguarded water retention canal and slippery slope.',
      },
    ],
    children: [
      {
        ...INITIAL_CHILDREN[2],
        currentCoords: { lat: 37.4418, lng: -122.1448 },
        currentZoneId: 'zone-home-suburb',
        currentZoneName: 'Home Cul-de-sac Safe Zone',
      },
      {
        ...INITIAL_CHILDREN[0],
        currentCoords: { lat: 37.4422, lng: -122.1442 },
        currentZoneId: 'zone-home-suburb',
        currentZoneName: 'Home Cul-de-sac Safe Zone',
      },
    ],
    geofences: [
      {
        id: 'zone-home-suburb',
        name: 'Home & Neighbor Cul-de-Sac',
        type: 'safe',
        shape: 'circle',
        center: { lat: 37.4418, lng: -122.1448 },
        radius: 170,
        color: '#10b981',
        active: true,
        scheduleDescription: '24/7 Residential Safe Zone',
        description: 'Enclosed lawns, sidewalks, and cul-de-sac play zone.',
      },
      {
        id: 'zone-creek-hazard',
        name: 'Danger: Creek Drainage Canal',
        type: 'danger',
        shape: 'circle',
        center: { lat: 37.4402, lng: -122.146 },
        radius: 120,
        color: '#f43f5e',
        active: true,
        scheduleDescription: 'Strict Hazard Exclusion',
        description: 'Steep drop-off and seasonal flash flood runoff.',
      },
    ],
    wanderPath: [
      { lat: 37.4418, lng: -122.1448 },
      { lat: 37.4412, lng: -122.1453 },
      { lat: 37.4406, lng: -122.1458 }, // wandering towards creek
      { lat: 37.4401, lng: -122.1462 },
    ],
  },
];
