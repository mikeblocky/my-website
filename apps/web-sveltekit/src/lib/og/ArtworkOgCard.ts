import { boardOgCard } from './BoardOgCard';
export function artworkOgCard({imageUrl, caption, author, date, id}: {imageUrl:string; caption?:string; author?:string; date:string; id?:string}) {
  return boardOgCard({imageUrl, body:caption || '', author, date, colorKey:id ? `sketchbook:${id}` : undefined, accent:'#2563eb', accentSoft:'#eff6ff', border:'#dbeafe',label:'Drawing'});
}
