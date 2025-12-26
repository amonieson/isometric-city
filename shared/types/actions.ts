// Action types for multiplayer game actions
// These represent actions that clients send to the server

import type { BuildingType, ZoneType, Tool } from './game.js';

// Base action interface
export interface BaseAction {
  type: string;
  timestamp?: number; // Optional client timestamp for ordering
}

// Place a building at a specific tile
export interface PlaceBuildingAction extends BaseAction {
  type: 'placeBuilding';
  x: number;
  y: number;
  buildingType: BuildingType;
}

// Bulldoze a tile (remove building/zone)
export interface BulldozeAction extends BaseAction {
  type: 'bulldoze';
  x: number;
  y: number;
}

// Place a zone at a specific tile
export interface PlaceZoneAction extends BaseAction {
  type: 'placeZone';
  x: number;
  y: number;
  zoneType: ZoneType;
}

// Place a road along a path
export interface PlaceRoadAction extends BaseAction {
  type: 'placeRoad';
  path: Array<{ x: number; y: number }>;
}

// Place rail along a path
export interface PlaceRailAction extends BaseAction {
  type: 'placeRail';
  path: Array<{ x: number; y: number }>;
}

// Place subway along a path
export interface PlaceSubwayAction extends BaseAction {
  type: 'placeSubway';
  path: Array<{ x: number; y: number }>;
}

// Place a tree
export interface PlaceTreeAction extends BaseAction {
  type: 'placeTree';
  x: number;
  y: number;
}

// Terraform (water to land or land to water)
export interface TerraformAction extends BaseAction {
  type: 'terraform';
  x: number;
  y: number;
  terraformType: 'water' | 'land';
}

// Set tax rate
export interface SetTaxRateAction extends BaseAction {
  type: 'setTaxRate';
  taxRate: number;
}

// Set game speed
export interface SetSpeedAction extends BaseAction {
  type: 'setSpeed';
  speed: 0 | 1 | 2 | 3;
}

// Set budget funding
export interface SetBudgetAction extends BaseAction {
  type: 'setBudget';
  category: 'police' | 'fire' | 'health' | 'education' | 'transportation' | 'parks' | 'power' | 'water';
  funding: number;
}

// Union of all possible actions
export type GameAction =
  | PlaceBuildingAction
  | BulldozeAction
  | PlaceZoneAction
  | PlaceRoadAction
  | PlaceRailAction
  | PlaceSubwayAction
  | PlaceTreeAction
  | TerraformAction
  | SetTaxRateAction
  | SetSpeedAction
  | SetBudgetAction;

