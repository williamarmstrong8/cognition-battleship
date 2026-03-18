'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Board, type PreviewCell } from '@/components/game/Board';
import ShipSelector from '@/components/game/ShipSelector';
import GameControls from '@/components/game/GameControls';
import FleetStatus from '@/components/game/FleetStatus';
import TurnIndicator from '@/components/game/TurnIndicator';
import { useGameState } from '@/hooks/useGameState';
import { canPlaceShip, getShipCoordinates } from '@/lib/game-logic/ships';
import type { Coordinate, Orientation } from '@/types';

export default function Home() {
  const {
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
    placeShipDirect,
    randomizePlayerShips,
    startGame,
    fireShot,
    resetGame,
  } = useGameState();

  const allPlaced = setupShips.every((s) => s.isPlaced);

  // ── Drag-and-drop state ──────────────────────────────────────────────────
  const [dragState, setDragState] = useState<{ shipId: string; offset: number } | null>(null);
  const [boardHoverCoord, setBoardHoverCoord] = useState<Coordinate | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Track cursor position via document-level dragover (fires on every pixel of movement)
  useEffect(() => {
    if (!dragState) {
      setCursorPos(null);
      return;
    }
    const handler = (e: DragEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    document.addEventListener('dragover', handler);
    return () => document.removeEventListener('dragover', handler);
  }, [dragState]);

  const draggedShip = dragState ? setupShips.find((s) => s.id === dragState.shipId) : null;

  const previewCells = useMemo<PreviewCell[]>(() => {
    if (!dragState || !boardHoverCoord) return [];
    const ship = setupShips.find((s) => s.id === dragState.shipId);
    if (!ship || ship.isPlaced) return [];

    const orientation: Orientation = isHorizontal ? 'horizontal' : 'vertical';
    const origin: Coordinate = isHorizontal
      ? { x: boardHoverCoord.x - dragState.offset, y: boardHoverCoord.y }
      : { x: boardHoverCoord.x, y: boardHoverCoord.y - dragState.offset };

    const valid =
      origin.x >= 0 &&
      origin.y >= 0 &&
      canPlaceShip(playerGrid, ship.length, origin, orientation);

    return getShipCoordinates(origin, ship.length, orientation)
      .filter((c) => c.x >= 0 && c.x < 10 && c.y >= 0 && c.y < 10)
      .map((c) => ({ x: c.x, y: c.y, valid }));
  }, [dragState, boardHoverCoord, isHorizontal, setupShips, playerGrid]);

  const handleCellDrop = (coord: Coordinate) => {
    if (!dragState) return;
    const orientation: Orientation = isHorizontal ? 'horizontal' : 'vertical';
    const origin: Coordinate = isHorizontal
      ? { x: coord.x - dragState.offset, y: coord.y }
      : { x: coord.x, y: coord.y - dragState.offset };
    placeShipDirect(dragState.shipId, origin, orientation);
    setDragState(null);
    setBoardHoverCoord(null);
  };

  // Build fleet status data (works for both player & AI ships)
  const playerFleetStatus = playerShips.map((s) => ({
    id: s.id,
    type: s.type,
    length: s.length,
    isSunk: s.isSunk,
  }));

  const aiFleetStatus = aiShips.map((s) => ({
    id: s.id,
    type: s.type,
    length: s.length,
    isSunk: s.isSunk,
  }));

  // During setup, show the default fleet for the enemy side
  const enemyFleetForStatus =
    phase === 'setup'
      ? [
          { id: 'carrier', type: 'Carrier' as const, length: 5, isSunk: false },
          { id: 'battleship', type: 'Battleship' as const, length: 4, isSunk: false },
          { id: 'cruiser', type: 'Cruiser' as const, length: 3, isSunk: false },
          { id: 'submarine', type: 'Submarine' as const, length: 3, isSunk: false },
          { id: 'destroyer', type: 'Destroyer' as const, length: 2, isSunk: false },
        ]
      : aiFleetStatus;

  const isPlayerTurn = phase === 'setup' || phase === 'player_turn';
  const isSetup = phase === 'setup';
  const isGameOver = phase === 'game_over';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Ship icon */}
            <div className="flex items-center justify-center w-8 h-8 bg-slate-900 rounded-lg">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.5.5 4.7 1.61 6.95" />
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
                <path d="M12 10v4" />
                <path d="M12 7v.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">Battleship</h1>
              <p className="text-[10px] text-slate-500 tracking-[0.15em] uppercase mt-0.5 leading-none">Naval Combat Simulator</p>
            </div>
          </div>

          {/* Phase pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all duration-500 ${
            isGameOver
              ? winner === 'player'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
              : isSetup
                ? 'bg-slate-100 border-slate-200 text-slate-600'
                : phase === 'player_turn'
                  ? 'bg-sky-50 border-sky-200 text-sky-700'
                  : 'bg-orange-50 border-orange-200 text-orange-600'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              isGameOver
                ? winner === 'player' ? 'bg-emerald-500' : 'bg-red-500'
                : isSetup
                  ? 'bg-slate-400'
                  : phase === 'player_turn'
                    ? 'bg-sky-500 animate-pulse'
                    : 'bg-orange-500 animate-pulse'
            }`} />
            {isGameOver
              ? winner === 'player' ? 'Victory' : 'Defeat'
              : isSetup
                ? 'Setup Phase'
                : phase === 'player_turn'
                  ? 'Your Turn'
                  : 'Enemy Turn'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Status / Turn Indicator */}
        {isGameOver ? (
          <div className={`relative overflow-hidden rounded-2xl border ${
            winner === 'player'
              ? 'bg-gradient-to-br from-emerald-50 to-sky-50 border-emerald-200'
              : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
          }`}>
            {/* Background decoration */}
            <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 ${
              winner === 'player' ? 'bg-emerald-400' : 'bg-red-400'
            }`} />
            <div className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10 ${
              winner === 'player' ? 'bg-sky-400' : 'bg-orange-400'
            }`} />

            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8">
              <div className="flex flex-col items-center sm:items-start gap-2">
                <div className={`text-[10px] font-bold uppercase tracking-[0.3em] ${
                  winner === 'player' ? 'text-emerald-500' : 'text-red-400'
                }`}>
                  {winner === 'player' ? 'Mission Complete' : 'Mission Failed'}
                </div>
                <h2 className={`text-5xl font-black tracking-tight leading-none ${
                  winner === 'player' ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {winner === 'player' ? 'Victory' : 'Defeat'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">{statusMessage}</p>
              </div>

              {/* Stats row */}
              <div className="flex gap-6">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black text-slate-800">
                    {playerShips.filter((s) => !s.isSunk).length}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ships Left</span>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black text-slate-800">
                    {aiShips.filter((s) => s.isSunk).length}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Enemy Sunk</span>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-black text-slate-800">
                    {playerShips.filter((s) => s.isSunk).length}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Losses</span>
                </div>
              </div>

              <Button
                onClick={resetGame}
                className={`shrink-0 px-6 py-5 text-sm font-semibold tracking-wider uppercase rounded-xl shadow-sm ${
                  winner === 'player'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                Play Again
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <TurnIndicator isPlayerTurn={isPlayerTurn} />
            {statusMessage && (
              <p className="text-center text-xs text-slate-500 mt-2 tracking-wide">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Setup layout (before start): only Command Grid + Fleet Assembly card */}
        {isSetup ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">My Fleet</p>
                <h2 className="text-base font-semibold text-slate-800 tracking-tight mt-0.5">Command Grid</h2>
              </div>
              <Board
                board={playerGrid}
                onCellClick={() => {}}
                disabled
                sunkShips={playerShips}
                previewCells={previewCells}
                onBoardDragMove={(coord) => setBoardHoverCoord(coord)}
                onBoardDrop={(coord) => handleCellDrop(coord)}
                onBoardDragLeave={() => setBoardHoverCoord(null)}
              />
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <ShipSelector
                ships={setupShips}
                isHorizontal={isHorizontal}
                onRotate={toggleOrientation}
                onShipDragStart={(shipId, offset) => setDragState({ shipId, offset })}
                onShipDragEnd={() => { setDragState(null); setBoardHoverCoord(null); }}
              />

              <GameControls
                allShipsPlaced={allPlaced}
                onStartGame={startGame}
                onRandomizeFleet={randomizePlayerShips}
                onResetGame={resetGame}
              />
            </div>
          </div>
        ) : (
          // Active layout (game started): Command Grid + Target Grid
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Player board */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">My Fleet</p>
                <h2 className="text-base font-semibold text-slate-800 tracking-tight mt-0.5">Command Grid</h2>
              </div>
              <Board
                board={playerGrid}
                onCellClick={() => {}}
                disabled
                sunkShips={playerShips}
              />
            </div>

            {/* AI board */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Enemy Waters</p>
                <h2 className="text-base font-semibold text-slate-800 tracking-tight mt-0.5">Target Grid</h2>
              </div>
              <Board
                board={aiGrid}
                onCellClick={phase === 'player_turn' ? fireShot : () => {}}
                disabled={phase !== 'player_turn'}
                hideShips
                sunkShips={aiShips}
              />
            </div>
          </div>
        )}

        {/* Fleet Status (only after the game has started) */}
        {!isSetup && (
          <FleetStatus
            playerShips={playerFleetStatus.length > 0 ? playerFleetStatus : setupShips}
            enemyShips={enemyFleetForStatus}
          />
        )}
      </main>

      {/* Floating ship ghost — follows cursor while dragging */}
      {draggedShip && cursorPos && (
        <div
          className="fixed z-50 pointer-events-none select-none"
          style={{
            left: cursorPos.x + 14,
            top: cursorPos.y - 18,
          }}
        >
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl shadow-xl px-3 py-2">
            {/* Ship blocks — same connected-bar style as ShipSelector */}
            <div className="flex gap-px">
              {Array.from({ length: draggedShip.length }, (_, i) => (
                <div
                  key={i}
                  className={`h-6 w-6 bg-slate-500 border border-slate-600 ${
                    i === 0 ? 'rounded-l-md' : ''
                  } ${
                    i === draggedShip.length - 1 ? 'rounded-r-md' : ''
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide whitespace-nowrap">
              {draggedShip.type}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
