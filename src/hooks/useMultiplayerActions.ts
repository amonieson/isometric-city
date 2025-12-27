'use client';

import { useCallback } from 'react';
import { useMultiplayerContext } from '@/context/MultiplayerContext';
import { useGame } from '@/context/GameContext';
import type { PlaceBuildingAction, BulldozeAction, PlaceZoneAction } from '../../shared/types/actions.js';
import { Tool, TOOL_INFO } from '@/types/game';

const toolBuildingMap: Partial<Record<Tool, string>> = {
  road: 'road',
  rail: 'rail',
  tree: 'tree',
  police_station: 'police_station',
  fire_station: 'fire_station',
  hospital: 'hospital',
  school: 'school',
  university: 'university',
  park: 'park',
  park_large: 'park_large',
  power_plant: 'power_plant',
  water_tower: 'water_tower',
  // Add more as needed
};

const toolZoneMap: Partial<Record<Tool, string>> = {
  zone_residential: 'residential',
  zone_commercial: 'commercial',
  zone_industrial: 'industrial',
  zone_dezone: 'none',
};

/**
 * Hook that provides a multiplayer-aware placeAtTile function
 * Routes actions to server if in multiplayer mode, otherwise applies locally
 */
export function useMultiplayerActions() {
  const { placeAtTile: localPlaceAtTile, state } = useGame();
  const multiplayer = useMultiplayerContext();

  const placeAtTile = useCallback((x: number, y: number) => {
    // Check if we're in multiplayer mode
    if (multiplayer.roomCode && multiplayer.isConnected && multiplayer.sendAction) {
      const tool = state.selectedTool;
      if (!tool || tool === 'select') {
        localPlaceAtTile(x, y);
        return;
      }

      const building = toolBuildingMap[tool as Tool];
      const zone = toolZoneMap[tool as Tool];

      // Create action based on tool
      let action: PlaceBuildingAction | BulldozeAction | PlaceZoneAction | null = null;

      if (tool === 'bulldoze') {
        action = {
          type: 'bulldoze',
          x,
          y,
        } as BulldozeAction;
      } else if (zone) {
        action = {
          type: 'placeZone',
          x,
          y,
          zoneType: zone as any,
        } as PlaceZoneAction;
      } else if (building) {
        action = {
          type: 'placeBuilding',
          x,
          y,
          buildingType: building as any,
        } as PlaceBuildingAction;
      }

      if (action) {
        // Send action to server (server will validate and process)
        multiplayer.sendAction(action as any);
      } else {
        // Fallback to local handling for unsupported actions (subway, terraform, etc.)
        localPlaceAtTile(x, y);
      }
    } else {
      // Single-player mode - use local handler
      localPlaceAtTile(x, y);
    }
  }, [localPlaceAtTile, multiplayer, state.selectedTool]);

  return { placeAtTile };
}

