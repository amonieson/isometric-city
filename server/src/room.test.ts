import { describe, it, expect, beforeEach } from 'vitest';
import { Room } from './room.js';
import type { GameState, PlayerInfo } from '@isometric-city/shared';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createHttpServer } from 'http';
import { AddressInfo } from 'net';

describe('Room', () => {
  let room: Room;
  let httpServer: ReturnType<typeof createHttpServer>;
  let io: SocketIOServer;

  beforeEach(() => {
    httpServer = createHttpServer();
    io = new SocketIOServer(httpServer);
    room = new Room('test-room-id', 'TEST12', io);
  });

  it('should create a room with id and code', () => {
    expect(room.id).toBe('test-room-id');
    expect(room.code).toBe('TEST12');
  });

  it('should start with no players', () => {
    expect(room.getPlayers()).toHaveLength(0);
  });

  it('should add a player', () => {
    const player: PlayerInfo = {
      id: 'player-1',
      socketId: 'socket-1',
      joinedAt: Date.now(),
    };
    room.addPlayer(player);
    expect(room.getPlayers()).toHaveLength(1);
    expect(room.getPlayers()[0].id).toBe('player-1');
  });

  it('should remove a player', () => {
    const player: PlayerInfo = {
      id: 'player-1',
      socketId: 'socket-1',
      joinedAt: Date.now(),
    };
    room.addPlayer(player);
    expect(room.getPlayers()).toHaveLength(1);
    room.removePlayer('player-1');
    expect(room.getPlayers()).toHaveLength(0);
  });

  it('should enforce max players limit (2)', () => {
    const player1: PlayerInfo = {
      id: 'player-1',
      socketId: 'socket-1',
      joinedAt: Date.now(),
    };
    const player2: PlayerInfo = {
      id: 'player-2',
      socketId: 'socket-2',
      joinedAt: Date.now(),
    };
    const player3: PlayerInfo = {
      id: 'player-3',
      socketId: 'socket-3',
      joinedAt: Date.now(),
    };

    expect(room.addPlayer(player1)).toBe(true);
    expect(room.addPlayer(player2)).toBe(true);
    expect(room.addPlayer(player3)).toBe(false); // Should fail - max 2 players
    expect(room.getPlayers()).toHaveLength(2);
  });

  it('should set and get game state', () => {
    const gameState: Partial<GameState> = {
      id: 'test-game',
      cityName: 'Test City',
      gridSize: 50,
    } as GameState;

    room.setGameState(gameState as GameState);
    const state = room.getGameState();
    expect(state?.cityName).toBe('Test City');
    expect(state?.gridSize).toBe(50);
  });

  it('should check if room is full', () => {
    expect(room.isFull()).toBe(false);
    
    const player1: PlayerInfo = {
      id: 'player-1',
      socketId: 'socket-1',
      joinedAt: Date.now(),
    };
    room.addPlayer(player1);
    expect(room.isFull()).toBe(false);

    const player2: PlayerInfo = {
      id: 'player-2',
      socketId: 'socket-2',
      joinedAt: Date.now(),
    };
    room.addPlayer(player2);
    expect(room.isFull()).toBe(true);
  });
});

