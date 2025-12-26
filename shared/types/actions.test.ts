import { describe, it, expect } from 'vitest';
import type {
  GameAction,
  PlaceBuildingAction,
  BulldozeAction,
  PlaceZoneAction,
  PlaceRoadAction,
  PlaceRailAction,
  PlaceSubwayAction,
  PlaceTreeAction,
  TerraformAction,
  SetTaxRateAction,
  SetSpeedAction,
  SetBudgetAction,
} from './actions.js';

describe('Action Types', () => {
  it('should define PlaceBuildingAction', () => {
    const action: PlaceBuildingAction = {
      type: 'placeBuilding',
      x: 10,
      y: 10,
      buildingType: 'house_small',
    };
    expect(action.type).toBe('placeBuilding');
    expect(action.x).toBe(10);
    expect(action.y).toBe(10);
  });

  it('should define BulldozeAction', () => {
    const action: BulldozeAction = {
      type: 'bulldoze',
      x: 10,
      y: 10,
    };
    expect(action.type).toBe('bulldoze');
  });

  it('should define PlaceZoneAction', () => {
    const action: PlaceZoneAction = {
      type: 'placeZone',
      x: 10,
      y: 10,
      zoneType: 'residential',
    };
    expect(action.type).toBe('placeZone');
    expect(action.zoneType).toBe('residential');
  });

  it('should define PlaceRoadAction', () => {
    const action: PlaceRoadAction = {
      type: 'placeRoad',
      path: [{ x: 10, y: 10 }, { x: 11, y: 10 }],
    };
    expect(action.type).toBe('placeRoad');
    expect(action.path).toHaveLength(2);
  });

  it('should define GameAction union type', () => {
    const actions: GameAction[] = [
      { type: 'placeBuilding', x: 10, y: 10, buildingType: 'house_small' },
      { type: 'bulldoze', x: 10, y: 10 },
      { type: 'placeZone', x: 10, y: 10, zoneType: 'residential' },
    ];
    expect(actions).toHaveLength(3);
  });
});

