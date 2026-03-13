// Context module: provides shared ToastContext state and actions across the app.
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastOptions } from '../types';

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (options: ToastOptions) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { ...options, id };
    
    setToasts((prev) => [...prev, toast]);

    // Auto-hide toast after duration
    setTimeout(() => {
      hideToast(id);
    }, options.duration || 3000);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
