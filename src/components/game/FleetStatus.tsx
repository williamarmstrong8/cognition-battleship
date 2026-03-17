import React from 'react';

interface Ship {
  id: string;
  type: 'Carrier' | 'Battleship' | 'Cruiser' | 'Submarine' | 'Destroyer';
  length: number;
  isSunk: boolean;
}

interface FleetStatusProps {
  playerShips: Ship[];
  enemyShips: Ship[];
}

const FleetStatus: React.FC<FleetStatusProps> = ({ playerShips, enemyShips }) => {
  const renderFleet = (ships: Ship[], title: string, color: string) => (
    <div className="flex-1 flex flex-col space-y-3">
      <div className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b border-slate-800 ${color}`}>
        {title}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {ships.map((ship) => (
          <div
            key={ship.id}
            className={`group relative p-3 border rounded-lg flex justify-between items-center transition-all duration-300 ${
              ship.isSunk
                ? 'bg-red-950/20 border-red-900/40 text-red-500/40 opacity-50'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-300 shadow-sm'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider">{ship.type}</span>
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: ship.length }, (_, i) => (
                  <div 
                    key={i} 
                    className={`h-4 w-4 rounded-sm border transition-colors aspect-square ${
                      ship.isSunk 
                        ? 'bg-red-900/30 border-red-900/50' 
                        : 'bg-blue-500/40 border-blue-500/50'
                    }`} 
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                ship.isSunk 
                  ? 'border-red-900/50 bg-red-950/50 text-red-600' 
                  : 'border-blue-900/50 bg-blue-950/50 text-blue-500'
              }`}>
                {ship.isSunk ? 'SUNK' : 'ACTIVE'}
              </span>
            </div>
            {ship.isSunk && (
              <div className="absolute inset-0 bg-red-950/10 pointer-events-none rounded-lg" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-6 bg-slate-900/80 backdrop-blur-md p-6 rounded-xl border border-slate-700 shadow-2xl">
      <div className="text-center">
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Operational Readiness</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {renderFleet(playerShips, 'Your Fleet', 'text-blue-400')}
        <div className="hidden md:block w-px bg-slate-800" />
        {renderFleet(enemyShips, 'Enemy Fleet', 'text-red-400')}
      </div>
    </div>
  );
};

export default FleetStatus;
