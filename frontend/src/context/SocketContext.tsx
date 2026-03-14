// Context module: provides shared SocketContext state and actions across the app.
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

export interface SocketContextType {
  socket: Socket | null;
  connect: (userId?: string) => void;
  disconnect: () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.connect(user.id);

      // Join appropriate room based on role
      if (user.role === 'user') {
        socketService.joinUserRoom(user.id);
      } else if (user.role === 'worker') {
        // Worker will join their room after getting worker profile
      } else if (user.role === 'admin') {
        socketService.joinAdminRoom();
      }

      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const connect = (userId?: string) => {
    socketService.connect(userId);
  };

  const disconnect = () => {
    socketService.disconnect();
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketService.getSocket(),
        connect,
        disconnect
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
