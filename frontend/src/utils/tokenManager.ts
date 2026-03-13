// Utility module: contains helper logic for tokenManager operations.
import { STORAGE_KEYS } from './constants';

/**
 * Get auth token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Set auth token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Remove auth token
 */
export const removeToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Check if token exists
 */
export const hasToken = (): boolean => {
  return !!getToken();
};

/**
 * Decode JWT token (basic decode, doesn't verify signature)
 */
export const decodeToken = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get token expiry time
 */
export const getTokenExpiry = (token: string): number | null => {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
};

/**
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  removeToken();
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};
