// A stable palette gives every title its own color without stored image assets.
export function pageOgCard(title: string) {
  const palettes = [ ['#eef2ff', '#4338ca'], ['#f0fdfa', '#0f766e'], ['#fff1f2', '#be123c'], ['#faf5ff', '#7e22ce'], ['#fffbeb', '#b45309'] ];
  const hash = Array.from(title).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  const [background, accent] = palettes[hash % palettes.length];
  return { type: 'div', props: { style: {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: 88, background, color: accent,
    borderBottom: `18px solid ${accent}`, fontFamily: 'Inter'
  }, children: [
    { type: 'div', props: { style: { display: 'flex', fontSize: title.length > 85 ? 52 : title.length > 45 ? 64 : 82, fontWeight: 700, lineHeight: 1.15, letterSpacing: -2, maxHeight: 400, overflow: 'hidden' }, children: title } },
    { type: 'div', props: { style: { position: 'absolute', bottom: 48, left: 88, fontSize: 24, opacity: 0.65 }, children: 'mikeblocky.com' } }
  ] } };
}
