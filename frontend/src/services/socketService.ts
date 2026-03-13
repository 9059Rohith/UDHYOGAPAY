// Service layer: handles socketService API calls and request logic.
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(userId?: string): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket?.id);
        if (userId) {
          this.joinUserRoom(userId);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Join user-specific room
  joinUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('user:online', userId);
    }
  }

  // Join worker-specific room
  joinWorkerRoom(workerId: string): void {
    if (this.socket) {
      this.socket.emit('worker:online', workerId);
    }
  }

  // Join admin room
  joinAdminRoom(): void {
    if (this.socket) {
      this.socket.emit('admin:join');
    }
  }

  // Update worker location
  updateWorkerLocation(workerId: string, coordinates: [number, number]): void {
    if (this.socket) {
      this.socket.emit('worker:location:update', {
        workerId,
        coordinates
      });
    }
  }

  // Send booking request
  sendBookingRequest(data: any): void {
    if (this.socket) {
      this.socket.emit('booking:request', data);
    }
  }

  // Accept booking
  acceptBooking(data: any): void {
    if (this.socket) {
      this.socket.emit('booking:accept', data);
    }
  }

  // Reject booking
  rejectBooking(data: any): void {
    if (this.socket) {
      this.socket.emit('booking:reject', data);
    }
  }

  // Start booking
  startBooking(data: any): void {
    if (this.socket) {
      this.socket.emit('booking:started', data);
    }
  }

  // Complete booking
  completeBooking(data: any): void {
    if (this.socket) {
      this.socket.emit('booking:completed', data);
    }
  }

  // Listen for events
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
