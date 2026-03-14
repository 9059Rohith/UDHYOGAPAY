// Backend comment: constants
export const CONSTANTS = {
  PROFESSIONS: ['plumber', 'electrician', 'carpenter', 'painter', 'cleaner'],
  
  BOOKING_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    STARTED: 'started',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  USER_ROLES: {
    USER: 'user',
    WORKER: 'worker',
    ADMIN: 'admin'
  },
  
  AVAILABILITY_STATUS: {
    AVAILABLE: 'available',
    BUSY: 'busy',
    OFFLINE: 'offline'
  },
  
  MAX_SEARCH_RADIUS: 5000, // 5km in meters
  BOOKING_TIMEOUT: 30000, // 30 seconds
  LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
  
  RANKING_WEIGHTS: {
    DISTANCE: 0.5,
    RATING: 0.3,
    EXPERIENCE: 0.2
  },
  
  NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org',
  OSRM_BASE_URL: 'http://router.project-osrm.org',
  ORS_BASE_URL: 'https://api.openrouteservice.org/v2'
};
