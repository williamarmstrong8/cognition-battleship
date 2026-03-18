'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Board } from '@/components/game/Board';
import ShipSelector from '@/components/game/ShipSelector';
import GameControls from '@/components/game/GameControls';
import FleetStatus from '@/components/game/FleetStatus';
import TurnIndicator from '@/components/game/TurnIndicator';
import { useGameState } from '@/hooks/useGameState';

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
    randomizePlayerShips,
    startGame,
    fireShot,
    resetGame,
  } = useGameState();

  const allPlaced = setupShips.every((s) => s.isPlaced);

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Battleship</h1>
          <p className="text-[10px] text-slate-500 tracking-[0.2em] uppercase mt-0.5">Naval Combat Simulator</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Status / Turn Indicator */}
        {isGameOver ? (
          <div className={`flex justify-center py-10 rounded-xl border shadow-lg ${
            winner === 'player'
              ? 'bg-sky-50 border-sky-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex flex-col items-center gap-4">
              <span className={`text-4xl font-bold tracking-tight ${winner === 'player' ? 'text-sky-600' : 'text-red-600'}`}>
                {winner === 'player' ? 'Victory' : 'Defeat'}
              </span>
              <p className="text-slate-600 text-sm">{statusMessage}</p>
              <Button
                onClick={resetGame}
                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold uppercase tracking-wider text-sm mt-2"
              >
                New Game
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

        {/* Boards */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Player board */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">My Fleet</p>
              <h2 className="text-base font-semibold text-slate-800 tracking-tight mt-0.5">Command Grid</h2>
            </div>
            <Board
              board={playerGrid}
              onCellClick={isSetup ? placeSelectedShip : () => {}}
              disabled={!isSetup}
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
            />
          </div>
        </div>

        {/* Controls — show during setup only */}
        {isSetup && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <GameControls
                allShipsPlaced={allPlaced}
                onStartGame={startGame}
                onRandomizeFleet={randomizePlayerShips}
                onResetGame={resetGame}
              />
            </div>
            <div className="flex-1">
              <ShipSelector
                ships={setupShips}
                selectedShip={selectedShipId}
                onSelectShip={selectShip}
                isHorizontal={isHorizontal}
                onRotate={toggleOrientation}
              />
            </div>
          </div>
        )}

        {/* Abort button during active game */}
        {!isSetup && !isGameOver && (
          <div className="flex justify-center">
            <Button
              onClick={resetGame}
              variant="destructive"
              className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
            >
              Abort Mission
            </Button>
          </div>
        )}

        {/* Fleet Status */}
        <FleetStatus
          playerShips={playerFleetStatus.length > 0 ? playerFleetStatus : setupShips}
          enemyShips={enemyFleetForStatus}
        />
      </main>
    </div>
  );
}
