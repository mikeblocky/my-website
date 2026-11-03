/** Reveal once, in reading order. Content stays visible without JavaScript. */
export function reveal(node: HTMLElement, delay = 0) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || document.documentElement.classList.contains('route-crossfade') ||
    !('IntersectionObserver' in window)) return {};
  let animation: Animation | undefined;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    if (preference.matches) { observer.disconnect(); return; }
    animation = node.animate(
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 800, delay, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)', fill: 'backwards' }
    );
    observer.disconnect();
  }, { threshold: 0.08 });
  const stop = () => { if (preference.matches) animation?.finish(); };
  preference.addEventListener('change', stop);
  observer.observe(node);
  return { destroy() { observer.disconnect(); animation?.cancel(); preference.removeEventListener('change', stop); } };
}
