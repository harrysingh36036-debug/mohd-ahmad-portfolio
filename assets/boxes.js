/**
 * Floating 3D Boxes Animation
 * Geometric boxes that rotate, drift, and react to scroll
 */
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'boxes-canvas';
  canvas.style.cssText =
    'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.4;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let w, h;
  let boxes = [];
  let scrollSpeed = 0;
  let lastScrollY = 0;
  const BOX_COUNT = 18;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  // 3D box vertices (unit cube)
  const cubeVerts = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
  ];

  // Edges connecting vertices
  const edges = [
    [0,1],[1,2],[2,3],[3,0], // back face
    [4,5],[5,6],[6,7],[7,4], // front face
    [0,4],[1,5],[2,6],[3,7], // connecting edges
  ];

  function rotateY(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos];
  }

  function rotateX(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos];
  }

  function rotateZ(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos, v[2]];
  }

  class Box {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 25 + 10;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.rotX = Math.random() * Math.PI * 2;
      this.rotY = Math.random() * Math.PI * 2;
      this.rotZ = Math.random() * Math.PI * 2;
      this.rotSpeedX = (Math.random() - 0.5) * 0.008;
      this.rotSpeedY = (Math.random() - 0.5) * 0.012;
      this.rotSpeedZ = (Math.random() - 0.5) * 0.005;
      this.parallax = Math.random() * 0.3 + 0.05;
      this.opacity = Math.random() * 0.3 + 0.08;
      this.baseOpacity = this.opacity;
      this.hue = Math.random() > 0.5 ? '0, 220, 255' : '255, 255, 255';
      this.filled = Math.random() > 0.6;
    }

    update() {
      // Scroll drift
      this.y -= scrollSpeed * this.parallax;
      this.x += scrollSpeed * this.parallax * 0.3;

      // Scroll speed boosts rotation
      const speedBoost = Math.abs(scrollSpeed) * 0.0003;
      this.rotX += this.rotSpeedX + speedBoost;
      this.rotY += this.rotSpeedY + speedBoost;
      this.rotZ += this.rotSpeedZ + speedBoost * 0.5;

      // Scroll brightens
      this.opacity = this.baseOpacity + Math.min(Math.abs(scrollSpeed) * 0.002, 0.25);

      // Float
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.999;
      this.vy *= 0.999;

      // Wrap
      if (this.x < -60) this.x = w + 60;
      if (this.x > w + 60) this.x = -60;
      if (this.y < -60) this.y = h + 60;
      if (this.y > h + 60) this.y = -60;
    }

    draw() {
      // Project 3D cube to 2D
      const projected = cubeVerts.map((v) => {
        let p = [v[0] * this.size, v[1] * this.size, v[2] * this.size];
        p = rotateX(p, this.rotX);
        p = rotateY(p, this.rotY);
        p = rotateZ(p, this.rotZ);
        // Simple perspective projection
        const perspective = 400;
        const scale = perspective / (perspective + p[2]);
        return [p[0] * scale + this.x, p[1] * scale + this.y];
      });

      ctx.strokeStyle = `rgba(${this.hue}, ${this.opacity})`;
      ctx.lineWidth = 0.8;

      // Draw edges
      for (const [a, b] of edges) {
        ctx.beginPath();
        ctx.moveTo(projected[a][0], projected[a][1]);
        ctx.lineTo(projected[b][0], projected[b][1]);
        ctx.stroke();
      }

      // Optionally fill faces
      if (this.filled) {
        ctx.fillStyle = `rgba(${this.hue}, ${this.opacity * 0.15})`;
        // Front face
        ctx.beginPath();
        ctx.moveTo(projected[4][0], projected[4][1]);
        ctx.lineTo(projected[5][0], projected[5][1]);
        ctx.lineTo(projected[6][0], projected[6][1]);
        ctx.lineTo(projected[7][0], projected[7][1]);
        ctx.closePath();
        ctx.fill();
        // Back face
        ctx.beginPath();
        ctx.moveTo(projected[0][0], projected[0][1]);
        ctx.lineTo(projected[1][0], projected[1][1]);
        ctx.lineTo(projected[2][0], projected[2][1]);
        ctx.lineTo(projected[3][0], projected[3][1]);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  function init() {
    resize();
    boxes = [];
    for (let i = 0; i < BOX_COUNT; i++) {
      boxes.push(new Box());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    for (const box of boxes) {
      box.update();
      box.draw();
    }

    // Decay scroll
    scrollSpeed *= 0.9;

    requestAnimationFrame(animate);
  }

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    scrollSpeed = currentY - lastScrollY;
    lastScrollY = currentY;
  }, { passive: true });

  window.addEventListener('resize', resize);

  init();
  animate();
})();
