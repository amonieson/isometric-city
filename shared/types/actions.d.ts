import type { BuildingType, ZoneType } from './game.js';
export interface BaseAction {
    type: string;
    timestamp?: number;
}
export interface PlaceBuildingAction extends BaseAction {
    type: 'placeBuilding';
    x: number;
    y: number;
    buildingType: BuildingType;
}
export interface BulldozeAction extends BaseAction {
    type: 'bulldoze';
    x: number;
    y: number;
}
export interface PlaceZoneAction extends BaseAction {
    type: 'placeZone';
    x: number;
    y: number;
    zoneType: ZoneType;
}
export interface PlaceRoadAction extends BaseAction {
    type: 'placeRoad';
    path: Array<{
        x: number;
        y: number;
    }>;
}
export interface PlaceRailAction extends BaseAction {
    type: 'placeRail';
    path: Array<{
        x: number;
        y: number;
    }>;
}
export interface PlaceSubwayAction extends BaseAction {
    type: 'placeSubway';
    path: Array<{
        x: number;
        y: number;
    }>;
}
export interface PlaceTreeAction extends BaseAction {
    type: 'placeTree';
    x: number;
    y: number;
}
export interface TerraformAction extends BaseAction {
    type: 'terraform';
    x: number;
    y: number;
    terraformType: 'water' | 'land';
}
export interface SetTaxRateAction extends BaseAction {
    type: 'setTaxRate';
    taxRate: number;
}
export interface SetSpeedAction extends BaseAction {
    type: 'setSpeed';
    speed: 0 | 1 | 2 | 3;
}
export interface SetBudgetAction extends BaseAction {
    type: 'setBudget';
    category: 'police' | 'fire' | 'health' | 'education' | 'transportation' | 'parks' | 'power' | 'water';
    funding: number;
}
export type GameAction = PlaceBuildingAction | BulldozeAction | PlaceZoneAction | PlaceRoadAction | PlaceRailAction | PlaceSubwayAction | PlaceTreeAction | TerraformAction | SetTaxRateAction | SetSpeedAction | SetBudgetAction;
//# sourceMappingURL=actions.d.ts.map