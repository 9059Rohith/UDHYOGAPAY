// Backend comment: matchingController
import { Request, Response } from 'express';
import Worker from '../models/Worker';
import { aiMatchingService } from '../services/aiMatchingService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Find matching workers for a service request
 */
export const findMatchingWorkers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      serviceType,
      userLocation,
      urgency = 'medium',
      maxDistance = 25,
      minRating = 0,
      skills = []
    } = req.body;

    console.log('🔍 Matching Request:', { serviceType, userLocation, maxDistance });

    // Validate required fields
    if (!serviceType || !userLocation || !userLocation.latitude || !userLocation.longitude) {
      return res.status(400).json({
        message: 'Missing required fields: serviceType and userLocation (latitude, longitude)'
      });
    }

    // Get all workers of the requested profession
    const workers = await Worker.find({
      profession: new RegExp(serviceType, 'i'),
      isOnline: true,
      isVerified: true,
      'currentLocation.coordinates.0': { $ne: 0 },
      'currentLocation.coordinates.1': { $ne: 0 }
    }).populate('userId', 'name email phone profileImage');

    console.log(`✅ Found ${workers.length} online verified workers for ${serviceType}`);
    
    // Log worker details for debugging
    workers.forEach(w => {
      console.log(`  - Worker: ${(w.userId as any)?.name}, Online: ${w.isOnline}, Verified: ${w.isVerified}, Location: [${w.currentLocation.coordinates}]`);
    });

    if (workers.length === 0) {
      return res.status(404).json({
        message: `No workers found for service type: ${serviceType}`,
        data: {
          workers: [],
          totalMatches: 0,
          searchRadius: maxDistance,
          matchingAlgorithm: 'None'
        }
      });
    }

    // Transform workers to AI engine format
    const workerData = workers.map(worker => {
      const user = worker.userId as any;
      return {
        _id: worker._id.toString(),
        name: user?.name || 'Unknown',
        profession: worker.profession,
        experience: worker.experience || 0,
        rating: worker.rating || 0,
        totalRatings: worker.totalJobs || 0, // Using totalJobs as proxy for totalRatings
        location: {
          latitude: worker.currentLocation.coordinates[1] || 0,
          longitude: worker.currentLocation.coordinates[0] || 0
        },
        availability: worker.availability.status === 'available',
        skills: [], // No skills field in current Worker model
        completedJobs: worker.totalJobs || 0,
        address: user?.address || '',
        phone: user?.phone || '',
        profileImage: user?.profileImage || ''
      };
    });

    // Create match request
    const matchRequest = {
      userId: req.user?.id || 'anonymous',
      userLocation: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      },
      serviceType,
      urgency,
      maxDistance,
      minRating,
      skills
    };

    // Use AI matching service
    const matchResult = await aiMatchingService.findMatchingWorkers(matchRequest, workerData);

    res.json({
      message: 'Workers matched successfully',
      data: matchResult
    });
  } catch (error) {
    console.error('Find matching workers error:', error);
    res.status(500).json({
      message: 'Failed to find matching workers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get AI matching engine status
 */
export const getMatchingEngineStatus = async (req: Request, res: Response) => {
  try {
    const isHealthy = await aiMatchingService.checkHealth();
    
    res.json({
      engine: 'AI Matching Engine',
      status: isHealthy ? 'online' : 'offline',
      fallbackAvailable: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      engine: 'AI Matching Engine',
      status: 'error',
      fallbackAvailable: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
