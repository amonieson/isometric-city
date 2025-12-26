// Game type definitions for IsoCity (Shared between client and server)

export type BuildingType =
  | 'empty'
  | 'grass'
  | 'water'
  | 'road'
  | 'bridge'
  | 'rail'
  | 'tree'
  // Residential
  | 'house_small'
  | 'house_medium'
  | 'mansion'
  | 'apartment_low'
  | 'apartment_high'
  // Commercial
  | 'shop_small'
  | 'shop_medium'
  | 'office_low'
  | 'office_high'
  | 'mall'
  // Industrial
  | 'factory_small'
  | 'factory_medium'
  | 'factory_large'
  | 'warehouse'
  // Services
  | 'police_station'
  | 'fire_station'
  | 'hospital'
  | 'school'
  | 'university'
  | 'park'
  | 'park_large'
  | 'tennis'
  // Utilities
  | 'power_plant'
  | 'water_tower'
  // Transportation
  | 'subway_station'
  | 'rail_station'
  // Special
  | 'stadium'
  | 'museum'
  | 'airport'
  | 'space_program'
  | 'city_hall'
  | 'amusement_park'
  // Parks (new sprite sheet)
  | 'basketball_courts'
  | 'playground_small'
  | 'playground_large'
  | 'baseball_field_small'
  | 'soccer_field_small'
  | 'football_field'
  | 'baseball_stadium'
  | 'community_center'
  | 'office_building_small'
  | 'swimming_pool'
  | 'skate_park'
  | 'mini_golf_course'
  | 'bleachers_field'
  | 'go_kart_track'
  | 'amphitheater'
  | 'greenhouse_garden'
  | 'animal_pens_farm'
  | 'cabin_house'
  | 'campground'
  | 'marina_docks_small'
  | 'pier_large'
  | 'roller_coaster_small'
  | 'community_garden'
  | 'pond_park'
  | 'park_gate'
  | 'mountain_lodge'
  | 'mountain_trailhead';

export type ZoneType = 'none' | 'residential' | 'commercial' | 'industrial';

export type Tool =
  | 'select'
  | 'bulldoze'
  | 'road'
  | 'rail'
  | 'subway'
  | 'tree'
  | 'zone_residential'
  | 'zone_commercial'
  | 'zone_industrial'
  | 'zone_dezone'
  | 'zone_water'
  | 'zone_land'
  | 'police_station'
  | 'fire_station'
  | 'hospital'
  | 'school'
  | 'university'
  | 'park'
  | 'park_large'
  | 'tennis'
  | 'power_plant'
  | 'water_tower'
  | 'subway_station'
  | 'rail_station'
  | 'stadium'
  | 'museum'
  | 'airport'
  | 'space_program'
  | 'city_hall'
  | 'amusement_park'
  // Park tools (new sprite sheet)
  | 'basketball_courts'
  | 'playground_small'
  | 'playground_large'
  | 'baseball_field_small'
  | 'soccer_field_small'
  | 'football_field'
  | 'baseball_stadium'
  | 'community_center'
  | 'office_building_small'
  | 'swimming_pool'
  | 'skate_park'
  | 'mini_golf_course'
  | 'bleachers_field'
  | 'go_kart_track'
  | 'amphitheater'
  | 'greenhouse_garden'
  | 'animal_pens_farm'
  | 'cabin_house'
  | 'campground'
  | 'marina_docks_small'
  | 'pier_large'
  | 'roller_coaster_small'
  | 'community_garden'
  | 'pond_park'
  | 'park_gate'
  | 'mountain_lodge'
  | 'mountain_trailhead';

// Bridge type based on span width
export type BridgeType = 'small' | 'medium' | 'large' | 'suspension';

// Bridge orientation
export type BridgeOrientation = 'ns' | 'ew';

// What the bridge carries (road or rail)
export type BridgeTrackType = 'road' | 'rail';

export interface Building {
  type: BuildingType;
  level: number;
  population: number;
  jobs: number;
  powered: boolean;
  watered: boolean;
  onFire: boolean;
  fireProgress: number;
  age: number;
  constructionProgress: number; // 0-100, building is under construction until 100
  abandoned: boolean; // Building is abandoned due to low demand, produces nothing
  flipped?: boolean; // Horizontally mirror the sprite (used for waterfront buildings to face water)
  cityId?: string; // ID of the city this building belongs to (for multi-city support)
  grandfatheredRoadAccess?: boolean; // If true, building was placed before road connectivity requirement (exempt from road check)
  // Bridge-specific properties
  bridgeType?: BridgeType; // Type of bridge (small, medium, large, suspension)
  bridgeOrientation?: BridgeOrientation; // Direction the bridge spans (ns or ew)
  bridgeVariant?: number; // Visual variant for this bridge type (0-2)
  bridgePosition?: 'start' | 'middle' | 'end'; // Position within the bridge span
  bridgeIndex?: number; // Index of this tile within the bridge (0-based)
  bridgeSpan?: number; // Total number of tiles in this bridge
  bridgeTrackType?: BridgeTrackType; // What the bridge carries: 'road' or 'rail'
}

// City definition for multi-city maps
export interface City {
  id: string;
  name: string;
  // Bounds of the city (inclusive tile coordinates)
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  // Economy stats (cached for performance)
  economy: CityEconomy;
  // City color for border rendering
  color: string;
}

// Cached economy data for a city
export interface CityEconomy {
  population: number;
  jobs: number;
  income: number;
  expenses: number;
  happiness: number;
  // Timestamp of last calculation for cache invalidation
  lastCalculated: number;
}

export interface Tile {
  x: number;
  y: number;
  zone: ZoneType;
  building: Building;
  landValue: number;
  pollution: number;
  crime: number;
  traffic: number;
  hasSubway: boolean;
  hasRailOverlay?: boolean; // Rail tracks overlaid on road (road base with rail tracks on top)
}

export interface Stats {
  population: number;
  jobs: number;
  money: number;
  income: number;
  expenses: number;
  happiness: number;
  health: number;
  education: number;
  safety: number;
  environment: number;
  demand: {
    residential: number;
    commercial: number;
    industrial: number;
  };
}

export interface BudgetCategory {
  name: string;
  funding: number;
  cost: number;
}

export interface Budget {
  police: BudgetCategory;
  fire: BudgetCategory;
  health: BudgetCategory;
  education: BudgetCategory;
  transportation: BudgetCategory;
  parks: BudgetCategory;
  power: BudgetCategory;
  water: BudgetCategory;
}

export interface ServiceCoverage {
  police: number[][];
  fire: number[][];
  health: number[][];
  education: number[][];
  power: boolean[][];
  water: boolean[][];
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  icon: string;
  timestamp: number;
}

export interface AdvisorMessage {
  name: string;
  icon: string;
  messages: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface HistoryPoint {
  year: number;
  month: number;
  population: number;
  money: number;
  happiness: number;
}

export interface AdjacentCity {
  id: string;
  name: string;
  direction: 'north' | 'south' | 'east' | 'west';
  connected: boolean;
  discovered: boolean; // City becomes discovered when a road reaches its edge
}

export interface WaterBody {
  id: string;
  name: string;
  type: 'lake' | 'ocean';
  tiles: { x: number; y: number }[];
  centerX: number;
  centerY: number;
}

export interface GameState {
  id: string; // Unique UUID for this game
  grid: Tile[][];
  gridSize: number;
  cityName: string;
  year: number;
  month: number;
  day: number;
  hour: number; // 0-23 for day/night cycle
  tick: number;
  speed: 0 | 1 | 2 | 3;
  selectedTool: Tool;
  taxRate: number;
  effectiveTaxRate: number; // Lagging tax rate that gradually moves toward taxRate (affects demand)
  stats: Stats;
  budget: Budget;
  services: ServiceCoverage;
  notifications: Notification[];
  advisorMessages: AdvisorMessage[];
  history: HistoryPoint[];
  activePanel: 'none' | 'budget' | 'statistics' | 'advisors' | 'settings';
  disastersEnabled: boolean;
  adjacentCities: AdjacentCity[];
  waterBodies: WaterBody[];
  gameVersion: number; // Increments when a new game starts - used to clear transient state like vehicles
  cities: City[]; // Cities in the map (for multi-city support)
}

