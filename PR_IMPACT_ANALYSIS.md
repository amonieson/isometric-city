# Impact Analysis: Road-Network-Based Service Coverage

## Current PR Scope
The current PR implements **road connectivity requirements** for service buildings:
- ✅ Service buildings must be connected to roads to function
- ✅ Still uses **radius-based coverage** (circular area around building)
- ✅ Disconnected buildings are excluded from coverage calculations

## Suggested Feature Change
Change from **radius-based** to **road-network-based** coverage:
- Services propagate along connected roads instead of circular radius
- Enables placing power plants in industrial zones, serving city via road network
- More realistic infrastructure simulation

## Impact Assessment

### 🔴 **Major Scope Change**
This would **double or triple** the PR scope:

1. **Current PR**: ~500 lines of code, 105+ tests
2. **With road-network coverage**: Would require:
   - Complete rewrite of `calculateServiceCoverage()` function
   - Pathfinding algorithm (BFS/DFS) to traverse road networks
   - Distance calculation along road paths (not Euclidean)
   - New overlay rendering logic
   - Extensive new test suite
   - Performance optimization for large road networks

### 🔴 **Architectural Complexity**
- **Current**: Simple distance check (`dx² + dy² <= range²`)
- **Proposed**: Graph traversal of road network from each service building
- **Performance**: Much more computationally expensive
- **Edge Cases**: Disconnected road segments, bridges, multi-city networks

### 🔴 **Breaking Changes**
- Would fundamentally change how coverage works
- Existing saved games might have different coverage patterns
- User expectations would shift dramatically

### 🟡 **Testing Impact**
- Current tests assume radius-based coverage
- Would need to rewrite most coverage tests
- Need new tests for road network traversal
- Need tests for disconnected road segments

### 🟡 **UI/UX Impact**
- Overlay rendering would need complete redesign
- Radius circles → road network highlighting
- More complex visualization

## Recommendation

### Option 1: **Separate PR** (Recommended)
- ✅ Keep current PR focused on road connectivity requirement
- ✅ Create follow-up PR for road-network-based coverage
- ✅ Allows incremental review and testing
- ✅ Less risk of introducing bugs

### Option 2: **Expand Current PR**
- ❌ Significantly delays current PR
- ❌ Much larger review burden
- ❌ Higher risk of bugs
- ❌ Mixes two distinct features

### Option 3: **Hybrid Approach**
- Keep radius-based coverage but **extend range** along roads
- Simpler than full network traversal
- Still allows industrial zone placement
- Less realistic but more performant

## Technical Implementation Estimate

If implementing road-network coverage:

### New Functions Needed
```typescript
// Pathfinding along roads
function findRoadNetworkReachable(
  grid: Tile[][],
  startX: number,
  startY: number,
  maxDistance: number,
  gridSize: number
): Set<number> // Set of tile indices reachable via roads

// Distance calculation along road paths
function calculateRoadDistance(
  grid: Tile[][],
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  gridSize: number
): number | null // Distance in tiles, or null if unreachable
```

### Modified Functions
- `calculateServiceCoverage()`: Complete rewrite
- Overlay rendering: New visualization logic
- Performance: Caching road network graphs

### Estimated Effort
- **Development**: 2-3x current PR effort
- **Testing**: 2x current test suite
- **Review**: Much longer review cycle
- **Risk**: Higher complexity = more bugs

## Suggested Response to Comment

> "This is a great idea for a follow-up feature! The current PR focuses on requiring service buildings to be connected to roads, which is the foundation needed for road-network-based coverage. Implementing coverage propagation along roads would be a natural next step, but it's a significantly larger feature that would:
> 
> 1. Require pathfinding algorithms to traverse road networks
> 2. Completely rewrite the coverage calculation system
> 3. Need new overlay visualization
> 4. Require extensive testing for edge cases
> 
> I'd recommend we merge this PR first to establish the road connectivity requirement, then tackle road-network coverage as a separate PR. This keeps the scope manageable and allows for focused review.
> 
> Would you like me to create an issue/plan for the road-network coverage feature?"

## Conclusion

**Keep the current PR focused.** The suggested feature is excellent but belongs in a separate PR. The current PR establishes the foundation (road connectivity requirement) that makes road-network coverage possible in the future.

