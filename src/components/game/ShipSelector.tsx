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
    <div className="flex flex-col space-y-6 bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-400 tracking-tight uppercase">Fleet Assembly</h2>
        <Button 
          onClick={onRotate} 
          variant="outline" 
          size="sm"
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
        >
          <span className="mr-2">Rotate</span>
          <span className="text-xs font-mono px-1.5 py-0.5 bg-blue-500/20 rounded">
            {isHorizontal ? 'HOR' : 'VER'}
          </span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {ships.map((ship) => (
          <div
            key={ship.id}
            className={`group relative p-4 border rounded-lg transition-all duration-200 cursor-pointer overflow-hidden ${
              selectedShip === ship.id 
                ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
            } ${ship.isPlaced ? 'opacity-40 grayscale pointer-events-none' : ''}`}
            onClick={() => !ship.isPlaced && onSelectShip(ship.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`font-bold uppercase tracking-wider text-sm ${
                selectedShip === ship.id ? 'text-blue-400' : 'text-slate-300'
              }`}>
                {ship.type}
              </span>
              <span className="text-xs font-mono text-slate-500">LEN: {ship.length}</span>
            </div>

            <div className="flex gap-0.5">
              {Array.from({ length: ship.length }, (_, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-sm border shadow-sm transition-colors aspect-square ${
                    selectedShip === ship.id
                      ? 'bg-blue-500 border-blue-400'
                      : 'bg-slate-600 border-slate-500 group-hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
            
            {ship.isPlaced && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deployed</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipSelector;
