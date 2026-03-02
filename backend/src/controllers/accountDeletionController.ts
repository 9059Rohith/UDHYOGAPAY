import { Response } from 'express';
import User from '../models/User';
import Worker from '../models/Worker';
import DeletionLog from '../models/DeletionLog';
import Booking from '../models/Booking';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all users and workers for deletion management
 * GET /api/account-deletion/admin/accounts
 */
export const getAllAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const { role, searchTerm } = req.query;

    let query: any = { role: { $ne: 'admin' } }; // Exclude admin accounts

    if (role && role !== 'all') {
      query.role = role;
    }

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const accounts = await User.find(query)
      .select('name email phone role createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: accounts.length,
      accounts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete user account with reason logging
 * DELETE /api/account-deletion/admin/delete/:id
 */
export const deleteUserAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, additionalInfo } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for deletion'
      });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin accounts'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.find({
      $or: [{ user: id }, { worker: id }],
      status: { $in: ['pending', 'accepted', 'started'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete account with ${activeBookings.length} active booking(s). Please complete or cancel them first.`
      });
    }

    // Log the deletion
    await DeletionLog.create({
      deletedUserId: user._id,
      accountHolderName: user.name,
      email: user.email,
      role: user.role,
      reason,
      additionalInfo,
      deletedBy: req.user!._id
    });

    // If user is a worker, delete worker profile
    if (user.role === 'worker') {
      await Worker.findOneAndDelete({ userId: user._id });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully and logged'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get deletion logs
 * GET /api/account-deletion/admin/logs
 */
export const getDeletionLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { role, startDate, endDate } = req.query;

    let query: any = {};

    if (role) {
      query.role = role;
    }

    if (startDate || endDate) {
      query.deletedAt = {};
      if (startDate) query.deletedAt.$gte = new Date(startDate as string);
      if (endDate) query.deletedAt.$lte = new Date(endDate as string);
    }

    const logs = await DeletionLog.find(query)
      .populate('deletedBy', 'name email')
      .sort({ deletedAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get account details with stats
 * GET /api/account-deletion/admin/account/:id
 */
export const getAccountDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get booking stats
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          $or: [
            { user: user._id },
            { worker: user._id }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get worker info if applicable
    let workerInfo = null;
    if (user.role === 'worker') {
      workerInfo = await Worker.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      account: {
        ...user.toObject(),
        bookingStats,
        workerInfo
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
