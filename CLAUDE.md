# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev                                # Vite dev server
bun run build                          # tsc --noEmit then vite build
bun run typecheck                      # type-check only
bun test                               # all tests
bun test src/logic/walls.test.ts       # single test file
```

## Architecture

Redux-style: immutable `GameState` → pure `dispatch()` → `Renderer` re-renders via RAF.

```
Input (keyboard/mouse)
  → dispatch(state, action) → nextState   [stateMachine.ts]
  → renderer.setState(nextState)          [renderer.ts]
  → RAF loop → draw*() functions          [render/]
```

`main.ts` is the composition root: creates initial state, instantiates `Renderer`, wires input handlers. `dispatch` rejections short-circuit `renderer.setState()` (no redundant re-render).

### Core types (`src/types.ts`)

- `Cell { x, y }` — 9×9 grid; y=0 is top (black's goal), y=8 is white's goal
- `WallPos { x, y }` — 0–7 range; anchor in the gap between cells
- `PlacedWall { pos, orientation }` — horizontal or vertical
- `GameState { players: Record<Team, PlayerState>, walls: PlacedWall[], phase }` — fully immutable; `phase` is `"playing" | "won"`
- `GameAction` — discriminated union `MOVE | PLACE_WALL`

### Module map

| Path | Role |
|------|------|
| `src/main.ts` | Composition root; holds state; wires input → dispatch → renderer |
| `src/state/GameState.ts` | `initialState()` factory |
| `src/state/stateMachine.ts` | Pure reducer: validates and applies actions |
| `src/logic/movement.ts` | `getLegalMoves()` — straight moves + jump logic |
| `src/logic/walls.ts` | Wall placement validation (bounds, budget, overlap, path integrity) |
| `src/logic/pathfinding.ts` | BFS confirming both players retain a path to their goal row |
| `src/render/renderer.ts` | `Renderer` class; owns canvas + RAF loop; caches `legalMoves` on `setState()`; `destroy()` cancels RAF (wired to HMR dispose) |
| `src/render/draw*.ts` | Pure draw functions (board, walls, players, UI) |
| `src/input/keyboard.ts` | WASD (white) / arrow keys (black); R to reset |
| `src/input/mouse.ts` | Left-click = H wall, right-click = V wall; live preview |
| `src/utils/coords.ts` | Pixel ↔ grid conversion; wall anchor detection; `cellEq()` |
| `src/constants.ts` | Cell size 70px, gap 15px, canvas 750×750, color palette |

### Wall encoding

- Horizontal wall at `{x,y}` blocks the edge between rows y/y+1 for columns x and x+1
- Vertical wall at `{x,y}` blocks the edge between cols x/x+1 for rows y and y+1
- Validation pipeline: bounds → budget (≤10 per player) → overlap/cross → BFS path check

### Jump logic (`movement.ts`)

If the opponent is adjacent, the active player can jump straight over. If that jump is blocked by a wall or the board edge, diagonal moves are offered instead.

## Tests

Test files live next to the code they test:
- `src/logic/walls.test.ts` — wall validation and pathfinding
- `src/state/stateMachine.test.ts` — state transitions and win conditions
