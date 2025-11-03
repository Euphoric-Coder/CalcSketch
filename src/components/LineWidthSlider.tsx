import React from 'react';

interface LineWidthSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const LineWidthSlider: React.FC<LineWidthSliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/90">Line Width</label>
        <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-center">
        <div
          className="bg-white rounded-full transition-all duration-200"
          style={{
            width: `${Math.max(value, 4)}px`,
            height: `${Math.max(value, 4)}px`,
          }}
        />
      </div>
    </div>
  );
};