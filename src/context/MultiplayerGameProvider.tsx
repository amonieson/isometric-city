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
  const { loadState, state } = useGame();
  const lastSyncedStateRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(false);

  // When we join a room, load the initial game state
  useEffect(() => {
    if (multiplayer.gameState && multiplayer.roomCode && multiplayer.isConnected) {
      const stateString = JSON.stringify(multiplayer.gameState);
      
      // Only update if the state actually changed
      if (stateString !== lastSyncedStateRef.current) {
        lastSyncedStateRef.current = stateString;
        // Preserve UI state when loading
        const stateToLoad = {
          ...multiplayer.gameState,
          selectedTool: state.selectedTool,
          activePanel: state.activePanel,
          speed: state.speed,
        };
        loadState(JSON.stringify(stateToLoad));
        
        if (!isInitialLoadRef.current) {
          isInitialLoadRef.current = true;
        }
      }
    } else {
      // Reset when leaving multiplayer
      isInitialLoadRef.current = false;
      lastSyncedStateRef.current = null;
    }
  }, [multiplayer.gameState, multiplayer.roomCode, multiplayer.isConnected, loadState, state.selectedTool, state.activePanel, state.speed]);

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

