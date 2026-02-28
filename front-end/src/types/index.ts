export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  username: string;
  role: Role;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  floorNumber: number;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface Booking {
  id: number;
  roomId: number;
  roomName: string;
  userId: number;
  username: string;
  date: string;
  startTime: string;
  endTime: string;
  agenda: string;
  status: BookingStatus;
  durationMinutes: number;
}