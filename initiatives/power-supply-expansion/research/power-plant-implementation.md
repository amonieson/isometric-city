# Power Plant Implementation Research

## Executive Summary

The existing power plant system in isometric-city is a grid-based utility service that provides boolean power coverage to all buildings within a fixed radius. Power plants are 2x2 tile buildings that generate electricity and distribute it in a circular pattern. This document provides a comprehensive analysis of how the current power system works, which will serve as the foundation for implementing new power sources (solar, wind, etc.).

---

## 1. Building Definition and Properties

### 1.1 Type Definition
The power plant is defined as a `BuildingType` in the type system:

**Location**: `src/types/game.ts:37`
```typescript
| 'power_plant'
```

### 1.2 Building Metadata
**Location**: `src/types/game.ts:164`
- **Name**: "Power Plant"
- **Cost**: 3,000 (one-time construction cost)
- **Size**: 2x2 tiles
- **Description**: "Generate electricity (2x2)"

### 1.3 Building Statistics
**Location**: `src/types/game.ts:389`
- **Max Population**: 0
- **Max Jobs**: 30
- **Pollution**: 30 (high pollution generator)
- **Land Value**: -20 (reduces nearby land value)

### 1.4 Building Dimensions
**Location**: `src/lib/simulation.ts:1978`
```typescript
power_plant: { width: 2, height: 2 }
```

---

## 2. Service Coverage System

### 2.1 Service Configuration
Power plants are registered in the `SERVICE_CONFIG` object:

**Location**: `src/lib/simulation.ts:852`
```typescript
power_plant: { range: 15, rangeSquared: 225 }
```

**Key Properties**:
- **Range**: 15 tiles (Euclidean distance)
- **Range Squared**: 225 (precomputed for distance calculations without sqrt)
- **Coverage Type**: Boolean (unlike police/fire/health which use percentage-based coverage)

### 2.2 Service Building Registration
Power plants are included in the `SERVICE_BUILDING_TYPES` set:

**Location**: `src/lib/simulation.ts:859`
```typescript
const SERVICE_BUILDING_TYPES = new Set([
  'police_station', 'fire_station', 'hospital', 'school', 'university',
  'power_plant', 'water_tower'
]);
```

---

## 3. Power Distribution Algorithm

### 3.1 Coverage Calculation Flow
The power distribution happens in `calculateServiceCoverage()`:

**Location**: `src/lib/simulation.ts:863-951`

**Algorithm Overview**:
1. **First Pass**: Collect all service building positions (optimization to avoid checking every tile)
2. **Second Pass**: Apply coverage for each service building

### 3.2 Power Plant Coverage Logic
**Location**: `src/lib/simulation.ts:907-917`

```typescript
if (type === 'power_plant') {
  for (let ny = minY; ny <= maxY; ny++) {
    for (let nx = minX; nx <= maxX; nx++) {
      const dx = nx - x;
      const dy = ny - y;
      // Use squared distance comparison (avoid Math.sqrt)
      if (dx * dx + dy * dy <= rangeSquared) {
        services.power[ny][nx] = true;
      }
    }
  }
}
```

**Key Characteristics**:
- **Circular Coverage**: Uses Euclidean distance (dx² + dy² ≤ range²)
- **Boolean Coverage**: Either a tile has power (true) or doesn't (false)
- **No Falloff**: Unlike percentage-based services, power is binary
- **Performance Optimized**: Uses squared distance to avoid expensive `Math.sqrt()` calls
- **Bounds Checking**: Calculates min/max bounds to avoid checking tiles outside the grid

### 3.3 Coverage Data Structure
Power coverage is stored in a boolean grid:

**Location**: `src/lib/simulation.ts:770-793`
```typescript
function createServiceCoverage(size: number): ServiceCoverage {
  return {
    // ... other services ...
    power: createBoolGrid(),  // Boolean grid for power coverage
    water: createBoolGrid(),  // Boolean grid for water coverage
    // ... percentage-based services ...
  };
}
```

---

## 4. Building Requirements and Dependencies

### 4.1 Power Requirements for Buildings
Most buildings require power to function, with exceptions for "starter" buildings:

**Location**: `src/lib/simulation.ts:1094-1099`
```typescript
// Starter buildings (farms, house_small, shop_small) don't require power/water
const isStarter = isStarterBuilding(x, y, building.type);

if (!isStarter && (!hasPower || !hasWater)) {
  return building;  // Building cannot evolve without power/water
}
```

**Starter Buildings** (can operate without power):
- `house_small`
- `shop_small`
- `factory_small` (farm variants)

### 4.2 Construction Requirements
Buildings under construction require power and water to progress:

**Location**: `src/lib/simulation.ts:1102-1114`
```typescript
// Construction requires power and water to progress (except farms)
if (building.constructionProgress !== undefined && building.constructionProgress < 100) {
  const constructionSpeed = getConstructionSpeed(building.type);
  building.constructionProgress = Math.min(100, building.constructionProgress + constructionSpeed);
  // ...
}
```

### 4.3 Building Evolution
Power status is checked during building evolution:

**Location**: `src/lib/simulation.ts:1087-1088`
```typescript
building.powered = services.power[y][x];
building.watered = services.water[y][x];
```

### 4.4 Abandonment Logic
Buildings without power are more likely to be abandoned:

**Location**: `src/lib/simulation.ts:1178-1179`
```typescript
// Buildings without power/water are slightly more likely to be abandoned
const utilityPenalty = isStarter ? 0 : ((!hasPower ? 0.005 : 0) + (!hasWater ? 0.005 : 0));
```

---

## 5. Budget and Maintenance Costs

### 5.1 Operating Costs
Power plants have ongoing maintenance costs:

**Location**: `src/lib/simulation.ts:1560`
```typescript
newBudget.power.cost = powerCount * 150;
```

**Cost Structure**:
- **Per Power Plant**: 150 per tick
- **Total Cost**: `powerCount * 150`

### 5.2 Budget Configuration
Power budget is part of the overall city budget:

**Location**: `src/lib/simulation.ts:743`
```typescript
power: { name: 'Power', funding: 100, cost: 0 }
```

**Budget Properties**:
- **Name**: "Power"
- **Default Funding**: 100% (full funding)
- **Initial Cost**: 0 (calculated dynamically based on power plant count)

### 5.3 Expense Calculation
Power expenses are calculated during budget processing:

**Location**: `src/lib/simulation.ts:1456`
```typescript
expenses += Math.floor(budget.power.cost * budget.power.funding / 100);
```

**Formula**: `floor(cost * funding / 100)`
- If funding is 100%, full cost is applied
- If funding is reduced, costs scale proportionally

---

## 6. Visual Representation

### 6.1 SVG Rendering
Power plants are rendered as SVG components:

**Location**: `src/components/buildings/IsometricBuildings.tsx:609-634`

**Visual Elements**:
- **Main Building**: Gray isometric box (70% of tile width)
- **Cooling Tower**: Curved blue-gray tower with steam effects
- **Steam Effects**: Semi-transparent white ellipses above the tower
- **Lightning Bolt**: Yellow/gold lightning bolt icon on the building
- **Ground Base**: Dark gray isometric base

### 6.2 Building Renderer Integration
Power plants are integrated into the building renderer:

**Location**: `src/components/buildings/IsometricBuildings.tsx:937-938`
```typescript
case 'power_plant':
  return <PowerPlant size={size} />;
```

### 6.3 Sprite Configuration
Power plants have sprite configuration for alternative rendering:

**Location**: `src/lib/renderConfig.ts:196, 241, 532`
- Sprite pack support available
- Vertical offset: -0.3 (shifted up)
- Sprite mapping: `power_plant: 'power_plant'`

---

## 7. Placement and Validation

### 7.1 Placement Rules
Power plants follow standard multi-tile building placement:

**Location**: `src/lib/simulation.ts:1978`
- Requires 2x2 clear space
- Must be placed on valid terrain (not water)
- No special adjacency requirements

### 7.2 Construction State
Power plants can be under construction:

**Location**: `src/lib/simulation.ts:878-880`
```typescript
// Skip buildings under construction
if (tile.building.constructionProgress !== undefined && tile.building.constructionProgress < 100) {
  continue;  // Power plant doesn't provide coverage until complete
}
```

**Key Point**: Power plants only provide coverage when construction is 100% complete.

### 7.3 Abandonment Handling
Abandoned power plants don't provide coverage:

**Location**: `src/lib/simulation.ts:882-885`
```typescript
// Skip abandoned buildings
if (tile.building.abandoned) {
  continue;  // Abandoned power plants don't generate power
}
```

---

## 8. Advisor System Integration

### 8.1 Power Advisor Messages
The game provides advisor messages about power coverage:

**Location**: `src/lib/simulation.ts:1596-1602`
```typescript
// Power advisor
if (unpoweredBuildings > 0) {
  messages.push({
    name: 'Power Advisor',
    icon: 'power',
    messages: [`${unpoweredBuildings} buildings lack power. Build more power plants!`],
    priority: unpoweredBuildings > 10 ? 'high' : 'medium',
  });
}
```

**Advisor Logic**:
- Counts buildings without power
- Provides warning message with count
- Sets priority based on number of unpowered buildings (>10 = high priority)

### 8.2 Unpowered Building Detection
**Location**: `src/lib/simulation.ts:1571-1582`
```typescript
let unpoweredBuildings = 0;
// ... count logic ...
if (!tile.building.powered) unpoweredBuildings++;
```

---

## 9. UI Integration

### 9.1 Tool Selection
Power plants are available as a tool in the utilities category:

**Location**: `src/components/game/Sidebar.tsx:328`
```typescript
tools: ['power_plant', 'water_tower', 'subway_station', 'rail_station'] as Tool[]
```

### 9.2 Command Menu
**Location**: `src/components/ui/CommandMenu.tsx:180`
```typescript
const utilitiesCategory: Tool[] = ['power_plant', 'water_tower', 'subway_station', 'rail_station'];
```

### 9.3 Mobile Toolbar
**Location**: `src/components/mobile/MobileToolbar.tsx:151, 195`
- Power plant icon available in mobile UI
- Grouped under 'UTILITIES' category

### 9.4 Overlay System
Power plants are part of the power overlay:

**Location**: `src/components/game/overlays.ts:91, 213`
```typescript
power_plant: 'power',
// ...
power: ['power_plant'],
```

---

## 10. State Management

### 10.1 Game Context
Power plants are tracked in the game state:

**Location**: `src/context/GameContext.tsx:109`
```typescript
power_plant: 'power_plant',
```

### 10.2 State Sharing
Power plants are included in shareable state:

**Location**: `src/lib/shareState.ts:16`
```typescript
'power_plant', 'water_tower', 'subway_station',
```

---

## 11. Performance Optimizations

### 11.1 Two-Pass Algorithm
The service coverage calculation uses a two-pass approach:
1. **First Pass**: Collect service building positions (O(n²) where n = grid size)
2. **Second Pass**: Apply coverage only for service buildings (O(m × r²) where m = service buildings, r = range)

This is more efficient than checking every tile for every service building.

### 11.2 Squared Distance Comparison
Uses `dx² + dy² ≤ range²` instead of `Math.sqrt(dx² + dy²) ≤ range` to avoid expensive square root calculations.

### 11.3 Bounds Calculation
Pre-calculates min/max bounds to avoid checking tiles outside the grid:
```typescript
const minY = Math.max(0, y - range);
const maxY = Math.min(size - 1, y + range);
const minX = Math.max(0, x - range);
const maxX = Math.min(size - 1, x + range);
```

---

## 12. Key Design Patterns

### 12.1 Boolean vs Percentage Coverage
- **Power/Water**: Boolean (has/doesn't have)
- **Police/Fire/Health/Education**: Percentage (0-100%)

This design choice makes sense because:
- Power is binary: a building either has electricity or it doesn't
- Other services can have partial effectiveness based on distance

### 12.2 Service Building Abstraction
All service buildings follow the same pattern:
1. Registered in `SERVICE_BUILDING_TYPES`
2. Configured in `SERVICE_CONFIG`
3. Processed in `calculateServiceCoverage()`

This makes it easy to add new service buildings.

### 12.3 Construction State Handling
Service buildings only provide coverage when:
- Construction is 100% complete
- Building is not abandoned

This creates interesting gameplay where incomplete infrastructure doesn't help.

---

## 13. Integration Points for New Power Sources

Based on this analysis, here are the key integration points for adding solar, wind, and other power sources:

1. **Type System**: Add new `BuildingType` entries (e.g., `'solar_panel'`, `'wind_turbine'`)
2. **Service Config**: Add entries to `SERVICE_CONFIG` with appropriate ranges
3. **Service Building Types**: Add to `SERVICE_BUILDING_TYPES` set
4. **Coverage Logic**: Extend the power coverage calculation in `calculateServiceCoverage()`
5. **Building Stats**: Define pollution, jobs, land value in `BUILDING_STATS`
6. **Cost System**: Add to budget calculation (may have different maintenance costs)
7. **Visual Rendering**: Create SVG components or sprite mappings
8. **Tool Integration**: Add to UI toolbars and command menus
9. **Placement Rules**: Define size, adjacency requirements, terrain restrictions

---

## Follow-Up Questions

1. **Power Capacity**: Should different power sources have different capacities (e.g., power plants provide more coverage than solar panels), or should they all work the same way with different ranges?

2. **Power Stacking**: Currently, multiple power plants can overlap coverage (boolean OR). Should new power sources also stack, or should we implement a capacity/load system where buildings consume power and sources have limited capacity?

3. **Terrain Requirements**: Should solar panels require specific terrain (e.g., no trees, flat land)? Should wind turbines require specific placement (e.g., higher elevation, coastal areas)?

4. **Weather/Time Dependencies**: Should solar panels only work during day time (given the day/night system exists)? Should wind turbines have variable output based on weather conditions?

5. **Pollution Differences**: Should renewable sources (solar, wind) have negative or zero pollution, while traditional power plants have high pollution? How should this affect land value?

6. **Cost Structure**: Should renewable sources have:
   - Higher initial cost but lower maintenance?
   - Lower initial cost but higher maintenance?
   - Different cost curves entirely?

7. **Visual Differentiation**: Should different power sources have distinct visual styles in overlays? Should the power overlay show different colors for different source types?

8. **Upgrade/Evolution**: Should players be able to upgrade existing power plants to more efficient versions, or should new power sources be separate buildings entirely?

9. **Power Grid**: Should we implement a power grid system where power can be transmitted over longer distances via power lines, or keep the current radius-based system?

10. **Integration with Existing Systems**: Should new power sources integrate with the day/night cycle, weather system (if we add one), or other existing game mechanics?

