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
  const sunkCount = (ships: Ship[]) => ships.filter((s) => s.isSunk).length;

  const renderFleet = (ships: Ship[], title: string, isEnemy: boolean) => (
    <div className="flex-1 flex flex-col gap-4">
      {/* Fleet header */}
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isEnemy ? 'text-red-500' : 'text-sky-600'}`}>
            {title}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-500">
            {sunkCount(ships)}/{ships.length} sunk
          </span>
          <div className="flex gap-0.5">
            {ships.map((s) => (
              <div
                key={s.id}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  s.isSunk ? 'bg-red-400' : isEnemy ? 'bg-red-200' : 'bg-sky-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ship rows */}
      <div className="flex flex-col gap-1.5">
        {ships.map((ship) => (
          <div
            key={ship.id}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-300 ${
              ship.isSunk
                ? 'bg-slate-50 border-slate-100 opacity-50'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {/* Ship block bar */}
            <div className="flex gap-px shrink-0">
              {Array.from({ length: ship.length }, (_, i) => (
                <div
                  key={i}
                  className={`h-5 w-5 transition-colors ${
                    i === 0 ? 'rounded-l-md' : ''
                  } ${
                    i === ship.length - 1 ? 'rounded-r-md' : ''
                  } ${
                    ship.isSunk
                      ? 'bg-slate-300'
                      : isEnemy
                        ? 'bg-red-400'
                        : 'bg-sky-400'
                  }`}
                />
              ))}
            </div>

            {/* Name */}
            <span className={`flex-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
              ship.isSunk ? 'text-slate-400 line-through' : 'text-slate-700'
            }`}>
              {ship.type}
            </span>

            {/* Status dot + label */}
            <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${
              ship.isSunk ? 'text-red-400' : 'text-slate-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                ship.isSunk ? 'bg-red-400' : 'bg-emerald-400'
              }`} />
              {ship.isSunk ? 'Sunk' : 'Active'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="mb-5 text-center">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Readiness</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {renderFleet(playerShips, 'Your Fleet', false)}
        <div className="hidden md:block w-px bg-slate-100" />
        {renderFleet(enemyShips, 'Enemy Fleet', true)}
      </div>
    </div>
  );
};

export default FleetStatus;
