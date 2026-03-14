// Backend comment: socketService
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import Worker from '../models/Worker';

let io: Server;

export const initializeSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Worker comes online
    socket.on('worker:online', (workerId: string) => {
      socket.join(`worker:${workerId}`);
      console.log(`Worker ${workerId} joined their room`);
    });

    // User joins their room
    socket.on('user:online', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Admin joins admin room
    socket.on('admin:join', () => {
      socket.join('admin');
      console.log('Admin joined admin room');
    });

    // Worker location update (every 30 seconds)
    socket.on('worker:location:update', async (data: {
      workerId: string;
      coordinates: [number, number];
    }) => {
      try {
        await Worker.findByIdAndUpdate(data.workerId, {
          'currentLocation.coordinates': data.coordinates,
          'currentLocation.lastUpdated': new Date()
        });

        // Broadcast to admin dashboard
        io.to('admin').emit('worker:location:updated', {
          workerId: data.workerId,
          coordinates: data.coordinates
        });
      } catch (error) {
        console.error('Error updating worker location:', error);
      }
    });

    // Booking request sent to worker
    socket.on('booking:request', (data: any) => {
      io.to(`worker:${data.workerId}`).emit('booking:request', {
        bookingId: data.bookingId,
        profession: data.profession,
        distance: data.distance,
        estimatedTime: data.estimatedTime,
        userLocation: data.userLocation,
        timeout: 30000 // 30 seconds
      });
    });

    // Worker accepts booking
    socket.on('booking:accept', (data: any) => {
      io.to(`user:${data.userId}`).emit('booking:accepted', {
        workerId: data.workerId,
        workerName: data.workerName,
        estimatedTime: data.estimatedTime,
        otp: data.otp
      });

      // Notify admin
      io.to('admin').emit('booking:status', {
        bookingId: data.bookingId,
        status: 'accepted'
      });
    });

    // Worker rejects booking
    socket.on('booking:reject', (data: any) => {
      io.to(`user:${data.userId}`).emit('booking:rejected', {
        bookingId: data.bookingId,
        message: 'Worker rejected the booking. Finding next available worker...'
      });
    });

    // Booking started (OTP verified)
    socket.on('booking:started', (data: any) => {
      io.to(`user:${data.userId}`).emit('booking:started', {
        bookingId: data.bookingId,
        workerName: data.workerName
      });
    });

    // Booking completed
    socket.on('booking:completed', (data: any) => {
      io.to(`user:${data.userId}`).emit('booking:completed', {
        bookingId: data.bookingId,
        message: 'Service completed. Please rate the worker.'
      });

      io.to(`worker:${data.workerId}`).emit('booking:completed', {
        bookingId: data.bookingId
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToWorker = (workerId: string, event: string, data: any) => {
  if (io) {
    io.to(`worker:${workerId}`).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToAdmin = (event: string, data: any) => {
  if (io) {
    io.to('admin').emit(event, data);
  }
};
