// Utility module: contains helper logic for localStorage operations.
import { STORAGE_KEYS } from './constants';

/**
 * Get item from localStorage
 */
export const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Set item in localStorage
 */
export const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage:`, error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error);
  }
};

/**
 * Clear all items from localStorage
 */
export const clear = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Get auth token
 */
export const getAuthToken = (): string | null => {
  return getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Set auth token
 */
export const setAuthToken = (token: string): void => {
  setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Remove auth token
 */
export const removeAuthToken = (): void => {
  removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Get user data
 */
export const getUserData = <T>(): T | null => {
  return getItem<T>(STORAGE_KEYS.USER_DATA);
};

/**
 * Set user data
 */
export const setUserData = <T>(data: T): void => {
  setItem(STORAGE_KEYS.USER_DATA, data);
};

/**
 * Remove user data
 */
export const removeUserData = (): void => {
  removeItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Clear auth data
 */
export const clearAuthData = (): void => {
  removeAuthToken();
  removeUserData();
};
