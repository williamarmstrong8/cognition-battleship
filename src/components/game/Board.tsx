'use client';

import React from 'react';
import type { CellState, Coordinate, Grid, Ship } from '../../types';

/** A preview cell shown while dragging a ship over the board */
export interface PreviewCell {
  x: number;
  y: number;
  /** true = valid placement, false = blocked/out-of-bounds */
  valid: boolean;
}

interface BoardProps {
  /** 10x10 grid — accepts Grid (Cell[]), CellState[][], or CellState[] */
  board: Grid | CellState[][] | CellState[];
  /** Callback when a cell is clicked */
  onCellClick: (coordinate: Coordinate) => void;
  /** If true, clicking is disabled (visual-only board) */
  disabled?: boolean;
  /** If true, ship cells are rendered as empty (hides ship positions) */
  hideShips?: boolean;
  /** Ships that have been fully sunk — their cells are revealed on the board */
  sunkShips?: Ship[];
  /** Ghost preview cells rendered while dragging a ship over the board */
  previewCells?: PreviewCell[];
  /**
   * Called continuously as the drag moves over the board.
   * Coord is derived from mouse position — much more reliable than per-cell onDragEnter.
   */
  onBoardDragMove?: (coord: Coordinate) => void;
  /** Called when the ship is dropped onto the board */
  onBoardDrop?: (coord: Coordinate) => void;
  /** Called when the drag leaves the board entirely */
  onBoardDragLeave?: () => void;
}

/** Derive a grid coordinate from a mouse event on the 11×11 board container */
function coordFromMouseEvent(
  e: React.MouseEvent | React.DragEvent,
  container: HTMLElement,
): Coordinate | null {
  const rect = container.getBoundingClientRect();
  const cellW = rect.width / 11;
  const cellH = rect.height / 11;
  const col = Math.floor((e.clientX - rect.left) / cellW) - 1;
  const row = Math.floor((e.clientY - rect.top) / cellH) - 1;
  if (col < 0 || col > 9 || row < 0 || row > 9) return null;
  return { x: col, y: row };
}

export const Board: React.FC<BoardProps> = ({
  board,
  onCellClick,
  disabled = false,
  hideShips = false,
  sunkShips = [],
  previewCells = [],
  onBoardDragMove,
  onBoardDrop,
  onBoardDragLeave,
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

  // Build a set of coordinate keys belonging to sunk ships for quick lookup
  const sunkCellKeys = new Set<string>();
  for (const ship of sunkShips) {
    if (ship.isSunk) {
      for (const coord of ship.coordinates) {
        sunkCellKeys.add(`${coord.x},${coord.y}`);
      }
    }
  }

  const getCellStyles = (state: CellState) => {
    switch (state) {
      case 'ship':
        return 'bg-slate-400';
      case 'hit':
        // A "hit" is a struck ship cell; render the ship backdrop behind the ping.
        return 'bg-slate-400 shadow-inner';
      case 'miss':
        return 'bg-slate-100';
      case 'empty':
      default:
        return 'bg-slate-100';
    }
  };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  // Build a fast lookup for preview cells
  const previewMap = new Map<string, boolean>();
  for (const p of previewCells) {
    previewMap.set(`${p.x},${p.y}`, p.valid);
  }

  return (
    <div
      className="w-full aspect-square grid grid-cols-11 grid-rows-11 border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden"
      onDragOver={(e) => {
        e.preventDefault();
        if (!onBoardDragMove) return;
        const coord = coordFromMouseEvent(e, e.currentTarget);
        if (coord) onBoardDragMove(coord);
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (!onBoardDrop) return;
        const coord = coordFromMouseEvent(e, e.currentTarget);
        if (coord) onBoardDrop(coord);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onBoardDragLeave?.();
        }
      }}
    >
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
      {/* Row labels + board rows */}
      {rows.map((row, rowIndex) => (
        <React.Fragment key={`row-${row}`}>
          <div className="flex items-center justify-center text-[9px] font-mono font-semibold text-slate-500 min-w-0 min-h-0">
            {row}
          </div>
          {flatBoard.slice(rowIndex * 10, rowIndex * 10 + 10).map((state, colIndex) => {
            const x = colIndex;
            const y = rowIndex;
            const key = `${x},${y}`;
            const isSunkCell = sunkCellKeys.has(key);
            const previewValid = previewMap.has(key) ? previewMap.get(key) : undefined;
            const isPreview = previewValid !== undefined;

            let bgClass: string;
            if (isPreview) {
              bgClass = previewValid
                ? 'bg-sky-300/60 border-sky-400'
                : 'bg-red-300/60 border-red-400';
            } else if (isSunkCell) {
              bgClass = 'bg-slate-600 shadow-inner border-slate-500';
            } else {
              bgClass = getCellStyles(state);
            }

            return (
              <div
                key={key}
                onClick={() => !disabled && onCellClick({ x, y })}
                className={`
                  border border-slate-200
                  min-w-0 min-h-0
                  ${!disabled && state === 'empty' && !isPreview ? 'cursor-pointer hover:bg-sky-100' : 'cursor-default'}
                  transition-colors duration-75
                  relative
                  ${bgClass}
                `}
              >
                {state === 'hit' && !isPreview && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isSunkCell ? (
                      <span className="relative flex h-3 w-3">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-800 shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
                      </span>
                    ) : (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                      </span>
                    )}
                  </div>
                )}
                {state === 'miss' && !isPreview && (
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
