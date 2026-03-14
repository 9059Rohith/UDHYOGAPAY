// Service layer: handles locationService API calls and request logic.
import api from './api';

export const locationService = {
  /**
   * Get user's current location using browser Geolocation API
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  /**
   * Watch user's location for continuous updates
   */
  watchLocation(
    callback: (coords: { latitude: number; longitude: number }) => void,
    errorCallback?: (error: GeolocationPositionError) => void
  ): number {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // 30 seconds
      }
    );
  },

  /**
   * Stop watching location
   */
  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  },

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string) {
    const response = await api.post('/users/geocode', { address });
    return response.data.result;
  },

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(longitude: number, latitude: number) {
    const response = await api.post('/users/reverse-geocode', {
      longitude,
      latitude
    });
    return response.data.result;
  },

  /**
   * Calculate distance and route between two points
   */
  async calculateRoute(origin: [number, number], destination: [number, number]) {
    const response = await api.post('/users/calculate-distance', {
      origin,
      destination
    });
    return response.data;
  }
};
