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
        return 'bg-slate-400';
      case 'hit':
        return 'bg-slate-100';
      case 'miss':
        return 'bg-slate-100';
      case 'empty':
      default:
        return 'bg-slate-100';
    }
  };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return (
    <div className="w-full aspect-square grid grid-cols-11 grid-rows-11 border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden">
      {/* Top-left corner */}
      <div className="min-w-0 min-h-0" />
      {/* Column headers (1–10) */}
      {cols.map((col) => (
        <div
          key={`col-${col}`}
          className="flex items-center justify-center text-[9px] font-mono font-semibold text-slate-500 tracking-tight min-w-0 min-h-0"
        >
          {col}
        </div>
      ))}
      {/* Row labels + board rows: each row is one label + 10 cells */}
      {rows.map((row, rowIndex) => (
        <React.Fragment key={`row-${row}`}>
          <div className="flex items-center justify-center text-[9px] font-mono font-semibold text-slate-500 min-w-0 min-h-0">
            {row}
          </div>
          {flatBoard.slice(rowIndex * 10, rowIndex * 10 + 10).map((state, colIndex) => {
            const x = colIndex;
            const y = rowIndex;
            return (
              <div
                key={`${x}-${y}`}
                onClick={() => !disabled && onCellClick({ x, y })}
                className={`
                  border border-slate-200
                  min-w-0 min-h-0
                  ${!disabled && state === 'empty' ? 'cursor-pointer hover:bg-sky-100' : 'cursor-default'}
                  transition-colors
                  duration-100
                  relative
                  ${getCellStyles(state)}
                `}
              >
                {state === 'hit' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                    </span>
                  </div>
                )}
                {state === 'miss' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
