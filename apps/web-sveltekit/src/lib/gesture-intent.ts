export function dragIntent(dx:number,dy:number,pointerType:string,axis:'free'|'horizontal'='free') {
  const threshold=pointerType==='touch'||pointerType==='pen'?12:6;
  if(Math.hypot(dx,dy)<threshold)return 'pending';
  if(axis==='horizontal'&&Math.abs(dy)>Math.abs(dx))return 'scroll';
  return 'drag';
}
export function dockDragIntent(dx:number,dy:number,pointerType:string,elapsed:number){
  if(pointerType!=='touch'&&pointerType!=='pen')return dragIntent(dx,dy,pointerType);
  const distance=Math.hypot(dx,dy);
  // Touch activation stays native; repositioning needs an intentional hold-drag.
  return elapsed>=320&&distance>=14?'drag':'pending';
}
