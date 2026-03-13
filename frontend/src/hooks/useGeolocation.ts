// Custom hook: encapsulates reusable useGeolocation state and behavior.
import { useState, useEffect } from 'react';
import { locationService } from '../services/locationService';

interface GeolocationState {
  location: { latitude: number; longitude: number } | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    let isMounted = true;

    locationService
      .getCurrentLocation()
      .then((location) => {
        if (isMounted) {
          setState({
            location,
            error: null,
            loading: false
          });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({
            location: null,
            error: error.message,
            loading: false
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};
