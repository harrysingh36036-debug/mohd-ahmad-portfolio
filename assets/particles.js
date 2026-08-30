/**
 * Particle Network Animation
 * Floating particles that react to mouse AND scroll
 * Optimized: reduced particle count, frame-skipping, capped connections
 */
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText =
    'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.6;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let w, h;
  let particles = [];
  const PARTICLE_COUNT = 24;
  const CONNECTION_DIST = 100;
  const MOUSE_RADIUS = 200;
  let frameCount = 0;

  let mouse = { x: -1000, y: -1000 };
  let scroll = { y: 0, speed: 0, lastY: 0 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2 + 1;
      this.baseOpacity = Math.random() * 0.5 + 0.2;
      this.opacity = this.baseOpacity;
      this.parallaxFactor = Math.random() * 0.4 + 0.1; // each particle reacts differently to scroll
      this.color = [
        '0, 240, 255',
        '0, 220, 230',
        '200, 240, 255',
        '255, 255, 255',
        '180, 230, 255',
      ][Math.floor(Math.random() * 5)];
    }
    update() {
      const scrollSpeedAbs = Math.abs(scroll.speed);

      // --- Scroll reactivity ---

      // 1. Parallax: each particle drifts vertically at its own rate
      this.y -= scroll.speed * this.parallaxFactor;

      // 2. Spread: scroll pushes particles outward horizontally
      const spreadForce = scrollSpeedAbs * 0.003;
      const centerX = w / 2;
      const dxFromCenter = this.x - centerX;
      this.x += dxFromCenter > 0 ? spreadForce : -spreadForce;

      // 3. Speed boost: scroll adds extra vertical velocity
      this.vy += scroll.speed * 0.0008;

      // 4. Opacity pulse: faster scroll = brighter particles
      this.opacity = this.baseOpacity + Math.min(scrollSpeedAbs * 0.003, 0.4);

      // 5. Radius pulse: particles swell slightly on scroll
      this.radius = this.radius > 0
        ? this.radius
        : Math.random() * 2 + 1;

      // --- Mouse repulsion ---
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      // --- Apply velocity ---
      this.x += this.vx;
      this.y += this.vy;

      // Friction
      this.vx *= 0.995;
      this.vy *= 0.995;

      // Wrap around edges (wrap based on actual canvas, not page)
      if (this.x < -50) this.x = w + 50;
      if (this.x > w + 50) this.x = -50;
      if (this.y < -50) this.y = h + 50;
      if (this.y > h + 50) this.y = -50;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  // Cap max connections per particle to avoid O(n²) stalls
  const MAX_CONNECTIONS = 120;

  function drawConnections() {
    const scrollSpeedAbs = Math.abs(scroll.speed);
    const lineBaseOpacity = 0.1 + Math.min(scrollSpeedAbs * 0.001, 0.15);
    const effectiveDist = CONNECTION_DIST + scrollSpeedAbs * 0.05;
    let totalConnections = 0;

    for (let i = 0; i < particles.length; i++) {
      if (totalConnections >= MAX_CONNECTIONS) break;
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;
        const effDistSq = effectiveDist * effectiveDist;

        if (distSq < effDistSq) {
          const dist = Math.sqrt(distSq);
          const opacity = (1 - dist / effectiveDist) * lineBaseOpacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 220, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          totalConnections++;
          if (totalConnections >= MAX_CONNECTIONS) break;
        }
      }
    }
  }

  function animate() {
    frameCount++;
    // Skip every other frame when not scrolling to reduce CPU load
    const active = Math.abs(scroll.speed) > 0.5 || Math.abs(mouse.x) > 0;
    if (!active && frameCount % 2 !== 0) {
      requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.update();
      p.draw();
    }

    drawConnections();

    // Decay scroll speed over time
    scroll.speed *= 0.92;

    requestAnimationFrame(animate);
  }

  // Track mouse
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Track scroll
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    scroll.speed = currentY - scroll.lastY;
    scroll.lastY = currentY;
  }, { passive: true });

  window.addEventListener('resize', () => {
    resize();
  });

  init();
  animate();
})();
