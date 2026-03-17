import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ isPlayerTurn }) => {
  return (
    <div className="flex justify-center p-6 bg-slate-950/50 rounded-xl border border-slate-800 shadow-inner">
      <div className="relative flex items-center gap-4">
        <div className={`flex items-center gap-3 px-8 py-3 rounded-full border-2 transition-all duration-500 ${
          isPlayerTurn 
            ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
            : 'bg-red-500/10 border-red-900/50 shadow-none'
        }`}>
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            isPlayerTurn ? 'bg-blue-400' : 'bg-red-600'
          }`} />
          <span className={`text-xl font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
            isPlayerTurn ? 'text-blue-400' : 'text-red-500'
          }`}>
            {isPlayerTurn ? 'Tactical Control: Active' : 'Enemy Signature Detected'}
          </span>
        </div>
        
        {!isPlayerTurn && (
          <div className="absolute -right-12 flex gap-1">
            <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TurnIndicator;
