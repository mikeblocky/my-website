import { getDrawingStats } from '$lib/stats/drawing-stats';

export function load() {
  return {
    stats: getDrawingStats()
  };
}
