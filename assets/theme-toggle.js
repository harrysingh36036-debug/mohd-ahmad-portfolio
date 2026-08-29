/**
 * Dark / Light Mode Toggle
 * Injects a toggle button into the nav and switches the full theme
 */
(function () {
  const STORAGE_KEY = 'theme-preference';

  // Light mode overrides for all CSS variables
  const lightVars = {
    '--color-bg': '#f8fafc',
    '--color-surface': '#ffffff',
    '--color-surface-elevated': '#ffffff',
    '--color-surface-hover': '#f1f5f9',
    '--color-border': 'rgba(0,0,0,0.08)',
    '--color-border-hover': '#5eead4',
    '--color-primary': '#0d9488',
    '--color-primary-muted': 'rgba(13,148,136,0.1)',
    '--color-secondary': '#2563eb',
    '--color-accent': '#7c3aed',
    '--color-text': '#0f172a',
    '--color-text-secondary': '#475569',
    '--color-text-tertiary': '#94a3b8',
    '--color-focus': '#0d9488',
  };

  // Dark mode (original values)
  const darkVars = {
    '--color-bg': '#070b14',
    '--color-surface': '#0f1729',
    '--color-surface-elevated': 'rgba(19,27,45,0.85)',
    '--color-surface-hover': 'rgba(30,42,68,0.9)',
    '--color-border': 'rgba(255,255,255,0.08)',
    '--color-border-hover': 'rgba(94,234,212,0.35)',
    '--color-primary': '#5eead4',
    '--color-primary-muted': 'rgba(94,234,212,0.12)',
    '--color-secondary': '#60a5fa',
    '--color-accent': '#a78bfa',
    '--color-text': '#f1f5f9',
    '--color-text-secondary': '#94a3b8',
    '--color-text-tertiary': '#64748b',
    '--color-focus': '#5eead4',
  };

  function applyTheme(isLight) {
    const vars = isLight ? lightVars : darkVars;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }

    // Body background
    document.body.style.background = isLight ? '#f8fafc' : '';

    // Vignette - softer in light mode
    const vignette = document.querySelector('.vignette');
    if (vignette) {
      vignette.style.background = isLight
        ? 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)'
        : '';
    }

    // Grid lines - darker in light mode
    const grid = document.querySelector('.motion-grid');
    if (grid) {
      grid.style.backgroundImage = isLight
        ? 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)'
        : '';
    }

    // Scan line
    const scanLine = document.querySelector('.scan-line');
    if (scanLine) {
      scanLine.style.background = isLight
        ? 'linear-gradient(90deg, transparent, rgba(13,148,136,0.2), transparent)'
        : '';
    }

    // Particle canvas opacity
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
      particleCanvas.style.opacity = isLight ? '0.35' : '0.6';
    }

    // Boxes canvas opacity
    const boxesCanvas = document.getElementById('boxes-canvas');
    if (boxesCanvas) {
      boxesCanvas.style.opacity = isLight ? '0.25' : '0.4';
    }

    // Nav background
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.style.background = isLight ? 'rgba(248,250,252,0.85)' : '';
      nav.style.borderBottomColor = isLight ? 'rgba(0,0,0,0.06)' : '';
    }

    // Update toggle icon
    updateToggleIcon(isLight);

    // Save preference
    localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark');
  }

  function updateToggleIcon(isLight) {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.innerHTML = isLight
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    btn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
  }

  function createToggle() {
    // Wait for nav to exist
    const nav = document.querySelector('.nav');
    if (!nav) {
      setTimeout(createToggle, 200);
      return;
    }

    // Check if already added
    if (document.querySelector('.theme-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.style.cssText = `
      cursor: pointer;
      padding: 8px;
      min-width: 40px;
      min-height: 40px;
      color: var(--color-text);
      background: var(--color-primary-muted);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md, 12px);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'var(--color-surface-hover)';
      btn.style.borderColor = 'var(--color-border-hover)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'var(--color-primary-muted)';
      btn.style.borderColor = 'var(--color-border)';
    });

    btn.addEventListener('click', () => {
      const current = localStorage.getItem(STORAGE_KEY);
      const isLight = current === 'light';
      applyTheme(!isLight);
    });

    // Insert before the nav toggle (mobile) or at the end
    const navToggle = nav.querySelector('.nav-toggle');
    if (navToggle) {
      nav.insertBefore(btn, navToggle);
    } else {
      nav.appendChild(btn);
    }

    // Apply saved preference on load
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light') {
      applyTheme(true);
    }
  }

  // Add transition style for smooth theme switching
  const style = document.createElement('style');
  style.textContent = `
    html { transition: background-color 0.4s ease; }
    body, .nav, .vignette, .motion-grid, .scan-line {
      transition: background 0.4s ease, background-color 0.4s ease, border-color 0.4s ease, opacity 0.4s ease;
    }
    * {
      transition-property: color, background-color, border-color, box-shadow, opacity;
      transition-duration: 0.4s;
      transition-timing-function: ease;
    }
    /* Exclude things that should not transition */
    .hero h1, .tw-cursor, .particle-canvas, #boxes-canvas {
      transition: none;
    }
  `;
  document.head.appendChild(style);

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createToggle);
  } else {
    createToggle();
  }
})();
