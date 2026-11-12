import { get, writable } from 'svelte/store';

export const hapticsEnabled = writable(false);
const preferenceKey = 'mike:touch-feedback';
export function setHaptics(enabled: boolean) {
  hapticsEnabled.set(enabled);
  try { localStorage.setItem(preferenceKey, String(enabled)); } catch {}
  if (enabled && typeof navigator.vibrate === 'function') {try{navigator.vibrate(8);}catch{}}
}

/** Observe native activation without replacing clicks, focus, scrolling or form submission. */
export function installInteractionFeedback() {
  try { hapticsEnabled.set(localStorage.getItem(preferenceKey) === 'true'); } catch {}
  const selector = 'button,a[href],summary,input[type="checkbox"],input[type="radio"],[role="button"]';
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
  let held: { node: HTMLElement; id: number; x: number; y: number } | null = null;
  let touchActivation = false;
  function control(event: Event) {
    const node = event.target instanceof Element ? event.target.closest<HTMLElement>(selector) : null;
    return node && !node.matches(':disabled,[aria-disabled="true"],.phone-menu-backdrop,[aria-label="Close lightbox backdrop"]') && !node.closest('[inert]') ? node : null;
  }
  function release() { held?.node.classList.remove('ui-held'); held = null; }
  function cancel(){release();touchActivation=false;}
  function down(event: PointerEvent) {
    release();
    touchActivation=false;
    const node = control(event);
    if (!node || !event.isPrimary || event.button !== 0) return;
    touchActivation = event.pointerType === 'touch' || event.pointerType === 'pen';
    held = { node, id: event.pointerId, x: event.clientX, y: event.clientY };
    node.classList.add('ui-held');
  }
  function move(event: PointerEvent) {
    if (held?.id === event.pointerId && Math.hypot(event.clientX-held.x,event.clientY-held.y)>12) { release(); touchActivation=false; }
  }
  function click(event: MouseEvent) {
    const touch=touchActivation;touchActivation=false;
    const node = control(event);
    if (!node || !event.isTrusted) return;
    clearTimeout(timers.get(node));
    node.classList.add('ui-ack');
    timers.set(node,setTimeout(()=>{node.classList.remove('ui-ack');timers.delete(node);},180));
    if (touch && get(hapticsEnabled) && typeof navigator.vibrate === 'function') {
      try { navigator.vibrate(8); } catch {}
    }
  }
  document.addEventListener('pointerdown',down,{capture:true,passive:true});
  document.addEventListener('pointermove',move,{capture:true,passive:true});
  document.addEventListener('pointerup',release,true);
  document.addEventListener('pointercancel',cancel,true);
  document.addEventListener('click',click,true);
  window.addEventListener('blur',cancel);
  return ()=>{
    release();
    document.removeEventListener('pointerdown',down,true);
    document.removeEventListener('pointermove',move,true);
    document.removeEventListener('pointerup',release,true);
    document.removeEventListener('pointercancel',cancel,true);
    document.removeEventListener('click',click,true);
    window.removeEventListener('blur',cancel);
    for(const [node,timer] of timers){clearTimeout(timer);node.classList.remove('ui-ack');}
    timers.clear();
  };
}
