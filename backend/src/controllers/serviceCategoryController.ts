import { Response } from 'express';
import ServiceCategory from '../models/ServiceCategory';
import { AuthRequest } from '../middleware/auth';

/**
 * Create new service category
 * POST /api/service-categories/create
 */
export const createServiceCategory = async (req: AuthRequest, res: Response) => {
  try {
    const {
      serviceName,
      serviceCode,
      description,
      basePrice,
      pricePerKm,
      minimumCharge,
      estimatedDuration,
      serviceIcon,
      category,
      surgePricingMultiplier,
      requiredSkills
    } = req.body;

    // Validate required fields
    if (!serviceName || !serviceCode || !description || basePrice === undefined || pricePerKm === undefined || minimumCharge === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if service code already exists
    const existingService = await ServiceCategory.findOne({ serviceCode: serviceCode.toUpperCase() });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service code already exists'
      });
    }

    const serviceCategory = await ServiceCategory.create({
      serviceName,
      serviceCode: serviceCode.toUpperCase(),
      description,
      basePrice,
      pricePerKm,
      minimumCharge,
      estimatedDuration: estimatedDuration || 60,
      serviceIcon,
      category: category || 'regular',
      surgePricingMultiplier: surgePricingMultiplier || 1.0,
      requiredSkills: requiredSkills || [],
      createdBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Service category created successfully',
      serviceCategory
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all service categories
 * GET /api/service-categories
 */
export const getAllServiceCategories = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { serviceName: { $regex: req.query.search, $options: 'i' } },
        { serviceCode: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const serviceCategories = await ServiceCategory.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ServiceCategory.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: serviceCategories.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      serviceCategories
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get single service category by ID
 * GET /api/service-categories/:id
 */
export const getServiceCategoryById = async (req: AuthRequest, res: Response) => {
  try {
    const serviceCategory = await ServiceCategory.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }

    res.status(200).json({
      success: true,
      serviceCategory
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update service category
 * PATCH /api/service-categories/:id
 */
export const updateServiceCategory = async (req: AuthRequest, res: Response) => {
  try {
    let serviceCategory = await ServiceCategory.findById(req.params.id);
    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }

    const {
      serviceName,
      description,
      basePrice,
      pricePerKm,
      minimumCharge,
      estimatedDuration,
      serviceIcon,
      category,
      surgePricingMultiplier,
      isActive,
      requiredSkills
    } = req.body;

    serviceCategory = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      {
        serviceName,
        description,
        basePrice,
        pricePerKm,
        minimumCharge,
        estimatedDuration,
        serviceIcon,
        category,
        surgePricingMultiplier,
        isActive,
        requiredSkills,
        updatedBy: req.user?._id
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service category updated successfully',
      serviceCategory
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete service category
 * DELETE /api/service-categories/:id
 */
export const deleteServiceCategory = async (req: AuthRequest, res: Response) => {
  try {
    const serviceCategory = await ServiceCategory.findById(req.params.id);
    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }

    await serviceCategory.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service category deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Toggle service category active status
 * PATCH /api/service-categories/:id/toggle-status
 */
export const toggleServiceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const serviceCategory = await ServiceCategory.findById(req.params.id);
    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }

    serviceCategory.isActive = !serviceCategory.isActive;
    serviceCategory.updatedBy = req.user?._id;
    await serviceCategory.save();

    res.status(200).json({
      success: true,
      message: `Service category ${serviceCategory.isActive ? 'activated' : 'deactivated'} successfully`,
      serviceCategory
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Calculate pricing for a service
 * POST /api/service-categories/calculate-pricing
 */
export const calculatePricing = async (req: AuthRequest, res: Response) => {
  try {
    const { serviceCode, distance } = req.body;

    if (!serviceCode || distance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide service code and distance'
      });
    }

    const serviceCategory = await ServiceCategory.findOne({ 
      serviceCode: serviceCode.toUpperCase(),
      isActive: true
    });

    if (!serviceCategory) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found or inactive'
      });
    }

    // Calculate pricing
    const basePrice = serviceCategory.basePrice;
    const distancePrice = distance * serviceCategory.pricePerKm;
    let totalPrice = basePrice + distancePrice;

    // Apply surge pricing if applicable
    totalPrice = totalPrice * serviceCategory.surgePricingMultiplier;

    // Apply minimum charge
    if (totalPrice < serviceCategory.minimumCharge) {
      totalPrice = serviceCategory.minimumCharge;
    }

    res.status(200).json({
      success: true,
      pricing: {
        serviceName: serviceCategory.serviceName,
        serviceCode: serviceCategory.serviceCode,
        basePrice,
        distance,
        pricePerKm: serviceCategory.pricePerKm,
        distancePrice,
        surgePricingMultiplier: serviceCategory.surgePricingMultiplier,
        minimumCharge: serviceCategory.minimumCharge,
        totalPrice: Math.round(totalPrice),
        estimatedDuration: serviceCategory.estimatedDuration
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
 * Get active service categories (public)
 * GET /api/service-categories/active
 */
export const getActiveServiceCategories = async (req: AuthRequest, res: Response) => {
  try {
    const serviceCategories = await ServiceCategory.find({ isActive: true })
      .select('-createdBy -updatedBy')
      .sort({ serviceName: 1 });

    res.status(200).json({
      success: true,
      count: serviceCategories.length,
      serviceCategories
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
