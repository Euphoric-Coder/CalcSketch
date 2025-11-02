import React from 'react';
import { useDraggable } from '../hooks/useDraggable';

interface DraggablePanelProps {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  className?: string;
  handle?: boolean;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  children,
  initialPosition = { x: 0, y: 0 },
  className = '',
  handle = true,
}) => {
  const { position, isDragging, dragRef, handleMouseDown } = useDraggable(initialPosition);

  return (
    <div
      ref={dragRef}
      className={`absolute ${className} ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
    >
      {handle && (
        <div
          className="cursor-grab active:cursor-grabbing p-2 flex justify-center"
          onMouseDown={handleMouseDown}
        >
          <div className="w-8 h-1 bg-white/40 rounded-full hover:bg-white/60 transition-colors"></div>
        </div>
      )}
      <div className={handle ? '' : 'cursor-grab'} onMouseDown={handle ? undefined : handleMouseDown}>
        {children}
      </div>
    </div>
  );
};