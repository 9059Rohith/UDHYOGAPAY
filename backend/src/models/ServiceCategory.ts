// Backend comment: ServiceCategory
import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceCategory extends Document {
  serviceName: string;
  serviceCode: string;
  description: string;
  basePrice: number;
  pricePerKm: number;
  minimumCharge: number;
  estimatedDuration: number;
  serviceIcon?: string;
  category: 'urgent' | 'regular' | 'premium';
  surgePricingMultiplier: number;
  isActive: boolean;
  requiredSkills: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceCategorySchema = new Schema<IServiceCategory>({
  serviceName: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
    maxlength: 100
  },
  serviceCode: {
    type: String,
    required: [true, 'Please provide a service code'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9_]+$/, 'Service code must contain only uppercase letters, numbers, and underscores']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 500,
    trim: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Please provide a base price'],
    min: 0
  },
  pricePerKm: {
    type: Number,
    required: [true, 'Please provide price per kilometer'],
    min: 0
  },
  minimumCharge: {
    type: Number,
    required: [true, 'Please provide minimum charge'],
    min: 0
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Please provide estimated duration in minutes'],
    min: 0
  },
  serviceIcon: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['urgent', 'regular', 'premium'],
    required: true,
    default: 'regular'
  },
  surgePricingMultiplier: {
    type: Number,
    min: 1.0,
    max: 3.0,
    default: 1.0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ServiceCategorySchema.index({ serviceName: 1 });
ServiceCategorySchema.index({ isActive: 1, category: 1 });

export default mongoose.model<IServiceCategory>('ServiceCategory', ServiceCategorySchema);
