import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ isPlayerTurn }) => {
  return (
    <div className="flex justify-center py-4 px-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="relative flex items-center gap-4">
        <div className={`flex items-center gap-3 px-8 py-2.5 rounded-full border transition-all duration-500 ${
          isPlayerTurn
            ? 'bg-sky-50 border-sky-300 shadow-[0_0_0_1px_rgba(14,165,233,0.15)]'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            isPlayerTurn ? 'bg-sky-500' : 'bg-red-500'
          }`} />
          <span className={`text-base font-semibold uppercase tracking-[0.15em] transition-colors duration-500 ${
            isPlayerTurn ? 'text-sky-700' : 'text-red-600'
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
