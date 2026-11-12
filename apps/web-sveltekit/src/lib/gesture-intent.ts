export function dragIntent(dx:number,dy:number,pointerType:string,axis:'free'|'horizontal'='free') {
  const threshold=pointerType==='touch'||pointerType==='pen'?12:6;
  if(Math.hypot(dx,dy)<threshold)return 'pending';
  if(axis==='horizontal'&&Math.abs(dy)>Math.abs(dx))return 'scroll';
  return 'drag';
}
