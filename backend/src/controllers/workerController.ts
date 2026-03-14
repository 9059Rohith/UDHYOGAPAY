// Backend comment: workerController
import { Response } from 'express';
import Worker from '../models/Worker';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { validateWorkerKYC } from '../utils/validators';
import cloudinary from '../config/cloudinary';

/**
 * Upload KYC documents
 * POST /api/workers/kyc
 */
export const uploadKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = validateWorkerKYC(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { profession, experience } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || (!files.aadhar && !files.policeVerification)) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one document'
      });
    }

    // Find worker profile
    const worker = await Worker.findOne({ userId: req.user?._id });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    // Upload to Cloudinary
    const documents: any = {};

    if (files.aadhar) {
      const aadharResult = await cloudinary.uploader.upload(files.aadhar[0].path, {
        folder: 'udhyogapay/kyc/aadhar'
      });
      documents.aadhar = {
        url: aadharResult.secure_url,
        uploadedAt: new Date()
      };
    }

    if (files.policeVerification) {
      const pvcResult = await cloudinary.uploader.upload(files.policeVerification[0].path, {
        folder: 'udhyogapay/kyc/police-verification'
      });
      documents.policeVerification = {
        url: pvcResult.secure_url,
        uploadedAt: new Date()
      };
    }

    // Update worker profile
    worker.profession = profession;
    worker.experience = experience;
    worker.documents = { ...worker.documents, ...documents };
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'KYC documents uploaded successfully. Awaiting admin approval.',
      worker
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Toggle worker online/offline status
 * PATCH /api/workers/toggle-online
 */
export const toggleOnline = async (req: AuthRequest, res: Response) => {
  try {
    const { isOnline, coordinates } = req.body;

    const worker = await Worker.findOne({ userId: req.user?._id });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    if (!worker.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please complete KYC verification first'
      });
    }

    worker.isOnline = isOnline;
    worker.availability.status = isOnline ? 'available' : 'offline';
    worker.availability.updatedAt = new Date();

    if (coordinates && coordinates.length === 2) {
      worker.currentLocation.coordinates = coordinates;
      worker.currentLocation.lastUpdated = new Date();
    }

    await worker.save();

    res.status(200).json({
      success: true,
      message: `Worker is now ${isOnline ? 'online' : 'offline'}`,
      isOnline: worker.isOnline
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update worker location
 * PATCH /api/workers/location
 */
export const updateLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    const worker = await Worker.findOne({ userId: req.user?._id });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    worker.currentLocation.coordinates = coordinates;
    worker.currentLocation.lastUpdated = new Date();
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get worker profile and dashboard data
 * GET /api/workers/profile
 */
export const getWorkerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const worker = await Worker.findOne({ userId: req.user?._id }).populate('userId', 'name email phone');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    res.status(200).json({
      success: true,
      worker
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
