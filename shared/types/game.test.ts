import { describe, it, expect } from 'vitest';
import type {
  GameState,
  Tile,
  Building,
  BuildingType,
  ZoneType,
  Tool,
  Stats,
  Budget,
  ServiceCoverage,
} from './game.js';

describe('Shared Game Types', () => {
  it('should export GameState type', () => {
    const state: GameState = {
      id: 'test-id',
      grid: [],
      gridSize: 50,
      cityName: 'Test City',
      year: 2024,
      month: 1,
      day: 1,
      hour: 12,
      tick: 0,
      speed: 1,
      selectedTool: 'select',
      taxRate: 7,
      effectiveTaxRate: 7,
      stats: {
        population: 0,
        jobs: 0,
        money: 50000,
        income: 0,
        expenses: 0,
        happiness: 50,
        health: 50,
        education: 50,
        safety: 50,
        environment: 50,
        demand: {
          residential: 0,
          commercial: 0,
          industrial: 0,
        },
      },
      budget: {
        police: { name: 'Police', funding: 50, cost: 0 },
        fire: { name: 'Fire', funding: 50, cost: 0 },
        health: { name: 'Health', funding: 50, cost: 0 },
        education: { name: 'Education', funding: 50, cost: 0 },
        transportation: { name: 'Transportation', funding: 50, cost: 0 },
        parks: { name: 'Parks', funding: 50, cost: 0 },
        power: { name: 'Power', funding: 50, cost: 0 },
        water: { name: 'Water', funding: 50, cost: 0 },
      },
      services: {
        police: [],
        fire: [],
        health: [],
        education: [],
        power: [],
        water: [],
      },
      notifications: [],
      advisorMessages: [],
      history: [],
      activePanel: 'none',
      disastersEnabled: false,
      adjacentCities: [],
      waterBodies: [],
      gameVersion: 1,
      cities: [],
    };

    expect(state.id).toBe('test-id');
    expect(state.cityName).toBe('Test City');
  });

  it('should export BuildingType', () => {
    const buildingType: BuildingType = 'house_small';
    expect(buildingType).toBe('house_small');
  });

  it('should export ZoneType', () => {
    const zoneType: ZoneType = 'residential';
    expect(zoneType).toBe('residential');
  });

  it('should export Tool', () => {
    const tool: Tool = 'bulldoze';
    expect(tool).toBe('bulldoze');
  });

  it('should export Tile interface', () => {
    const tile: Tile = {
      x: 10,
      y: 10,
      zone: 'none',
      building: {
        type: 'empty',
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
      },
      landValue: 0,
      pollution: 0,
      crime: 0,
      traffic: 0,
      hasSubway: false,
    };

    expect(tile.x).toBe(10);
    expect(tile.y).toBe(10);
  });
});

