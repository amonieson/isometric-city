# Multiple Energy Types Implementation - Task Breakdown

## Agent Instructions

You are tasked with implementing solar panels and wind turbines for the isometric-city game. Follow these steps:

1. **Create a feature branch**: `git checkout -b feature/multiple-energy-types`
2. **Work through tasks sequentially** - do not move to the next task until:
   - All tests pass
   - Code compiles without errors
   - Changes are committed
3. **Write tests first** (TDD approach) or immediately after implementation
4. **Commit after each task** with descriptive commit messages

---

## Task 1: Create Feature Branch and Setup

### Objective
Set up the development environment and create the feature branch.

### Steps
1. Create feature branch: `git checkout -b feature/multiple-energy-types`
2. Verify you're on the new branch: `git branch`
3. Ensure dependencies are installed: `npm install`

### Tests
- [ ] Branch exists and is checked out
- [ ] `npm install` completes without errors
- [ ] `npm run build` completes without errors (baseline)

### Commit
```
git commit -m "chore: create feature branch for multiple energy types"
```

---

## Task 2: Add Type Definitions

### Objective
Add `solar_panel` and `wind_turbine` to the type system.

### Implementation Steps
1. Open `src/types/game.ts`
2. Add `'solar_panel'` and `'wind_turbine'` to `BuildingType` union (after `'water_tower'`)
3. Add `'solar_panel'` and `'wind_turbine'` to `Tool` union (after `'water_tower'`)

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] No type errors in `src/types/game.ts`
- [ ] `BuildingType` includes `'solar_panel'` and `'wind_turbine'`
- [ ] `Tool` includes `'solar_panel'` and `'wind_turbine'`

### Commit
```
git add src/types/game.ts
git commit -m "feat: add solar_panel and wind_turbine to type system"
```

---

## Task 3: Add Building Metadata (TOOL_INFO)

### Objective
Add tool information for solar panels and wind turbines.

### Implementation Steps
1. Open `src/types/game.ts`
2. In `TOOL_INFO`, add entries after `water_tower`:
   - `solar_panel: { name: 'Solar Panel', cost: 4000, description: 'Generate clean electricity from sunlight', size: 1 }`
   - `wind_turbine: { name: 'Wind Turbine', cost: 4500, description: 'Generate clean electricity from wind (requires coastal placement)', size: 1 }`

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] `TOOL_INFO['solar_panel']` exists and has correct properties
- [ ] `TOOL_INFO['wind_turbine']` exists and has correct properties
- [ ] Cost values are 4000 and 4500 respectively
- [ ] Size is 1 for both

### Commit
```
git add src/types/game.ts
git commit -m "feat: add tool metadata for solar panels and wind turbines"
```

---

## Task 4: Add Building Statistics (BUILDING_STATS)

### Objective
Add building statistics for pollution, jobs, and land value.

### Implementation Steps
1. Open `src/types/game.ts`
2. In `BUILDING_STATS`, add entries after `water_tower`:
   - `solar_panel: { maxPop: 0, maxJobs: 2, pollution: -5, landValue: 5 }`
   - `wind_turbine: { maxPop: 0, maxJobs: 3, pollution: -5, landValue: -5 }`

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] `BUILDING_STATS['solar_panel']` exists with correct values
- [ ] `BUILDING_STATS['wind_turbine']` exists with correct values
- [ ] Pollution is -5 for both (negative environmental impact)
- [ ] Jobs are 2 and 3 respectively

### Commit
```
git add src/types/game.ts
git commit -m "feat: add building statistics for renewable energy sources"
```

---

## Task 5: Update Service Configuration

### Objective
Add service coverage configuration for new power sources.

### Implementation Steps
1. Open `src/lib/simulation.ts`
2. Find `SERVICE_CONFIG` (around line 850)
3. Add entries:
   - `solar_panel: { range: 8, rangeSquared: 64 }`
   - `wind_turbine: { range: 10, rangeSquared: 100 }`
4. Find `SERVICE_BUILDING_TYPES` (around line 857)
5. Add `'solar_panel'` and `'wind_turbine'` to the Set

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] `SERVICE_CONFIG['solar_panel']` exists with range 8
- [ ] `SERVICE_CONFIG['wind_turbine']` exists with range 10
- [ ] `SERVICE_BUILDING_TYPES.has('solar_panel')` returns true
- [ ] `SERVICE_BUILDING_TYPES.has('wind_turbine')` returns true

### Commit
```
git add src/lib/simulation.ts
git commit -m "feat: add service coverage configuration for solar and wind"
```

---

## Task 6: Update Power Coverage Calculation

### Objective
Update `calculateServiceCoverage()` to handle solar and wind power sources.

### Implementation Steps
1. Open `src/lib/simulation.ts`
2. Find `calculateServiceCoverage()` function (around line 865)
3. Update the power coverage logic to include solar and wind:
   ```typescript
   // All power sources work 24/7 (solar assumes battery system)
   if (type === 'power_plant' || type === 'solar_panel' || type === 'wind_turbine') {
     for (let ny = minY; ny <= maxY; ny++) {
       for (let nx = minX; nx <= maxX; nx++) {
         const dx = nx - x;
         const dy = ny - y;
         if (dx * dx + dy * dy <= rangeSquared) {
           services.power[ny][nx] = true;
         }
       }
     }
   }
   ```

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] Function signature is correct (no hour parameter needed)
- [ ] Solar panels provide power coverage (8 tile range)
- [ ] Wind turbines provide power coverage (10 tile range)
- [ ] Coverage is circular (distance-based)
- [ ] All power sources work 24/7 (no day/night check)

### Manual Test
Create a test game state with solar panels and verify they provide power coverage.

### Commit
```
git add src/lib/simulation.ts
git commit -m "feat: update power coverage calculation for solar and wind"
```

---

## Task 7: Update Budget Calculations

### Objective
Add budget cost calculations for new power sources.

### Implementation Steps
1. Open `src/lib/simulation.ts`
2. Find `updateBudgetCosts()` function (around line 1535)
3. Add counting variables: `solarCount` and `windCount`
4. Add cases in the switch statement:
   - `case 'solar_panel': solarCount++; break;`
   - `case 'wind_turbine': windCount++; break;`
5. Update power cost calculation:
   - `newBudget.power.cost = powerCount * 150 + solarCount * 50 + windCount * 75;`

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] `solarCount` and `windCount` are declared
- [ ] Switch cases exist for both building types
- [ ] Power cost formula includes all three power sources
- [ ] Costs are: 150 (power plant), 50 (solar), 75 (wind) per building

### Manual Test
Create a game with 1 power plant, 2 solar panels, 1 wind turbine. Verify budget shows:
- Power cost = (1 * 150) + (2 * 50) + (1 * 75) = 325

### Commit
```
git add src/lib/simulation.ts
git commit -m "feat: add budget cost calculations for renewable energy"
```

---

## Task 8: Add Wind Turbine Coastal Placement Validation

### Objective
Require wind turbines to be placed near water (coastal).

### Implementation Steps
1. Open `src/lib/simulation.ts`
2. Find `WATERFRONT_BUILDINGS` array (around line 553)
3. Add `'wind_turbine'` to the array
4. Find `placeBuilding()` function (around line 2259)
5. Locate the water adjacency check (around line 2343)
6. Update to use `isNearWater()` for wind turbines:
   ```typescript
   if (requiresWaterAdjacency(buildingType)) {
     // Wind turbines use isNearWater (5x5 area check) instead of edge adjacency
     if (buildingType === 'wind_turbine') {
       if (!isNearWater(newGrid, x, y, state.gridSize)) {
         return state; // Wind turbines must be placed near water (coastal)
       }
     } else {
       // Existing logic for marina and pier
       const waterCheck = getWaterAdjacency(newGrid, x, y, size.width, size.height, state.gridSize);
       if (!waterCheck.hasWater) {
         return state;
       }
       shouldFlip = waterCheck.shouldFlip;
     }
   }
   ```

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] `WATERFRONT_BUILDINGS` includes `'wind_turbine'`
- [ ] `requiresWaterAdjacency('wind_turbine')` returns true
- [ ] Wind turbines cannot be placed away from water
- [ ] Wind turbines can be placed near water (5x5 area)
- [ ] Other waterfront buildings (marina, pier) still work correctly

### Manual Test
1. Try placing wind turbine away from water → should fail
2. Try placing wind turbine near water → should succeed
3. Verify marina and pier placement still works

### Commit
```
git add src/lib/simulation.ts
git commit -m "feat: add coastal placement requirement for wind turbines"
```

---

## Task 9: Create Solar Panel Visual Renderer

### Objective
Create SVG component for solar panel rendering.

### Implementation Steps
1. Open `src/components/buildings/IsometricBuildings.tsx`
2. Find where `PowerPlant` component is defined (around line 609)
3. Add `SolarPanel` component after `PowerPlant`:
   ```typescript
   export const SolarPanel: React.FC<BuildingProps> = ({ size = TILE_WIDTH }) => {
     const w = size;
     const h = getTileHeight(w);
     const panelH = h * 0.3;
     const totalH = h + panelH;
     const groundY = panelH;
     
     return (
       <svg width={w} height={totalH} viewBox={`0 0 ${w} ${totalH}`} style={{ display: 'block' }}>
         {/* Ground */}
         <polygon points={`${w/2},${groundY} ${w},${groundY + h/2} ${w/2},${totalH} 0,${groundY + h/2}`} fill="#4a7c3f" stroke="#2d4a26" strokeWidth={0.5} />
         {/* Base platform */}
         <IsometricBox w={w * 0.6} h={h * 0.4} depth={h * 0.15} topColor="#2a2a2a" leftColor="#1a1a1a" rightColor="#3a3a3a" yOffset={panelH * 0.5} />
         {/* Solar panel array - angled toward sun */}
         <polygon points={`${w * 0.2},${panelH * 0.3} ${w * 0.8},${panelH * 0.3} ${w * 0.75},${panelH * 0.7} ${w * 0.25},${panelH * 0.7}`} fill="#1a3a5a" stroke="#0a2a4a" strokeWidth={0.5} />
         {/* Panel grid lines */}
         {[0, 1, 2].map(i => (
           <line
             key={i}
             x1={w * (0.2 + i * 0.2)}
             y1={panelH * 0.3}
             x2={w * (0.2 + i * 0.2)}
             y2={panelH * 0.7}
             stroke="#0a2a4a"
             strokeWidth={0.3}
           />
         ))}
         {/* Support posts */}
         <rect x={w * 0.25} y={panelH * 0.7} width={2} height={h * 0.1} fill="#4a5568" />
         <rect x={w * 0.5 - 1} y={panelH * 0.7} width={2} height={h * 0.1} fill="#4a5568" />
         <rect x={w * 0.75 - 2} y={panelH * 0.7} width={2} height={h * 0.1} fill="#4a5568" />
       </svg>
     );
   };
   ```

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] Component exports without errors
- [ ] SVG renders correctly (check visually in browser)
- [ ] Component accepts `size` prop

### Manual Test
1. Start dev server: `npm run dev`
2. Place a solar panel in the game
3. Verify it renders correctly on the canvas

### Commit
```
git add src/components/buildings/IsometricBuildings.tsx
git commit -m "feat: add solar panel visual renderer"
```

---

## Task 10: Create Wind Turbine Visual Renderer

### Objective
Create SVG component for wind turbine rendering.

### Implementation Steps
1. Open `src/components/buildings/IsometricBuildings.tsx`
2. Add `WindTurbine` component after `SolarPanel`:
   ```typescript
   export const WindTurbine: React.FC<BuildingProps> = ({ size = TILE_WIDTH }) => {
     const w = size;
     const h = getTileHeight(w);
     const towerH = h * 2.0;
     const totalH = h + towerH;
     const groundY = towerH;
     
     return (
       <svg width={w} height={totalH} viewBox={`0 0 ${w} ${totalH}`} style={{ display: 'block' }}>
         {/* Ground */}
         <polygon points={`${w/2},${groundY} ${w},${groundY + h/2} ${w/2},${totalH} 0,${groundY + h/2}`} fill="#4a7c3f" stroke="#2d4a26" strokeWidth={0.5} />
         {/* Tower - tapered */}
         <polygon points={`${w * 0.48},${towerH} ${w * 0.52},${towerH} ${w * 0.51},${towerH * 0.1} ${w * 0.49},${towerH * 0.1}`} fill="#666" stroke="#555" strokeWidth={0.5} />
         {/* Nacelle (housing at top) */}
         <ellipse cx={w * 0.5} cy={towerH * 0.1} rx={w * 0.15} ry={h * 0.08} fill="#888" stroke="#777" strokeWidth={0.5} />
         {/* Blades - simplified 3-blade design */}
         {[0, 120, 240].map((angle, i) => {
           const angleRad = (angle * Math.PI) / 180;
           const bladeLength = w * 0.25;
           const x1 = w * 0.5;
           const y1 = towerH * 0.1;
           const x2 = x1 + bladeLength * Math.cos(angleRad);
           const y2 = y1 + bladeLength * Math.sin(angleRad);
           return (
             <line
               key={i}
               x1={x1}
               y1={y1}
               x2={x2}
               y2={y2}
               stroke="#aaa"
               strokeWidth={2}
               strokeLinecap="round"
             />
           );
         })}
       </svg>
     );
   };
   ```

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] Component exports without errors
- [ ] SVG renders correctly (check visually in browser)
- [ ] Component accepts `size` prop
- [ ] Three blades are rendered

### Manual Test
1. Start dev server: `npm run dev`
2. Place a wind turbine near water in the game
3. Verify it renders correctly on the canvas

### Commit
```
git add src/components/buildings/IsometricBuildings.tsx
git commit -m "feat: add wind turbine visual renderer"
```

---

## Task 11: Integrate Renderers into Building Renderer

### Objective
Add solar panel and wind turbine cases to the building renderer switch.

### Implementation Steps
1. Open `src/components/buildings/IsometricBuildings.tsx`
2. Find `BuildingRenderer` component (around line 905)
3. Find the switch statement in `renderBuilding()` (around line 937)
4. Add cases after `water_tower`:
   ```typescript
   case 'solar_panel':
     return <SolarPanel size={size} />;
   case 'wind_turbine':
     return <WindTurbine size={size} />;
   ```

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] No type errors
- [ ] Switch cases are added correctly

### Manual Test
1. Start dev server: `npm run dev`
2. Place solar panel and wind turbine
3. Verify they render correctly

### Commit
```
git add src/components/buildings/IsometricBuildings.tsx
git commit -m "feat: integrate solar and wind renderers into building renderer"
```

---

## Task 12: Add Tools to Sidebar

### Objective
Add solar panel and wind turbine to the utilities category in the sidebar.

### Implementation Steps
1. Open `src/components/game/Sidebar.tsx`
2. Find the utilities category tools array (around line 328)
3. Update to include new tools:
   ```typescript
   tools: ['power_plant', 'solar_panel', 'wind_turbine', 'water_tower', 'subway_station', 'rail_station'] as Tool[],
   ```

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] No type errors
- [ ] Tools array includes both new building types

### Manual Test
1. Start dev server: `npm run dev`
2. Open sidebar
3. Verify solar panel and wind turbine appear in utilities category
4. Click on them - verify tool selection works

### Commit
```
git add src/components/game/Sidebar.tsx
git commit -m "feat: add solar and wind tools to sidebar"
```

---

## Task 13: Add Tools to Command Menu

### Objective
Add solar panel and wind turbine to the command menu utilities category.

### Implementation Steps
1. Open `src/components/ui/CommandMenu.tsx`
2. Find `utilitiesCategory` array (around line 180)
3. Update to include new tools:
   ```typescript
   const utilitiesCategory: Tool[] = ['power_plant', 'solar_panel', 'wind_turbine', 'water_tower', 'subway_station', 'rail_station'];
   ```

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] No type errors
- [ ] Command menu includes both new building types

### Manual Test
1. Start dev server: `npm run dev`
2. Open command menu (Cmd/Ctrl + K)
3. Search for "solar" or "wind"
4. Verify tools appear and can be selected

### Commit
```
git add src/components/ui/CommandMenu.tsx
git commit -m "feat: add solar and wind tools to command menu"
```

---

## Task 14: Add Tools to Mobile Toolbar

### Objective
Add solar panel and wind turbine to mobile toolbar with icons.

### Implementation Steps
1. Open `src/components/mobile/MobileToolbar.tsx`
2. Find the tool icon mapping (around line 151)
3. Add entries:
   ```typescript
   solar_panel: <PowerIcon size={20} />,
   wind_turbine: <PowerIcon size={20} />,
   ```
4. Find the `UTILITIES` category array (around line 195)
5. Update to include new tools:
   ```typescript
   'UTILITIES': ['power_plant', 'solar_panel', 'wind_turbine', 'water_tower', 'subway_station', 'rail_station'] as Tool[],
   ```

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] No type errors
- [ ] Icon mappings exist for both tools
- [ ] Utilities category includes both tools

### Manual Test
1. Start dev server: `npm run dev`
2. Test on mobile viewport or mobile device
3. Verify tools appear in mobile toolbar
4. Verify icons display correctly

### Commit
```
git add src/components/mobile/MobileToolbar.tsx
git commit -m "feat: add solar and wind tools to mobile toolbar"
```

---

## Task 15: Update Overlay System

### Objective
Add solar and wind to power overlay mapping.

### Implementation Steps
1. Open `src/components/game/overlays.ts`
2. Find `TOOL_TO_OVERLAY_MAP` (around line 90)
3. Add entries:
   ```typescript
   solar_panel: 'power',
   wind_turbine: 'power',
   ```
4. Find `OVERLAY_TO_BUILDING_TYPES` (around line 211)
5. Update power array:
   ```typescript
   power: ['power_plant', 'solar_panel', 'wind_turbine'],
   ```

### Tests
- [ ] TypeScript compiles: `npm run build`
- [ ] No type errors
- [ ] Overlay mappings exist for both tools
- [ ] Power overlay includes both building types

### Manual Test
1. Start dev server: `npm run dev`
2. Place solar panels and wind turbines
3. Enable power overlay
4. Verify coverage circles appear for all power sources

### Commit
```
git add src/components/game/overlays.ts
git commit -m "feat: add solar and wind to power overlay system"
```

---

## Task 16: Integration Testing

### Objective
Test the complete feature end-to-end.

### Test Scenarios

#### Scenario 1: Solar Panel Placement and Coverage
1. Start a new game
2. Select solar panel tool
3. Place solar panel on grass tile
4. Verify it renders correctly
5. Zone nearby tiles
6. Verify buildings receive power coverage (8 tile range)
7. Check budget panel - verify maintenance cost is 50/month

#### Scenario 2: Wind Turbine Placement and Coverage
1. Start a new game with water (lake or ocean)
2. Select wind turbine tool
3. Try placing away from water → should fail
4. Place wind turbine near water → should succeed
5. Verify it renders correctly
6. Zone nearby tiles
7. Verify buildings receive power coverage (10 tile range)
8. Check budget panel - verify maintenance cost is 75/month

#### Scenario 3: Mixed Power Sources
1. Place 1 power plant, 2 solar panels, 1 wind turbine
2. Verify all provide power coverage
3. Check budget: power cost = (1 * 150) + (2 * 50) + (1 * 75) = 325
4. Verify power overlay shows coverage from all sources

#### Scenario 4: Building Evolution
1. Place solar panels
2. Zone residential area within range
3. Verify buildings evolve and receive power
4. Verify population/jobs are calculated correctly

#### Scenario 5: Save/Load
1. Create game with solar and wind
2. Save the game
3. Reload the game
4. Verify solar and wind buildings persist
5. Verify power coverage still works

### Tests Checklist
- [ ] All scenarios pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Visual rendering is correct
- [ ] Power coverage works correctly
- [ ] Budget calculations are correct
- [ ] Save/load works

### Commit
```
git commit -m "test: complete integration testing for multiple energy types"
```

---

## Task 17: Final Verification and Documentation

### Objective
Verify everything works and update documentation.

### Steps
1. Run full build: `npm run build`
2. Run linter: `npm run lint` (fix any issues)
3. Test in browser: `npm run dev`
4. Verify all features work
5. Check for any console warnings/errors

### Documentation Updates
- [ ] Verify tooltips are clear
- [ ] Verify descriptions are accurate
- [ ] Check that coastal requirement is mentioned for wind turbines

### Final Checklist
- [ ] All TypeScript compiles
- [ ] No linter errors (except pre-existing ones)
- [ ] All visual renderers work
- [ ] All tools accessible in UI
- [ ] Power coverage works correctly
- [ ] Budget calculations correct
- [ ] Placement validation works
- [ ] Save/load works
- [ ] No console errors

### Commit
```
git commit -m "docs: final verification and cleanup"
```

---

## Task 18: Prepare for Merge

### Objective
Finalize the feature branch for merge.

### Steps
1. Ensure all tasks are complete
2. Ensure all tests pass
3. Review all commits
4. Create summary of changes

### Final Commit
```
git commit -m "chore: prepare feature branch for merge"
```

### Summary
Create a brief summary of what was implemented:
- Added solar panels (8 tile range, 4000 cost, 50/month)
- Added wind turbines (10 tile range, 4500 cost, 75/month, coastal required)
- All power sources work 24/7
- Visual renderers for both building types
- Full UI integration (sidebar, command menu, mobile toolbar)
- Power overlay support
- Budget system integration

---

## Notes for Agent

- **Do not skip tests** - each task must have passing tests before moving on
- **Commit frequently** - after each completed task
- **Ask for help** if stuck on any task
- **Test manually** in addition to automated tests where specified
- **Fix linter errors** as you go (except pre-existing ones)

Good luck! 🚀

