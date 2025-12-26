# Agent Execution Prompt: Multiplayer Implementation

## Your Mission

You are tasked with implementing multiplayer functionality for the isometric-city project following a test-driven development (TDD) approach. Your goal is to build a 2-player cooperative multiplayer system with ephemeral rooms, where players can join via room codes and see each other's actions in real-time.

## Critical Instructions

### 1. Create Feature Branch

**First step - do this immediately:**
```bash
git checkout -b feature/multiplayer-mvp
```

**Branch naming:** `feature/multiplayer-mvp`

### 2. Task Breakdown Strategy

Break down the implementation plan (`initiatives/multiplayer-support/plans/implementation-plan.md`) into **small, focused, testable tasks**. Each task should:

- Be completable in 1-4 hours
- Have clear success criteria
- Be independently testable
- Build incrementally on previous tasks

**Task Size Guidelines:**
- ✅ **Good**: "Create Express server with health check endpoint"
- ✅ **Good**: "Implement Room class with create/join methods"
- ❌ **Too Large**: "Build entire backend server"
- ❌ **Too Large**: "Implement all multiplayer features"

**Example Task Breakdown:**
1. Setup server directory structure
2. Create Express server with health check
3. Add Socket.io to Express server
4. Create Room class (basic structure)
5. Implement room creation with unique IDs
6. Implement room code generation
7. Implement player join functionality
8. ... (continue breaking down)

### 3. Test-Driven Development (TDD) Workflow

**For EVERY task, follow this strict workflow:**

1. **Write tests FIRST** (before any implementation)
   - Create test file for the feature
   - Write tests that describe expected behavior
   - Run tests (they should fail - this is expected)

2. **Implement the feature**
   - Write minimal code to make tests pass
   - Keep implementation simple and focused

3. **Verify tests pass**
   - All tests must pass before moving on
   - Fix any failing tests
   - Ensure no regressions

4. **Refactor if needed**
   - Clean up code while keeping tests green
   - Improve structure without changing behavior

**DO NOT move to the next task until:**
- ✅ All tests for current task pass
- ✅ Code is committed
- ✅ No linting errors

### 4. Testing Requirements

**Test Coverage:**
- Unit tests for all core logic
- Integration tests for server-client communication
- Edge case testing (disconnections, invalid actions, etc.)

**Testing Tools:**
- Use Vitest (already in project)
- Use `@testing-library/react` for React components
- Use `socket.io-client` for integration tests

**Test File Structure:**
```
server/
├── src/
│   ├── room.ts
│   └── room.test.ts    # Tests for room.ts
├── tests/
│   └── integration/    # Integration tests
```

**Example Test Pattern:**
```typescript
// room.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Room } from './room';

describe('Room', () => {
  it('should create room with unique ID', () => {
    const room = new Room();
    expect(room.id).toBeDefined();
    expect(typeof room.id).toBe('string');
  });

  it('should generate 6-character room code', () => {
    const room = new Room();
    expect(room.code).toHaveLength(6);
    expect(room.code).toMatch(/^[A-Z0-9]{6}$/);
  });
});
```

### 5. Commit Strategy

**Commit after EVERY completed task:**
- One task = one commit (or a few related commits)
- Use clear, descriptive commit messages
- Follow conventional commit format

**Commit Message Format:**
```
feat(multiplayer): [brief description]

[Optional longer description if needed]

- Task: [task name from breakdown]
- Tests: All passing
```

**Examples:**
```
feat(multiplayer): add Express server with health check endpoint

- Task: Setup basic Express server
- Tests: Server responds to GET /health
```

```
feat(multiplayer): implement Room class with code generation

- Task: Create Room class with unique codes
- Tests: Room creation, code generation, uniqueness
```

**Commit Frequency:**
- ✅ Commit after each task completion
- ✅ Commit when tests pass
- ❌ Don't commit broken/wip code
- ❌ Don't wait until end of day

### 6. Reference Documents

**Read these first:**
1. `initiatives/multiplayer-support/plans/implementation-plan.md` - Full implementation plan
2. `initiatives/multiplayer-support/research/multiplayer-implementation-research.md` - Research and architecture decisions

**Key Requirements from Plan:**
- 2-player cooperative gameplay
- Ephemeral rooms (no persistence)
- Server-authoritative validation
- Room codes for joining (e.g., "ABC123")
- Separate WebSocket server (not Vercel)
- Socket.io for real-time communication

### 7. Implementation Order

Follow the plan's step-by-step approach, but break each step into smaller tasks:

**Step 1: Setup Backend Server**
- Task 1.1: Create server directory structure
- Task 1.2: Initialize package.json with dependencies
- Task 1.3: Setup TypeScript configuration
- Task 1.4: Create Express server with health check
- Task 1.5: Add Socket.io to Express server
- Task 1.6: Test server connection locally

**Step 2: Shared Types**
- Task 2.1: Create shared directory structure
- Task 2.2: Extract GameState type to shared
- Task 2.3: Create Action types
- Task 2.4: Create Message types
- Task 2.5: Setup shared package exports

**Step 3: Room Management**
- Task 3.1: Create Room class structure
- Task 3.2: Implement room ID generation
- Task 3.3: Implement room code generation
- Task 3.4: Implement player join
- Task 3.5: Implement player leave
- Task 3.6: Implement room cleanup

**Continue this pattern for all steps...**

### 8. Code Quality Standards

**Follow existing codebase patterns:**
- TypeScript with strict mode
- Use `@/*` path alias for imports
- Follow existing file structure
- Match code style (see existing files)

**Code Review Checklist:**
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ No linting errors (`npm run lint`)
- ✅ Code follows existing patterns
- ✅ Clear variable/function names
- ✅ Comments for complex logic

### 9. Testing Multiplayer Locally

**How to test your implementation:**
1. Start backend server: `cd server && npm run dev`
2. Start frontend: `npm run dev`
3. Open multiple browser tabs to `http://localhost:3000`
4. Test room creation and joining
5. Test actions in both tabs
6. Verify state synchronization

**Test Scenarios:**
- [ ] Create room, get room code
- [ ] Join room with code
- [ ] Player 1 places building, Player 2 sees it
- [ ] Player 2 bulldozes, Player 1 sees it
- [ ] Both players see stats updates
- [ ] Handle disconnection gracefully

### 10. Progress Tracking

**After each task, update:**
- Mark task as complete in your TODO list
- Note any blockers or issues
- Document decisions made

**If you get stuck:**
- Review the implementation plan
- Check research document for architecture decisions
- Look at reference codebases (Bloc, Colyseus patterns)
- Ask for clarification rather than guessing

## Success Criteria

You'll know you're done when:

- [ ] Backend server runs and accepts connections
- [ ] 2 players can create/join a room via code
- [ ] Players see each other's actions in real-time
- [ ] All actions validated on server
- [ ] State synchronized across clients
- [ ] All tests pass
- [ ] Code committed to feature branch
- [ ] No linting errors
- [ ] Works in multiple browser tabs

## Important Reminders

1. **Tests first, always** - Write tests before implementation
2. **Small tasks** - Break everything into bite-sized pieces
3. **Commit often** - After each task completion
4. **Verify locally** - Test with multiple browser tabs
5. **Follow the plan** - Reference implementation plan for guidance
6. **Ask questions** - Don't guess at requirements

## Getting Started

1. Read `initiatives/multiplayer-support/plans/implementation-plan.md`
2. Create feature branch: `git checkout -b feature/multiplayer-mvp`
3. Break down Step 1 into small tasks
4. Start with Task 1.1: Create server directory structure
5. Write tests first, then implement
6. Commit when tests pass
7. Move to next task

**Good luck! Remember: small tasks, tests first, commit often.**

