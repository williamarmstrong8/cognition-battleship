"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Coordinate,
  GamePhase,
  Grid,
  Orientation,
  Ship,
  ShipDefinition,
  ShipType,
  Winner,
} from "@/types";
import { FLEET, GRID_SIZE } from "@/types";
import { createEmptyBoard, receiveAttack } from "@/lib/game-logic/board";
import { canPlaceShip, getShipCoordinates, placeShip } from "@/lib/game-logic/ships";
import {
  chooseAIShot,
  createInitialAIState,
  updateAIStateAfterShot,
} from "@/lib/game-logic/ai";
import type { AIState } from "@/types";

// ---------------------------------------------------------------------------
// Types used only by the hook
// ---------------------------------------------------------------------------

/** Lightweight ship descriptor for the setup UI. */
export interface SetupShip {
  id: string;
  type: ShipType;
  length: number;
  isPlaced: boolean;
  isSunk: boolean;
}

export interface UseGameStateReturn {
  // grids
  playerGrid: Grid;
  aiGrid: Grid;

  // ships
  playerShips: Ship[];
  aiShips: Ship[];
  setupShips: SetupShip[];

  // phase
  phase: GamePhase;
  winner: Winner | null;
  statusMessage: string;

  // setup actions
  selectedShipId: string | null;
  isHorizontal: boolean;
  selectShip: (id: string) => void;
  toggleOrientation: () => void;
  placeSelectedShip: (coordinate: Coordinate) => void;
  randomizePlayerShips: () => void;

  // game actions
  startGame: () => void;
  fireShot: (coordinate: Coordinate) => void;
  resetGame: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createShipFromDefinition(
  def: ShipDefinition,
  origin: Coordinate,
  orientation: Orientation,
): Ship {
  return {
    id: def.type.toLowerCase(),
    type: def.type,
    length: def.length,
    orientation,
    coordinates: getShipCoordinates(origin, def.length, orientation),
    hits: new Set<string>(),
    isSunk: false,
  };
}

/** Try to randomly place a ship on the board. Returns null if impossible after many retries. */
function randomlyPlaceShip(
  board: Grid,
  def: ShipDefinition,
  idPrefix: string,
): { board: Grid; ship: Ship } | null {
  const orientations: Orientation[] = ["horizontal", "vertical"];
  for (let attempt = 0; attempt < 200; attempt++) {
    const orientation =
      orientations[Math.floor(Math.random() * orientations.length)];
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const origin: Coordinate = { x, y };

    if (canPlaceShip(board, def.length, origin, orientation)) {
      const ship: Ship = {
        id: `${idPrefix}-${def.type.toLowerCase()}`,
        type: def.type,
        length: def.length,
        orientation,
        coordinates: getShipCoordinates(origin, def.length, orientation),
        hits: new Set<string>(),
        isSunk: false,
      };
      return { board: placeShip(board, ship), ship };
    }
  }
  return null;
}

function placeAllShipsRandomly(
  idPrefix: string,
): { board: Grid; ships: Ship[] } {
  let board = createEmptyBoard();
  const ships: Ship[] = [];

  for (const def of FLEET) {
    const result = randomlyPlaceShip(board, def, idPrefix);
    if (!result) {
      throw new Error(`Failed to place ${def.type} after 200 attempts`);
    }
    board = result.board;
    ships.push(result.ship);
  }

  return { board, ships };
}

function allShipsSunk(ships: Ship[]): boolean {
  return ships.length > 0 && ships.every((s) => s.isSunk);
}

function buildSetupShips(placedIds: Set<string>): SetupShip[] {
  return FLEET.map((def) => ({
    id: def.type.toLowerCase(),
    type: def.type,
    length: def.length,
    isPlaced: placedIds.has(def.type.toLowerCase()),
    isSunk: false,
  }));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGameState(): UseGameStateReturn {
  // --- Grids ---
  const [playerGrid, setPlayerGrid] = useState<Grid>(createEmptyBoard);
  const [aiGrid, setAiGrid] = useState<Grid>(createEmptyBoard);

  // --- Ships ---
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [aiShips, setAiShips] = useState<Ship[]>([]);

  // --- Phase ---
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [winner, setWinner] = useState<Winner | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Deploy your fleet, Commander.",
  );

  // --- AI ---
  const aiStateRef = useRef<AIState>(createInitialAIState());

  // --- Setup UI state ---
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [placedShipIds, setPlacedShipIds] = useState<Set<string>>(
    new Set<string>(),
  );

  const setupShips = buildSetupShips(placedShipIds);
  const allPlaced = placedShipIds.size === FLEET.length;

  // -----------------------------------------------------------------------
  // Setup actions
  // -----------------------------------------------------------------------

  const selectShip = useCallback((id: string) => {
    setSelectedShipId(id);
  }, []);

  const toggleOrientation = useCallback(() => {
    setIsHorizontal((prev) => !prev);
  }, []);

  const placeSelectedShip = useCallback(
    (coordinate: Coordinate) => {
      if (phase !== "setup" || !selectedShipId) return;

      const def = FLEET.find(
        (d) => d.type.toLowerCase() === selectedShipId,
      );
      if (!def) return;
      if (placedShipIds.has(selectedShipId)) return;

      const orientation: Orientation = isHorizontal
        ? "horizontal"
        : "vertical";

      if (!canPlaceShip(playerGrid, def.length, coordinate, orientation)) {
        setStatusMessage("Invalid placement — try a different position.");
        return;
      }

      const ship = createShipFromDefinition(def, coordinate, orientation);
      const newGrid = placeShip(playerGrid, ship);

      setPlayerGrid(newGrid);
      setPlayerShips((prev) => [...prev, ship]);
      setPlacedShipIds((prev) => {
        const next = new Set(prev);
        next.add(selectedShipId);
        return next;
      });
      setSelectedShipId(null);
      setStatusMessage(`${def.type} deployed.`);
    },
    [phase, selectedShipId, isHorizontal, playerGrid, placedShipIds],
  );

  const randomizePlayerShips = useCallback(() => {
    if (phase !== "setup") return;

    const { board, ships } = placeAllShipsRandomly("player");
    setPlayerGrid(board);
    setPlayerShips(ships);
    setPlacedShipIds(
      new Set(ships.map((s) => s.id.replace("player-", ""))),
    );
    setSelectedShipId(null);
    setStatusMessage("Fleet auto-deployed. Ready for combat.");
  }, [phase]);

  // -----------------------------------------------------------------------
  // Start game
  // -----------------------------------------------------------------------

  const startGame = useCallback(() => {
    if (!allPlaced) return;

    // Place AI ships randomly (hidden from player)
    const { board: aiBoardWithShips, ships: aiFleet } =
      placeAllShipsRandomly("ai");

    // For the AI grid shown to the player, hide ship positions
    const hiddenAiGrid: Grid = aiBoardWithShips.map((cell) => ({
      ...cell,
      state: cell.state === "ship" ? "empty" : cell.state,
    }));

    setAiGrid(hiddenAiGrid);
    setAiShips(aiFleet);
    aiStateRef.current = createInitialAIState();
    setPhase("player_turn");
    setStatusMessage("Engage the enemy — select a target on their grid.");
  }, [allPlaced]);

  // -----------------------------------------------------------------------
  // Player fires
  // -----------------------------------------------------------------------

  const fireShot = useCallback(
    (coordinate: Coordinate) => {
      if (phase !== "player_turn") return;

      // Check if already attacked
      const existingCell = aiGrid[coordinate.y * GRID_SIZE + coordinate.x];
      if (existingCell.state === "hit" || existingCell.state === "miss") {
        setStatusMessage("Already targeted — pick another coordinate.");
        return;
      }

      // We need to attack the *real* AI board (with ships), not the hidden one.
      // Reconstruct: take the hidden grid and overlay ship info from aiShips.
      const realAiGrid: Grid = aiGrid.map((cell) => {
        const shipOnCell = aiShips.find((s) =>
          s.coordinates.some(
            (c) =>
              c.x === cell.coordinate.x && c.y === cell.coordinate.y,
          ),
        );
        if (shipOnCell && cell.state === "empty") {
          return { ...cell, state: "ship" as const, shipId: shipOnCell.id };
        }
        return cell;
      });

      const result = receiveAttack(realAiGrid, aiShips, coordinate);

      // Convert back to hidden grid for display (don't reveal un-hit ships)
      const displayGrid: Grid = result.board.map((cell) => ({
        ...cell,
        state: cell.state === "ship" ? "empty" : cell.state,
      }));

      setAiGrid(displayGrid);
      setAiShips(result.ships);

      if (result.result === "sunk") {
        setStatusMessage(
          `Direct hit! You sunk their ${result.sunkShip?.type}!`,
        );
      } else if (result.result === "hit") {
        setStatusMessage("Hit! Keep firing, Commander.");
      } else {
        setStatusMessage("Miss. The enemy returns fire...");
      }

      // Check win
      if (allShipsSunk(result.ships)) {
        setPhase("game_over");
        setWinner("player");
        setStatusMessage("Victory! All enemy vessels destroyed.");
        return;
      }

      // Transition to AI turn
      setPhase("ai_turn");
    },
    [phase, aiGrid, aiShips],
  );

  // -----------------------------------------------------------------------
  // AI turn (runs automatically via useEffect)
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (phase !== "ai_turn") return;

    const timer = setTimeout(() => {
      const { coordinate, newAIState } = chooseAIShot(
        aiStateRef.current,
      );

      const result = receiveAttack(playerGrid, playerShips, coordinate);

      // Update AI internal state based on result
      const wasHit = result.result === "hit" || result.result === "sunk";
      const wasSunk = result.result === "sunk";
      const updatedAIState = updateAIStateAfterShot(
        newAIState,
        coordinate,
        wasHit,
        wasSunk,
      );
      aiStateRef.current = updatedAIState;

      setPlayerGrid(result.board);
      setPlayerShips(result.ships);

      // Check AI win
      if (allShipsSunk(result.ships)) {
        setPhase("game_over");
        setWinner("ai");
        setStatusMessage("Defeat. Your fleet has been destroyed.");
        return;
      }

      if (result.result === "sunk") {
        setStatusMessage(
          `The enemy sunk your ${result.sunkShip?.type}! Your turn.`,
        );
      } else if (result.result === "hit") {
        setStatusMessage("The enemy scored a hit! Your turn.");
      } else {
        setStatusMessage("Enemy missed. Your turn, Commander.");
      }

      setPhase("player_turn");
    }, 800);

    return () => clearTimeout(timer);
  }, [phase, playerGrid, playerShips]);

  // -----------------------------------------------------------------------
  // Reset
  // -----------------------------------------------------------------------

  const resetGame = useCallback(() => {
    setPlayerGrid(createEmptyBoard());
    setAiGrid(createEmptyBoard());
    setPlayerShips([]);
    setAiShips([]);
    setPhase("setup");
    setWinner(null);
    setStatusMessage("Deploy your fleet, Commander.");
    aiStateRef.current = createInitialAIState();
    setSelectedShipId(null);
    setIsHorizontal(true);
    setPlacedShipIds(new Set<string>());
  }, []);

  return {
    playerGrid,
    aiGrid,
    playerShips,
    aiShips,
    setupShips,
    phase,
    winner,
    statusMessage,
    selectedShipId,
    isHorizontal,
    selectShip,
    toggleOrientation,
    placeSelectedShip,
    randomizePlayerShips,
    startGame,
    fireShot,
    resetGame,
  };
}
