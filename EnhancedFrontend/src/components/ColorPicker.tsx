import React from 'react';
import { SWATCHES } from '../constants';
import { Eraser } from 'lucide-react';
import type { DrawingMode } from '../constants';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  drawingMode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor, 
  onColorChange, 
  drawingMode, 
  onModeChange 
}) => {
  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          className={`
            flex-1 py-2 px-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
            ${drawingMode === 'draw' 
              ? 'border-blue-400 bg-blue-400/20 text-blue-300' 
              : 'border-white/30 hover:border-white/60 text-white/70'
            }
          `}
          onClick={() => onModeChange('draw')}
          title="Draw Mode"
        >
          <div className="w-3 h-3 rounded-full bg-current"></div>
          Draw
        </button>
        <button
          className={`
            flex-1 py-2 px-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2
            ${drawingMode === 'erase' 
              ? 'border-red-400 bg-red-400/20 text-red-300' 
              : 'border-white/30 hover:border-white/60 text-white/70'
            }
          `}
          onClick={() => onModeChange('erase')}
          title="Erase Mode"
        >
          <Eraser className="w-3 h-3" />
          Erase
        </button>
      </div>

      {/* Color Swatches - only show when in draw mode */}
      {drawingMode === 'draw' && (
        <div className="grid grid-cols-4 gap-2">
          {SWATCHES.map((color) => (
            <button
              key={color}
              className={`
                w-8 h-8 rounded-full border-2 transition-all duration-200 transform hover:scale-110 active:scale-95
                ${selectedColor === color 
                  ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' 
                  : 'border-white/30 hover:border-white/60'
                }
              `}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              title={`Select ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};