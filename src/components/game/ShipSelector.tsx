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
  isHorizontal: boolean;
  onRotate: () => void;
  onShipDragStart?: (shipId: string, offset: number) => void;
  onShipDragEnd?: () => void;
}

const ShipSelector: React.FC<ShipSelectorProps> = ({
  ships,
  isHorizontal,
  onRotate,
  onShipDragStart,
  onShipDragEnd,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Fleet Assembly</h2>
          <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest uppercase">Drag to place</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Orientation</div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <button
              type="button"
              onClick={() => {
                if (!isHorizontal) onRotate();
              }}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                isHorizontal
                  ? 'bg-sky-600 text-white'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100'
              }`}
            >
              Horizontal
            </button>
            <button
              type="button"
              onClick={() => {
                if (isHorizontal) onRotate();
              }}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                !isHorizontal
                  ? 'bg-sky-600 text-white'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100'
              }`}
            >
              Vertical
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {ships.map((ship) => (
          <div
            key={ship.id}
            className={`flex items-center gap-3 transition-opacity duration-200 ${ship.isPlaced ? 'opacity-35' : ''}`}
          >
            {/* Ship blocks — each block is independently draggable so offset is tracked */}
            <div className="flex gap-px">
              {Array.from({ length: ship.length }, (_, i) => (
                <div
                  key={i}
                  draggable={!ship.isPlaced}
                  onDragStart={(e) => {
                    if (ship.isPlaced) return;
                    // Canvas blank image — fully suppresses the browser ghost
                    const canvas = document.createElement('canvas');
                    canvas.width = 1;
                    canvas.height = 1;
                    document.body.appendChild(canvas);
                    e.dataTransfer.setDragImage(canvas, 0, 0);
                    e.dataTransfer.effectAllowed = 'move';
                    // Remove canvas after the drag image is captured (next frame)
                    requestAnimationFrame(() => {
                      if (document.body.contains(canvas)) document.body.removeChild(canvas);
                    });
                    onShipDragStart?.(ship.id, i);
                  }}
                  onDragEnd={() => onShipDragEnd?.()}
                  className={`h-7 w-7 select-none transition-colors ${
                    // Round only the end caps for a connected bar look
                    i === 0 ? 'rounded-l-md' : ''
                  } ${
                    i === ship.length - 1 ? 'rounded-r-md' : ''
                  } ${
                    ship.isPlaced
                      ? 'bg-slate-300 border border-slate-300 cursor-default'
                      : 'bg-slate-500 border border-slate-600 cursor-grab active:cursor-grabbing hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Name + deployed indicator */}
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-xs font-semibold uppercase tracking-wide leading-none ${
                ship.isPlaced ? 'text-slate-400' : 'text-slate-700'
              }`}>
                {ship.type}
              </span>
              {ship.isPlaced && (
                <span className="text-[9px] font-bold text-emerald-600 tracking-wider uppercase">✓ Deployed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipSelector;
