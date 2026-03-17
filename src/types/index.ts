// ---------------------------------------------------------------------------
// Battleship – Domain Types
// ---------------------------------------------------------------------------

/** Grid dimensions */
export const GRID_SIZE = 10 as const;

/** Row labels used in the classic game (A–J). */
export const ROW_LABELS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
] as const;

/** Column labels used in the classic game (1–10). */
export const COLUMN_LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// ---------------------------------------------------------------------------
// Coordinate
// ---------------------------------------------------------------------------

/** Zero-indexed (x = column, y = row) position on the 10×10 grid. */
export interface Coordinate {
  /** Column index (0–9). */
  x: number;
  /** Row index (0–9). */
  y: number;
}

// ---------------------------------------------------------------------------
// Ship
// ---------------------------------------------------------------------------

/** Canonical ship types in the standard fleet. */
export type ShipType =
  | "Carrier"
  | "Battleship"
  | "Cruiser"
  | "Submarine"
  | "Destroyer";

/** Orientation a ship can be placed in on the grid. */
export type Orientation = "horizontal" | "vertical";

/** Metadata for each ship type: name and length. */
export interface ShipDefinition {
  type: ShipType;
  length: number;
}

/** The standard fleet (5 ships, 17 total cells). */
export const FLEET: readonly ShipDefinition[] = [
  { type: "Carrier", length: 5 },
  { type: "Battleship", length: 4 },
  { type: "Cruiser", length: 3 },
  { type: "Submarine", length: 3 },
  { type: "Destroyer", length: 2 },
] as const;

/** Total number of cells occupied by all ships in the standard fleet. */
export const TOTAL_SHIP_CELLS = 17 as const;

/**
 * A ship that has been placed on a grid.
 *
 * `coordinates` lists every cell the ship occupies.
 * `hits` tracks which of those cells have been struck.
 */
export interface Ship {
  /** Unique identifier for this ship instance. */
  id: string;
  /** The type / class of the ship. */
  type: ShipType;
  /** Number of cells this ship occupies. */
  length: number;
  /** The orientation the ship was placed in. */
  orientation: Orientation;
  /** Ordered list of cells the ship occupies (length === `length`). */
  coordinates: Coordinate[];
  /** Set of coordinate keys ("x,y") that have been hit. */
  hits: Set<string>;
  /** Derived – true when every cell has been hit. */
  isSunk: boolean;
}

// ---------------------------------------------------------------------------
// Ship Placement (setup phase)
// ---------------------------------------------------------------------------

/**
 * Represents a ship that is being positioned during the setup phase
 * but has not yet been committed to the board.
 */
export interface ShipPlacement {
  /** The ship type being placed. */
  type: ShipType;
  /** Number of cells this ship occupies. */
  length: number;
  /** Current orientation. */
  orientation: Orientation;
  /** The anchor coordinate (top-left cell of the ship). */
  origin: Coordinate;
}

// ---------------------------------------------------------------------------
// Cell & Board
// ---------------------------------------------------------------------------

/** Visual / logical state of a single cell on a grid. */
export type CellState = "empty" | "ship" | "hit" | "miss";

/** A single cell on the board, combining position and state. */
export interface Cell {
  coordinate: Coordinate;
  state: CellState;
  /** If occupied, the id of the ship on this cell. */
  shipId: string | null;
}

/** A 10×10 grid represented as a flat array (row-major, length 100). */
export type Grid = Cell[];

// ---------------------------------------------------------------------------
// Shot
// ---------------------------------------------------------------------------

/** Result of a single shot. */
export type ShotResult = "hit" | "miss" | "sunk";

/** Record of a shot fired at the opponent. */
export interface ShotRecord {
  coordinate: Coordinate;
  result: ShotResult;
  /** If the shot sank a ship, the type of ship that was sunk. */
  sunkShipType?: ShipType;
}

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------

/** The two modes the Hunt-and-Target AI operates in. */
export type AIMode = "hunt" | "target";

/** Internal state the AI tracks between turns. */
export interface AIState {
  mode: AIMode;
  /** Coordinates the AI has already fired at. */
  shotsFired: Set<string>;
  /** Stack of high-priority targets (adjacent to a recent hit). */
  targetQueue: Coordinate[];
  /** Coordinates of consecutive hits on the ship currently being targeted. */
  currentHits: Coordinate[];
}

// ---------------------------------------------------------------------------
// Game Phase & State
// ---------------------------------------------------------------------------

/** High-level phases the game progresses through. */
export type GamePhase = "setup" | "player_turn" | "ai_turn" | "game_over";

/** Which participant won. */
export type Winner = "player" | "ai";

/** Top-level game state that drives the entire UI and logic. */
export interface GameState {
  /** Current phase of the game. */
  phase: GamePhase;

  /** The player's own grid (shows their ships + AI's hits/misses). */
  playerGrid: Grid;
  /** The AI's grid (hides AI ships; shows player's hits/misses). */
  aiGrid: Grid;

  /** Player's fleet with hit / sunk tracking. */
  playerShips: Ship[];
  /** AI's fleet with hit / sunk tracking. */
  aiShips: Ship[];

  /** Chronological log of every shot the player has taken. */
  playerShotHistory: ShotRecord[];
  /** Chronological log of every shot the AI has taken. */
  aiShotHistory: ShotRecord[];

  /** AI internal state (hunt/target bookkeeping). */
  aiState: AIState;

  /** Set once the game reaches 'game_over'. */
  winner: Winner | null;

  /** Human-readable status message shown in the UI. */
  statusMessage: string;
}
