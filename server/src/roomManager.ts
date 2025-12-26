import { Server as SocketIOServer } from 'socket.io';
import { Room } from './room.js';

/**
 * Generates a random 6-character room code using uppercase letters and numbers
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map(); // Map<roomId, Room>
  private roomCodes: Map<string, string> = new Map(); // Map<roomCode, roomId>
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  createRoom(): Room {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    // Generate a unique room code
    do {
      code = generateRoomCode();
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique room code after multiple attempts');
      }
    } while (this.roomCodes.has(code));

    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const room = new Room(roomId, code, this.io);

    this.rooms.set(roomId, room);
    this.roomCodes.set(code, roomId);

    return room;
  }

  getRoomByCode(code: string): Room | null {
    const roomId = this.roomCodes.get(code);
    if (!roomId) {
      return null;
    }
    return this.rooms.get(roomId) || null;
  }

  getRoomById(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    this.roomCodes.delete(room.getCode());
    this.rooms.delete(roomId);
    return true;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}

