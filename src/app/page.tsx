'use client';

import React from 'react';
import Link from 'next/link';
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
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <header className="flex justify-between items-center max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-4xl font-black tracking-tighter text-blue-500 uppercase">Battleship</h1>
        <Link href="/gallery">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white">
            UI Gallery
          </Button>
        </Link>
      </header>

      {/* Status / Turn Indicator */}
      {isGameOver ? (
        <div className="flex justify-center p-6 bg-slate-950/50 rounded-xl border border-slate-800 shadow-inner max-w-7xl mx-auto mb-6">
          <div className="flex flex-col items-center gap-4">
            <span className={`text-3xl font-black uppercase tracking-[0.2em] ${winner === 'player' ? 'text-blue-400' : 'text-red-500'}`}>
              {winner === 'player' ? 'Victory!' : 'Defeat!'}
            </span>
            <p className="text-slate-400">{statusMessage}</p>
            <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase">
              New Game
            </Button>
          </div>
        </div>
      ) : !isSetup ? (
        <div className="max-w-7xl mx-auto mb-6">
          <TurnIndicator isPlayerTurn={isPlayerTurn} />
          <p className="text-center text-sm text-slate-400 mt-2">{statusMessage}</p>
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto">
        {isSetup ? (
          /* Setup phase: Command Grid + Fleet Assembly side by side */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Player board */}
            <div className="flex-1">
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-semibold">My Fleet Command Grid</h2>
              </div>
              <Board
                board={playerGrid}
                onCellClick={placeSelectedShip}
                disabled={false}
                sunkShips={playerShips}
              />
              <div className="mt-4 text-center text-sm text-slate-400">{statusMessage}</div>
              <div className="mt-4">
                <GameControls
                  allShipsPlaced={allPlaced}
                  onStartGame={startGame}
                  onRandomizeFleet={randomizePlayerShips}
                  onResetGame={resetGame}
                />
              </div>
            </div>

            {/* Fleet Assembly (ship selector) */}
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
        ) : (
          /* Active game: both grids side by side */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Player board */}
            <div className="flex-1">
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-semibold">My Fleet</h2>
              </div>
              <Board
                board={playerGrid}
                onCellClick={() => {}}
                disabled
                sunkShips={playerShips}
              />
            </div>

            {/* AI board */}
            <div className="flex-1">
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-semibold">Enemy Waters</h2>
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

        {/* Reset button during active game */}
        {!isSetup && !isGameOver && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={resetGame}
              variant="destructive"
              className="bg-red-950/30 border border-red-900/50 text-red-500 hover:bg-red-900/40 hover:text-red-400"
            >
              Abort Mission
            </Button>
          </div>
        )}

        {!isSetup && (
          <div className="mt-6">
            <FleetStatus
              playerShips={playerFleetStatus.length > 0 ? playerFleetStatus : setupShips}
              enemyShips={enemyFleetForStatus}
            />
          </div>
        )}
      </div>
    </div>
  );
}
