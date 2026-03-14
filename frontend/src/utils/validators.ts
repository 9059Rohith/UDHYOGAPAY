// Utility module: contains helper logic for validators operations.
import { PATTERNS } from './constants';

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  return PATTERNS.EMAIL.test(email);
};

/**
 * Validate phone
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return PATTERNS.PHONE.test(cleaned);
};

/**
 * Validate password
 */
export const isValidPassword = (password: string): boolean => {
  return PATTERNS.PASSWORD.test(password);
};

/**
 * Validate pincode
 */
export const isValidPincode = (pincode: string): boolean => {
  return PATTERNS.PINCODE.test(pincode);
};

/**
 * Validate URL
 */
export const isValidURL = (url: string): boolean => {
  return PATTERNS.URL.test(url);
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const isValidFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Get password strength
 */
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) {
    return { score, label: 'Weak', color: 'red' };
  } else if (score <= 4) {
    return { score, label: 'Medium', color: 'yellow' };
  } else {
    return { score, label: 'Strong', color: 'green' };
  }
};

/**
 * Sanitize input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate OTP
 */
export const isValidOTP = (otp: string): boolean => {
  return /^\d{4,6}$/.test(otp);
};

/**
 * Validate rating
 */
export const isValidRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5;
};
