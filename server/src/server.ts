import express, { Express, Request, Response } from 'express';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './roomManager.js';
import { createInitialGameState } from './gameState.js';
import type { CreateRoomMessage, JoinRoomMessage, PlayerInfo } from '@isometric-city/shared';

export interface ServerInstance {
  app: Express;
  httpServer: HttpServer;
  io: SocketIOServer;
  close: () => void;
}

export function createServer(port: number = 3001, autoStart: boolean = true): ServerInstance {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Create HTTP server
  const httpServer = createHttpServer(app);

  // Create Socket.io server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Initialize room manager
  const roomManager = new RoomManager(io);

  // Track socket to room mapping for cleanup
  const socketToRoom: Map<string, string> = new Map(); // Map<socketId, roomId>

  // Socket.io connection handling
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle room creation
    socket.on('createRoom', (message: CreateRoomMessage) => {
      try {
        const { cityName, gridSize } = message;
        
        // Create new room
        const room = roomManager.createRoom();
        
        // Create initial game state
        const gameState = createInitialGameState(cityName, gridSize);
        room.setGameState(gameState);
        
        // Create player info
        const player: PlayerInfo = {
          id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          socketId: socket.id,
          joinedAt: Date.now(),
        };
        
        // Add player to room
        room.addPlayer(player);
        
        // Join socket room
        socket.join(room.getId());
        socketToRoom.set(socket.id, room.getId());
        
        // Send room created message
        socket.emit('roomCreated', {
          type: 'roomCreated',
          roomId: room.getId(),
          roomCode: room.getCode(),
        });
        
        // Send room joined message with initial state
        socket.emit('roomJoined', {
          type: 'roomJoined',
          roomId: room.getId(),
          roomCode: room.getCode(),
          gameState: room.getGameState()!,
          players: room.getPlayers(),
        });
        
        console.log(`Room created: ${room.getCode()} by ${socket.id}`);
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error', {
          type: 'error',
          code: 'ROOM_CREATION_FAILED',
          message: 'Failed to create room',
        });
      }
    });

    // Handle room joining
    socket.on('joinRoom', (message: JoinRoomMessage) => {
      try {
        const { roomCode } = message;
        
        // Find room by code
        const room = roomManager.getRoomByCode(roomCode.toUpperCase());
        
        if (!room) {
          socket.emit('roomJoinFailed', {
            type: 'roomJoinFailed',
            reason: 'room_not_found',
          });
          return;
        }
        
        // Check if room is full
        if (room.isFull()) {
          socket.emit('roomJoinFailed', {
            type: 'roomJoinFailed',
            reason: 'room_full',
          });
          return;
        }
        
        // Create player info
        const player: PlayerInfo = {
          id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          socketId: socket.id,
          joinedAt: Date.now(),
        };
        
        // Add player to room
        if (!room.addPlayer(player)) {
          socket.emit('roomJoinFailed', {
            type: 'roomJoinFailed',
            reason: 'room_full',
          });
          return;
        }
        
        // Join socket room
        socket.join(room.getId());
        socketToRoom.set(socket.id, room.getId());
        
        // Send room joined message to the new player
        socket.emit('roomJoined', {
          type: 'roomJoined',
          roomId: room.getId(),
          roomCode: room.getCode(),
          gameState: room.getGameState()!,
          players: room.getPlayers(),
        });
        
        // Notify other players
        room.broadcastToOthers(socket.id, 'playerJoined', {
          type: 'playerJoined',
          player,
          players: room.getPlayers(),
        });
        
        console.log(`Player ${player.id} joined room ${room.getCode()}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', {
          type: 'error',
          code: 'ROOM_JOIN_FAILED',
          message: 'Failed to join room',
        });
      }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        const room = roomManager.getRoomById(roomId);
        if (room) {
          // Find and remove player
          const player = room.getPlayers().find(p => p.socketId === socket.id);
          if (player) {
            room.removePlayer(player.id);
            
            // Notify other players
            room.broadcastToOthers(socket.id, 'playerLeft', {
              type: 'playerLeft',
              playerId: player.id,
              players: room.getPlayers(),
            });
            
            console.log(`Player ${player.id} left room ${room.getCode()}`);
            
            // If room is empty, delete it (ephemeral rooms)
            if (room.getPlayers().length === 0) {
              roomManager.deleteRoom(roomId);
              console.log(`Room ${room.getCode()} deleted (empty)`);
            }
          }
        }
        socketToRoom.delete(socket.id);
      }
    });
  });

  // Start server if autoStart is true
  if (autoStart) {
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }

  return {
    app,
    httpServer,
    io,
    close: () => {
      io.close();
      httpServer.close();
    },
  };
}

// Start server if this file is run directly
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('server.ts')) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  createServer(port);
}

