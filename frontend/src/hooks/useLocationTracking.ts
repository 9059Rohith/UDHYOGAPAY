// Custom hook: encapsulates reusable useLocationTracking state and behavior.
import { useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import { locationService } from '../services/locationService';

export const useLocationTracking = (workerId: string, isOnline: boolean) => {
  const intervalRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOnline || !workerId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (watchIdRef.current) {
        locationService.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Send location every 30 seconds
    intervalRef.current = window.setInterval(async () => {
      try {
        const location = await locationService.getCurrentLocation();
        socketService.updateWorkerLocation(workerId, [location.longitude, location.latitude]);
      } catch (error) {
        console.error('Location update error:', error);
      }
    }, 30000); // 30 seconds

    // Initial location update
    locationService
      .getCurrentLocation()
      .then((location) => {
        socketService.updateWorkerLocation(workerId, [location.longitude, location.latitude]);
      })
      .catch((error) => {
        console.error('Initial location error:', error);
      });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (watchIdRef.current) {
        locationService.clearWatch(watchIdRef.current);
      }
    };
  }, [workerId, isOnline]);
};
