# Multiplayer Implementation Plan

## Overview

This plan outlines the implementation of multiplayer functionality for isometric-city, starting with the simplest viable version: **2-player cooperative gameplay with ephemeral rooms**.

## Architecture Decision

### Frontend + Backend Separation

**Frontend (Vercel):**
- Next.js application (unchanged)
- Connects to separate WebSocket server
- Handles UI and client-side rendering

**Backend (Separate Server):**
- Node.js + Express + Socket.io server
- Hosted on Railway, Render, Fly.io, or similar
- Manages game rooms and state synchronization

**Why Separate?**
- Vercel doesn't support persistent WebSocket connections
- Serverless functions have execution time limits
- WebSocket requires persistent connection

## Phase 1: MVP Implementation

### Goals
- ✅ 2 players can join the same game room
- ✅ Players see each other's actions in real-time
- ✅ Server validates all actions
- ✅ Cooperative gameplay (shared city)
- ✅ Ephemeral rooms (no persistence)

### Components to Build

#### 1. Backend Server (`/server` directory)

**Structure:**
```
server/
├── src/
│   ├── server.ts          # Express + Socket.io setup
│   ├── room.ts            # Room management class
│   ├── gameState.ts       # Game state manager
│   ├── actions.ts         # Action validation and processing
│   └── types.ts           # Shared types
├── package.json
└── tsconfig.json
```

**Key Files:**

**`server/src/server.ts`**
- Express server for health checks
- Socket.io server setup
- Room creation/joining logic
- Connection handling

**`server/src/room.ts`**
- Room class to manage game sessions
- Player list management
- Game state storage
- Broadcast methods

**`server/src/gameState.ts`**
- Maintains authoritative game state
- Applies validated actions
- Generates state updates
- Handles simulation ticks

**`server/src/actions.ts`**
- Action type definitions
- Action validation logic
- Action processing
- Error handling

#### 2. Shared Types (`/shared` directory)

**Structure:**
```
shared/
├── types/
│   ├── game.ts            # GameState, Tile, Building (shared)
│   ├── actions.ts         # Action types
│   └── messages.ts        # Socket message types
└── package.json
```

**Purpose:**
- Share TypeScript types between frontend and backend
- Ensure type safety across client-server boundary
- Single source of truth for game state structure

#### 3. Frontend Integration

**New Files:**
- `src/hooks/useMultiplayer.ts` - Multiplayer hook
- `src/lib/multiplayerClient.ts` - Socket.io client wrapper
- `src/context/MultiplayerContext.tsx` - Multiplayer state context

**Modified Files:**
- `src/context/GameContext.tsx` - Add multiplayer mode
- `src/components/Game.tsx` - Add multiplayer UI (room code, player list)

### Implementation Steps

#### Step 1: Setup Backend Server (Week 1)

1. **Create server directory structure**
   ```bash
   mkdir -p server/src shared/types
   ```

2. **Initialize server project**
   - Create `server/package.json`
   - Install dependencies: `express`, `socket.io`, `typescript`, `@types/node`
   - Setup TypeScript config

3. **Create basic Express + Socket.io server**
   - Health check endpoint
   - Socket.io connection handling
   - Basic room creation

4. **Test server locally**
   - Run on `localhost:3001`
   - Connect with Socket.io client
   - Verify connection

#### Step 2: Shared Types (Week 1)

1. **Extract game types to shared package**
   - Copy `GameState`, `Tile`, `Building` types
   - Create action types
   - Create message types

2. **Setup shared package**
   - Create `shared/package.json`
   - Export types for both frontend and backend

#### Step 3: Room Management (Week 2)

1. **Implement Room class**
   - Room creation with unique ID
   - Player join/leave handling
   - Room state management
   - Broadcast methods

2. **Implement room code system**
   - Generate 6-character room codes (e.g., "ABC123")
   - Room lookup by code
   - Room cleanup when empty

3. **Test room system**
   - Create room
   - Join room with code
   - Verify player list updates

#### Step 4: Game State Synchronization (Week 2-3)

1. **Create GameStateManager**
   - Initialize game state
   - Apply actions to state
   - Generate state updates
   - Handle simulation ticks

2. **Implement action system**
   - Define action types (placeBuilding, bulldoze, etc.)
   - Validate actions (check funds, valid position, etc.)
   - Apply actions to state
   - Broadcast state updates

3. **Test state sync**
   - Player 1 places building
   - Verify Player 2 sees update
   - Test multiple simultaneous actions

#### Step 5: Frontend Integration (Week 3-4)

1. **Create multiplayer hook**
   - `useMultiplayer` hook
   - Connection management
   - Room joining
   - Action sending

2. **Create multiplayer context**
   - Multiplayer state
   - Connection status
   - Player list
   - Room code

3. **Integrate with GameContext**
   - Add multiplayer mode flag
   - Route actions to server in multiplayer mode
   - Merge server state updates

4. **Add multiplayer UI**
   - Room code display
   - Player list
   - Connection status indicator
   - Join room dialog

#### Step 6: Testing & Refinement (Week 4)

1. **Local testing**
   - Open multiple browser tabs
   - Test all game actions
   - Verify state synchronization
   - Test disconnection/reconnection

2. **Bug fixes**
   - Fix state sync issues
   - Handle edge cases
   - Improve error handling

3. **Performance optimization**
   - Optimize state updates
   - Reduce bandwidth usage
   - Improve latency

### Technical Details

#### Action Flow

```
Client Action → Socket.io → Server Validation → State Update → Broadcast → All Clients
```

1. **Client sends action:**
   ```typescript
   socket.emit('action', {
     type: 'placeBuilding',
     x: 10,
     y: 10,
     buildingType: 'house_small'
   });
   ```

2. **Server validates:**
   ```typescript
   function validateAction(action: Action, state: GameState): boolean {
     // Check funds
     // Check valid position
     // Check game rules
     return isValid;
   }
   ```

3. **Server applies:**
   ```typescript
   function applyAction(action: Action, state: GameState) {
     // Update game state
     state.stats.money -= action.cost;
     state.grid[y][x].building = createBuilding(action.buildingType);
   }
   ```

4. **Server broadcasts:**
   ```typescript
   room.broadcast('stateUpdate', {
     changedTiles: [{ x, y, tile: state.grid[y][x] }],
     stats: state.stats
   });
   ```

5. **Clients receive and merge:**
   ```typescript
   socket.on('stateUpdate', (update) => {
     mergeStateUpdate(localState, update);
     triggerRerender();
   });
   ```

#### State Update Strategy

**Initial Load:**
- Send full game state when player joins
- Client initializes with full state

**Updates:**
- Send only changed tiles and stats
- Use delta compression
- Batch multiple changes

**Example Update:**
```typescript
interface StateUpdate {
  changedTiles: Array<{ x: number; y: number; tile: Tile }>;
  stats?: Partial<Stats>;
  timestamp: number;
}
```

#### Conflict Resolution

**Simple Strategy (MVP):**
- Actions processed in order received
- First valid action wins
- Rejected actions return error to client
- Client shows error message

**Future Enhancement:**
- Action queuing
- Optimistic updates with rollback
- Tile-level locking

### Deployment

#### Backend Server

**Option 1: Railway**
- Free tier available
- Easy deployment
- Automatic HTTPS
- WebSocket support

**Option 2: Render**
- Free tier available
- Simple setup
- WebSocket support

**Option 3: Fly.io**
- Free tier available
- Global distribution
- WebSocket support

**Deployment Steps:**
1. Create account on chosen platform
2. Connect GitHub repository
3. Configure build command: `cd server && npm install && npm run build`
4. Configure start command: `cd server && npm start`
5. Set environment variables
6. Deploy

#### Frontend (Vercel)

**Configuration:**
- Add environment variable: `NEXT_PUBLIC_WS_URL`
- Point to deployed WebSocket server
- No changes to Vercel deployment

### Testing Strategy

#### Local Development

1. **Start backend server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Test with multiple tabs:**
   - Open `http://localhost:3000` in Tab 1
   - Open `http://localhost:3000` in Tab 2
   - Create room in Tab 1
   - Join room in Tab 2
   - Test actions in both tabs

#### Automated Testing

- Unit tests for action validation
- Unit tests for state updates
- Integration tests for room management
- E2E tests with Playwright (multiple browsers)

### Success Criteria

- [ ] 2 players can create/join a room
- [ ] Players see each other's actions in real-time
- [ ] All actions validated on server
- [ ] State synchronized across clients
- [ ] Handles disconnections gracefully
- [ ] Works in multiple browser tabs
- [ ] No major performance issues
- [ ] Basic error handling

### Future Enhancements (Post-MVP)

1. **Persistence**
   - Save games to database
   - Resume games later
   - Game history

2. **More Players**
   - Support 3-4 players
   - Room capacity management

3. **Authentication**
   - User accounts
   - Player profiles
   - Friend system

4. **Optimizations**
   - Delta compression
   - Client-side prediction
   - Spatial partitioning

5. **Features**
   - Chat system
   - Player permissions
   - Game modes (competitive, etc.)

## Timeline

- **Week 1**: Backend server setup + shared types
- **Week 2**: Room management + basic state sync
- **Week 3**: Frontend integration
- **Week 4**: Testing, bug fixes, deployment

**Total: ~4 weeks for MVP**

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| State sync bugs | High | Extensive testing, type safety |
| Performance issues | Medium | Optimize updates, batch changes |
| Deployment complexity | Low | Use managed platforms |
| Vercel WebSocket limitation | Medium | Separate server (already planned) |

## Next Steps

1. Review and approve this plan
2. Create GitHub issues for each step
3. Begin Step 1: Backend server setup
4. Set up development environment
5. Start implementation

