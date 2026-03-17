'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Board } from '@/components/game/Board';
import ShipSelector from '@/components/game/ShipSelector';
import GameControls from '@/components/game/GameControls';
import FleetStatus from '@/components/game/FleetStatus';
import TurnIndicator from '@/components/game/TurnIndicator';

export default function Home() {
  // Mock state
  const [grid] = useState<Array<'empty' | 'ship' | 'hit' | 'miss'>[]>(
    Array(100).fill('empty')
  );
  const [gameState] = useState<'setup'>('setup');
  const [ships] = useState([
    { id: 'carrier', type: 'Carrier' as const, length: 5, isPlaced: false, isSunk: false },
    { id: 'battleship', type: 'Battleship' as const, length: 4, isPlaced: false, isSunk: false },
    { id: 'cruiser', type: 'Cruiser' as const, length: 3, isPlaced: false, isSunk: false },
    { id: 'submarine', type: 'Submarine' as const, length: 3, isPlaced: false, isSunk: false },
    { id: 'destroyer', type: 'Destroyer' as const, length: 2, isPlaced: false, isSunk: false },
  ]);
  const [selectedShip, setSelectedShip] = useState<string | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(true);

  // Dummy functions
  const handleCellClick = (coord: { x: number; y: number }) => console.log('Cell clicked:', coord);
  const handleSelectShip = (id: string) => setSelectedShip(id);
  const handleRotate = () => setIsHorizontal(!isHorizontal);
  const handleStartGame = () => console.log('Start game');
  const handleRandomizeFleet = () => console.log('Randomize fleet');
  const handleResetGame = () => console.log('Reset game');

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

      <TurnIndicator isPlayerTurn={gameState === 'setup'} />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-semibold">My Fleet</h2>
            </div>
            <Board board={grid} onCellClick={handleCellClick} />
          </div>
          <div className="flex-1">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-semibold">Enemy Waters</h2>
            </div>
            <Board board={grid} onCellClick={handleCellClick} />
          </div>
        </div>

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <GameControls
              allShipsPlaced={false}
              onStartGame={handleStartGame}
              onRandomizeFleet={handleRandomizeFleet}
              onResetGame={handleResetGame}
            />
          </div>
          <div className="flex-1">
            <ShipSelector
              ships={ships}
              selectedShip={selectedShip}
              onSelectShip={handleSelectShip}
              isHorizontal={isHorizontal}
              onRotate={handleRotate}
            />
          </div>
        </div>

        <div className="mt-6">
          <FleetStatus playerShips={ships} enemyShips={ships} />
        </div>
      </div>
    </div>
  );
}
