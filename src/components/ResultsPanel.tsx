import React from 'react';
import { DraggablePanel } from './DraggablePanel';
import { X, Calculator } from 'lucide-react';

interface Result {
  id: string;
  expression: string;
  answer: string;
}

interface ResultsPanelProps {
  results: Result[];
  onRemoveResult: (id: string) => void;
  onClearAll: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  results,
  onRemoveResult,
  onClearAll,
}) => {
  if (results.length === 0) return null;

  return (
    <DraggablePanel
      initialPosition={{ x: 24, y: window.innerHeight - 300 }}
      className="z-20"
    >
      <div className="bg-black/60 backdrop-blur-md rounded-xl border border-white/20 p-4 w-80 shadow-2xl max-h-64 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-green-400" />
            <h3 className="text-white font-medium">Results ({results.length})</h3>
          </div>
          {results.length > 1 && (
            <button
              onClick={onClearAll}
              className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-400/10 hover:bg-red-400/20 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="space-y-2 overflow-y-auto max-h-48 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-green-900/30 backdrop-blur-sm rounded-lg p-3 border border-green-400/20 group hover:bg-green-900/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-green-300 font-mono text-sm break-all">
                    {result.expression} = {result.answer}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveResult(result.id)}
                  className="ml-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-400/10 rounded"
                  title="Remove result"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DraggablePanel>
  );
};