/**
 * Scroll Reveal Fallback
 *
 * The app animates sections in with Motion's `whileInView`:
 *
 *   initial:'hidden'  whileInView:'visible'  viewport:{ once:true, amount:0.5 }
 *
 * `amount: 0.5` tells IntersectionObserver to wait until 50% of the target
 * is inside the viewport. On a phone the single-column grids (12 skill cards,
 * ~60 certifications, the project list) are far taller than the screen, so
 * 50% visibility can never be reached and those sections are stuck at
 * opacity 0 permanently. The user sees blank sections that never fill in.
 *
 * That threshold lives in the React source, which is not in this repo, so
 * this script watches for elements Motion left hidden and rescues them once
 * they have been in view for a moment. Motion's own animation is left alone
 * wherever it works, so the reveal still plays normally on desktop.
 */
(function () {
  if (window.__revealFallback) return;
  window.__revealFallback = true;

  const root = document.getElementById('root');
  if (!root) return;

  // Never touch navigation or the typewriter cursor - they manage their own
  // opacity for the open/close animation.
  const SKIP = '.nav, .nav-links-mobile, .tw-cursor';

  // How long an element may sit in view before we assume Motion has given up
  // on it. Long enough that a working 0.5s reveal is never interrupted.
  const RESCUE_MS = 1200;

  const observed = new WeakSet();
  let scanScheduled = false;

  function isHidden(el) {
    return parseFloat(getComputedStyle(el).opacity) < 0.02;
  }

  function rescue(el) {
    // !important so a later inline write from Motion cannot drop it back.
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        setTimeout(() => {
          // Only rescue if Motion still has it hidden.
          if (el.isConnected && isHidden(el)) {
            rescue(el);
          }
        }, RESCUE_MS);
      });
    },
    {
      threshold: 0,
      rootMargin: '0px 0px 8% 0px',
    }
  );

  function scan() {
    scanScheduled = false;
    const nodes = root.querySelectorAll('*');
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      if (observed.has(el)) continue;
      if (el.closest(SKIP)) continue;
      if (!isHidden(el)) continue;
      observed.add(el);
      observer.observe(el);
    }
  }

  function scheduleScan() {
    if (scanScheduled) return;
    scanScheduled = true;
    requestAnimationFrame(scan);
  }

  // React mounts progressively; pick up anything that appears late.
  new MutationObserver(scheduleScan).observe(root, { childList: true, subtree: true });

  window.addEventListener('load', scheduleScan);
  scheduleScan();

  // Backstop: if React never mounts there is nothing hidden to fix, but if it
  // mounts slowly the observer above covers it. Keep a slow sweep for the
  // first few seconds regardless.
  let sweeps = 0;
  const sweep = setInterval(() => {
    scheduleScan();
    if (++sweeps >= 10) clearInterval(sweep);
  }, 400);
})();
