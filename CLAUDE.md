# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Canopy is a spatial, community-driven forum where conversations grow like forests. Users plant virtual trees on an infinite shared grid, with trees representing messages that grow through interactions. Full-stack TypeScript frontend (PIXI.js/Vite) + Python backend (FastAPI/SQLModel).

## Common Commands

### Development
```bash
npm run dev              # Run both client and server concurrently
npm run client           # Frontend dev server only (Vite on port 5173)
npm run server           # Backend dev server only (FastAPI on port 8000)
```

### Build & Quality
```bash
npm run build            # Production build to dist/
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
```

### Testing
```bash
npm test                 # Watch mode
npm run test-ci          # Single run with coverage
npm run coverage         # Full coverage report
```

### Backend Setup
```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Architecture

### Frontend Layers (src/)

**Entry & Orchestration:**
- `main.ts` → Entry point, initializes Scene
- `world/scene.ts` → Master orchestrator: PIXI.Application, Viewport, coordinates all managers

**Interaction & State:**
- `world/selection-manager.ts` → Cell selection, hover states, radial menu control
- `world/actions-handler.ts` → Dispatches WebSocket messages to registries/services
- `registry/user-registry.ts` → In-memory user store with event emission (add/remove callbacks)

**Data Flow:**
- `service/user-service.ts` → Business logic, bridges Repository ↔ Registry
- `repository/user-repository.ts` → API data fetching
- `network/connection-manager.ts` → WebSocket singleton with typed message handling

**UI Components:**
- `ui/radial-menu.ts` → Context menu for tree interactions
- `ui/cursor.ts` → Cursor visualization
- `ui/button.ts` → Button component

**Utilities:**
- `math/position-converter.ts` → World ↔ Screen ↔ Cell coordinate conversions
- `constants.ts` → World size, zoom limits, colors

### Backend Structure (server/src/)

- `main.py` → FastAPI app, WebSocket broadcast loop, CORS
- `routes/v1/http/` → REST endpoints (users, posts)
- `routes/v1/websocket/` → WebSocket endpoints
- `models/post.py` → SQLModel definitions (ORM + validation)
- `database/database.py` → SQLite setup

### WebSocket Protocol

Messages use discriminated union types in `src/network/types/message.ts`:

**Inbound (Server → Client):** `USERS`, `CONNECT`, `DISCONNECT`, `STATE`
**Outbound (Client → Server):** `SWITCH_CELL`

When adding new message types, update `message.ts` and handle in `actions-handler.ts`.

## Key Patterns

- **Singleton:** ConnectionManager (WebSocket)
- **Registry Pattern:** In-memory entity stores with event callbacks
- **Repository Pattern:** Data access abstraction from API
- **Discriminated Unions:** Type-safe WebSocket messages

## World Configuration

Grid is 1000x1000 cells, each 100px. Zoom range 0.25-5x. Colors defined in `constants.ts`:
- Fill: `0xf0ead2` (light beige)
- Hover: `0xbfd8bd` (sage green)
- Selection: `0xb5e48c` (light green)

## Code Style

- 4-space indentation, single quotes, semicolons required
- 120 character line limit
- Trailing commas in multiline objects
- TypeScript strict mode with no unused variables
