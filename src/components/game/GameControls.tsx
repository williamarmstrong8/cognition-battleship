import React from 'react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  allShipsPlaced: boolean;
  onStartGame: () => void;
  onRandomizeFleet: () => void;
  onResetGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  allShipsPlaced,
  onStartGame,
  onRandomizeFleet,
  onResetGame,
}) => {
  return (
    <div className="flex flex-col space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Command Center</h2>
        <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest uppercase">System Operations</p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={onStartGame}
          disabled={!allShipsPlaced}
          className={`w-full py-6 text-sm font-semibold uppercase tracking-widest transition-all duration-300 rounded-lg ${
            allShipsPlaced
              ? 'bg-sky-600 hover:bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.25)] text-white'
              : 'bg-slate-100 text-slate-400 border border-slate-200'
          }`}
        >
          {allShipsPlaced ? 'Initiate Combat' : 'Awaiting Deployment'}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onRandomizeFleet}
            variant="outline"
            className="border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400"
          >
            Auto-Deploy
          </Button>
          <Button
            onClick={onResetGame}
            variant="destructive"
            className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
          >
            Abort Mission
          </Button>
        </div>
      </div>

      {!allShipsPlaced && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 text-center leading-relaxed tracking-wide">
            All vessels must be assigned coordinates before engagement can begin.
          </p>
        </div>
      )}
    </div>
  );
};

export default GameControls;
