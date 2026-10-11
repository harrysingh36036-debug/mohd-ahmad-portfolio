/**
 * Scroll Reveal Animations
 * Sections, cards, and elements animate in when scrolled into view
 */
(function () {
  // On lite devices we never hide anything in the first place. Injecting
  // the reveal CSS and immediately force-showing still costs a style recalc
  // on every node, so bail out before any of it runs.
  if (document.documentElement.dataset.perf === 'lite') return;

  // Add reveal CSS
  const style = document.createElement('style');
  style.textContent = `
    /* Reveal base state - hidden before animation */
    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal.reveal-left {
      transform: translateX(-40px);
    }
    .reveal.reveal-right {
      transform: translateX(40px);
    }
    .reveal.reveal-scale {
      transform: scale(0.92);
    }

    /* Visible state */
    .reveal.visible {
      opacity: 1;
      transform: translateY(0) translateX(0) scale(1);
    }

    /* Stagger children */
    .reveal-stagger > * {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal-stagger.visible > *:nth-child(1) { transition-delay: 0s; opacity: 1; transform: translateY(0); }
    .reveal-stagger.visible > *:nth-child(2) { transition-delay: 0.08s; opacity: 1; transform: translateY(0); }
    .reveal-stagger.visible > *:nth-child(3) { transition-delay: 0.16s; opacity: 1; transform: translateY(0); }
    .reveal-stagger.visible > *:nth-child(4) { transition-delay: 0.24s; opacity: 1; transform: translateY(0); }
    .reveal-stagger.visible > *:nth-child(5) { transition-delay: 0.32s; opacity: 1; transform: translateY(0); }
    .reveal-stagger.visible > *:nth-child(6) { transition-delay: 0.4s; opacity: 1; transform: translateY(0); }
    .reveal-stagger.visible > *:nth-child(7) { transition-delay: 0.48s; opacity: 1; transform: translateY(0); }
    .reveal-stagger.visible > *:nth-child(8) { transition-delay: 0.56s; opacity: 1; transform: translateY(0); }
    .reveal-stagger.visible > *:nth-child(9) { transition-delay: 0.64s; opacity: 1; transform: translateY(0); }

    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .reveal, .reveal > * {
        transition: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Motion sets an inline `opacity: 0` on the nodes it animates, and an
  // inline style beats any stylesheet rule. Adding `.visible` alone would be
  // silently ignored on those nodes, so clear the competing inline values and
  // let the CSS transition take over normally.
  function reveal(el) {
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
    el.classList.add('visible');
  }

  // Hard failsafe. Anything tagged .reveal gets force-shown once this fires,
  // so a missed observer callback can never leave a section invisible.
  // Transitions are suppressed here: by the time we are forcing content in,
  // a 0.7s fade on a saturated main thread is what produced the "blank
  // until scrolled" symptom in the first place.
  let failsafe = null;
  function scheduleFailsafe() {
    if (failsafe) return;
    failsafe = setTimeout(function () {
      revealAll();
    }, 2500);
  }

  function revealAll() {
    clearTimeout(failsafe);
    failsafe = null;
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.style.setProperty('transition', 'none', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'none', 'important');
      el.classList.add('visible');
    });
  }

  function init() {
    const root = document.getElementById('root');
    if (!root || !root.querySelector('.hero')) {
      // React has not mounted yet. Cap the polling so a mount failure or a
      // JS error does not spin this forever.
      if (init.tries === undefined) init.tries = 0;
      if (init.tries++ < 60) {
        setTimeout(init, 200);
      }
      return;
    }

    scheduleFailsafe();

    // Tag elements with reveal classes
    // --- Sections ---
    const sections = document.querySelectorAll('.section');
    sections.forEach((s) => {
      s.classList.add('reveal');
    });

    // --- Section headers ---
    document.querySelectorAll('.section-header').forEach((h) => {
      h.classList.add('reveal');
    });

    // --- Stat cards (stagger) ---
    const statsGrid = document.querySelector('.stats');
    if (statsGrid) {
      statsGrid.classList.add('reveal', 'reveal-stagger');
    }

    // --- Skill cards (stagger) ---
    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
      skillsGrid.classList.add('reveal', 'reveal-stagger');
    }

    // --- Cert cards (stagger) ---
    const certGrid = document.querySelector('.cert-grid');
    if (certGrid) {
      certGrid.classList.add('reveal', 'reveal-stagger');
    }

    // --- Project cards (stagger) ---
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
      projectGrid.classList.add('reveal', 'reveal-stagger');
    }

    // --- About card ---
    document.querySelectorAll('.about-card').forEach((c) => {
      c.classList.add('reveal');
    });

    // --- Contact section ---
    document.querySelectorAll('.contact-section').forEach((c) => {
      c.classList.add('reveal');
    });

    // --- Hero content (fade up on load) ---
    // Guarded so the re-run on window load does not flash the hero back
    // to opacity 0.
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && !heroContent.dataset.revealed) {
      heroContent.dataset.revealed = '1';
      heroContent.style.opacity = '0';
      heroContent.style.transform = 'translateY(30px)';
      heroContent.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
      }, 100);
    }

    // --- Set up Intersection Observer ---
    // threshold 0 (rather than 0.1) fires as soon as any part is visible.
    // A tall single-column grid can sit under 10% of its own height on a
    // phone, which left whole sections stuck hidden until a nudge.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            // Unobserve after reveal (animate once)
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 10% 0px',
      }
    );

    // Observe all reveal elements
    document.querySelectorAll('.reveal').forEach((el) => {
      observer.observe(el);
    });
  }

  // React can still be committing when we first tag. Re-run once the page
  // has fully loaded to catch any nodes that arrived late.
  window.addEventListener('load', init);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
