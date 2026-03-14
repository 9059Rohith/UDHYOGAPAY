// Backend comment: osmService
import axios from 'axios';
import { CONSTANTS } from '../config/constants';

// Haversine formula for straight-line distance calculation
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const osmService = {
  /**
   * Geocode address to coordinates using Nominatim
   */
  async geocodeAddress(address: string) {
    const url = `${CONSTANTS.NOMINATIM_BASE_URL}/search`;

    try {
      const response = await axios.get(url, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'UdhyogaPay/1.0'
        }
      });

      if (response.data.length === 0) {
        throw new Error('Address not found');
      }

      const result = response.data[0];
      return {
        coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
        displayName: result.display_name,
        address: result.address
      };
    } catch (error: any) {
      console.error('Geocoding error:', error.message);
      throw new Error('Failed to geocode address');
    }
  },

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(longitude: number, latitude: number) {
    const url = `${CONSTANTS.NOMINATIM_BASE_URL}/reverse`;

    try {
      const response = await axios.get(url, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'UdhyogaPay/1.0'
        }
      });

      return {
        displayName: response.data.display_name,
        address: response.data.address
      };
    } catch (error: any) {
      console.error('Reverse geocoding error:', error.message);
      throw new Error('Failed to reverse geocode coordinates');
    }
  },

  /**
   * Calculate route using OSRM (Open Source Routing Machine)
   */
  async getRoute(origin: [number, number], destination: [number, number]) {
    const url = `${CONSTANTS.OSRM_BASE_URL}/route/v1/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

    try {
      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: true
        }
      });

      if (response.data.code !== 'Ok') {
        throw new Error('Route calculation failed');
      }

      const route = response.data.routes[0];
      return {
        distance: route.distance / 1000, // Convert meters to km
        duration: route.duration / 60, // Convert seconds to minutes
        geometry: route.geometry, // GeoJSON LineString
        steps: route.legs[0].steps
      };
    } catch (error: any) {
      console.error('OSRM route error:', error.message);
      // Fallback to haversine distance
      const distance = this.calculateDistance(origin, destination);
      return {
        distance,
        duration: (distance / 30) * 60, // Assume 30 km/h
        geometry: null,
        steps: []
      };
    }
  },

  /**
   * Alternative: OpenRouteService (requires API key)
   */
  async getRouteORS(origin: [number, number], destination: [number, number]) {
    const apiKey = process.env.OPENROUTESERVICE_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouteService API key not configured');
    }

    const url = `${CONSTANTS.ORS_BASE_URL}/directions/driving-car`;

    try {
      const response = await axios.post(
        url,
        {
          coordinates: [origin, destination]
        },
        {
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const route = response.data.routes[0];
      return {
        distance: route.summary.distance / 1000,
        duration: route.summary.duration / 60,
        geometry: route.geometry
      };
    } catch (error: any) {
      console.error('ORS route error:', error.message);
      throw new Error('Failed to calculate route');
    }
  },

  /**
   * Calculate straight-line distance (fallback)
   */
  calculateDistance(origin: [number, number], destination: [number, number]): number {
    return haversineDistance(origin[1], origin[0], destination[1], destination[0]);
  },

  /**
   * Batch distance calculation for multiple workers
   */
  calculateDistances(
    userLocation: [number, number],
    workerLocations: Array<{ id: string; coords: [number, number] }>
  ) {
    return workerLocations.map((worker) => ({
      workerId: worker.id,
      distance: haversineDistance(
        userLocation[1],
        userLocation[0],
        worker.coords[1],
        worker.coords[0]
      )
    }));
  }
};
