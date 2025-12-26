// Message types for Socket.io communication between client and server

import type { GameAction } from './actions.js';
import type { GameState, Tile, Stats } from './game.js';

// ===== Client to Server Messages =====

export interface JoinRoomMessage {
  type: 'joinRoom';
  roomCode: string;
}

export interface CreateRoomMessage {
  type: 'createRoom';
  cityName: string;
  gridSize: number;
}

export interface ActionMessage {
  type: 'action';
  action: GameAction;
}

// Union of all client messages
export type ClientMessage = JoinRoomMessage | CreateRoomMessage | ActionMessage;

// ===== Server to Client Messages =====

export interface RoomCreatedMessage {
  type: 'roomCreated';
  roomId: string;
  roomCode: string;
}

export interface RoomJoinedMessage {
  type: 'roomJoined';
  roomId: string;
  roomCode: string;
  gameState: GameState; // Full initial state
  players: PlayerInfo[];
}

export interface RoomJoinFailedMessage {
  type: 'roomJoinFailed';
  reason: 'room_not_found' | 'room_full' | 'invalid_code' | 'server_error';
}

export interface StateUpdateMessage {
  type: 'stateUpdate';
  changedTiles: Array<{ x: number; y: number; tile: Tile | null }>; // null means tile was removed
  stats?: Partial<Stats>;
  timestamp: number;
}

export interface PlayerJoinedMessage {
  type: 'playerJoined';
  player: PlayerInfo;
  players: PlayerInfo[]; // Updated player list
}

export interface PlayerLeftMessage {
  type: 'playerLeft';
  playerId: string;
  players: PlayerInfo[]; // Updated player list
}

export interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
  actionId?: string; // If error is related to a specific action
}

export interface FullStateMessage {
  type: 'fullState';
  gameState: GameState;
}

// Player information
export interface PlayerInfo {
  id: string;
  socketId: string;
  name?: string; // Optional player name
  joinedAt: number;
}

// Union of all server messages
export type ServerMessage =
  | RoomCreatedMessage
  | RoomJoinedMessage
  | RoomJoinFailedMessage
  | StateUpdateMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | ErrorMessage
  | FullStateMessage;

