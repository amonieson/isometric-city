/**
 * Multiplayer client wrapper for Socket.io
 * Handles connection, room management, and message passing
 */

import { io, Socket } from 'socket.io-client';
import type {
  ClientMessage,
  ServerMessage,
  CreateRoomMessage,
  JoinRoomMessage,
  ActionMessage,
  RoomCreatedMessage,
  RoomJoinedMessage,
  RoomJoinFailedMessage,
  StateUpdateMessage,
  PlayerJoinedMessage,
  PlayerLeftMessage,
  ErrorMessage,
} from '../../shared/types/messages.js';
import type { GameAction } from '../../shared/types/actions.js';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface MultiplayerClientCallbacks {
  onRoomCreated?: (message: RoomCreatedMessage) => void;
  onRoomJoined?: (message: RoomJoinedMessage) => void;
  onRoomJoinFailed?: (message: RoomJoinFailedMessage) => void;
  onStateUpdate?: (message: StateUpdateMessage) => void;
  onPlayerJoined?: (message: PlayerJoinedMessage) => void;
  onPlayerLeft?: (message: PlayerLeftMessage) => void;
  onError?: (message: ErrorMessage) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

export class MultiplayerClient {
  private socket: Socket | null = null;
  private serverUrl: string;
  private callbacks: MultiplayerClientCallbacks;
  private connectionStatus: ConnectionStatus = 'disconnected';

  constructor(serverUrl: string, callbacks: MultiplayerClientCallbacks = {}) {
    this.serverUrl = serverUrl;
    this.callbacks = callbacks;
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.setConnectionStatus('connecting');

    this.socket = io(this.serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      this.setConnectionStatus('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
      this.setConnectionStatus('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.setConnectionStatus('error');
    });

    // Register message handlers
    this.socket.on('roomCreated', (message: RoomCreatedMessage) => {
      this.callbacks.onRoomCreated?.(message);
    });

    this.socket.on('roomJoined', (message: RoomJoinedMessage) => {
      this.callbacks.onRoomJoined?.(message);
    });

    this.socket.on('roomJoinFailed', (message: RoomJoinFailedMessage) => {
      this.callbacks.onRoomJoinFailed?.(message);
    });

    this.socket.on('stateUpdate', (message: StateUpdateMessage) => {
      this.callbacks.onStateUpdate?.(message);
    });

    this.socket.on('playerJoined', (message: PlayerJoinedMessage) => {
      this.callbacks.onPlayerJoined?.(message);
    });

    this.socket.on('playerLeft', (message: PlayerLeftMessage) => {
      this.callbacks.onPlayerLeft?.(message);
    });

    this.socket.on('error', (message: ErrorMessage) => {
      this.callbacks.onError?.(message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.setConnectionStatus('disconnected');
    }
  }

  createRoom(cityName: string, gridSize: number): void {
    if (!this.socket?.connected) {
      console.error('Not connected to server');
      return;
    }

    const message: CreateRoomMessage = {
      type: 'createRoom',
      cityName,
      gridSize,
    };

    this.socket.emit('createRoom', message);
  }

  joinRoom(roomCode: string): void {
    if (!this.socket?.connected) {
      console.error('Not connected to server');
      return;
    }

    const message: JoinRoomMessage = {
      type: 'joinRoom',
      roomCode: roomCode.toUpperCase(),
    };

    this.socket.emit('joinRoom', message);
  }

  sendAction(action: GameAction): void {
    if (!this.socket?.connected) {
      console.error('Not connected to server');
      return;
    }

    const message: ActionMessage = {
      type: 'action',
      action: {
        ...action,
        timestamp: Date.now(),
      },
    };

    this.socket.emit('action', message);
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.callbacks.onConnectionChange?.(status);
  }
}

