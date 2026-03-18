import { Location } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param point1 First location
 * @param point2 Second location
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);

  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimals to keep API responses compact and consistent.
  return Math.round(distance * 100) / 100;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate travel time based on distance
 * Assumes average speed of 30 km/h in urban areas
 */
export function estimateTravelTime(distanceKm: number): number {
  const averageSpeedKmh = 30;
  const timeHours = distanceKm / averageSpeedKmh;
  const timeMinutes = Math.ceil(timeHours * 60);
  return timeMinutes;
}
