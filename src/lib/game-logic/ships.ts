import type { Coordinate, Grid, Orientation, Ship } from "@/types";
import { GRID_SIZE } from "@/types";
import { coordToIndex } from "./board";

// ---------------------------------------------------------------------------
// Coordinate generation
// ---------------------------------------------------------------------------

/**
 * Compute the list of coordinates a ship would occupy given an anchor
 * (top-left), length, and orientation.
 *
 * Does **not** validate whether the coordinates are in bounds or available —
 * use `canPlaceShip` for that.
 */
export function getShipCoordinates(
  origin: Coordinate,
  length: number,
  orientation: Orientation,
): Coordinate[] {
  const coords: Coordinate[] = [];
  for (let i = 0; i < length; i++) {
    coords.push(
      orientation === "horizontal"
        ? { x: origin.x + i, y: origin.y }
        : { x: origin.x, y: origin.y + i },
    );
  }
  return coords;
}

// ---------------------------------------------------------------------------
// Placement validation
// ---------------------------------------------------------------------------

/**
 * Check whether a ship of `shipLength` cells can legally be placed on `board`
 * starting at `startingCoordinate` in the given `orientation`.
 *
 * A placement is valid when **all** of the following hold:
 * 1. Every cell the ship would occupy is within the 10×10 grid.
 * 2. None of those cells are already occupied by another ship.
 */
export function canPlaceShip(
  board: Grid,
  shipLength: number,
  startingCoordinate: Coordinate,
  orientation: Orientation,
): boolean {
  const coords = getShipCoordinates(
    startingCoordinate,
    shipLength,
    orientation,
  );

  for (const coord of coords) {
    // Out of bounds?
    if (
      coord.x < 0 ||
      coord.x >= GRID_SIZE ||
      coord.y < 0 ||
      coord.y >= GRID_SIZE
    ) {
      return false;
    }

    // Already occupied?
    const cell = board[coordToIndex(coord)];
    if (cell.state === "ship") {
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Ship placement
// ---------------------------------------------------------------------------

/**
 * Place a `ship` on the `board` and return a **new** board with those cells
 * updated to `state: 'ship'`.
 *
 * **Pre-condition**: the placement must be legal (call `canPlaceShip` first).
 * This function will throw if any target cell is out of bounds or already
 * occupied so that invalid states are caught early.
 */
export function placeShip(board: Grid, ship: Ship): Grid {
  const newBoard: Grid = [...board];

  for (const coord of ship.coordinates) {
    if (
      coord.x < 0 ||
      coord.x >= GRID_SIZE ||
      coord.y < 0 ||
      coord.y >= GRID_SIZE
    ) {
      throw new RangeError(
        `Ship "${ship.id}" coordinate (${coord.x}, ${coord.y}) is out of bounds`,
      );
    }

    const index = coordToIndex(coord);
    const cell = newBoard[index];

    if (cell.state === "ship") {
      throw new Error(
        `Ship "${ship.id}" overlaps existing ship at (${coord.x}, ${coord.y})`,
      );
    }

    newBoard[index] = {
      ...cell,
      state: "ship",
      shipId: ship.id,
    };
  }

  return newBoard;
}
