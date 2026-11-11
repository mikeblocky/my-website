type Rectangle = { left: number; right: number; top: number; bottom: number };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(Math.max(min, max), value));

export function thoughtWidth(available: number, long: boolean, previous = 0, needsMoreRoom = false) {
  return Math.max(0, Math.min(available, 620, Math.max(long ? 520 : 300, previous + (needsMoreRoom ? 80 : 0))));
}

/** Prefer above the person; flip below when necessary and keep the complete bubble in view. */
export function placeThought(anchor: Rectangle, bounds: Rectangle, width: number, height: number, preferAbove = false) {
  const above = anchor.top - bounds.top - 14;
  const below = bounds.bottom - anchor.bottom - 14;
  const side = preferAbove || above >= height || above >= below ? 'above' : 'below';
  const y = side === 'above' ? anchor.top - height - 14 : anchor.bottom + 14;
  return { x: clamp((anchor.left + anchor.right - width) / 2, bounds.left, bounds.right - width), y: clamp(y, bounds.top, bounds.bottom - height), side };
}
