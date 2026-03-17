'use client';

import React from 'react';
import type { CellState, Coordinate, Grid } from '../../types';

interface BoardProps {
  /** 10x10 grid — accepts Grid (Cell[]), CellState[][], or CellState[] */
  board: Grid | CellState[][] | CellState[];
  /** Callback when a cell is clicked */
  onCellClick: (coordinate: Coordinate) => void;
  /** If true, clicking is disabled (visual-only board) */
  disabled?: boolean;
  /** If true, ship cells are rendered as empty (hides ship positions) */
  hideShips?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  board,
  onCellClick,
  disabled = false,
  hideShips = false,
}) => {
  // Normalise into a flat CellState[] regardless of input shape
  let flatBoard: CellState[];
  if (board.length > 0 && typeof board[0] === 'object' && !Array.isArray(board[0]) && 'state' in (board[0] as object)) {
    // Grid (Cell[])
    flatBoard = (board as Grid).map((cell) => cell.state);
  } else if (Array.isArray(board[0])) {
    flatBoard = (board as CellState[][]).flat();
  } else {
    flatBoard = board as CellState[];
  }

  // Optionally hide ship cells
  if (hideShips) {
    flatBoard = flatBoard.map((s) => (s === 'ship' ? 'empty' : s));
  }

  const getCellStyles = (state: CellState) => {
    switch (state) {
      case 'ship':
        return 'bg-slate-600 shadow-inner';
      case 'hit':
        return 'bg-slate-800';
      case 'miss':
        return 'bg-slate-800';
      case 'empty':
      default:
        return 'bg-blue-900/40';
    }
  };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return (
    <div className="flex flex-col items-center">
      {/* Column Headers (1-10) */}
      <div className="grid grid-cols-11 w-full mb-1">
        <div className="w-8 h-8 flex items-center justify-center" /> {/* Top-left empty spacer */}
        {cols.map((col) => (
          <div key={col} className="flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
            {col}
          </div>
        ))}
      </div>

      <div className="flex w-full">
        {/* Row Headers (A-J) */}
        <div className="flex flex-col mr-1">
          {rows.map((row) => (
            <div key={row} className="w-8 h-8 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 uppercase">
              {row}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-10 gap-0 border-4 border-slate-700 w-full aspect-square shadow-2xl bg-slate-800 p-1 rounded-sm flex-1">
          {flatBoard.map((state, index) => {
            const x = index % 10;
            const y = Math.floor(index / 10);
            
            return (
              <div
                key={`${x}-${y}`}
                onClick={() => !disabled && onCellClick({ x, y })}
                className={`
                  border border-slate-700/50
                  ${disabled ? 'cursor-default' : 'cursor-pointer hover:bg-blue-400/20'}
                  transition-all
                  duration-150
                  relative
                  ${getCellStyles(state)}
                `}
              >
                {state === 'hit' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2/3 h-2/3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                  </div>
                )}
                {state === 'miss' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1/3 h-1/3 bg-slate-400 rounded-full opacity-60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
