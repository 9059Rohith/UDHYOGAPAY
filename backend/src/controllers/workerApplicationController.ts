// Backend comment: workerApplicationController
import { Request, Response } from 'express';
import WorkerApplication from '../models/WorkerApplication';
import User from '../models/User';
import Worker from '../models/Worker';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';
import { sendWorkerCredentialsEmail, sendApplicationRejectionEmail } from '../services/emailService';
import cloudinary from '../config/cloudinary';

/**
 * Submit worker application
 * POST /api/worker-applications/submit
 */
export const submitWorkerApplication = async (req: Request, res: Response) => {
  try {
    const { name, personalEmail, phone, profession, experience, address } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Check if application already exists
    const existingApplication = await WorkerApplication.findOne({
      $or: [{ personalEmail }, { phone }]
    });

    if (existingApplication) {
      if (existingApplication.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending application'
        });
      }
      if (existingApplication.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'You are already registered as a worker'
        });
      }
    }

    // Upload Aadhaar images to Cloudinary
    const documents: any = {};
    
    if (files && files.aadhaarFront) {
      const aadhaarFrontResult = await cloudinary.uploader.upload(files.aadhaarFront[0].path, {
        folder: 'udhyogapay/kyc/aadhaar-front'
      });
      documents.aadhaarFront = {
        url: aadhaarFrontResult.secure_url,
        uploadedAt: new Date()
      };
    }

    if (files && files.aadhaarBack) {
      const aadhaarBackResult = await cloudinary.uploader.upload(files.aadhaarBack[0].path, {
        folder: 'udhyogapay/kyc/aadhaar-back'
      });
      documents.aadhaarBack = {
        url: aadhaarBackResult.secure_url,
        uploadedAt: new Date()
      };
    }

    // Create worker application
    const application = await WorkerApplication.create({
      name,
      personalEmail,
      phone,
      profession,
      experience,
      address,
      documents,
      status: 'pending',
      kycStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. You will receive an email once approved.',
      application: {
        id: application._id,
        status: application.status,
        kycStatus: application.kycStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all pending worker applications (Admin only)
 * GET /api/worker-applications/pending
 */
export const getPendingApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await WorkerApplication.find({ status: 'pending' })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Approve worker application (Admin only)
 * POST /api/worker-applications/:id/approve
 */
export const approveWorkerApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { workEmail } = req.body;

    // Find application
    const application = await WorkerApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been reviewed'
      });
    }

    // Generate random password
    const randomPassword = crypto.randomBytes(8).toString('hex');

    // Create user account with admin-provided work email
    const user = await User.create({
      name: application.name,
      email: workEmail,
      phone: application.phone,
      password: randomPassword,
      role: 'worker'
    });

    // Create worker profile
    const worker = await Worker.create({
      userId: user._id,
      profession: application.profession,
      experience: application.experience,
      isVerified: true,
      isOnline: false,
      documents: application.documents
    });

    // Update application
    application.status = 'approved';
    application.workEmail = workEmail;
    application.userId = user._id;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user?.id;
    await application.save();

    // Send email to worker's personal email with credentials
    try {
      await sendWorkerCredentialsEmail({
        personalEmail: application.personalEmail,
        name: application.name,
        workEmail,
        password: randomPassword,
        profession: application.profession
      });
      
      res.status(200).json({
        success: true,
        message: 'Worker application approved successfully. Login credentials have been sent to the worker\'s email.',
        emailSent: true
      });
    } catch (emailError: any) {
      // Even if email fails, the account is created
      console.error('Failed to send email:', emailError);
      res.status(200).json({
        success: true,
        message: 'Worker application approved successfully, but email sending failed.',
        emailSent: false,
        credentials: {
          workEmail,
          password: randomPassword,
          personalEmail: application.personalEmail
        },
        error: 'Please manually send credentials to worker'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Reject worker application (Admin only)
 * POST /api/worker-applications/:id/reject
 */
export const rejectWorkerApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const application = await WorkerApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been reviewed'
      });
    }

    application.status = 'rejected';
    application.rejectionReason = reason;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user?.id;
    await application.save();

    // Send rejection email to worker
    try {
      await sendApplicationRejectionEmail(
        application.personalEmail,
        application.name,
        reason
      );
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Worker application rejected'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get application status by email
 * POST /api/worker-applications/check-status
 */
export const checkApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const application = await WorkerApplication.findOne({ personalEmail: email });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No application found with this email'
      });
    }

    res.status(200).json({
      success: true,
      application: {
        status: application.status,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        rejectionReason: application.rejectionReason
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
