// Backend comment: otpService
/**
 * Generate a 4-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Verify OTP
 */
export const verifyOTP = (providedOTP: string, actualOTP: string): boolean => {
  return providedOTP === actualOTP;
};

/**
 * Generate OTP with expiry (optional enhancement)
 */
export const generateOTPWithExpiry = () => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return {
    otp,
    expiresAt
  };
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
