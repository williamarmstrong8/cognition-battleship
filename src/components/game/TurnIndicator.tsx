import React from 'react';

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ isPlayerTurn }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3.5 flex items-center justify-between">
      {/* Left: status label */}
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          isPlayerTurn ? 'bg-sky-500 animate-pulse' : 'bg-orange-500 animate-pulse'
        }`} />
        <div>
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${
            isPlayerTurn ? 'text-sky-600' : 'text-orange-600'
          }`}>
            {isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {isPlayerTurn
              ? 'Select a target on the enemy grid'
              : 'Enemy is calculating strike…'}
          </p>
        </div>
      </div>

      {/* Right: turn chip */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
        isPlayerTurn
          ? 'bg-sky-50 border-sky-200 text-sky-700'
          : 'bg-orange-50 border-orange-200 text-orange-700'
      }`}>
        {!isPlayerTurn && (
          <div className="flex gap-0.5">
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" />
          </div>
        )}
        {isPlayerTurn ? 'Commander' : 'Incoming'}
      </div>
    </div>
  );
};

export default TurnIndicator;
