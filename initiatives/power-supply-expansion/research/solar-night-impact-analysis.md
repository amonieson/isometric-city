# Solar Panel Night-Time Impact Analysis

## Executive Summary

**CRITICAL ISSUE IDENTIFIED**: Solar panels only working during day (hour 6-20) will cause buildings to lose power every night, resulting in:
- **50% reduction in population and jobs** during night hours
- **Reduced tax income** (scales with population)
- **Lower job satisfaction** (affects happiness)
- **Prevented building evolution** during night
- **Slightly increased abandonment risk** (+0.5% chance)

However, **happiness is NOT directly affected** by power loss - it's calculated from service coverage averages, pollution, green ratio, job satisfaction, and taxes.

---

## 1. Day/Night Cycle Mechanics

### 1.1 Cycle Duration
- **One full day/night cycle = 15 game days (450 ticks)**
- **Night hours**: hour >= 20 || hour < 6 (14 hours out of 24)
- **Day hours**: hour >= 6 && hour < 20 (10 hours out of 24)
- **Night represents ~58% of the visual cycle**

### 1.2 Power Coverage Calculation
- Power coverage is recalculated **every tick** in `calculateServiceCoverage()`
- Solar panels check: `const isDay = currentHour >= 6 && currentHour < 20;`
- If `!isDay`, solar panels provide **zero power coverage**

---

## 2. Immediate Impact on Buildings

### 2.1 Building Efficiency System
**Location**: `src/lib/simulation.ts:1313`

```typescript
const efficiency = (anchorBuilding.powered ? 0.5 : 0) + (anchorBuilding.watered ? 0.5 : 0);
```

**Impact**:
- **With power + water**: efficiency = 1.0 (100%)
- **With power only**: efficiency = 0.5 (50%)
- **With water only**: efficiency = 0.5 (50%)
- **With neither**: efficiency = 0.0 (0%)

### 2.2 Population and Jobs Calculation
**Location**: `src/lib/simulation.ts:1315-1320`

```typescript
anchorBuilding.population = buildingStats?.maxPop > 0
  ? Math.floor(buildingStats.maxPop * Math.max(1, anchorBuilding.level) * efficiency * 0.8)
  : 0;
anchorBuilding.jobs = buildingStats?.maxJobs > 0
  ? Math.floor(buildingStats?.maxJobs * Math.max(1, anchorBuilding.level) * efficiency * 0.8)
  : 0;
```

**Impact During Night**:
- Buildings lose power → efficiency drops to 0.5 (if they have water)
- **Population drops to 50% of max capacity**
- **Jobs drop to 50% of max capacity**
- This happens **every single night** (58% of the cycle)

### 2.3 Building Evolution Blocked
**Location**: `src/lib/simulation.ts:1117-1119`

```typescript
if (!isStarter && (!hasPower || !hasWater)) {
  return building; // Building doesn't evolve
}
```

**Impact**:
- Buildings **cannot evolve or upgrade** during night
- Construction **cannot progress** during night (line 1122-1134)
- Building level increases are **blocked** during night

---

## 3. Abandonment Risk

### 3.1 Abandonment Conditions
**Location**: `src/lib/simulation.ts:1193-1209`

Buildings only abandon when:
1. **Demand < -20** (significant oversupply)
2. **Building age > 30** (mature buildings)
3. **Abandonment chance**: 0.5-2% per tick (very gradual)

### 3.2 Power Loss Penalty
**Location**: `src/lib/simulation.ts:1199`

```typescript
const utilityPenalty = isStarter ? 0 : ((!hasPower ? 0.005 : 0) + (!hasWater ? 0.005 : 0));
```

**Impact**:
- Buildings without power get **+0.5% abandonment chance** per tick
- This is **additive** to the base abandonment chance
- **Example**: At demand -40, base chance is ~0.5%, with power loss it becomes ~1.0%
- **Still very gradual** - would take many ticks to see significant abandonment

### 3.3 Abandonment Recovery
**Location**: `src/lib/simulation.ts:1147-1188`

- Abandoned buildings can **recover** when demand returns (demand > 10)
- Recovery chance: 3-12% per tick at high demand
- Buildings are **cleared** (revert to grass) and can be redeveloped

**Conclusion**: Abandonment is **unlikely** unless demand is already very negative. Power loss alone won't cause mass abandonment, but it does increase the risk slightly.

---

## 4. Happiness Impact

### 4.1 Happiness Calculation
**Location**: `src/lib/simulation.ts:1494-1501`

```typescript
const happiness = Math.min(100, (
  safety * 0.15 +
  health * 0.2 +
  education * 0.15 +
  environment * 0.15 +
  jobSatisfaction * 0.2 +
  (100 - taxRate * 3) * 0.15
));
```

**Key Finding**: **Happiness does NOT directly depend on power coverage**

### 4.2 Indirect Happiness Impact

**Job Satisfaction Component** (20% of happiness):
```typescript
const jobSatisfaction = jobs >= population ? 100 : (jobs / (population || 1)) * 100;
```

**Impact**:
- During night: jobs drop to 50% → job satisfaction may decrease
- If `jobs < population`, job satisfaction drops below 100%
- **Example**: If population = 100, jobs = 50 (night), satisfaction = 50%
- This reduces happiness by up to **10 points** (50% * 20% weight)

**Tax Income Impact**:
- Lower population → lower tax income
- Lower tax income → may need to raise taxes
- Higher taxes → lower happiness (15% weight)

**Conclusion**: Happiness is **indirectly affected** through job satisfaction and potential tax increases, but the impact is **moderate** (up to ~10-15 points reduction).

---

## 5. Economic Impact

### 5.1 Tax Income Calculation
**Location**: `src/lib/simulation.ts:1467`

```typescript
const income = Math.floor(population * taxRate * 0.1 + jobs * taxRate * 0.05);
```

**Impact During Night**:
- Population drops to 50% → income from population drops to 50%
- Jobs drop to 50% → income from jobs drops to 50%
- **Total income reduction: ~50% during night hours**

### 5.2 Weekly Income Deposits
**Location**: `src/lib/simulation.ts:1940-1942`

Income is deposited **weekly** (every 7 days), so the impact is **averaged** over the week.

**Calculation**:
- Day hours: 10/24 = 41.7% of cycle (full income)
- Night hours: 14/24 = 58.3% of cycle (50% income)
- **Average income**: (0.417 * 1.0 + 0.583 * 0.5) = **70.8% of full income**

**Conclusion**: Cities relying solely on solar panels will have **~29% lower income** compared to cities with 24/7 power.

---

## 6. Service Coverage Impact

### 6.1 Power Advisor Messages
**Location**: `src/lib/simulation.ts:1620-1628`

```typescript
if (unpoweredBuildings > 0) {
  messages.push({
    name: 'Power Advisor',
    icon: 'power',
    messages: [`${unpoweredBuildings} buildings lack power. Build more power plants!`],
    priority: unpoweredBuildings > 10 ? 'high' : 'medium',
  });
}
```

**Impact**:
- Players will see **constant warnings** about unpowered buildings at night
- This may be **confusing** if they don't understand the day/night cycle
- Advisor messages will **fluctuate** between day and night

---

## 7. Summary of Downstream Impacts

### 7.1 Direct Impacts (Every Night)
✅ **Confirmed**:
- Buildings lose 50% population and jobs
- Building evolution/construction blocked
- Tax income reduced by ~29% (averaged)
- Job satisfaction reduced (affects happiness)
- Power advisor warnings triggered

### 7.2 Indirect Impacts
✅ **Confirmed**:
- Happiness reduced by up to 10-15 points (via job satisfaction)
- Potential tax increases needed (reduces happiness further)
- Slower city growth (buildings can't evolve at night)

### 7.3 What Does NOT Happen
❌ **NOT Confirmed**:
- Mass abandonment (requires very negative demand + old buildings)
- Direct happiness penalty (happiness doesn't check power directly)
- Immediate building destruction
- Permanent damage (buildings recover during day)

---

## 8. Recommendations

### 8.1 Option 1: Hybrid Power Strategy (Recommended)
**Solution**: Encourage players to use **solar + backup power**
- Solar panels for day (cheaper, clean)
- Power plants or wind turbines for night coverage
- **Best of both worlds**: Lower costs during day, 24/7 coverage

### 8.2 Option 2: Battery Storage System (Future Enhancement)
**Solution**: Add battery storage buildings that store solar power
- Solar panels charge batteries during day
- Batteries discharge during night
- More complex but realistic

### 8.3 Option 3: Reduce Night Impact
**Solution**: Make buildings more resilient to temporary power loss
- Add a "grace period" where buildings maintain efficiency for a few ticks after losing power
- Reduce efficiency penalty from 50% to 25% for temporary outages
- Only apply full penalty after extended power loss

### 8.4 Option 4: Solar + Wind Combination
**Solution**: Wind turbines work 24/7, solar works during day
- Players naturally combine both for full coverage
- Wind provides night backup
- Solar provides day boost

### 8.5 Option 5: Clarify in UI
**Solution**: Better player communication
- Show day/night indicator more prominently
- Explain solar panel limitations in tooltip
- Show power coverage overlay with time-of-day indicator
- Add advisor message explaining solar-only cities need backup power

---

## 9. Expected Player Experience

### 9.1 Solar-Only City (Problematic)
- **Day**: City thrives, full population, high income
- **Night**: Population/jobs drop 50%, income drops, warnings appear
- **Result**: Frustrating oscillation, unclear why it's happening

### 9.2 Solar + Backup Power (Ideal)
- **Day**: Solar provides power, backup idles
- **Night**: Backup provides power, solar idles
- **Result**: Smooth 24/7 operation, balanced costs

### 9.3 Power Plant Only (Current)
- **Day/Night**: Consistent 24/7 power
- **Result**: Predictable but higher pollution and costs

---

## 10. Conclusion

**The current implementation will cause significant gameplay issues** if players rely solely on solar panels:

1. **Economic Impact**: ~29% income reduction
2. **Growth Impact**: Buildings can't evolve at night
3. **Happiness Impact**: Up to 10-15 point reduction
4. **Player Confusion**: Constant warnings, unclear mechanics

**Recommended Solution**: 
- **Document the limitation clearly** in tooltips and UI
- **Encourage hybrid strategies** (solar + wind or solar + power plant)
- **Consider Option 3** (grace period) to reduce frustration
- **Add visual indicators** showing day/night power status

The system is **working as designed** (solar only works during day), but players need **clear guidance** and **strategic options** to avoid frustration.

