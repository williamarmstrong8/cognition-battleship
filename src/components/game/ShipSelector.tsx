import React from 'react';
import { Button } from '@/components/ui/button';

interface Ship {
  id: string;
  type: 'Carrier' | 'Battleship' | 'Cruiser' | 'Submarine' | 'Destroyer';
  length: number;
  isPlaced: boolean;
}

interface ShipSelectorProps {
  ships: Ship[];
  selectedShip: string | null;
  onSelectShip: (shipId: string) => void;
  isHorizontal: boolean;
  onRotate: () => void;
}

const ShipSelector: React.FC<ShipSelectorProps> = ({
  ships,
  selectedShip,
  onSelectShip,
  isHorizontal,
  onRotate,
}) => {
  return (
    <div className="flex flex-col space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Fleet Assembly</h2>
          <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest uppercase">Select &amp; Place</p>
        </div>
        <Button
          onClick={onRotate}
          variant="outline"
          size="sm"
          className="border-sky-300 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:border-sky-400"
        >
          <span className="mr-1.5 text-xs">Rotate</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-sky-200 rounded text-sky-700">
            {isHorizontal ? 'HOR' : 'VER'}
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {ships.map((ship) => (
          <div
            key={ship.id}
            className={`group relative p-3.5 border rounded-lg transition-all duration-200 cursor-pointer overflow-hidden ${
              selectedShip === ship.id
                ? 'bg-sky-50 border-sky-300 shadow-[0_0_0_1px_rgba(14,165,233,0.2)]'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            } ${ship.isPlaced ? 'opacity-50 grayscale pointer-events-none' : ''}`}
            onClick={() => !ship.isPlaced && onSelectShip(ship.id)}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className={`font-semibold uppercase tracking-wider text-xs ${
                selectedShip === ship.id ? 'text-sky-700' : 'text-slate-700'
              }`}>
                {ship.type}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{ship.length}</span>
            </div>

            <div className="flex gap-1">
              {Array.from({ length: ship.length }, (_, i) => (
                <div
                  key={i}
                  className={`h-6 w-6 rounded-md border transition-colors ${
                    selectedShip === ship.id
                      ? 'bg-sky-400 border-sky-500'
                      : 'bg-slate-300 border-slate-400 group-hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {ship.isPlaced && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">Deployed</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipSelector;
