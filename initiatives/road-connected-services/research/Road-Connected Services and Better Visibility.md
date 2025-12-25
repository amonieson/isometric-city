# Road-Connected Services and Better Visibility

## Executive Summary

This initiative aims to require public service buildings (police stations, fire stations, hospitals, schools, and universities) to be connected to roads for functionality, preventing players from placing them randomly and improving the strategic planning aspect of city building. Additionally, we will enhance the overlay system to provide better visual feedback about service coverage and road connectivity.

---

## 1. Current State Analysis

### 1.1 Public Service Buildings

The following buildings are considered public services that should require road connectivity:

**Location**: `src/types/game.ts:28-32`
- `police_station` - Police Station (1x1, cost: 500)
- `fire_station` - Fire Station (1x1, cost: 500)
- `hospital` - Hospital (2x2, cost: 1000)
- `school` - School (2x2, cost: 400)
- `university` - University (3x3, cost: 2000)

### 1.2 Current Placement Validation

**Location**: `src/lib/simulation.ts:2235-2378`

Currently, building placement validation (`placeBuilding`) only checks:
- Cannot build on water tiles
- Cannot place roads/rails on existing buildings
- Cannot place buildings on roads/rails (except for special cases)
- Waterfront buildings (marina, pier) must be adjacent to water
- Multi-tile buildings must fit within grid bounds and be placed on grass/tree tiles

**No road connectivity requirement exists** for any service buildings.

### 1.3 Road Adjacency Detection

**Location**: `src/lib/simulation.ts:632-697`

The codebase already has a `getRoadAdjacency()` function that:
- Checks all four edges of a building footprint for adjacent roads
- Returns `{ hasRoad: boolean; shouldFlip: boolean }`
- Currently only used for visual sprite flipping (making buildings face roads)

This function can be reused for validation, but needs to be called during placement validation.

### 1.4 Service Coverage System

**Location**: `src/lib/simulation.ts:846-860`

Service buildings provide coverage in circular radii:
- `police_station`: range 13 tiles
- `fire_station`: range 18 tiles
- `hospital`: range 12 tiles
- `school`: range 11 tiles
- `university`: range 19 tiles

**Current Behavior**: Service buildings provide coverage regardless of road connectivity. A hospital placed in the middle of nowhere with no roads will still provide health coverage to nearby buildings.

### 1.5 Overlay System

**Location**: `src/components/game/overlays.ts`

Current overlay functionality:
- Shows red warning tint (`rgba(239, 68, 68, 0.45)`) on buildings without coverage
- Draws radius circles around service buildings
- Highlights service buildings with colored glows
- Uses percentage-based coverage for police/fire/health/education (0-100%)

**Limitations**:
- No visual indication of road connectivity
- No distinction between "no coverage" and "service building not connected to road"
- Coverage circles always shown, even if service building is non-functional

---

## 2. Road Connection Requirements

### 2.1 Which Buildings Should Require Roads?

**Primary Targets** (Public Services):
- `police_station` - Emergency services need road access
- `fire_station` - Fire trucks require road access
- `hospital` - Ambulances and visitors need road access
- `school` - Students and staff need road access
- `university` - Large institution requires road access

**Excluded** (Utilities/Infrastructure):
- `power_plant` - May be placed in remote locations, connected via power grid
- `water_tower` - Infrastructure, may not need road access
- `subway_station` - Has its own transportation network
- `rail_station` - Has its own transportation network

**Question for Discussion**: Should utilities like power plants and water towers also require road access? They currently don't, but it might make sense for maintenance/construction access.

### 2.2 Road Connection Definition

A building is "connected to a road" if:
- At least one edge of the building's footprint is adjacent to a road tile
- For multi-tile buildings (hospital 2x2, school 2x2, university 3x3), any edge tile adjacent to a road counts

**Implementation**: Use existing `getRoadAdjacency()` function which already checks all four edges.

### 2.3 Functional Impact

When a service building is **not connected to a road**:
- **Option A (Strict)**: Building provides **zero coverage** - completely non-functional
- **Option B (Gradual)**: Building provides **reduced coverage** (e.g., 50% effectiveness)
- **Option C (Warning)**: Building works but shows warning/notification

**Recommendation**: Option A (strict) - if not connected to road, building provides zero coverage. This is clearest for players and prevents "cheating."

---

## 3. Implementation Approach

### 3.1 Placement Validation

**Location**: `src/lib/simulation.ts:2235-2378`

Add road connectivity check in `placeBuilding()` function:

```typescript
// After water adjacency check (around line 2325)
if (requiresRoadConnection(buildingType)) {
  const roadCheck = getRoadAdjacency(newGrid, x, y, size.width, size.height, state.gridSize);
  if (!roadCheck.hasRoad) {
    return state; // Service buildings must be placed next to a road
  }
}
```

**New Helper Function**:
```typescript
function requiresRoadConnection(buildingType: BuildingType): boolean {
  const ROAD_REQUIRED_BUILDINGS: BuildingType[] = [
    'police_station',
    'fire_station',
    'hospital',
    'school',
    'university'
  ];
  return ROAD_REQUIRED_BUILDINGS.includes(buildingType);
}
```

### 3.2 Service Coverage Calculation

**Location**: `src/lib/simulation.ts:863-951`

Modify `calculateServiceCoverage()` to check road connectivity:

```typescript
// In the service building collection loop (around line 887)
if (!SERVICE_BUILDING_TYPES.has(buildingType)) continue;

// Skip buildings under construction
if (tile.building.constructionProgress !== undefined && tile.building.constructionProgress < 100) {
  continue;
}

// Skip abandoned buildings
if (tile.building.abandoned) {
  continue;
}

// NEW: Skip service buildings not connected to roads
if (requiresRoadConnection(buildingType)) {
  const size = getBuildingSize(buildingType);
  const roadCheck = getRoadAdjacency(grid, x, y, size.width, size.height, size);
  if (!roadCheck.hasRoad) {
    continue; // Building is non-functional without road access
  }
}

serviceBuildings.push({ x, y, type: buildingType });
```

### 3.3 Existing Buildings Migration

**Consideration**: What happens to existing service buildings in saved games that aren't connected to roads?

**Options**:
1. **Grandfather clause**: Only enforce for new placements, existing buildings continue to work
2. **Immediate enforcement**: Existing buildings without roads stop providing coverage
3. **Grace period**: Show warning, but building continues working for X months

**Recommendation**: Option 2 (immediate enforcement) - cleanest implementation, players can rebuild if needed.

---

## 4. UI/UX Improvements

### 4.1 Overlay Enhancements

**Location**: `src/components/game/overlays.ts` and `src/components/game/CanvasIsometricGrid.tsx`

#### 4.1.1 Service Building Status Indicators

Add visual distinction for non-functional service buildings:

**Option A - Different Circle Style**:
- Functional service buildings: Solid colored radius circle
- Non-functional (no road): Dashed/dotted radius circle in gray or red

**Option B - Building Highlight**:
- Functional: Normal colored glow
- Non-functional: Red warning glow (similar to fire overlay)

**Option C - Overlay Tint**:
- In service overlay mode, tint non-functional service buildings with a distinct color (e.g., dark red or orange)

**Recommendation**: Combine Option A and B - dashed circle + red glow for non-functional buildings.

#### 4.1.2 Road Connectivity Overlay Mode

**New Overlay Mode**: `'road_connectivity'` or add to existing overlays

Show:
- Green highlight on service buildings connected to roads
- Red highlight on service buildings NOT connected to roads
- Visual connection lines from service buildings to nearest roads (optional, may be cluttered)

**Alternative**: Integrate into existing service overlays - when viewing fire overlay, show which fire stations are connected.

#### 4.1.3 Coverage Visualization

**Current**: Red tint on uncovered buildings, radius circles for service buildings

**Enhancement**: 
- Show gradient/heatmap of coverage strength (darker = better coverage)
- Distinguish between "no service building nearby" vs "service building exists but not connected to road"
- Add tooltip/info panel showing why a building has no coverage

### 4.2 Placement Feedback

**Location**: `src/components/game/CanvasIsometricGrid.tsx` or building placement logic

When player tries to place a service building:
- **Before placement**: Show preview with road connectivity indicator
- **Invalid placement**: Show error message/tooltip "Service buildings must be placed next to a road"
- **Valid placement**: Show green indicator on adjacent road tiles

### 4.3 Notification System

**Location**: `src/lib/simulation.ts` (notification generation)

Add notifications for:
- Service building placed without road connection (shouldn't happen with validation, but for edge cases)
- Service building loses road connection (if roads are bulldozed)
- Service building regains road connection

---

## 5. Technical Considerations

### 5.1 Performance Impact

**Road Adjacency Check**:
- `getRoadAdjacency()` already exists and is efficient
- Checks 4 edges of building footprint: O(width + height) per building
- For placement validation: Only called once per placement attempt
- For coverage calculation: Called once per service building per simulation tick

**Optimization**: Cache road adjacency status in building data structure to avoid recalculating every tick.

### 5.2 Multi-Tile Buildings

**Current Behavior**: Multi-tile buildings (hospital 2x2, school 2x2, university 3x3) have their coverage calculated from the origin tile (top-left).

**Road Connection**: Should check all edges of the footprint, not just origin tile. The existing `getRoadAdjacency()` function already handles this correctly.

### 5.3 Road Network Changes

**Edge Case**: What if a road is bulldozed after a service building is placed?

**Current**: Building would continue to provide coverage (no validation on existing buildings)

**With Road Requirement**: Need to re-validate road connectivity when roads change.

**Implementation**: In `placeBuilding()` when bulldozing roads, check adjacent service buildings and mark them as non-functional if they lose road access.

### 5.4 Data Structure Changes

**Option A**: No new data - check road connectivity on-the-fly
- Pros: No storage overhead, always accurate
- Cons: Recalculation every tick

**Option B**: Add `connectedToRoad: boolean` flag to `Building` interface
- Pros: Fast lookup, can be cached
- Cons: Needs to be kept in sync with road changes

**Recommendation**: Option A initially (simpler), optimize to Option B if performance becomes an issue.

---

## 6. Code Locations Reference

### 6.1 Key Files

1. **Building Placement**: `src/lib/simulation.ts:2235-2378` (`placeBuilding()`)
2. **Road Adjacency**: `src/lib/simulation.ts:632-697` (`getRoadAdjacency()`)
3. **Service Coverage**: `src/lib/simulation.ts:863-951` (`calculateServiceCoverage()`)
4. **Service Config**: `src/lib/simulation.ts:846-860` (`SERVICE_CONFIG`)
5. **Overlay Rendering**: `src/components/game/CanvasIsometricGrid.tsx:2920-2985`
6. **Overlay Logic**: `src/components/game/overlays.ts`
7. **Building Types**: `src/types/game.ts:28-32`

### 6.2 Related Systems

- **Water Adjacency**: `src/lib/simulation.ts:563-628` (`getWaterAdjacency()`) - Similar pattern for waterfront buildings
- **Building Size**: `src/lib/simulation.ts:1978+` (`getBuildingSize()`) - Needed for multi-tile buildings
- **Multi-tile Validation**: `src/lib/simulation.ts:2039-2067` (`canPlaceMultiTileBuilding()`)

---

## 7. Testing Considerations

### 7.1 Test Cases

1. **Placement Validation**:
   - Try placing police station next to road → should succeed
   - Try placing hospital away from roads → should fail
   - Try placing university with one edge on road → should succeed
   - Try placing school with all edges away from roads → should fail

2. **Service Coverage**:
   - Place fire station next to road → should provide coverage
   - Place fire station away from road (if somehow placed) → should provide zero coverage
   - Bulldoze road next to hospital → hospital should stop providing coverage

3. **Multi-tile Buildings**:
   - Place 2x2 hospital with only one corner touching road → should succeed
   - Place 3x3 university with road on one edge → should succeed

4. **Edge Cases**:
   - Service building on grid edge (some edges out of bounds)
   - Service building next to road that gets bulldozed
   - Multiple service buildings, some connected, some not

### 7.2 Visual Testing

- Verify overlay shows correct status for connected vs non-connected buildings
- Verify radius circles are styled differently for non-functional buildings
- Verify error messages appear when trying invalid placement
- Verify notifications appear for road connection changes

---

## 8. Implementation Phases

### Phase 1: Core Validation
1. Add `requiresRoadConnection()` helper function
2. Add road connectivity check in `placeBuilding()`
3. Test placement validation

### Phase 2: Coverage Calculation
1. Modify `calculateServiceCoverage()` to skip non-connected service buildings
2. Test that non-connected buildings provide zero coverage

### Phase 3: UI Enhancements
1. Update overlay rendering to show non-functional service buildings differently
2. Add visual indicators (dashed circles, red glow)
3. Add placement feedback (error messages, preview indicators)

### Phase 4: Polish
1. Add notifications for road connection changes
2. Handle edge cases (bulldozing roads, grid boundaries)
3. Performance optimization if needed

---

## 9. Open Questions & Follow-Up

### 9.1 Design Decisions

1. **Should utilities (power plants, water towers) also require road connections?**
   - Currently excluded, but might make sense for maintenance access
   - Could be a separate initiative or included here

2. **What happens to existing service buildings in saved games?**
   - Immediate enforcement vs grandfather clause vs grace period
   - Need to decide before implementation

3. **Should there be a visual "road connectivity" overlay mode?**
   - Or integrate into existing service overlays?
   - How to avoid UI clutter?

4. **Should non-connected service buildings show any coverage radius?**
   - Option A: Show radius but dashed/grayed out (indicates "would cover if connected")
   - Option B: Don't show radius at all (cleaner, but less informative)

5. **Should we show connection lines from service buildings to roads?**
   - Could be helpful but might be visually cluttered
   - Maybe only on hover/selection?

### 9.2 Technical Questions

6. **Should we cache road connectivity status in the Building interface?**
   - Performance vs data consistency trade-off
   - Need to keep in sync when roads change

7. **How to handle service buildings that lose road connection?**
   - Immediate effect vs gradual degradation
   - Should there be a warning period?

8. **Should road connection be checked for all service buildings every tick?**
   - Or only when roads change?
   - Performance implications for large cities

### 9.3 UX Questions

9. **What error message should appear when placement fails?**
   - Simple: "Must be placed next to a road"
   - Detailed: "Service buildings require road access for vehicles and visitors"

10. **Should the placement preview show road connectivity?**
    - Green highlight on valid placement locations
    - Red X on invalid locations
    - Show which road tiles count as "connected"

11. **How should we indicate in the overlay that a service building is non-functional?**
    - Different circle style (dashed)
    - Different color (red/gray)
    - Building highlight
    - Combination of above

12. **Should there be a notification when a service building loses road connection?**
    - "Hospital lost road access and is no longer providing health coverage"
    - Or rely on overlay visualization only?

---

## 10. References

- Power Plant Implementation Research: `initiatives/power-supply-expansion/research/power-plant-implementation.md`
- Road Adjacency Function: `src/lib/simulation.ts:632-697`
- Building Placement: `src/lib/simulation.ts:2235-2378`
- Service Coverage Calculation: `src/lib/simulation.ts:863-951`
- Overlay System: `src/components/game/overlays.ts`
- Building Types: `src/types/game.ts`

---

*Document prepared for review and feedback. Please provide answers to the follow-up questions above to proceed with implementation planning.*

