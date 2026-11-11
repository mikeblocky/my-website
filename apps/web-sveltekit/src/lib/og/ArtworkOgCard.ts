import { boardOgCard } from './BoardOgCard';
export function artworkOgCard({imageUrl, caption, author, date}: {imageUrl:string; caption?:string; author?:string; date:string}) {
  return boardOgCard({imageUrl, body:caption || '', author, date, accent:'#2563eb', accentSoft:'#eff6ff', border:'#dbeafe',label:'Drawing'});
}
