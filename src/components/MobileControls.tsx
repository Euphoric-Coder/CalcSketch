import React from 'react';
import { Button } from './ui/button';
import { ColorPicker } from './ColorPicker';
import { Palette, RotateCcw, Send, Settings, Minus, Plus, X } from 'lucide-react';
import { Loader } from './Loader';
import type { DrawingMode } from '../constants';

interface MobileControlsProps {
  color: string;
  onColorChange: (color: string) => void;
  drawingMode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  lineWidth: number;
  onLineWidthChange: (width: number) => void;
  onReset: () => void;
  onGenerate: () => void;
  loading: boolean;
  showControls: boolean;
  onToggleControls: () => void;
  results: Array<{ id: string; expression: string; answer: string }>;
  onRemoveResult: (id: string) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  color,
  onColorChange,
  drawingMode,
  onModeChange,
  lineWidth,
  onLineWidthChange,
  onReset,
  onGenerate,
  loading,
  showControls,
  onToggleControls,
  results,
  onRemoveResult,
}) => {
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 p-4 bg-black/70 backdrop-blur-sm rounded-full border border-white/20 hover:bg-black/80 transition-all duration-200 touch-manipulation"
        onClick={onToggleControls}
      >
        <Settings className="w-6 h-6 text-white" />
      </button>

      {/* Mobile Control Panel */}
      {showControls && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-t border-white/20 p-4 safe-area-pb">
          <div className="max-w-md mx-auto space-y-4">
            {/* Line Width Control */}
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">Brush Size</span>
                <span className="text-white/70 text-sm bg-white/20 px-2 py-1 rounded">
                  {lineWidth}px
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="p-2 bg-white/20 rounded-lg touch-manipulation"
                  onClick={() => onLineWidthChange(Math.max(1, lineWidth - 1))}
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={lineWidth}
                  onChange={(e) => onLineWidthChange(Number(e.target.value))}
                  className="flex-1 h-3 bg-white/20 rounded-lg appearance-none touch-manipulation"
                />
                <button
                  className="p-2 bg-white/20 rounded-lg touch-manipulation"
                  onClick={() => onLineWidthChange(Math.min(100, lineWidth + 1))}
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex justify-center mt-3">
                <div
                  className="bg-white rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.max(lineWidth, 4)}px`,
                    height: `${Math.max(lineWidth, 4)}px`,
                  }}
                />
              </div>
            </div>

            {/* Color Picker */}
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Drawing Tools</span>
              </div>
              <ColorPicker 
                selectedColor={color} 
                onColorChange={onColorChange}
                drawingMode={drawingMode}
                onModeChange={onModeChange}
              />
            </div>

            {/* Results Display */}
            {results.length > 0 && (
              <div className="bg-white/10 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">Results ({results.length})</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {results.map((result) => (
                    <div key={result.id} className="bg-green-900/50 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-green-300 text-sm font-mono">
                        {result.expression} = {result.answer}
                      </span>
                      <button
                        onClick={() => onRemoveResult(result.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onReset}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl py-4 px-4 shadow-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 touch-manipulation"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>

              <Button
                onClick={onGenerate}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl py-4 px-4 shadow-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 disabled:transform-none disabled:opacity-70 touch-manipulation"
              >
                {loading ? (
                  <>
                    <Loader />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};