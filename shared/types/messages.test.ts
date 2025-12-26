import { describe, it, expect } from 'vitest';
import type {
  ClientMessage,
  ServerMessage,
  JoinRoomMessage,
  CreateRoomMessage,
  ActionMessage,
  StateUpdateMessage,
  ErrorMessage,
  PlayerJoinedMessage,
  PlayerLeftMessage,
} from './messages.js';

describe('Message Types', () => {
  it('should define JoinRoomMessage', () => {
    const message: JoinRoomMessage = {
      type: 'joinRoom',
      roomCode: 'ABC123',
    };
    expect(message.type).toBe('joinRoom');
    expect(message.roomCode).toBe('ABC123');
  });

  it('should define CreateRoomMessage', () => {
    const message: CreateRoomMessage = {
      type: 'createRoom',
      cityName: 'Test City',
      gridSize: 50,
    };
    expect(message.type).toBe('createRoom');
    expect(message.cityName).toBe('Test City');
  });

  it('should define ActionMessage', () => {
    const message: ActionMessage = {
      type: 'action',
      action: {
        type: 'placeBuilding',
        x: 10,
        y: 10,
        buildingType: 'house_small',
      },
    };
    expect(message.type).toBe('action');
    expect(message.action.type).toBe('placeBuilding');
  });

  it('should define StateUpdateMessage', () => {
    const message: StateUpdateMessage = {
      type: 'stateUpdate',
      changedTiles: [{ x: 10, y: 10, tile: null as any }],
      stats: null as any,
      timestamp: Date.now(),
    };
    expect(message.type).toBe('stateUpdate');
    expect(message.changedTiles).toHaveLength(1);
  });

  it('should define ErrorMessage', () => {
    const message: ErrorMessage = {
      type: 'error',
      code: 'INVALID_ACTION',
      message: 'Invalid action',
    };
    expect(message.type).toBe('error');
    expect(message.code).toBe('INVALID_ACTION');
  });
});

