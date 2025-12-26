import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from './roomManager.js';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createHttpServer } from 'http';

describe('RoomManager', () => {
  let roomManager: RoomManager;
  let httpServer: ReturnType<typeof createHttpServer>;
  let io: SocketIOServer;

  beforeEach(() => {
    httpServer = createHttpServer();
    io = new SocketIOServer(httpServer);
    roomManager = new RoomManager(io);
  });

  it('should create a room with a unique code', () => {
    const room = roomManager.createRoom();
    expect(room).toBeDefined();
    expect(room.getCode()).toMatch(/^[A-Z0-9]{6}$/);
    expect(room.getId()).toBeDefined();
  });

  it('should generate unique room codes', () => {
    const room1 = roomManager.createRoom();
    const room2 = roomManager.createRoom();
    expect(room1.getCode()).not.toBe(room2.getCode());
  });

  it('should find a room by code', () => {
    const room = roomManager.createRoom();
    const code = room.getCode();
    const found = roomManager.getRoomByCode(code);
    expect(found).toBe(room);
  });

  it('should return null for non-existent room code', () => {
    const found = roomManager.getRoomByCode('INVALID');
    expect(found).toBeNull();
  });

  it('should find a room by id', () => {
    const room = roomManager.createRoom();
    const id = room.getId();
    const found = roomManager.getRoomById(id);
    expect(found).toBe(room);
  });

  it('should delete a room', () => {
    const room = roomManager.createRoom();
    const code = room.getCode();
    roomManager.deleteRoom(room.getId());
    expect(roomManager.getRoomByCode(code)).toBeNull();
  });

  it('should list all rooms', () => {
    const room1 = roomManager.createRoom();
    const room2 = roomManager.createRoom();
    const rooms = roomManager.getAllRooms();
    expect(rooms).toHaveLength(2);
    expect(rooms).toContain(room1);
    expect(rooms).toContain(room2);
  });
});

