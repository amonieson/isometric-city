import { describe, it, expect, beforeEach } from 'vitest';
import { validateAction, processAction } from './actions.js';
import { createInitialGameState } from './gameState.js';
import type { GameAction, PlaceBuildingAction, BulldozeAction, PlaceZoneAction } from '../../shared/types/actions.js';
import type { GameState } from '../../shared/types/game.js';

describe('Action Validation', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState('Test City', 50);
  });

  it('should validate placeBuilding action with sufficient funds', () => {
    const action: PlaceBuildingAction = {
      type: 'placeBuilding',
      x: 10,
      y: 10,
      buildingType: 'house_small',
    };
    // house_small costs 0 (it's a zone building), but let's check it validates
    expect(validateAction(action, state)).toBe(true);
  });

  it('should reject placeBuilding action with insufficient funds', () => {
    state.stats.money = 0;
    const action: PlaceBuildingAction = {
      type: 'placeBuilding',
      x: 10,
      y: 10,
      buildingType: 'hospital', // hospital costs 1000
    };
    expect(validateAction(action, state)).toBe(false);
  });

  it('should reject placeBuilding action on water', () => {
    state.grid[10][10].building.type = 'water';
    const action: PlaceBuildingAction = {
      type: 'placeBuilding',
      x: 10,
      y: 10,
      buildingType: 'house_small',
    };
    expect(validateAction(action, state)).toBe(false);
  });

  it('should reject placeBuilding action out of bounds', () => {
    const action: PlaceBuildingAction = {
      type: 'placeBuilding',
      x: 100,
      y: 100,
      buildingType: 'house_small',
    };
    expect(validateAction(action, state)).toBe(false);
  });

  it('should validate bulldoze action', () => {
    state.grid[10][10].building.type = 'house_small';
    const action: BulldozeAction = {
      type: 'bulldoze',
      x: 10,
      y: 10,
    };
    expect(validateAction(action, state)).toBe(true);
  });

  it('should reject bulldoze action on water', () => {
    state.grid[10][10].building.type = 'water';
    const action: BulldozeAction = {
      type: 'bulldoze',
      x: 10,
      y: 10,
    };
    expect(validateAction(action, state)).toBe(false);
  });

  it('should validate placeZone action', () => {
    const action: PlaceZoneAction = {
      type: 'placeZone',
      x: 10,
      y: 10,
      zoneType: 'residential',
    };
    expect(validateAction(action, state)).toBe(true);
  });

  it('should reject placeZone action on water', () => {
    state.grid[10][10].building.type = 'water';
    const action: PlaceZoneAction = {
      type: 'placeZone',
      x: 10,
      y: 10,
      zoneType: 'residential',
    };
    expect(validateAction(action, state)).toBe(false);
  });
});

describe('Action Processing', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState('Test City', 50);
  });

  it('should process placeBuilding action', () => {
    const initialMoney = state.stats.money;
    const action: PlaceBuildingAction = {
      type: 'placeBuilding',
      x: 10,
      y: 10,
      buildingType: 'house_small',
    };
    
    const result = processAction(action, state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.grid[10][10].building.type).toBe('house_small');
    }
  });

  it('should process bulldoze action', () => {
    state.grid[10][10].building.type = 'house_small';
    const action: BulldozeAction = {
      type: 'bulldoze',
      x: 10,
      y: 10,
    };
    
    const result = processAction(action, state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.grid[10][10].building.type).toBe('grass');
    }
  });

  it('should process placeZone action', () => {
    const action: PlaceZoneAction = {
      type: 'placeZone',
      x: 10,
      y: 10,
      zoneType: 'residential',
    };
    
    const result = processAction(action, state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.grid[10][10].zone).toBe('residential');
    }
  });

  it('should deduct money when placing building', () => {
    const initialMoney = state.stats.money;
    const action: PlaceBuildingAction = {
      type: 'placeBuilding',
      x: 10,
      y: 10,
      buildingType: 'hospital', // costs 1000
    };
    
    const result = processAction(action, state);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newState.stats.money).toBe(initialMoney - 1000);
    }
  });

  it('should return error for invalid action', () => {
    state.stats.money = 0;
    const action: PlaceBuildingAction = {
      type: 'placeBuilding',
      x: 10,
      y: 10,
      buildingType: 'hospital', // costs 1000, but we have 0
    };
    
    const result = processAction(action, state);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

