import type { Coordinate, Grid, Ship, ShotResult } from "@/types";
import { GRID_SIZE } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a coordinate to its flat-array index (row-major). */
export function coordToIndex(coord: Coordinate): number {
  return coord.y * GRID_SIZE + coord.x;
}

/** Check whether a coordinate falls within the 10×10 grid. */
export function isValidCoordinate(coord: Coordinate): boolean {
  return (
    coord.x >= 0 &&
    coord.x < GRID_SIZE &&
    coord.y >= 0 &&
    coord.y < GRID_SIZE
  );
}

/** Produce the "x,y" key used for set lookups. */
export function coordKey(coord: Coordinate): string {
  return `${coord.x},${coord.y}`;
}

// ---------------------------------------------------------------------------
// Board creation
// ---------------------------------------------------------------------------

/**
 * Create a fresh 10×10 grid where every cell is empty.
 *
 * The grid is stored as a flat, row-major array of 100 cells.
 */
export function createEmptyBoard(): Grid {
  const board: Grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      board.push({
        coordinate: { x, y },
        state: "empty",
        shipId: null,
      });
    }
  }
  return board;
}

// ---------------------------------------------------------------------------
// Attack handling
// ---------------------------------------------------------------------------

/** Return value of `receiveAttack` so the caller knows what happened. */
export interface AttackResult {
  /** The updated board (new array — original is not mutated). */
  board: Grid;
  /** Whether the shot was a hit, miss, or sunk a ship. */
  result: ShotResult;
  /** If a ship was sunk, the updated ship object. */
  sunkShip: Ship | null;
}

/**
 * Process an incoming attack on `board` at `coordinate`.
 *
 * Rules applied:
 * - If the cell is already hit/miss the shot is treated as a miss (wasted turn).
 * - If the cell contains a ship, it becomes a 'hit' and the ship's hit set is
 *   updated. If all of the ship's cells are now hit the ship is marked as sunk.
 * - Otherwise the cell becomes a 'miss'.
 *
 * Returns a **new** board array — the original is never mutated.
 * Also returns a copy of the `ships` array with the targeted ship updated.
 */
export function receiveAttack(
  board: Grid,
  ships: Ship[],
  coordinate: Coordinate,
): { board: Grid; ships: Ship[]; result: ShotResult; sunkShip: Ship | null } {
  if (!isValidCoordinate(coordinate)) {
    throw new RangeError(
      `Coordinate (${coordinate.x}, ${coordinate.y}) is out of bounds`,
    );
  }

  const index = coordToIndex(coordinate);
  const cell = board[index];

  // Already attacked — treat as a miss (wasted turn).
  if (cell.state === "hit" || cell.state === "miss") {
    return { board: [...board], ships, result: "miss", sunkShip: null };
  }

  // Shallow-copy the board so we don't mutate the original.
  const newBoard: Grid = [...board];

  if (cell.state === "ship" && cell.shipId !== null) {
    // --- HIT ---
    newBoard[index] = { ...cell, state: "hit" };

    const key = coordKey(coordinate);
    const newShips = ships.map((s) => {
      if (s.id !== cell.shipId) return s;
      const newHits = new Set(s.hits);
      newHits.add(key);
      const isSunk = newHits.size === s.length;
      return { ...s, hits: newHits, isSunk };
    });

    const updatedShip = newShips.find((s) => s.id === cell.shipId) ?? null;
    const sunk = updatedShip?.isSunk ?? false;

    return {
      board: newBoard,
      ships: newShips,
      result: sunk ? "sunk" : "hit",
      sunkShip: sunk ? updatedShip : null,
    };
  }

  // --- MISS ---
  newBoard[index] = { ...cell, state: "miss" };
  return { board: newBoard, ships, result: "miss", sunkShip: null };
}
