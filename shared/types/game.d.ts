export type BuildingType = 'empty' | 'grass' | 'water' | 'road' | 'bridge' | 'rail' | 'tree' | 'house_small' | 'house_medium' | 'mansion' | 'apartment_low' | 'apartment_high' | 'shop_small' | 'shop_medium' | 'office_low' | 'office_high' | 'mall' | 'factory_small' | 'factory_medium' | 'factory_large' | 'warehouse' | 'police_station' | 'fire_station' | 'hospital' | 'school' | 'university' | 'park' | 'park_large' | 'tennis' | 'power_plant' | 'water_tower' | 'subway_station' | 'rail_station' | 'stadium' | 'museum' | 'airport' | 'space_program' | 'city_hall' | 'amusement_park' | 'basketball_courts' | 'playground_small' | 'playground_large' | 'baseball_field_small' | 'soccer_field_small' | 'football_field' | 'baseball_stadium' | 'community_center' | 'office_building_small' | 'swimming_pool' | 'skate_park' | 'mini_golf_course' | 'bleachers_field' | 'go_kart_track' | 'amphitheater' | 'greenhouse_garden' | 'animal_pens_farm' | 'cabin_house' | 'campground' | 'marina_docks_small' | 'pier_large' | 'roller_coaster_small' | 'community_garden' | 'pond_park' | 'park_gate' | 'mountain_lodge' | 'mountain_trailhead';
export type ZoneType = 'none' | 'residential' | 'commercial' | 'industrial';
export type Tool = 'select' | 'bulldoze' | 'road' | 'rail' | 'subway' | 'tree' | 'zone_residential' | 'zone_commercial' | 'zone_industrial' | 'zone_dezone' | 'zone_water' | 'zone_land' | 'police_station' | 'fire_station' | 'hospital' | 'school' | 'university' | 'park' | 'park_large' | 'tennis' | 'power_plant' | 'water_tower' | 'subway_station' | 'rail_station' | 'stadium' | 'museum' | 'airport' | 'space_program' | 'city_hall' | 'amusement_park' | 'basketball_courts' | 'playground_small' | 'playground_large' | 'baseball_field_small' | 'soccer_field_small' | 'football_field' | 'baseball_stadium' | 'community_center' | 'office_building_small' | 'swimming_pool' | 'skate_park' | 'mini_golf_course' | 'bleachers_field' | 'go_kart_track' | 'amphitheater' | 'greenhouse_garden' | 'animal_pens_farm' | 'cabin_house' | 'campground' | 'marina_docks_small' | 'pier_large' | 'roller_coaster_small' | 'community_garden' | 'pond_park' | 'park_gate' | 'mountain_lodge' | 'mountain_trailhead';
export type BridgeType = 'small' | 'medium' | 'large' | 'suspension';
export type BridgeOrientation = 'ns' | 'ew';
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
    constructionProgress: number;
    abandoned: boolean;
    flipped?: boolean;
    cityId?: string;
    grandfatheredRoadAccess?: boolean;
    bridgeType?: BridgeType;
    bridgeOrientation?: BridgeOrientation;
    bridgeVariant?: number;
    bridgePosition?: 'start' | 'middle' | 'end';
    bridgeIndex?: number;
    bridgeSpan?: number;
    bridgeTrackType?: BridgeTrackType;
}
export interface City {
    id: string;
    name: string;
    bounds: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
    economy: CityEconomy;
    color: string;
}
export interface CityEconomy {
    population: number;
    jobs: number;
    income: number;
    expenses: number;
    happiness: number;
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
    hasRailOverlay?: boolean;
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
    discovered: boolean;
}
export interface WaterBody {
    id: string;
    name: string;
    type: 'lake' | 'ocean';
    tiles: {
        x: number;
        y: number;
    }[];
    centerX: number;
    centerY: number;
}
export interface GameState {
    id: string;
    grid: Tile[][];
    gridSize: number;
    cityName: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    tick: number;
    speed: 0 | 1 | 2 | 3;
    selectedTool: Tool;
    taxRate: number;
    effectiveTaxRate: number;
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
    gameVersion: number;
    cities: City[];
}
//# sourceMappingURL=game.d.ts.map