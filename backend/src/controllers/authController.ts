// Backend comment: authController
import { Request, Response } from 'express';
import User from '../models/User';
import Worker from '../models/Worker';
import { generateToken } from '../middleware/auth';
import { validateRegister, validateLogin } from '../utils/validators';
import { ErrorHandler } from '../utils/errorHandler';
import { sendPasswordResetEmail } from '../services/emailService';
import crypto from 'crypto';

/**
 * Register a new user or worker
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role
    });

    // If role is worker, create worker profile
    if (role === 'worker') {
      await Worker.create({
        userId: user._id,
        profession: 'plumber', // Default, will be updated during KYC
        experience: 0,
        isVerified: process.env.NODE_ENV === 'development', // Auto-verify in development
        isOnline: false,
        currentLocation: {
          type: 'Point',
          coordinates: [0, 0],
          address: 'Not set',
          lastUpdated: new Date()
        }
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
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
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = req.body;

    // Hardcoded admin credentials
    if (email === 'rajuchaswik@gmail.com' && password === 'Raju@2006') {
      // Find admin user by email or phone
      let adminUser = await User.findOne({ 
        $or: [
          { email: 'rajuchaswik@gmail.com' },
          { phone: '9876543210' }
        ]
      });
      
      if (!adminUser) {
        // Create the admin user if it doesn't exist
        try {
          adminUser = await User.create({
            name: 'Admin',
            email: 'rajuchaswik@gmail.com',
            phone: '9876543210',
            password: 'Raju@2006',
            role: 'admin'
          });
        } catch (error: any) {
          // If creation fails due to duplicate, find existing user
          if (error.code === 11000) {
            adminUser = await User.findOne({ 
              $or: [
                { email: 'rajuchaswik@gmail.com' },
                { phone: '9876543210' }
              ]
            });
            if (adminUser && adminUser.role !== 'admin') {
              adminUser.role = 'admin';
              await adminUser.save();
            }
          } else {
            throw error;
          }
        }
      } else if (adminUser.role !== 'admin') {
        // Update role to admin if user exists but is not admin
        adminUser.role = 'admin';
        await adminUser.save();
      }

      if (!adminUser) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create or find admin user'
        });
      }

      // Generate token
      const token = generateToken(adminUser._id.toString());

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone,
          role: adminUser.role
        }
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
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
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Verify token
 * GET /api/auth/verify-token
 */
export const verifyToken = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid'
  });
};

/**
 * Admin password reset (for rajuchaswik@gmail.com only)
 * POST /api/auth/admin/reset-password
 */
export const adminResetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    // Check if email is admin email
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Forgot password - Send reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
      // Send email
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1)
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (emailError: any) {
      // If email fails, remove reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.'
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
 * Reset password using token
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash token to compare with stored hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token and check expiry
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
