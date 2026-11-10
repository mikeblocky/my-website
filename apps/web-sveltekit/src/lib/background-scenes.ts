/** Shuffle on the client: static page data stays identical during hydration. */
export function createArtworkScenes(
  artworks: { width: number; height: number }[],
  previous: number[] = [],
  random: () => number = Math.random
): number[][] {
  function shuffle<T>(items: T[]): T[] {
    for (let index = items.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1));
      [items[index], items[other]] = [items[other], items[index]];
    }
    return items;
  }
  const portraits = shuffle(artworks.flatMap((art, index) => art.height > art.width ? [index] : []));
  const scenes = artworks.flatMap((art, index) => art.height <= art.width ? [[index]] : []);
  while (portraits.length) {
    // Leave a remainder that can itself be partitioned into threes and fours.
    const choices = [3, 4].filter(size => {
      const remainder = portraits.length - size;
      return remainder === 0 || (remainder >= 3 && remainder !== 5);
    });
    const size = choices.length ? choices[Math.floor(random() * choices.length)] : Math.min(4, portraits.length);
    scenes.push(portraits.splice(0, size));
  }
  shuffle(scenes);
  const fresh = scenes.findIndex(scene => scene.every(index => !previous.includes(index)));
  if (fresh > 0) [scenes[0], scenes[fresh]] = [scenes[fresh], scenes[0]];
  return scenes;
}

/** Adjacent panels cover the viewport, including an incomplete final phone row. */
export function getBackgroundSlots(count: number, width: number, height: number, compact = width < 600) {
  if (!count) return [];
  const columns = compact ? Math.min(2, count) : count;
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const itemsInRow = Math.min(columns, count - row * columns);
    const slotWidth = width / itemsInRow;
    return { x: index % columns * slotWidth, y: row * height / rows, width: slotWidth, height: height / rows };
  });
}
