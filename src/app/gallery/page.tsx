'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Board } from '@/components/game/Board';
import ShipSelector from '@/components/game/ShipSelector';
import GameControls from '@/components/game/GameControls';
import FleetStatus from '@/components/game/FleetStatus';
import TurnIndicator from '@/components/game/TurnIndicator';
import { Button } from '@/components/ui/button';

export default function GalleryPage() {
  const [activeComponent, setActiveComponent] = useState<string>('Board');

  // Mock Data
  const emptyGrid = Array(100).fill('empty');
  const mixedGrid = Array(100).fill('empty').map((_, i) => {
    if (i % 15 === 0) return 'ship';
    if (i % 7 === 0) return 'hit';
    if (i % 9 === 0) return 'miss';
    return 'empty';
  });

  const mockShips = [
    { id: '1', type: 'Carrier' as const, length: 5, isPlaced: true, isSunk: false },
    { id: '2', type: 'Battleship' as const, length: 4, isPlaced: false, isSunk: false },
    { id: '3', type: 'Cruiser' as const, length: 3, isPlaced: true, isSunk: true },
    { id: '4', type: 'Submarine' as const, length: 3, isPlaced: false, isSunk: false },
    { id: '5', type: 'Destroyer' as const, length: 2, isPlaced: false, isSunk: false },
  ];

  const components = [
    { name: 'Board', description: 'The main 10x10 grid' },
    { name: 'ShipSelector', description: 'Ship placement tool' },
    { name: 'GameControls', description: 'Action buttons' },
    { name: 'FleetStatus', description: 'Game progress dashboard' },
    { name: 'TurnIndicator', description: 'Turn status banner' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-blue-500 uppercase">UI Gallery</h1>
            <p className="text-slate-400 mt-2">Preview and test individual Battleship components</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Game</Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <nav className="space-y-2">
            {components.map((comp) => (
              <button
                key={comp.name}
                onClick={() => setActiveComponent(comp.name)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeComponent === comp.name
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">{comp.name}</div>
                <div className="text-xs opacity-70">{comp.description}</div>
              </button>
            ))}
          </nav>

          {/* Preview Area */}
          <main className="md:col-span-3 bg-slate-900 rounded-2xl p-8 border border-slate-800 min-h-[500px] flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-slate-300">{activeComponent} Preview</h2>
            
            <div className="flex-1 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800/50 p-8">
              {activeComponent === 'Board' && (
                <div className="w-full max-w-md">
                   <h3 className="text-sm font-medium text-slate-500 mb-4 text-center">Mixed State Board</h3>
                   <Board board={mixedGrid} onCellClick={(c) => console.log(c)} />
                </div>
              )}

              {activeComponent === 'ShipSelector' && (
                <div className="w-full max-w-sm">
                  <ShipSelector
                    ships={mockShips}
                    selectedShip="2"
                    onSelectShip={(id) => console.log('Selected:', id)}
                    isHorizontal={true}
                    onRotate={() => console.log('Rotate')}
                  />
                </div>
              )}

              {activeComponent === 'GameControls' && (
                <div className="w-full max-w-xs">
                  <GameControls
                    allShipsPlaced={false}
                    onStartGame={() => console.log('Start')}
                    onRandomizeFleet={() => console.log('Random')}
                    onResetGame={() => console.log('Reset')}
                  />
                </div>
              )}

              {activeComponent === 'FleetStatus' && (
                <div className="w-full max-w-md">
                  <FleetStatus
                    playerShips={mockShips}
                    enemyShips={mockShips}
                  />
                </div>
              )}

              {activeComponent === 'TurnIndicator' && (
                <div className="flex flex-col gap-8 w-full">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest">Player Turn</p>
                    <TurnIndicator isPlayerTurn={true} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest">AI Turn</p>
                    <TurnIndicator isPlayerTurn={false} />
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
