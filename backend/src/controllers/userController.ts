// Backend comment: userController
import { Response } from 'express';
import Worker from '../models/Worker';
import { AuthRequest } from '../middleware/auth';
import { osmService } from '../services/osmService';
import { CONSTANTS } from '../config/constants';

/**
 * Find nearby workers by profession with ranking algorithm
 * POST /api/users/workers/nearby
 */
export const findNearbyWorkers = async (req: AuthRequest, res: Response) => {
  try {
    const { location, profession, maxDistance = 100000 } = req.body;

    if (!location || !location.length || location.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid location coordinates [longitude, latitude]'
      });
    }

    if (!profession) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a profession'
      });
    }

    // MongoDB Geospatial aggregation with multi-factor ranking
    const workers = await Worker.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: location },
          distanceField: 'distance',
          maxDistance: maxDistance,
          spherical: true,
          query: {
            profession,
            isVerified: true,
            isOnline: true
            // Removed availability filter - show all online workers
          }
        }
      },
      {
        $addFields: {
          // Distance score: closer = higher score (0-5)
          distanceScore: {
            $subtract: [5, { $min: [{ $divide: ['$distance', 1000] }, 5] }]
          },
          // Rating score: 0-5
          ratingScore: '$rating',
          // Experience score: normalized to 0-5 (max 10 years)
          experienceScore: {
            $min: [{ $divide: ['$experience', 2] }, 5]
          }
        }
      },
      {
        $addFields: {
          // Weighted final score
          finalScore: {
            $add: [
              { $multiply: ['$distanceScore', CONSTANTS.RANKING_WEIGHTS.DISTANCE] },
              { $multiply: ['$ratingScore', CONSTANTS.RANKING_WEIGHTS.RATING] },
              { $multiply: ['$experienceScore', CONSTANTS.RANKING_WEIGHTS.EXPERIENCE] }
            ]
          }
        }
      },
      { $sort: { finalScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' }
    ]);

    // Calculate exact routes for top 5 workers using OSRM
    const top5 = workers.slice(0, 5);
    for (let worker of top5) {
      try {
        const route = await osmService.getRoute(location, worker.currentLocation.coordinates);
        worker.estimatedTime = Math.round(route.duration);
        worker.exactDistance = route.distance.toFixed(2);
        worker.routeGeometry = route.geometry;
      } catch (error) {
        // Fallback to straight-line distance
        worker.estimatedTime = Math.round((worker.distance / 1000 / 30) * 60); // Assume 30 km/h
        worker.exactDistance = (worker.distance / 1000).toFixed(2);
        worker.routeGeometry = null;
      }
    }

    res.status(200).json({
      success: true,
      count: workers.length,
      workers: top5
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Geocode address to coordinates
 * POST /api/users/geocode
 */
export const geocodeAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an address'
      });
    }

    const result = await osmService.geocodeAddress(address);

    res.status(200).json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Reverse geocode coordinates to address
 * POST /api/users/reverse-geocode
 */
export const reverseGeocode = async (req: AuthRequest, res: Response) => {
  try {
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude'
      });
    }

    const result = await osmService.reverseGeocode(longitude, latitude);

    res.status(200).json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Calculate distance and ETA between two points
 * POST /api/users/calculate-distance
 */
export const calculateDistance = async (req: AuthRequest, res: Response) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination || origin.length !== 2 || destination.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid origin and destination coordinates'
      });
    }

    const route = await osmService.getRoute(origin, destination);

    res.status(200).json({
      success: true,
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all online workers (for initial map display)
 * GET /api/users/workers/all-online
 */
export const getAllOnlineWorkers = async (req: AuthRequest, res: Response) => {
  try {
    const { profession } = req.query;

    const query: any = {
      isVerified: true,
      isOnline: true,
      // Removed availability filter - show all online workers regardless of busy status
      'currentLocation.coordinates.0': { $ne: 0 },
      'currentLocation.coordinates.1': { $ne: 0 }
    };

    // Add profession filter if provided
    if (profession) {
      query.profession = profession;
    }

    const workers = await Worker.find(query)
      .populate('userId', 'name email phone profileImage')
      .limit(50); // Limit to prevent too many markers

    // Transform workers to include proper location format
    const transformedWorkers = workers.map(worker => {
      const user = worker.userId as any;
      return {
        _id: worker._id,
        userId: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: 'worker'
        },
        userDetails: {
          name: user.name,
          phone: user.phone,
          profilePicture: user.profileImage
        },
        profession: worker.profession,
        experience: worker.experience,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        totalReviews: 0,
        hourlyRate: 0,
        currentLocation: {
          type: 'Point',
          coordinates: worker.currentLocation.coordinates,
          lastUpdated: worker.currentLocation.lastUpdated
        },
        location: {
          type: 'Point',
          coordinates: worker.currentLocation.coordinates
        },
        availability: {
          status: worker.availability.status,
          updatedAt: worker.availability.updatedAt
        },
        isAvailable: true,
        isVerified: worker.isVerified,
        isOnline: worker.isOnline,
        documents: worker.documents,
        kycStatus: worker.kycStatus
      };
    });

    res.status(200).json({
      success: true,
      count: transformedWorkers.length,
      workers: transformedWorkers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete user account
 * DELETE /api/users/account
 */
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // First, delete associated worker profile if exists
    await Worker.findOneAndDelete({ userId });

    // Then delete the user account (this will also be imported from models)
    const User = (await import('../models/User')).default;
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
