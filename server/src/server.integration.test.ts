import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from './server.js';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';
import type { CreateRoomMessage, JoinRoomMessage } from '@isometric-city/shared';

describe('Server Socket.io Integration', () => {
  let server: ReturnType<typeof createServer>;
  let client1: ClientSocket;
  let client2: ClientSocket;
  let port: number;

  beforeAll(async () => {
    return new Promise<void>((resolve) => {
      server = createServer(0, false); // Don't auto-start
      const httpServer = server.httpServer;
      httpServer.listen(() => {
        port = (httpServer.address() as AddressInfo).port;
        client1 = Client(`http://localhost:${port}`);
        client2 = Client(`http://localhost:${port}`);
        
        let client1Connected = false;
        let client2Connected = false;
        
        const checkBothConnected = () => {
          if (client1Connected && client2Connected) {
            resolve();
          }
        };
        
        client1.on('connect', () => {
          client1Connected = true;
          checkBothConnected();
        });
        
        client2.on('connect', () => {
          client2Connected = true;
          checkBothConnected();
        });
      });
    });
  });

  afterAll(() => {
    if (client1) client1.close();
    if (client2) client2.close();
    if (server) server.close();
  });

  it('should create a room and return room code', (done) => {
    const createMessage: CreateRoomMessage = {
      type: 'createRoom',
      cityName: 'Test City',
      gridSize: 50,
    };

    client1.once('roomCreated', (message) => {
      expect(message.type).toBe('roomCreated');
      expect(message.roomId).toBeDefined();
      expect(message.roomCode).toMatch(/^[A-Z0-9]{6}$/);
      done();
    });

    client1.emit('createRoom', createMessage);
  });

  it('should send roomJoined message after creating room', (done) => {
    const createMessage: CreateRoomMessage = {
      type: 'createRoom',
      cityName: 'Test City 2',
      gridSize: 50,
    };

    client1.once('roomJoined', (message) => {
      expect(message.type).toBe('roomJoined');
      expect(message.roomId).toBeDefined();
      expect(message.roomCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(message.gameState).toBeDefined();
      expect(message.gameState.cityName).toBe('Test City 2');
      expect(message.gameState.gridSize).toBe(50);
      expect(message.players).toHaveLength(1);
      done();
    });

    client1.emit('createRoom', createMessage);
  });

  it('should allow second player to join room', (done) => {
    let roomCode: string;

    // First player creates room
    client1.once('roomCreated', (message) => {
      roomCode = message.roomCode;
      
      // Second player joins
      const joinMessage: JoinRoomMessage = {
        type: 'joinRoom',
        roomCode,
      };

      client2.once('roomJoined', (message) => {
        expect(message.type).toBe('roomJoined');
        expect(message.roomCode).toBe(roomCode);
        expect(message.players).toHaveLength(2);
        done();
      });

      client2.emit('joinRoom', joinMessage);
    });

    const createMessage: CreateRoomMessage = {
      type: 'createRoom',
      cityName: 'Test City 3',
      gridSize: 50,
    };
    client1.emit('createRoom', createMessage);
  });

  it('should notify other players when someone joins', (done) => {
    let roomCode: string;

    // First player creates room
    client1.once('roomCreated', (message) => {
      roomCode = message.roomCode;
      
      // Listen for playerJoined event
      client1.once('playerJoined', (message) => {
        expect(message.type).toBe('playerJoined');
        expect(message.player).toBeDefined();
        expect(message.players).toHaveLength(2);
        done();
      });

      // Second player joins
      const joinMessage: JoinRoomMessage = {
        type: 'joinRoom',
        roomCode,
      };
      client2.emit('joinRoom', joinMessage);
    });

    const createMessage: CreateRoomMessage = {
      type: 'createRoom',
      cityName: 'Test City 4',
      gridSize: 50,
    };
    client1.emit('createRoom', createMessage);
  });

  it('should reject join when room is full', (done) => {
    let roomCode: string;

    // Create room and add two players
    client1.once('roomCreated', (message) => {
      roomCode = message.roomCode;
      
      // Second player joins
      client2.once('roomJoined', () => {
        // Third client tries to join
        const client3 = Client(`http://localhost:${port}`);
        client3.on('connect', () => {
          client3.once('roomJoinFailed', (message) => {
            expect(message.type).toBe('roomJoinFailed');
            expect(message.reason).toBe('room_full');
            client3.close();
            done();
          });

          const joinMessage: JoinRoomMessage = {
            type: 'joinRoom',
            roomCode,
          };
          client3.emit('joinRoom', joinMessage);
        });
        client3.connect();
      });

      const joinMessage: JoinRoomMessage = {
        type: 'joinRoom',
        roomCode,
      };
      client2.emit('joinRoom', joinMessage);
    });

    const createMessage: CreateRoomMessage = {
      type: 'createRoom',
      cityName: 'Test City 5',
      gridSize: 50,
    };
    client1.emit('createRoom', createMessage);
  });

  it('should reject join for non-existent room', (done) => {
    client1.once('roomJoinFailed', (message) => {
      expect(message.type).toBe('roomJoinFailed');
      expect(message.reason).toBe('room_not_found');
      done();
    });

    const joinMessage: JoinRoomMessage = {
      type: 'joinRoom',
      roomCode: 'INVALID',
    };
    client1.emit('joinRoom', joinMessage);
  });
});
