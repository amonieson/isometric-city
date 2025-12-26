'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MultiplayerClient, ConnectionStatus } from '@/lib/multiplayerClient';
import type {
  RoomCreatedMessage,
  RoomJoinedMessage,
  RoomJoinFailedMessage,
  StateUpdateMessage,
  PlayerJoinedMessage,
  PlayerLeftMessage,
  ErrorMessage,
  PlayerInfo,
} from '../../../shared/types/messages.js';
import type { GameState } from '../../../shared/types/game.js';

const SERVER_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export interface MultiplayerState {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  roomCode: string | null;
  roomId: string | null;
  players: PlayerInfo[];
  gameState: GameState | null;
  error: string | null;
}

export function useMultiplayer() {
  const clientRef = useRef<MultiplayerClient | null>(null);
  const [state, setState] = useState<MultiplayerState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    roomCode: null,
    roomId: null,
    players: [],
    gameState: null,
    error: null,
  });

  // Initialize client
  useEffect(() => {
    const client = new MultiplayerClient(SERVER_URL, {
      onConnectionChange: (status) => {
        setState((prev) => ({
          ...prev,
          connectionStatus: status,
          isConnected: status === 'connected',
        }));
      },
      onRoomCreated: (message: RoomCreatedMessage) => {
        setState((prev) => ({
          ...prev,
          roomId: message.roomId,
          roomCode: message.roomCode,
          error: null,
        }));
      },
      onRoomJoined: (message: RoomJoinedMessage) => {
        setState((prev) => ({
          ...prev,
          roomId: message.roomId,
          roomCode: message.roomCode,
          players: message.players,
          gameState: message.gameState,
          error: null,
        }));
      },
      onRoomJoinFailed: (message: RoomJoinFailedMessage) => {
        setState((prev) => ({
          ...prev,
          error: `Failed to join room: ${message.reason}`,
        }));
      },
      onStateUpdate: (message: StateUpdateMessage) => {
        setState((prev) => {
          if (!prev.gameState) return prev;

          // Merge state update into current game state
          const newGrid = prev.gameState.grid.map((row, y) =>
            row.map((tile, x) => {
              const changedTile = message.changedTiles.find(
                (ct) => ct.x === x && ct.y === y
              );
              if (changedTile) {
                return changedTile.tile || tile; // null means tile was removed
              }
              return tile;
            })
          );

          return {
            ...prev,
            gameState: {
              ...prev.gameState,
              grid: newGrid,
              stats: message.stats ? { ...prev.gameState.stats, ...message.stats } : prev.gameState.stats,
            },
          };
        });
      },
      onPlayerJoined: (message: PlayerJoinedMessage) => {
        setState((prev) => ({
          ...prev,
          players: message.players,
        }));
      },
      onPlayerLeft: (message: PlayerLeftMessage) => {
        setState((prev) => ({
          ...prev,
          players: message.players,
        }));
      },
      onError: (message: ErrorMessage) => {
        setState((prev) => ({
          ...prev,
          error: message.message,
        }));
      },
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
    };
  }, []);

  const createRoom = useCallback((cityName: string, gridSize: number) => {
    if (clientRef.current) {
      clientRef.current.createRoom(cityName, gridSize);
    }
  }, []);

  const joinRoom = useCallback((roomCode: string) => {
    if (clientRef.current) {
      clientRef.current.joinRoom(roomCode);
    }
  }, []);

  const sendAction = useCallback((action: Parameters<typeof clientRef.current.sendAction>[0]) => {
    if (clientRef.current && state.isConnected) {
      clientRef.current.sendAction(action);
    }
  }, [state.isConnected]);

  return {
    ...state,
    createRoom,
    joinRoom,
    sendAction,
  };
}

