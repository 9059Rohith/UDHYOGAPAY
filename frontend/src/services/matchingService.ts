// Service layer: handles matchingService API calls and request logic.
import api from './api';

interface Location {
  latitude: number;
  longitude: number;
}

interface FindWorkersRequest {
  serviceType: string;
  userLocation: Location;
  urgency?: 'low' | 'medium' | 'high';
  maxDistance?: number;
  minRating?: number;
  skills?: string[];
}

interface MatchedWorker {
  _id: string;
  name: string;
  profession: string;
  experience: number;
  rating: number;
  totalRatings: number;
  location: Location;
  availability: boolean;
  skills: string[];
  completedJobs: number;
  address?: string;
  phone?: string;
  profileImage?: string;
  matchScore: number;
  distance: number;
  estimatedTime: number;
}

interface MatchingResult {
  workers: MatchedWorker[];
  totalMatches: number;
  searchRadius: number;
  matchingAlgorithm: string;
}

/**
 * Find matching workers using AI engine
 */
export const findMatchingWorkers = async (
  request: FindWorkersRequest
): Promise<MatchingResult> => {
  const response = await api.post('/matching/find', request);
  return response.data.data;
};

/**
 * Get AI matching engine status
 */
export const getMatchingEngineStatus = async (): Promise<{
  engine: string;
  status: string;
  fallbackAvailable: boolean;
}> => {
  const response = await api.get('/matching/status');
  return response.data;
};

export default {
  findMatchingWorkers,
  getMatchingEngineStatus
};
