import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserAddress {
  label: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: [number, number];
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'worker' | 'admin';
  avatarUrl?: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  addresses: IUserAddress[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateResetToken(): string;
}

const addressSchema = new Schema<IUserAddress>(
  {
    label: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    landmark: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, match: /^[0-9]{6}$/ },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr: number[]) => arr.length === 2,
        message: 'coordinates must be [lng, lat]'
      }
    },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[0-9]{10}$/
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'worker', 'admin'],
      default: 'user',
      index: true
    },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    isPhoneVerified: { type: Boolean, default: false },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [78.4867, 17.385],
        validate: {
          validator: (arr: number[]) => arr.length === 2,
          message: 'location coordinates must be [lng, lat]'
        }
      }
    },
    addresses: {
      type: [addressSchema],
      default: [],
      validate: {
        validator: (arr: IUserAddress[]) => arr.length <= 5,
        message: 'Maximum 5 saved addresses allowed'
      }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ createdAt: -1 });

userSchema.virtual('defaultAddress').get(function (this: IUser) {
  return this.addresses.find((address) => address.isDefault) || null;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateResetToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  return token;
};

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);

export default User;
