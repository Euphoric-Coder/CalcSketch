import { useRef, useCallback } from 'react';
import type { DrawingMode } from '../constants';

interface TouchPoint {
  x: number;
  y: number;
  pressure?: number;
}

export const useTouchDrawing = () => {
  const lastTouchRef = useRef<TouchPoint | null>(null);

  const getTouchPos = useCallback((canvas: HTMLCanvasElement, touch: Touch): TouchPoint => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      pressure: touch.force || 1, // Apple Pencil provides pressure via force
    };
  }, []);

  const getPointerPos = useCallback((canvas: HTMLCanvasElement, e: PointerEvent): TouchPoint => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 1,
    };
  }, []);

  const drawLine = useCallback((
    ctx: CanvasRenderingContext2D,
    from: TouchPoint,
    to: TouchPoint,
    color: string,
    baseLineWidth: number,
    mode: DrawingMode = 'draw'
  ) => {
    const pressureMultiplier = Math.max(0.3, Math.min(2, to.pressure || 1));

    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#111111'; // Dark color to match background
      ctx.lineWidth = baseLineWidth * 5 * pressureMultiplier;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = baseLineWidth * pressureMultiplier;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, []);

  return {
    getTouchPos,
    getPointerPos,
    drawLine,
    lastTouchRef,
  };
};