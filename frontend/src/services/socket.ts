import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(userId?: number): void {
    if (this.socket && this.isConnected) {
      return;
    }

    const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.isConnected = true;
      
      if (userId) {
        this.socket?.emit('join_room', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Booking event listeners
  onNewBooking(callback: (data: any) => void): void {
    this.socket?.on('new_booking', callback);
  }

  onBookingUpdated(callback: (data: any) => void): void {
    this.socket?.on('booking_updated', callback);
  }

  onBookingCancelled(callback: (data: any) => void): void {
    this.socket?.on('booking_cancelled', callback);
  }

  onBookingStatusUpdated(callback: (data: any) => void): void {
    this.socket?.on('booking_status_updated', callback);
  }

  onReceiptUploaded(callback: (data: any) => void): void {
    this.socket?.on('receipt_uploaded', callback);
  }

  // Remove event listeners
  offNewBooking(): void {
    this.socket?.off('new_booking');
  }

  offBookingUpdated(): void {
    this.socket?.off('booking_updated');
  }

  offBookingCancelled(): void {
    this.socket?.off('booking_cancelled');
  }

  offBookingStatusUpdated(): void {
    this.socket?.off('booking_status_updated');
  }

  offReceiptUploaded(): void {
    this.socket?.off('receipt_uploaded');
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;