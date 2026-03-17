# Battleship Next.js - Architecture & Technical Spec

## 1. Project Overview
A single-player Battleship game built with Next.js (App Router), TypeScript, and Tailwind CSS. The user plays against an AI opponent. 

**Tech Stack:**
* Framework: Next.js 16 (App Router)
* Language: TypeScript
* Styling: Tailwind CSS
* UI Components: shadcn/ui
* State Management: React Hooks (Context API if necessary)

## 2. Directory Structure
We strictly separate UI components, game logic, and state management.

```text
src/
├── app/                  # Next.js routing and main page layouts
├── components/
│   ├── game/             # Battleship-specific UI (Board, Cell, Ship, Controls)
│   └── ui/               # Reusable UI components (shadcn buttons, dialogs, etc.)
├── hooks/                # React state management (useGameState, useAudio, etc.)
├── lib/
│   └── game-logic/       # Pure TypeScript functions (NO React imports here)
│       ├── ai.ts         # AI opponent algorithm (Hunt & Target)
│       ├── board.ts      # Grid generation and validation
│       └── ships.ts      # Ship placement and rotation logic
└── types/
    └── index.ts          # Global TypeScript interfaces
```

## 3. Data Models (Core Types)
The game relies on these fundamental structures:

Coordinate: { x: number, y: number }

Ship: * id: string

type: 'Carrier' | 'Battleship' | 'Cruiser' | 'Submarine' | 'Destroyer'

length: number

coordinates: Coordinate[]

isSunk: boolean

CellState: 'empty' | 'ship' | 'hit' | 'miss'

GameState Phase: 'setup' | 'player_turn' | 'ai_turn' | 'game_over'

## 4. State Management Strategy
Pure Logic: Functions in /lib/game-logic must be pure. They take a board state and an action, and return a new board state. They do not trigger React renders.

React State: The useGameState hook will hold the grids (Player and AI) and use the pure functions from /lib to update state.

Two Grids: The game requires tracking two 10x10 grids:

playerGrid: Shows player's ships and the AI's guesses (hits/misses).

aiGrid: Hides AI's ships, only showing the player's guesses (hits/misses).

## 5. AI Opponent Strategy
The AI (/lib/game-logic/ai.ts) operates in two modes:

Hunt Mode: Fires at random valid coordinates. (Optimization: use a checkerboard parity algorithm to guess efficiently).

Target Mode: Triggered when a "hit" occurs. The AI will store the hit coordinate and prioritize firing at adjacent cells (N, S, E, W) until the ship is sunk, then revert to Hunt Mode.
