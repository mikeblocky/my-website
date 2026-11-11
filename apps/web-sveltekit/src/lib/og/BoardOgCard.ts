import { randomOgPalette } from './PageOgCard';

type BoardOgCardProps = {
  accent: string; accentSoft: string; border: string; label: string;
  body: string; title?: string; author?: string; date: string;
  imageUrl?: string; imageUrls?: string[];
};

/** Match the colorful page thumbnails without clipping longer posts or artwork. */
export function boardOgCard({ body, title, author, date, imageUrl, imageUrls, label }: BoardOgCardProps) {
  const images = [...new Set(imageUrls?.length ? imageUrls : imageUrl ? [imageUrl] : [])].slice(0, 4);
  const content = label === 'Drawing' && !body.trim() ? 'drew a thing!' : body;
  const { background, accent } = randomOgPalette();
  const textWidth = images.length ? 654 : 1104;
  const fontSize = content.length > 400 ? 26 : 32;
  const lines = content.split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(Array.from(line).reduce((width, char) => width + (char.codePointAt(0)! > 0x2e7f ? 1 : .65), 0) / (textWidth / fontSize))), 0);
  const centered = lines <= 5 && content.length + (title?.length || 0) <= 280;
  const height = Math.max(630, Math.ceil(224 + lines * fontSize * 1.5 + (title ? 100 : 0)));
  const node = (style: Record<string, unknown>, children?: unknown): any => ({type:'div', props:{style:{display:'flex', ...style}, children}});
  const header = node({alignItems:'center', justifyContent:'flex-start', flexWrap:'wrap', gap:14, marginBottom:24, width:'100%'}, [
    node({width:48, height:48, borderRadius:24, background:'#ffffff', color:accent, alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0}, (author || 'anonymous').slice(0,1).toUpperCase()),
    node({fontSize:28, fontWeight:700}, author || 'anonymous'),
    node({fontSize:23, color:accent, opacity:.65}, `· ${date}`)
  ]);
  return node({width:1200, height, padding:48, paddingBottom:66, gap:40, alignItems:centered ? 'center' : 'flex-start', background, color:accent, borderBottom:`18px solid ${accent}`, fontFamily:'DM Sans, Noto Sans JP'}, [
    node({width:textWidth, flexDirection:'column', flexShrink:0, alignItems:'flex-start', justifyContent:centered ? 'center' : 'flex-start', textAlign:'left', alignSelf:centered ? 'center' : 'flex-start'}, [
      header,
      ...(title ? [node({fontSize:32, fontWeight:700, marginBottom:16},title)] : []),
      node({width:'100%', justifyContent:'flex-start', fontSize, lineHeight:1.5, whiteSpace:'pre-wrap', wordBreak:'break-word'},content)
    ]),
    ...(images.length ? [node({width:410, flexDirection:'column', gap:12, alignSelf:'center'}, images.map(src => ({type:'img',props:{src,style:{width:410,height:Math.min(480,Math.floor((height-114)/images.length)-12),objectFit:'contain',borderRadius:8, background:'#ffffff'}}})))] : [])
  ]);
}
