// Backend comment: complaintController
import { Response } from 'express';
import Complaint from '../models/Complaint';
import Booking from '../models/Booking';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

/**
 * Create a new complaint (User or Worker)
 * POST /api/complaints/create
 */
export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, complaintType, description } = req.body;

    // Validation
    if (!jobId || !complaintType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(jobId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Job/Booking not found'
      });
    }

    // Determine complainant role
    const user = await User.findById(req.user!._id);
    const complainantRole = user?.role === 'worker' ? 'worker' : 'user';

    // Create complaint
    const complaint = await Complaint.create({
      complainant: req.user!._id,
      complainantRole,
      jobId,
      complaintType,
      description
    });

    await complaint.populate('complainant', 'name email phone');
    await complaint.populate('jobId', 'profession status createdAt');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all complaints for logged-in user/worker
 * GET /api/complaints/my-complaints
 */
export const getMyComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await Complaint.find({ complainant: req.user!._id })
      .populate('jobId', 'profession status createdAt')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all complaints for admin
 * GET /api/complaints/admin/all
 */
export const getAllComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const { status, complainantRole } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (complainantRole) query.complainantRole = complainantRole;

    const complaints = await Complaint.find(query)
      .populate('complainant', 'name email phone role')
      .populate('jobId', 'profession status createdAt')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update complaint status (Admin only)
 * PATCH /api/complaints/admin/:id/update
 */
export const updateComplaintStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.status = status || complaint.status;
    complaint.adminNotes = adminNotes || complaint.adminNotes;

    if (status === 'resolved') {
      complaint.resolvedBy = req.user!._id;
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    await complaint.populate('complainant', 'name email phone');
    await complaint.populate('jobId', 'profession status');
    await complaint.populate('resolvedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get complaint by ID
 * GET /api/complaints/:id
 */
export const getComplaintById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate('complainant', 'name email phone role')
      .populate('jobId', 'profession status createdAt pricing')
      .populate('resolvedBy', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete complaint (Admin only)
 * DELETE /api/complaints/admin/:id
 */
export const deleteComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
