import type { GameState, Tile, Building, ZoneType } from '@isometric-city/shared';

/**
 * Creates a minimal initial game state for multiplayer rooms
 * This is a simplified version - can be enhanced later to match frontend terrain generation
 */
export function createInitialGameState(cityName: string, gridSize: number): GameState {
  // Create empty grid
  const grid: Tile[][] = [];
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
      const building: Building = {
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
      };

      grid[y][x] = {
        x,
        y,
        zone: 'none' as ZoneType,
        building,
        landValue: 0,
        pollution: 0,
        crime: 0,
        traffic: 0,
        hasSubway: false,
      };
    }
  }

  return {
    id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    grid,
    gridSize,
    cityName,
    year: 2024,
    month: 1,
    day: 1,
    hour: 12,
    tick: 0,
    speed: 1,
    selectedTool: 'select',
    taxRate: 9,
    effectiveTaxRate: 9,
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
      police: Array(gridSize).fill(null).map(() => Array(gridSize).fill(0)),
      fire: Array(gridSize).fill(null).map(() => Array(gridSize).fill(0)),
      health: Array(gridSize).fill(null).map(() => Array(gridSize).fill(0)),
      education: Array(gridSize).fill(null).map(() => Array(gridSize).fill(0)),
      power: Array(gridSize).fill(null).map(() => Array(gridSize).fill(false)),
      water: Array(gridSize).fill(null).map(() => Array(gridSize).fill(false)),
    },
    notifications: [],
    advisorMessages: [],
    history: [],
    activePanel: 'none',
    disastersEnabled: true,
    adjacentCities: [],
    waterBodies: [],
    gameVersion: 1,
    cities: [],
  };
}

