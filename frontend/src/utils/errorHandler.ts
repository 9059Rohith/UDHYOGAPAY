// Utility module: contains helper logic for errorHandler operations.
import type { ApiError } from '../types';

/**
 * Handle API error
 */
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data?.message || 'An error occurred',
      statusCode: error.response.status,
      errors: error.response.data?.errors,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Network error. Please check your connection.',
      statusCode: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: -1,
    };
  }
};

/**
 * Get error message
 */
export const getErrorMessage = (error: any): string => {
  const apiError = handleApiError(error);
  return apiError.message;
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401;
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error: any): boolean => {
  return error.response?.status === 400 || error.response?.status === 422;
};

/**
 * Check if error is not found error
 */
export const isNotFoundError = (error: any): boolean => {
  return error.response?.status === 404;
};

/**
 * Check if error is server error
 */
export const isServerError = (error: any): boolean => {
  return error.response?.status >= 500;
};

/**
 * Extract validation errors
 */
export const extractValidationErrors = (error: any): Record<string, string> => {
  const apiError = handleApiError(error);
  const errors: Record<string, string> = {};
  
  if (apiError.errors) {
    Object.entries(apiError.errors).forEach(([key, messages]) => {
      errors[key] = Array.isArray(messages) ? messages[0] : String(messages);
    });
  }
  
  return errors;
};
