# Manual Testing Guide

## Prerequisites

1. **Start the development server**:
   ```bash
   npm run dev
   ```
   The server should start on `http://localhost:3000`

2. **Open the browser** to `http://localhost:3000`

---

## Test Scenarios

### Test 1: Solar Panel Placement and Coverage

**Steps**:
1. Click "New Game" or load an existing game
2. Open the sidebar (or press `Cmd/Ctrl + K` for command menu)
3. Navigate to **Utilities** category
4. Select **Solar Panel** tool
5. Click on a grass tile to place the solar panel
6. Verify the solar panel renders correctly (angled panel array)
7. Zone some tiles within 8 tiles of the solar panel
8. Wait for buildings to develop
9. Verify buildings receive power (check building info panel)

**Expected Results**:
- ✅ Solar panel renders with angled panels and support posts
- ✅ Buildings within 8 tiles receive power
- ✅ Budget panel shows 50/month maintenance cost per solar panel

---

### Test 2: Wind Turbine Placement and Coverage

**Steps**:
1. Ensure your game has water (lake or ocean edge)
2. Select **Wind Turbine** tool from Utilities
3. Try placing a wind turbine **away from water** → should fail (no placement)
4. Move near water (within 5x5 area)
5. Place wind turbine near water → should succeed
6. Verify the wind turbine renders correctly (tower with 3 blades)
7. Zone some tiles within 10 tiles of the wind turbine
8. Wait for buildings to develop
9. Verify buildings receive power

**Expected Results**:
- ✅ Wind turbine cannot be placed away from water
- ✅ Wind turbine can be placed near water (coastal)
- ✅ Wind turbine renders with tower, nacelle, and 3 blades
- ✅ Buildings within 10 tiles receive power
- ✅ Budget panel shows 75/month maintenance cost per wind turbine

---

### Test 3: Mixed Power Sources

**Steps**:
1. Place 1 power plant
2. Place 2 solar panels
3. Place 1 wind turbine (near water)
4. Open the **Budget Panel**
5. Check the Power budget cost
6. Enable **Power Overlay** (click power button or use overlay toggle)
7. Verify coverage circles appear for all power sources

**Expected Results**:
- ✅ All buildings render correctly
- ✅ Budget shows: Power cost = (1 × 150) + (2 × 50) + (1 × 75) = **325/month**
- ✅ Power overlay shows coverage circles for all three power source types
- ✅ Coverage circles are different sizes: 15 tiles (power plant), 8 tiles (solar), 10 tiles (wind)

---

### Test 4: Building Evolution with Renewable Power

**Steps**:
1. Place solar panels in a residential area
2. Zone residential tiles within 8 tiles of solar panels
3. Wait for buildings to develop
4. Check building info panel for a developed building
5. Verify the building shows as "powered"
6. Verify population/jobs are calculated correctly

**Expected Results**:
- ✅ Buildings develop normally
- ✅ Buildings show as powered
- ✅ Population and jobs are at full capacity (not reduced)
- ✅ Buildings can evolve to higher levels

---

### Test 5: Save and Load

**Steps**:
1. Create a game with solar panels and wind turbines
2. Place several of each
3. Save the game (Settings Panel → Export/Import)
4. Reload the page
5. Load the saved game
6. Verify solar panels and wind turbines are still present
7. Verify power coverage still works

**Expected Results**:
- ✅ Game saves successfully
- ✅ Game loads successfully
- ✅ All solar panels and wind turbines persist
- ✅ Power coverage works after reload

---

### Test 6: UI Integration

**Steps**:
1. Check **Sidebar** → Utilities category → verify solar and wind appear
2. Press **Cmd/Ctrl + K** → search "solar" → verify tool appears
3. Press **Cmd/Ctrl + K** → search "wind" → verify tool appears
4. On mobile viewport → check mobile toolbar → verify tools appear

**Expected Results**:
- ✅ Tools appear in all UI locations
- ✅ Icons display correctly
- ✅ Tool selection works

---

### Test 7: Power Overlay

**Steps**:
1. Place solar panels and wind turbines
2. Enable Power Overlay mode
3. Verify coverage circles appear
4. Verify buildings without power show red tint
5. Verify all power sources use the same amber color

**Expected Results**:
- ✅ Coverage circles appear for all power sources
- ✅ Circles are correct sizes (8, 10, 15 tiles)
- ✅ Unpowered buildings show red warning tint
- ✅ All power sources use same amber overlay color

---

### Test 8: Cost Comparison

**Steps**:
1. Note your current money
2. Place 1 power plant (cost: 3,000)
3. Check budget: maintenance = 150/month
4. Bulldoze power plant
5. Place 1 solar panel (cost: 4,000)
6. Check budget: maintenance = 50/month
7. Place 1 wind turbine (cost: 4,500)
8. Check budget: maintenance = 75/month

**Expected Results**:
- ✅ Initial costs: Power Plant (3,000) < Solar (4,000) < Wind (4,500)
- ✅ Maintenance costs: Solar (50) < Wind (75) < Power Plant (150)
- ✅ Renewables have higher initial cost but lower maintenance

---

## Known Issues to Watch For

1. **Wind Turbine Placement**: Should fail if not near water - verify this works
2. **Power Coverage**: All sources should work 24/7 (no day/night variation)
3. **Visual Rendering**: Buildings should render correctly at different zoom levels
4. **Budget Calculations**: Verify costs are calculated correctly

---

## Reporting Issues

If you find any issues during testing:

1. Note the test scenario number
2. Describe what happened vs. what was expected
3. Check browser console for errors
4. Note any visual glitches

---

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Visual rendering correct
- ✅ Power coverage working
- ✅ Budget calculations correct
- ✅ Placement validation working
- ✅ Save/load working

