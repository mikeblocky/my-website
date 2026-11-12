export function dragIntent(dx:number,dy:number,pointerType:string,axis:'free'|'horizontal'='free') {
  const threshold=pointerType==='touch'||pointerType==='pen'?12:6;
  if(Math.hypot(dx,dy)<threshold)return 'pending';
  if(axis==='horizontal'&&Math.abs(dy)>Math.abs(dx))return 'scroll';
  return 'drag';
}
export function dockDragIntent(dx:number,dy:number,pointerType:string,elapsed:number){
  if(pointerType!=='touch'&&pointerType!=='pen')return dragIntent(dx,dy,pointerType);
  const distance=Math.hypot(dx,dy);
  // A quick tap may wobble; holding briefly or moving decisively starts a drag.
  return distance>=28||(elapsed>=180&&distance>=14)?'drag':'pending';
}
