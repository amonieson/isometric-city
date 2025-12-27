# Research Prompt: Power Utilities Network System

## Context

You are researching how to implement a **road-network-based power utilities system** for an isometric city-building game. The current implementation uses radius-based coverage (circular area around power plants), but we want to transition to a system where power and utilities propagate along connected road networks.

## Current System

The game currently has:
- **Power plants** that provide coverage in a 15-tile radius (circular)
- **Water towers** that provide coverage in a 12-tile radius (circular)
- **Road connectivity requirement** (recently implemented) - service buildings must be connected to roads
- **Isometric grid system** with tiles at coordinates (x, y)
- **Road network** represented as `building.type === 'road'` tiles

## Research Goal

Investigate how other city-building games implement **network-based utility distribution** (power, water, etc.) that propagates along infrastructure networks (roads, power lines, pipes) rather than simple radius-based coverage.

## Instructions

### Step 1: Identify Relevant Codebases

Use Driver's MCP tools to explore codebases that likely implement utility network systems:

1. **Call `get_codebase_names`** to see available codebases
2. **Prioritize these codebases** (city-building games):
   - `citybound` - Modern city building game
   - `Cytopia` - Open-source city builder
   - `lincity-ng` - Linux City (classic city builder)
   - `micropolisJS` - JavaScript SimCity
   - `OpenSC2K` - SimCity 2000 open source
   - `starpeace-server-multiverse-nodejs` - Multiplayer city builder
   - Any other city-building or infrastructure simulation games

### Step 2: Deep Context Research

For each relevant codebase:

1. **Get architecture overview**:
   - Use `get_architecture_overview` to understand the codebase structure
   - Use `get_llm_onboarding_guide` for navigation tips
   - Use `get_changelog` to understand historical development

2. **Explore utility/power systems**:
   - Use `get_code_map` to find files related to:
     - Power/utility distribution
     - Network/graph traversal
     - Infrastructure connectivity
     - Service coverage calculations
   - Search for terms like: "power", "utility", "network", "grid", "distribution", "coverage", "connectivity"

3. **Read implementation details**:
   - Use `get_file_documentation` to get detailed documentation for relevant files
   - Focus on:
     - How utilities propagate along networks
     - Pathfinding/graph traversal algorithms used
     - Distance calculation along networks
     - Performance optimizations
     - Data structures for network representation

### Step 3: Analysis Questions

For each codebase, answer:

1. **Network Representation**:
   - How is the utility network represented? (graph, adjacency lists, etc.)
   - How are roads/infrastructure stored and connected?
   - Are utilities separate from roads or use the same network?

2. **Propagation Algorithm**:
   - What algorithm is used to traverse the network? (BFS, DFS, Dijkstra, etc.)
   - How is distance calculated along the network? (tile count, weighted, etc.)
   - Is there a maximum range/distance for utility propagation?

3. **Performance**:
   - How is the network traversal optimized?
   - Is there caching of reachable areas?
   - How is cache invalidation handled when networks change?

4. **Edge Cases**:
   - How are disconnected road segments handled?
   - What happens when a road is removed (power outage)?
   - How are bridges/tunnels handled?
   - Multi-city or isolated zones?

5. **UI/Visualization**:
   - How is network-based coverage visualized?
   - Are there overlays showing utility reach?
   - How do users see which areas are connected?

### Step 4: Implementation Recommendations

Based on the research, provide:

1. **Recommended Approach**:
   - Which algorithm(s) would work best for our isometric grid?
   - What data structures should we use?
   - How should we handle performance?

2. **Architecture Design**:
   - Proposed function signatures
   - How to integrate with existing `calculateServiceCoverage()`
   - How to maintain backward compatibility

3. **Implementation Phases**:
   - Break down into incremental steps
   - What can be done first (MVP)?
   - What are the dependencies?

4. **Testing Strategy**:
   - What test cases are critical?
   - How to test network traversal?
   - Performance benchmarks needed?

## Deliverable

Create a comprehensive research document at:
`initiatives/road-connected-services/research/power-utilities-network-system.md`

### Document Structure

1. **Executive Summary**
   - Overview of findings
   - Key patterns across codebases
   - Recommended approach

2. **Codebase Analysis** (one section per codebase)
   - Architecture overview
   - Utility system implementation
   - Key algorithms and data structures
   - Performance considerations
   - Pros/cons for our use case

3. **Comparative Analysis**
   - Common patterns across games
   - Different approaches and trade-offs
   - What works well vs. what doesn't

4. **Implementation Recommendations**
   - Proposed architecture
   - Algorithm selection
   - Data structure choices
   - Integration points with existing code
   - Performance optimization strategies

5. **Implementation Plan**
   - Phased approach
   - Dependencies
   - Risk assessment
   - Testing strategy

6. **Code Examples**
   - Pseudocode or TypeScript examples
   - Function signatures
   - Data structure definitions

7. **Follow-up Questions**
   - Unanswered questions
   - Areas needing clarification
   - Design decisions needed

## Notes

- Focus on **practical, implementable** solutions
- Consider **performance** for large cities (100x100+ grids)
- Maintain **backward compatibility** with existing saves
- Keep **isometric grid constraints** in mind
- Consider **multi-tile buildings** (power plants can be large)

## Success Criteria

The research should enable an agent to:
1. Understand how network-based utilities work in similar games
2. Choose appropriate algorithms and data structures
3. Design a system that integrates with existing code
4. Implement incrementally with confidence
5. Test effectively

---

**Start by calling `get_codebase_names` and then systematically explore each relevant city-building codebase using Driver's MCP tools.**

