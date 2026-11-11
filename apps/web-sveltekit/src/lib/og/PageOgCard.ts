const palettes = [ ['#eef2ff', '#4338ca'], ['#f0fdfa', '#0f766e'], ['#fff1f2', '#be123c'], ['#faf5ff', '#7e22ce'], ['#fffbeb', '#b45309'] ];

export function postColorHash(key: string) {
  let hash = 2166136261;
  for (const char of key) { hash ^= char.codePointAt(0)!; hash = Math.imul(hash, 16777619); }
  hash ^= hash >>> 16; hash = Math.imul(hash, 0x7feb352d); hash ^= hash >>> 15;
  return hash >>> 0;
}

function hslHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100, l = lightness / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/** Per-item colors span the full hue range instead of repeating a short palette. */
export function postOgPalette(key: string) {
  const hash = postColorHash(key), detail = postColorHash(`ink:${key}`);
  const hue = hash / 4294967296 * 360;
  return { background: hslHex(hue, 64 + detail % 25, 91.5 + (detail >>> 8) % 40 / 10), accent: hslHex(hue, 52 + (detail >>> 16) % 30, 28 + (detail >>> 24) % 90 / 10) };
}

export function randomOgPalette(random = Math.random) {
  const [background, accent] = palettes[Math.min(palettes.length - 1, Math.floor(random() * palettes.length))];
  return { background, accent };
}

// Page titles keep their established colors; individual posts use stable per-item colors.
export function pageOgPalette(title: string) {
  const hash = Array.from(title).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  const [background, accent] = palettes[hash % palettes.length];
  return { background, accent };
}

export function pageOgCard(title: string) {
  const { background, accent } = pageOgPalette(title);
  return { type: 'div', props: { style: {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: 88, background, color: accent,
    borderBottom: `18px solid ${accent}`, fontFamily: 'DM Sans, Noto Sans JP'
  }, children: [
    { type: 'div', props: { style: { display: 'flex', fontSize: title.length > 180 ? 38 : title.length > 140 ? 44 : title.length > 85 ? 52 : title.length > 45 ? 64 : 82, fontWeight: 700, lineHeight: 1.15, letterSpacing: -2, wordBreak: 'break-word' }, children: title } },
    { type: 'div', props: { style: { position: 'absolute', bottom: 48, left: 88, fontSize: 24, opacity: 0.65 }, children: 'mikeblocky.com' } }
  ] } };
}
