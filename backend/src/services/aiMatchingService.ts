// Backend comment: aiMatchingService
import axios from 'axios';

interface Location {
  latitude: number;
  longitude: number;
}

interface MatchRequest {
  userId: string;
  userLocation: Location;
  serviceType: string;
  urgency?: 'low' | 'medium' | 'high';
  maxDistance?: number;
  minRating?: number;
  skills?: string[];
}

interface WorkerData {
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
}

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5002';

export class AIMatchingService {
  /**
   * Find matching workers using AI engine
   */
  async findMatchingWorkers(
    request: MatchRequest,
    availableWorkers: WorkerData[]
  ): Promise<any> {
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/api/match`, {
        request,
        workers: availableWorkers
      }, {
        timeout: 10000 // 10 second timeout
      });

      return response.data.data;
    } catch (error) {
      console.error('AI Matching Engine error:', error);
      
      // Fallback to simple distance-based matching if AI engine fails
      console.log('Falling back to simple distance matching...');
      return this.fallbackMatching(request, availableWorkers);
    }
  }

  /**
   * Fallback matching algorithm (simple distance-based)
   */
  private fallbackMatching(
    request: MatchRequest,
    workers: WorkerData[]
  ): any {
    const maxDistance = request.maxDistance || 25;
    
    const matchedWorkers = workers
      .filter(w => w.profession.toLowerCase() === request.serviceType.toLowerCase())
      .map(worker => {
        const distance = this.calculateDistance(request.userLocation, worker.location);
        return {
          ...worker,
          matchScore: distance <= maxDistance ? (1 - distance / maxDistance) * 100 : 0,
          distance,
          estimatedTime: Math.ceil((distance / 30) * 60) // 30 km/h average
        };
      })
      .filter(w => w.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return {
      workers: matchedWorkers,
      totalMatches: matchedWorkers.length,
      searchRadius: maxDistance,
      matchingAlgorithm: 'Fallback-Distance-Based'
    };
  }

  /**
   * Calculate distance using Haversine formula
   */
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * 
              Math.cos(lat1) * Math.cos(lat2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if AI engine is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${AI_ENGINE_URL}/health`, { timeout: 3000 });
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  }
}

export const aiMatchingService = new AIMatchingService();
