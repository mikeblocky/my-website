import { postOgPalette, postColorHash } from './PageOgCard';
import { imageSize } from 'image-size';

type BoardOgCardProps = {
  accent: string; accentSoft: string; border: string; label: string;
  body: string; title?: string; author?: string; date: string;
  imageUrl?: string; imageUrls?: string[];
  colorKey?: string;
};

/** Match the colorful page thumbnails without clipping longer posts or artwork. */
export function boardOgCard({ body, title, author, date, imageUrl, imageUrls, label, colorKey }: BoardOgCardProps) {
  const images = [...new Set(imageUrls?.length ? imageUrls : imageUrl ? [imageUrl] : [])].slice(0, 4);
  const content = label === 'Drawing' && !body.trim() ? 'drew a thing!' : body;
  const key = colorKey || `${label}:${author}:${date}:${title || content}`;
  const { background, accent } = postOgPalette(key);
  const hash = postColorHash(key);
  const dimensions = images.map(src => {
    try {
      if (src.startsWith('data:image/') && src.includes(';base64,') && src.length < 12000000) {
        const size = imageSize(Buffer.from(src.split(',')[1], 'base64'));
        return { width: size.width, height: size.height };
      }
    } catch { /* Unknown formats retain a safe uncropped square fallback. */ }
    return { width: 600, height: 600 };
  });
  const ratio = dimensions[0] ? dimensions[0].width / dimensions[0].height : 1;
  const imageColumn = ratio > 1.25 ? 470 + hash % 71 : ratio < .8 ? 340 + hash % 71 : 400 + hash % 81;
  const textWidth = images.length ? 1064 - imageColumn : 1104;
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
    ...(images.length ? [node({width:imageColumn, flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:12, alignSelf:'center'}, images.map((src,index) => {
      const size = dimensions[index], columns = images.length > 2 ? 2 : 1;
      const rows = Math.ceil(images.length / columns);
      const maxWidth = (imageColumn - (columns - 1) * 12) / columns;
      const maxHeight = Math.min(480, (height - 114 - (rows - 1) * 12) / rows);
      const variation = .88 + postColorHash(`${key}:${index}`) % 13 / 100;
      const scale = Math.min(maxWidth / size.width, maxHeight / size.height) * variation;
      return {type:'img',props:{src,style:{width:Math.round(size.width * scale),height:Math.round(size.height * scale),objectFit:'contain',borderRadius:8, background:'#ffffff'}}};
    }))] : [])
  ]);
}
