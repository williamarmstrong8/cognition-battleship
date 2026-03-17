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
    <div className="flex flex-col space-y-6 bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
      <div className="text-center border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-blue-400 tracking-tight uppercase">Command Center</h2>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">System Operations</p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={onStartGame}
          disabled={!allShipsPlaced}
          className={`w-full py-6 text-lg font-bold uppercase tracking-tighter transition-all duration-300 ${
            allShipsPlaced 
              ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white' 
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
        >
          {allShipsPlaced ? 'Initiate Combat' : 'Awaiting Deployment'}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={onRandomizeFleet} 
            variant="outline" 
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Auto-Deploy
          </Button>
          <Button 
            onClick={onResetGame} 
            variant="destructive"
            className="bg-red-950/30 border border-red-900/50 text-red-500 hover:bg-red-900/40 hover:text-red-400"
          >
            Abort Mission
          </Button>
        </div>
      </div>

      {!allShipsPlaced && (
        <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-3">
          <p className="text-[10px] text-blue-400/70 text-center leading-tight uppercase tracking-tight">
            Notice: All vessels must be assigned coordinates before engagement protocols can be authorized.
          </p>
        </div>
      )}
    </div>
  );
};

export default GameControls;
