import { Coordinates, GeofenceZone } from '../types/tracking';

/**
 * Calculates the great circle distance between two points in meters using Haversine formula
 */
export function getDistanceMeters(p1: Coordinates, p2: Coordinates): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Ray-casting algorithm to test whether a point is inside a polygon
 */
export function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat,
      yi = polygon[i].lng;
    const xj = polygon[j].lat,
      yj = polygon[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks if a point is within a circular geofence
 */
export function isPointInCircle(point: Coordinates, center: Coordinates, radiusMeters: number): boolean {
  return getDistanceMeters(point, center) <= radiusMeters;
}

/**
 * Checks if a point is inside a specific geofence zone
 */
export function isPointInGeofence(point: Coordinates, zone: GeofenceZone): boolean {
  if (!zone.active) return false;
  if (zone.shape === 'circle') {
    return isPointInCircle(point, zone.center, zone.radius);
  } else if (zone.shape === 'polygon' && zone.polygonPoints && zone.polygonPoints.length > 2) {
    return isPointInPolygon(point, zone.polygonPoints);
  }
  return false;
}

/**
 * Evaluates child coordinates against all assigned geofences
 * Returns whether child is in safe zone, if any danger zone is entered, and matching zone name
 */
export function evaluateGeofences(
  point: Coordinates,
  zones: GeofenceZone[]
): {
  isSafe: boolean;
  isInDangerZone: boolean;
  activeZone?: GeofenceZone;
  dangerZone?: GeofenceZone;
  distanceToSafePerimeter?: number;
} {
  const activeZones = zones.filter((z) => z.active);

  // First check danger zones
  const dangerZones = activeZones.filter((z) => z.type === 'danger');
  const breachedDanger = dangerZones.find((z) => isPointInGeofence(point, z));

  if (breachedDanger) {
    return {
      isSafe: false,
      isInDangerZone: true,
      dangerZone: breachedDanger,
    };
  }

  // Check safe zones
  const safeZones = activeZones.filter((z) => z.type === 'safe');
  const matchedSafeZone = safeZones.find((z) => isPointInGeofence(point, z));

  if (matchedSafeZone) {
    return {
      isSafe: true,
      isInDangerZone: false,
      activeZone: matchedSafeZone,
    };
  }

  // If outside all safe zones, find distance to nearest safe zone perimeter
  let minDistanceToPerimeter = Infinity;
  for (const zone of safeZones) {
    const distCenter = getDistanceMeters(point, zone.center);
    const distEdge = Math.max(0, distCenter - zone.radius);
    if (distEdge < minDistanceToPerimeter) {
      minDistanceToPerimeter = distEdge;
    }
  }

  return {
    isSafe: false,
    isInDangerZone: false,
    distanceToSafePerimeter: minDistanceToPerimeter === Infinity ? 0 : minDistanceToPerimeter,
  };
}

/**
 * Formats distance in meters or kilometers
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Calculates bearing angle between two coordinates
 */
export function calculateBearing(start: Coordinates, end: Coordinates): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}
