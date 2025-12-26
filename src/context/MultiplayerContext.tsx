'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useMultiplayer, MultiplayerState } from '@/hooks/useMultiplayer';
import type { GameAction } from '../../../shared/types/actions.js';

interface MultiplayerContextValue extends MultiplayerState {
  createRoom: (cityName: string, gridSize: number) => void;
  joinRoom: (roomCode: string) => void;
  sendAction: (action: GameAction) => void;
}

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const multiplayer = useMultiplayer();

  return (
    <MultiplayerContext.Provider value={multiplayer}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayerContext() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayerContext must be used within MultiplayerProvider');
  }
  return context;
}

