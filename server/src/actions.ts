import type { GameAction, PlaceBuildingAction, BulldozeAction, PlaceZoneAction } from '../../shared/types/actions.js';
import type { GameState, BuildingType, Building } from '../../shared/types/game.js';

// Building costs - simplified for MVP
const BUILDING_COSTS: Record<BuildingType, number> = {
  empty: 0,
  grass: 0,
  water: 0,
  road: 25,
  bridge: 25,
  rail: 40,
  tree: 15,
  house_small: 0, // Zone building
  house_medium: 0,
  mansion: 0,
  apartment_low: 0,
  apartment_high: 0,
  shop_small: 0,
  shop_medium: 0,
  office_low: 0,
  office_high: 0,
  mall: 0,
  factory_small: 0,
  factory_medium: 0,
  factory_large: 0,
  warehouse: 0,
  police_station: 500,
  fire_station: 500,
  hospital: 1000,
  school: 400,
  university: 2000,
  park: 150,
  park_large: 600,
  tennis: 200,
  power_plant: 3000,
  water_tower: 1000,
  subway_station: 750,
  rail_station: 1000,
  stadium: 5000,
  museum: 4000,
  airport: 10000,
  space_program: 15000,
  city_hall: 6000,
  amusement_park: 12000,
  basketball_courts: 250,
  playground_small: 200,
  playground_large: 350,
  baseball_field_small: 800,
  soccer_field_small: 400,
  football_field: 1200,
  baseball_stadium: 6000,
  community_center: 500,
  office_building_small: 600,
  swimming_pool: 450,
  skate_park: 300,
  mini_golf_course: 700,
  bleachers_field: 350,
  go_kart_track: 1000,
  amphitheater: 1500,
  greenhouse_garden: 800,
  animal_pens_farm: 400,
  cabin_house: 300,
  campground: 250,
  marina_docks_small: 1200,
  pier_large: 600,
  roller_coaster_small: 3000,
  community_garden: 200,
  pond_park: 350,
  park_gate: 150,
  mountain_lodge: 1500,
  mountain_trailhead: 400,
};

const BULLDOZE_COST = 10;
const ZONE_COST = 50;

/**
 * Creates a basic building object
 */
function createBuilding(type: BuildingType): Building {
  return {
    type,
    level: 0,
    population: 0,
    jobs: 0,
    powered: false,
    watered: false,
    onFire: false,
    fireProgress: 0,
    age: 0,
    constructionProgress: 100,
    abandoned: false,
  };
}

/**
 * Validates an action before processing
 */
export function validateAction(action: GameAction, state: GameState): boolean {
  // Check bounds
  if (action.type === 'placeBuilding' || action.type === 'bulldoze' || action.type === 'placeZone') {
    const x = action.x;
    const y = action.y;
    if (x < 0 || y < 0 || x >= state.gridSize || y >= state.gridSize) {
      return false;
    }
  }

  // Check funds
  let cost = 0;
  if (action.type === 'placeBuilding') {
    cost = BUILDING_COSTS[action.buildingType] || 0;
  } else if (action.type === 'bulldoze') {
    cost = BULLDOZE_COST;
  } else if (action.type === 'placeZone') {
    cost = ZONE_COST;
  }

  if (cost > 0 && state.stats.money < cost) {
    return false;
  }

  // Check tile validity
  if (action.type === 'placeBuilding' || action.type === 'bulldoze' || action.type === 'placeZone') {
    const tile = state.grid[action.y]?.[action.x];
    if (!tile) return false;

    // Can't build on water (except for specific water buildings)
    if (action.type === 'placeBuilding' || action.type === 'placeZone') {
      if (tile.building.type === 'water') {
        // Allow waterfront buildings
        const waterfrontBuildings: BuildingType[] = ['marina_docks_small', 'pier_large'];
        if (!waterfrontBuildings.includes(action.buildingType)) {
          return false;
        }
      }
    }

    // Can't bulldoze water
    if (action.type === 'bulldoze' && tile.building.type === 'water') {
      return false;
    }
  }

  return true;
}

export interface ActionResult {
  success: boolean;
  newState?: GameState;
  error?: string;
  changedTiles?: Array<{ x: number; y: number }>;
}

/**
 * Processes an action and returns the new game state
 */
export function processAction(action: GameAction, state: GameState): ActionResult {
  // Validate first
  if (!validateAction(action, state)) {
    return {
      success: false,
      error: 'Action validation failed',
    };
  }

  // Create a deep copy of the state
  const newState: GameState = {
    ...state,
    grid: state.grid.map(row => row.map(tile => ({
      ...tile,
      building: { ...tile.building },
    }))),
    stats: { ...state.stats },
  };

  const changedTiles: Array<{ x: number; y: number }> = [];

  try {
    if (action.type === 'placeBuilding') {
      const cost = BUILDING_COSTS[action.buildingType] || 0;
      newState.stats.money -= cost;
      newState.grid[action.y][action.x].building = createBuilding(action.buildingType);
      newState.grid[action.y][action.x].zone = 'none';
      changedTiles.push({ x: action.x, y: action.y });
    } else if (action.type === 'bulldoze') {
      newState.stats.money -= BULLDOZE_COST;
      newState.grid[action.y][action.x].building = createBuilding('grass');
      newState.grid[action.y][action.x].zone = 'none';
      changedTiles.push({ x: action.x, y: action.y });
    } else if (action.type === 'placeZone') {
      const cost = ZONE_COST;
      newState.stats.money -= cost;
      newState.grid[action.y][action.x].zone = action.zoneType;
      changedTiles.push({ x: action.x, y: action.y });
    } else {
      // Other action types not implemented yet for MVP
      return {
        success: false,
        error: `Action type ${action.type} not yet implemented`,
      };
    }

    return {
      success: true,
      newState,
      changedTiles,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

