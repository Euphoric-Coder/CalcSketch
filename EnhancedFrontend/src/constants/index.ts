export const SWATCHES = [
  '#ffffff', // White
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#ffa500', // Orange
  '#800080', // Purple
  '#ffc0cb', // Pink
  '#a52a2a', // Brown
  '#808080', // Gray
];

export const DRAWING_MODES = {
  DRAW: 'draw',
  ERASE: 'erase',
} as const;

export type DrawingMode = typeof DRAWING_MODES[keyof typeof DRAWING_MODES];