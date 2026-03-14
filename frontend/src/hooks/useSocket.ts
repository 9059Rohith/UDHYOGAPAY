// Custom hook: encapsulates reusable useSocket state and behavior.
import { useContext } from 'react';
import { SocketContext, SocketContextType } from '../context/SocketContext';

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
