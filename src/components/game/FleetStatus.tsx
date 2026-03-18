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
  const renderFleet = (ships: Ship[], title: string, accentClass: string) => (
    <div className="flex-1 flex flex-col space-y-3">
      <div className={`text-[10px] font-bold uppercase tracking-[0.25em] pb-2.5 border-b border-slate-200 ${accentClass}`}>
        {title}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {ships.map((ship) => (
          <div
            key={ship.id}
            className={`group relative p-3 border rounded-lg flex justify-between items-center transition-all duration-300 overflow-hidden ${
              ship.isSunk
                ? 'bg-red-50/50 border-slate-200 opacity-60'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex flex-col gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${ship.isSunk ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                {ship.type}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: ship.length }, (_, i) => (
                  <div
                    key={i}
                    className={`h-3.5 w-3.5 rounded border transition-colors ${
                      ship.isSunk
                        ? 'bg-slate-300 border-slate-300'
                        : 'bg-sky-300 border-sky-400'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border tracking-widest uppercase ${
              ship.isSunk
                ? 'border-red-200 bg-red-100 text-red-600'
                : 'border-sky-200 bg-sky-50 text-sky-600'
            }`}>
              {ship.isSunk ? 'SUNK' : 'ACTIVE'}
            </span>
            {ship.isSunk && (
              <div className="absolute left-3 right-3 top-1/2 h-px bg-red-400/60 pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="text-center">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Operational Readiness</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {renderFleet(playerShips, 'Your Fleet', 'text-sky-600')}
        <div className="hidden md:block w-px bg-slate-200" />
        {renderFleet(enemyShips, 'Enemy Fleet', 'text-red-600')}
      </div>
    </div>
  );
};

export default FleetStatus;
