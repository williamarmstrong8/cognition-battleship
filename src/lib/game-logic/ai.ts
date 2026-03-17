import type { AIState, Coordinate } from "@/types";
import { GRID_SIZE } from "@/types";
import { coordKey, isValidCoordinate } from "./board";

// ---------------------------------------------------------------------------
// AI State factory
// ---------------------------------------------------------------------------

/** Create a fresh AI state for the start of a game. */
export function createInitialAIState(): AIState {
  return {
    mode: "hunt",
    shotsFired: new Set<string>(),
    targetQueue: [],
    currentHits: [],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the four cardinal neighbours of a coordinate (N, S, E, W). */
function getAdjacentCoords(coord: Coordinate): Coordinate[] {
  return [
    { x: coord.x, y: coord.y - 1 }, // N
    { x: coord.x, y: coord.y + 1 }, // S
    { x: coord.x + 1, y: coord.y }, // E
    { x: coord.x - 1, y: coord.y }, // W
  ];
}

/**
 * Use a checkerboard parity pattern for hunt mode.
 * Only target cells where (x + y) is even — this covers every ship of length ≥ 2
 * with half the total shots.
 */
function getHuntCandidates(shotsFired: Set<string>): Coordinate[] {
  const candidates: Coordinate[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if ((x + y) % 2 === 0 && !shotsFired.has(coordKey({ x, y }))) {
        candidates.push({ x, y });
      }
    }
  }
  // If checkerboard is exhausted, fall back to all remaining cells
  if (candidates.length === 0) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!shotsFired.has(coordKey({ x, y }))) {
          candidates.push({ x, y });
        }
      }
    }
  }
  return candidates;
}

// ---------------------------------------------------------------------------
// Core AI: choose next shot
// ---------------------------------------------------------------------------

/**
 * Decide the AI's next shot and return the updated AI state.
 *
 * Hunt mode  — pick a random valid cell (checkerboard parity).
 * Target mode — fire at the next coordinate in the target queue.
 *               If the queue is empty, fall back to hunt mode.
 */
export function chooseAIShot(
  aiState: AIState,
): { coordinate: Coordinate; newAIState: AIState } {
  const newShotsFired = new Set(aiState.shotsFired);

  // --- TARGET MODE ---
  if (aiState.mode === "target" && aiState.targetQueue.length > 0) {
    // Find the first target that hasn't been shot yet
    const queue = [...aiState.targetQueue];
    let target: Coordinate | null = null;
    while (queue.length > 0) {
      const candidate = queue.shift()!;
      const key = coordKey(candidate);
      if (
        isValidCoordinate(candidate) &&
        !newShotsFired.has(key)
      ) {
        target = candidate;
        break;
      }
    }

    if (target) {
      newShotsFired.add(coordKey(target));
      return {
        coordinate: target,
        newAIState: {
          ...aiState,
          shotsFired: newShotsFired,
          targetQueue: queue,
        },
      };
    }
    // Queue exhausted — fall through to hunt mode
  }

  // --- HUNT MODE ---
  const candidates = getHuntCandidates(newShotsFired);
  if (candidates.length === 0) {
    // Should never happen if the game is still going, but be safe
    throw new Error("AI has no valid shots remaining");
  }

  const target = candidates[Math.floor(Math.random() * candidates.length)];
  newShotsFired.add(coordKey(target));

  return {
    coordinate: target,
    newAIState: {
      ...aiState,
      mode: "hunt",
      shotsFired: newShotsFired,
      targetQueue: [],
      currentHits: [],
    },
  };
}

// ---------------------------------------------------------------------------
// Post-shot state update
// ---------------------------------------------------------------------------

/**
 * After a shot resolves, update the AI state based on the result.
 *
 * - Miss in target mode → keep targeting (queue may still have entries).
 * - Hit → switch to target mode, enqueue adjacent cells, record the hit.
 * - Sunk → clear current hits & queue, revert to hunt mode.
 */
export function updateAIStateAfterShot(
  aiState: AIState,
  coordinate: Coordinate,
  wasHit: boolean,
  wasSunk: boolean,
): AIState {
  if (wasSunk) {
    return {
      ...aiState,
      mode: "hunt",
      targetQueue: [],
      currentHits: [],
    };
  }

  if (wasHit) {
    const newCurrentHits = [...aiState.currentHits, coordinate];

    // Enqueue adjacent cells that haven't been fired at yet
    const adjacent = getAdjacentCoords(coordinate).filter(
      (c) =>
        isValidCoordinate(c) && !aiState.shotsFired.has(coordKey(c)),
    );

    // If we have 2+ hits in a line, prioritise the axis they form
    let prioritised: Coordinate[] = adjacent;
    if (newCurrentHits.length >= 2) {
      const first = newCurrentHits[0];
      const last = newCurrentHits[newCurrentHits.length - 1];
      const isHorizontal = first.y === last.y;

      if (isHorizontal) {
        // Prioritise E/W extensions
        prioritised = adjacent.filter((c) => c.y === first.y);
      } else {
        // Prioritise N/S extensions
        prioritised = adjacent.filter((c) => c.x === first.x);
      }
      // Fall back to all adjacent if axis filtering gives nothing
      if (prioritised.length === 0) prioritised = adjacent;
    }

    // Merge with existing queue (no duplicates)
    const existingKeys = new Set(
      aiState.targetQueue.map((c) => coordKey(c)),
    );
    const merged = [...aiState.targetQueue];
    for (const c of prioritised) {
      const key = coordKey(c);
      if (!existingKeys.has(key)) {
        merged.push(c);
        existingKeys.add(key);
      }
    }

    return {
      ...aiState,
      mode: "target",
      targetQueue: merged,
      currentHits: newCurrentHits,
    };
  }

  // Miss — stay in current mode (target queue may still have entries)
  if (aiState.mode === "target" && aiState.targetQueue.length > 0) {
    return aiState;
  }

  // Nothing left to target, revert to hunt
  return {
    ...aiState,
    mode: "hunt",
    targetQueue: [],
    currentHits: [],
  };
}
