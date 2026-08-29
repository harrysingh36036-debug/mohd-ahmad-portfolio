/**
 * Scroll Reveal Animations
 * Sections, cards, and elements animate in when scrolled into view
 */
(function () {
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

  function init() {
    const root = document.getElementById('root');
    if (!root || !root.querySelector('.hero')) {
      setTimeout(init, 200);
      return;
    }

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
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.opacity = '0';
      heroContent.style.transform = 'translateY(30px)';
      heroContent.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
      }, 100);
    }

    // --- Set up Intersection Observer ---
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after reveal (animate once)
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    // Observe all reveal elements
    document.querySelectorAll('.reveal').forEach((el) => {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
