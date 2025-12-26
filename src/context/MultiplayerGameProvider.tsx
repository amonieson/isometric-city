'use client';

import React, { useEffect, useRef } from 'react';
import { GameProvider, useGame } from './GameContext';
import { MultiplayerProvider, useMultiplayerContext } from './MultiplayerContext';
import type { GameState } from '@/types/game';

/**
 * Component that syncs multiplayer state updates into GameContext
 */
function MultiplayerStateSync() {
  const multiplayer = useMultiplayerContext();
  const gameStateRef = useRef<GameState | null>(null);
  
  // Get access to GameContext's internal state setter via a workaround
  // We'll use the loadState function to update the state
  const { loadState, state } = useGame();

  // When we join a room, load the initial game state
  useEffect(() => {
    if (multiplayer.gameState && multiplayer.roomCode && multiplayer.isConnected) {
      const stateString = JSON.stringify(multiplayer.gameState);
      const currentStateString = JSON.stringify(gameStateRef.current);
      
      // Only update if the state actually changed
      if (stateString !== currentStateString) {
        gameStateRef.current = multiplayer.gameState;
        loadState(stateString);
      }
    }
  }, [multiplayer.gameState, multiplayer.roomCode, multiplayer.isConnected, loadState]);

  return null;
}

/**
 * Wrapper that provides both GameContext and MultiplayerContext
 * and syncs multiplayer state updates into the game state
 */
export function MultiplayerGameProvider({ children }: { children: React.ReactNode }) {
  return (
    <MultiplayerProvider>
      <GameProvider>
        <MultiplayerStateSync />
        {children}
      </GameProvider>
    </MultiplayerProvider>
  );
}

