/**
 * Typewriter Animation
 * Types out the hero headline character by character with a blinking cursor
 */
(function () {
  function initTypewriter() {
    const heroH1 = document.querySelector('.hero h1');
    if (!heroH1) {
      setTimeout(initTypewriter, 200);
      return;
    }

    // Store original text and HTML
    const originalHTML = heroH1.innerHTML;
    const originalText = heroH1.textContent;

    // Clear the text initially
    heroH1.textContent = '';

    // Add cursor
    const cursor = document.createElement('span');
    cursor.className = 'tw-cursor';
    cursor.textContent = '|';
    heroH1.appendChild(cursor);

    // Typewriter settings
    const CHARS_PER_TICK = 2;
    const TICK_MS = 40;
    const PAUSE_AFTER_WORD = 120; // ms pause after each word

    let charIndex = 0;
    let tickTimer = null;

    function type() {
      if (charIndex >= originalText.length) {
        // Done typing — keep cursor blinking, then fade it out
        setTimeout(() => {
          cursor.style.animation = 'tw-blink 1s step-end 3';
          setTimeout(() => {
            cursor.style.opacity = '0';
          }, 3000);
        }, 800);

        // Restore the original HTML (with gradient spans etc)
        heroH1.innerHTML = originalHTML;
        // Re-add cursor at end
        const newCursor = document.createElement('span');
        newCursor.className = 'tw-cursor';
        newCursor.textContent = '|';
        heroH1.appendChild(newCursor);
        // Fade it out after a bit
        setTimeout(() => {
          newCursor.style.transition = 'opacity 0.5s';
          newCursor.style.opacity = '0';
        }, 1500);

        return;
      }

      // Add characters
      const charsToAdd = originalText.slice(charIndex, charIndex + CHARS_PER_TICK);
      heroH1.textContent = originalText.slice(0, charIndex + CHARS_PER_TICK);
      heroH1.appendChild(cursor);
      charIndex += CHARS_PER_TICK;

      // Pause longer at spaces (word boundaries)
      const nextChar = originalText[charIndex];
      if (nextChar === ' ') {
        setTimeout(type, PAUSE_AFTER_WORD);
      } else {
        tickTimer = setTimeout(type, TICK_MS);
      }
    }

    // Start typing after a short delay
    setTimeout(type, 600);
  }

  // Add cursor styles
  const style = document.createElement('style');
  style.textContent = `
    .tw-cursor {
      font-weight: 300;
      animation: tw-blink 0.7s step-end infinite;
      margin-left: 2px;
      color: var(--color-primary, #5eead4);
      transition: opacity 0.5s;
    }
    @keyframes tw-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    /* Hide hero content until typewriter finishes */
    .hero h1 {
      min-height: 1.2em;
    }
  `;
  document.head.appendChild(style);

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypewriter);
  } else {
    initTypewriter();
  }
})();
