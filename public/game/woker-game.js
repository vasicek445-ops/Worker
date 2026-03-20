/**
 * Woker Game Engine — Mario-style scroll-driven pixel art game
 *
 * Dependencies (must be loaded before this script):
 *   - sprites.js  (SPRITES, drawSprite, cacheSprite)
 *   - levels.js   (LEVELS, getLevel, getTerrainY)
 *   - parallax.js (Parallax)
 */

const WokerGame = {
  // ── Config ───────────────────────────────────────────────
  canvas: null,
  ctx: null,
  wrapper: null,
  container: null,
  canvasW: 900,
  canvasH: 460,
  pixelSize: 3,
  totalWorldWidth: 5000,
  wrapperHeight: 6000,

  // ── State ────────────────────────────────────────────────
  progress: 0,
  worldX: 0,
  cameraX: 0,
  characterY: 0,
  walkFrame: 0,
  wookySpawned: false,
  collectedItems: [],
  showEndScreen: false,
  confettiParticles: [],
  instructionOpacity: 1,
  collectEffects: [],
  skipBtn: null,
  endCTA: null,

  // ── Pixel Font ───────────────────────────────────────────
  // 5x7 bitmap font — each char is an array of 7 rows, each row a 5-bit number
  FONT: {
    'A': [0x04,0x0A,0x11,0x1F,0x11,0x11,0x11],
    'B': [0x1E,0x11,0x11,0x1E,0x11,0x11,0x1E],
    'C': [0x0E,0x11,0x10,0x10,0x10,0x11,0x0E],
    'D': [0x1E,0x11,0x11,0x11,0x11,0x11,0x1E],
    'E': [0x1F,0x10,0x10,0x1E,0x10,0x10,0x1F],
    'F': [0x1F,0x10,0x10,0x1E,0x10,0x10,0x10],
    'G': [0x0E,0x11,0x10,0x17,0x11,0x11,0x0E],
    'H': [0x11,0x11,0x11,0x1F,0x11,0x11,0x11],
    'I': [0x0E,0x04,0x04,0x04,0x04,0x04,0x0E],
    'J': [0x07,0x02,0x02,0x02,0x02,0x12,0x0C],
    'K': [0x11,0x12,0x14,0x18,0x14,0x12,0x11],
    'L': [0x10,0x10,0x10,0x10,0x10,0x10,0x1F],
    'M': [0x11,0x1B,0x15,0x15,0x11,0x11,0x11],
    'N': [0x11,0x19,0x15,0x13,0x11,0x11,0x11],
    'O': [0x0E,0x11,0x11,0x11,0x11,0x11,0x0E],
    'P': [0x1E,0x11,0x11,0x1E,0x10,0x10,0x10],
    'Q': [0x0E,0x11,0x11,0x11,0x15,0x12,0x0D],
    'R': [0x1E,0x11,0x11,0x1E,0x14,0x12,0x11],
    'S': [0x0E,0x11,0x10,0x0E,0x01,0x11,0x0E],
    'T': [0x1F,0x04,0x04,0x04,0x04,0x04,0x04],
    'U': [0x11,0x11,0x11,0x11,0x11,0x11,0x0E],
    'V': [0x11,0x11,0x11,0x11,0x0A,0x0A,0x04],
    'W': [0x11,0x11,0x11,0x15,0x15,0x1B,0x11],
    'X': [0x11,0x11,0x0A,0x04,0x0A,0x11,0x11],
    'Y': [0x11,0x11,0x0A,0x04,0x04,0x04,0x04],
    'Z': [0x1F,0x01,0x02,0x04,0x08,0x10,0x1F],
    '0': [0x0E,0x11,0x13,0x15,0x19,0x11,0x0E],
    '1': [0x04,0x0C,0x04,0x04,0x04,0x04,0x0E],
    '2': [0x0E,0x11,0x01,0x06,0x08,0x10,0x1F],
    '3': [0x0E,0x11,0x01,0x06,0x01,0x11,0x0E],
    '4': [0x02,0x06,0x0A,0x12,0x1F,0x02,0x02],
    '5': [0x1F,0x10,0x1E,0x01,0x01,0x11,0x0E],
    '6': [0x06,0x08,0x10,0x1E,0x11,0x11,0x0E],
    '7': [0x1F,0x01,0x02,0x04,0x08,0x08,0x08],
    '8': [0x0E,0x11,0x11,0x0E,0x11,0x11,0x0E],
    '9': [0x0E,0x11,0x11,0x0F,0x01,0x02,0x0C],
    ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00],
    '.': [0x00,0x00,0x00,0x00,0x00,0x00,0x04],
    ',': [0x00,0x00,0x00,0x00,0x00,0x04,0x08],
    '!': [0x04,0x04,0x04,0x04,0x04,0x00,0x04],
    '?': [0x0E,0x11,0x01,0x06,0x04,0x00,0x04],
    ':': [0x00,0x00,0x04,0x00,0x00,0x04,0x00],
    '-': [0x00,0x00,0x00,0x0E,0x00,0x00,0x00],
    '+': [0x00,0x04,0x04,0x1F,0x04,0x04,0x00],
    '/': [0x01,0x01,0x02,0x04,0x08,0x10,0x10],
    '(': [0x02,0x04,0x08,0x08,0x08,0x04,0x02],
    ')': [0x08,0x04,0x02,0x02,0x02,0x04,0x08],
    // Czech diacritics — mapped to base letter glyphs (caron/accent drawn above)
    '\u010C': null, // C with caron
    '\u010D': null, // c with caron
    '\u0160': null, // S with caron
    '\u0161': null, // s with caron
    '\u017D': null, // Z with caron
    '\u017E': null, // z with caron
    '\u0158': null, // R with caron
    '\u0159': null, // r with caron
    '\u0147': null, // N with caron
    '\u0148': null, // n with caron
    '\u0164': null, // T with caron
    '\u0165': null, // t with caron
    '\u010E': null, // D with caron
    '\u010F': null, // d with caron
    '\u00C1': null, // A acute
    '\u00E1': null, // a acute
    '\u00C9': null, // E acute
    '\u00E9': null, // e acute
    '\u00CD': null, // I acute
    '\u00ED': null, // i acute
    '\u00DA': null, // U acute
    '\u00FA': null, // u acute
    '\u016E': null, // U ring
    '\u016F': null, // u ring
    '\u00DD': null, // Y acute
    '\u00FD': null, // y acute
  },

  // Map Czech chars to base letter + diacritic type
  DIACRITICS: {
    '\u010C':'C','\u010D':'C','\u0160':'S','\u0161':'S','\u017D':'Z','\u017E':'Z',
    '\u0158':'R','\u0159':'R','\u0147':'N','\u0148':'N','\u0164':'T','\u0165':'T',
    '\u010E':'D','\u010F':'D',
    '\u00C1':'A','\u00E1':'A','\u00C9':'E','\u00E9':'E','\u00CD':'I','\u00ED':'I',
    '\u00DA':'U','\u00FA':'U','\u016E':'U','\u016F':'U','\u00DD':'Y','\u00FD':'Y',
  },

  CARONS: new Set([
    '\u010C','\u010D','\u0160','\u0161','\u017D','\u017E',
    '\u0158','\u0159','\u0147','\u0148','\u0164','\u0165',
    '\u010E','\u010F',
  ]),

  RINGS: new Set(['\u016E','\u016F']),

  // ── Init ─────────────────────────────────────────────────
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn('[WokerGame] Canvas not found:', canvasId);
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.wrapper = document.getElementById('game-wrapper');
    this.container = document.getElementById('game-sticky');

    if (!this.wrapper || !this.container) {
      console.warn('[WokerGame] Missing #game-wrapper or #game-sticky');
      return;
    }

    // Crisp pixel art
    this.ctx.imageSmoothingEnabled = false;

    // Responsive sizing
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Scroll listener — passive, RAF debounced
    let rafId = null;
    window.addEventListener('scroll', () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const p = this.getScrollProgress();
        this.render(p);
        rafId = null;
      });
    }, { passive: true });

    // Cache sprites if available
    if (typeof cacheSprite === 'function' && typeof SPRITES !== 'undefined') {
      Object.keys(SPRITES).forEach(key => {
        if (SPRITES[key] && SPRITES[key].frames) cacheSprite(SPRITES[key], this.pixelSize);
      });
    }

    // Create skip button
    this._createSkipButton();

    // Initial render
    this.render(0);
  },

  // ── Scroll Progress ──────────────────────────────────────
  getScrollProgress() {
    if (!this.wrapper) return 0;
    const wrapperRect = this.wrapper.getBoundingClientRect();
    const scrollOffset = -wrapperRect.top;
    const maxScroll = this.wrapperHeight - window.innerHeight;
    return Math.max(0, Math.min(1, scrollOffset / maxScroll));
  },

  // ── Skip Button ──────────────────────────────────────────
  _createSkipButton() {
    if (this.skipBtn) return;
    this.skipBtn = document.createElement('button');
    this.skipBtn.textContent = 'P\u0159esko\u010Dit hru \u2192';
    this.skipBtn.style.cssText = [
      'position:absolute',
      'top:12px',
      'right:12px',
      'z-index:20',
      'background:rgba(0,0,0,0.55)',
      'color:#fff',
      'border:1px solid rgba(255,255,255,0.25)',
      'border-radius:6px',
      'padding:6px 14px',
      'font-size:13px',
      'font-family:monospace',
      'cursor:pointer',
      'backdrop-filter:blur(4px)',
      'transition:opacity 0.3s',
    ].join(';');

    this.skipBtn.addEventListener('click', () => {
      if (!this.wrapper) return;
      const wrapperBottom = this.wrapper.offsetTop + this.wrapper.offsetHeight;
      window.scrollTo({ top: wrapperBottom, behavior: 'smooth' });
    });

    // Append to the sticky container so it stays in view
    this.container.style.position = 'relative';
    this.container.appendChild(this.skipBtn);
  },

  // ── End Screen CTA ───────────────────────────────────────
  _createEndCTA() {
    if (this.endCTA) return;
    this.endCTA = document.createElement('a');
    this.endCTA.href = '/pricing';
    this.endCTA.textContent = 'Za\u010Dni te\u010F \u2192';
    this.endCTA.style.cssText = [
      'position:absolute',
      'left:50%',
      'bottom:18%',
      'transform:translateX(-50%)',
      'z-index:30',
      'background:#22c55e',
      'color:#fff',
      'border:none',
      'border-radius:8px',
      'padding:14px 36px',
      'font-size:18px',
      'font-family:monospace',
      'font-weight:bold',
      'cursor:pointer',
      'text-decoration:none',
      'box-shadow:0 4px 20px rgba(34,197,94,0.4)',
      'transition:transform 0.2s',
      'display:none',
    ].join(';');

    this.endCTA.addEventListener('mouseenter', () => {
      this.endCTA.style.transform = 'translateX(-50%) scale(1.05)';
    });
    this.endCTA.addEventListener('mouseleave', () => {
      this.endCTA.style.transform = 'translateX(-50%)';
    });

    this.container.appendChild(this.endCTA);
  },

  // ── Resize Handler ───────────────────────────────────────
  handleResize() {
    const isMobile = window.innerWidth < 768;
    this.canvasW = isMobile
      ? Math.min(360, window.innerWidth - 20)
      : Math.min(900, window.innerWidth - 40);
    this.canvasH = isMobile ? 220 : 460;
    this.pixelSize = isMobile ? 2 : 3;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvasW * dpr;
    this.canvas.height = this.canvasH * dpr;
    this.canvas.style.width = this.canvasW + 'px';
    this.canvas.style.height = this.canvasH + 'px';

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = false;

    // Re-render at current progress
    this.render(this.progress);
  },

  // ── Main Render ──────────────────────────────────────────
  render(progress) {
    this.progress = progress;
    const ctx = this.ctx;
    const W = this.canvasW;
    const H = this.canvasH;

    // Calculate world position
    this.worldX = progress * this.totalWorldWidth;
    this.cameraX = this.worldX - W / 2;

    // Current level
    const level = (typeof getLevel === 'function')
      ? getLevel(this.worldX)
      : null;

    // Character walk frame
    this.walkFrame = Math.floor(this.worldX / 30) % 3;

    // Character Y from terrain
    this.characterY = (typeof getTerrainY === 'function')
      ? getTerrainY(this.worldX)
      : H - 100;

    // Wooky spawns after 60% progress
    this.wookySpawned = progress > 0.6;

    // End screen after 95%
    this.showEndScreen = progress > 0.95;

    // ── Clear canvas
    ctx.clearRect(0, 0, W, H);

    // ── 1. Parallax background
    if (typeof Parallax !== 'undefined' && Parallax.draw) {
      Parallax.draw(ctx, this.cameraX, W, H, level);
    } else {
      this._drawFallbackBackground(ctx, W, H, level);
    }

    // ── 2. Ground tiles
    this._drawGround(ctx, W, H, level);

    // ── 3. Level elements (buildings, items, obstacles)
    this.drawElements(ctx, level);

    // ── 4. Main character
    this.drawCharacter(ctx);

    // ── 5. Wooky companion
    if (this.wookySpawned) {
      this.drawWooky(ctx);
    }

    // ── 6. Collection effects
    this._updateCollectEffects();
    this.collectEffects.forEach(e => this.drawCollectEffect(ctx, e));

    // ── 7. HUD
    this.drawHUD(ctx, level);

    // ── 8. Instruction text at start
    if (progress < 0.05) {
      this.instructionOpacity = 1 - (progress / 0.05);
      this._drawInstruction(ctx, W, H);
    }

    // ── 9. End screen
    if (this.showEndScreen) {
      this.drawEndScreen(ctx, W, H);
    }

    // Toggle end CTA visibility
    if (this.endCTA) {
      this.endCTA.style.display = this.showEndScreen ? 'block' : 'none';
    }

    // Hide skip button at end
    if (this.skipBtn) {
      this.skipBtn.style.opacity = this.showEndScreen ? '0' : '1';
      this.skipBtn.style.pointerEvents = this.showEndScreen ? 'none' : 'auto';
    }
  },

  // ── Fallback Background ──────────────────────────────────
  _drawFallbackBackground(ctx, W, H, level) {
    // Gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Simple parallax mountains
    const ps = this.pixelSize;
    ctx.fillStyle = '#0f3460';
    for (let x = 0; x < W; x += ps) {
      const worldXOff = (x + this.cameraX * 0.3) * 0.02;
      const mtnH = Math.sin(worldXOff) * 40 + Math.cos(worldXOff * 0.7) * 25 + 80;
      ctx.fillRect(x, H * 0.7 - mtnH, ps, mtnH);
    }

    // Mid mountains
    ctx.fillStyle = '#1a1a4e';
    for (let x = 0; x < W; x += ps) {
      const worldXOff = (x + this.cameraX * 0.5) * 0.025;
      const mtnH = Math.sin(worldXOff + 1) * 30 + Math.cos(worldXOff * 0.5) * 20 + 50;
      ctx.fillRect(x, H * 0.7 - mtnH, ps, mtnH);
    }

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const starSeed = 42;
    for (let i = 0; i < 50; i++) {
      const sx = ((i * 137 + starSeed) % W);
      const sy = ((i * 97 + starSeed) % (H * 0.5));
      ctx.fillRect(sx, sy, ps, ps);
    }
  },

  // ── Ground ───────────────────────────────────────────────
  _drawGround(ctx, W, H, level) {
    const ps = this.pixelSize;
    const groundY = H - 60;
    const groundColor = level && level.groundColor ? level.groundColor : '#2d5016';
    const dirtColor = level && level.dirtColor ? level.dirtColor : '#4a3728';

    // Grass top
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, groundY, W, ps * 2);

    // Dirt
    ctx.fillStyle = dirtColor;
    ctx.fillRect(0, groundY + ps * 2, W, H - groundY - ps * 2);

    // Grass detail
    ctx.fillStyle = '#3d7a1e';
    for (let x = 0; x < W; x += ps * 4) {
      const worldXTile = x + Math.floor(this.cameraX / ps) * ps;
      if ((worldXTile / ps) % 3 === 0) {
        ctx.fillRect(x, groundY - ps, ps, ps);
      }
    }
  },

  // ── Character ────────────────────────────────────────────
  drawCharacter(ctx) {
    const ps = this.pixelSize;
    const cx = this.canvasW / 2;
    const groundY = this.canvasH - 60;
    const baseY = (typeof getTerrainY === 'function')
      ? getTerrainY(this.worldX)
      : groundY;
    const cy = baseY - 36 * ps / 3;

    // Try sprite system first
    if (typeof drawSprite === 'function' && typeof SPRITES !== 'undefined' && SPRITES.czechWorker) {
      drawSprite(ctx, SPRITES.czechWorker, this.walkFrame, cx - 12 * ps / 3, cy, ps);
      return;
    }

    // Fallback: draw pixel character
    this._drawPixelCharacter(ctx, cx, cy, ps);
  },

  _drawPixelCharacter(ctx, cx, cy, ps) {
    const s = ps;
    const frame = this.walkFrame;

    // Hard hat (yellow)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cx - 4*s, cy - 2*s, 8*s, 2*s);
    ctx.fillRect(cx - 3*s, cy - 4*s, 6*s, 2*s);

    // Face
    ctx.fillStyle = '#fcd9b6';
    ctx.fillRect(cx - 3*s, cy, 6*s, 5*s);

    // Eyes
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(cx - 2*s, cy + 1*s, s, s);
    ctx.fillRect(cx + 1*s, cy + 1*s, s, s);

    // Mouth
    ctx.fillRect(cx - 1*s, cy + 3*s, 2*s, s);

    // Body (blue work shirt)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(cx - 4*s, cy + 5*s, 8*s, 8*s);

    // Arms
    const armOffset = frame === 1 ? s : 0;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(cx - 6*s, cy + 5*s + armOffset, 2*s, 6*s);
    ctx.fillRect(cx + 4*s, cy + 5*s - armOffset, 2*s, 6*s);

    // Hands
    ctx.fillStyle = '#fcd9b6';
    ctx.fillRect(cx - 6*s, cy + 11*s + armOffset, 2*s, 2*s);
    ctx.fillRect(cx + 4*s, cy + 11*s - armOffset, 2*s, 2*s);

    // Pants (dark)
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(cx - 4*s, cy + 13*s, 3*s, 6*s);
    ctx.fillRect(cx + 1*s, cy + 13*s, 3*s, 6*s);

    // Boots
    const bootOff1 = frame === 0 ? s : 0;
    const bootOff2 = frame === 2 ? s : 0;
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(cx - 5*s, cy + 19*s - bootOff1, 4*s, 3*s);
    ctx.fillRect(cx + 1*s, cy + 19*s - bootOff2, 4*s, 3*s);
  },

  // ── Wooky Companion ──────────────────────────────────────
  drawWooky(ctx) {
    const ps = this.pixelSize;
    const cx = this.canvasW / 2 - 60;
    const groundY = this.canvasH - 60;
    const baseY = (typeof getTerrainY === 'function')
      ? getTerrainY(this.worldX - 60)
      : groundY;
    const cy = baseY - 28 * ps / 3;

    // Try sprite system first
    if (typeof drawSprite === 'function' && typeof SPRITES !== 'undefined' && SPRITES.wookyRobot) {
      drawSprite(ctx, SPRITES.wookyRobot, this.walkFrame, cx - 10 * ps / 3, cy, ps);
      return;
    }

    // Fallback: pixel Wooky robot
    this._drawPixelWooky(ctx, cx, cy, ps);
  },

  _drawPixelWooky(ctx, cx, cy, ps) {
    const s = ps;
    const bounce = Math.sin(this.worldX * 0.1) * s;

    // Antenna
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx, cy - 3*s + bounce, s, 3*s);
    ctx.fillRect(cx - s, cy - 4*s + bounce, 3*s, s);

    // Head (rounded robot)
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(cx - 4*s, cy + bounce, 8*s, 6*s);

    // Eyes (LED)
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(cx - 3*s, cy + 2*s + bounce, 2*s, 2*s);
    ctx.fillRect(cx + 1*s, cy + 2*s + bounce, 2*s, 2*s);

    // Body
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(cx - 3*s, cy + 6*s + bounce, 6*s, 7*s);

    // Chest light
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cx - s, cy + 8*s + bounce, 2*s, 2*s);

    // Legs
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(cx - 3*s, cy + 13*s + bounce, 2*s, 4*s);
    ctx.fillRect(cx + 1*s, cy + 13*s + bounce, 2*s, 4*s);

    // Feet
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(cx - 4*s, cy + 17*s + bounce, 3*s, 2*s);
    ctx.fillRect(cx + 1*s, cy + 17*s + bounce, 3*s, 2*s);
  },

  // ── Level Elements ───────────────────────────────────────
  drawElements(ctx, level) {
    if (!level || !level.elements) return;

    const cam = this.cameraX;
    const W = this.canvasW;
    const ps = this.pixelSize;
    const groundY = this.canvasH - 60;

    level.elements.forEach(el => {
      // Only draw elements in viewport (with margin)
      const screenX = el.x - cam;
      if (screenX < -200 || screenX > W + 200) return;

      switch (el.type) {
        case 'building':
          this._drawBuilding(ctx, screenX, groundY, el, ps);
          break;
        case 'item':
          this._drawItem(ctx, screenX, groundY, el, ps);
          break;
        case 'obstacle':
          this._drawObstacle(ctx, screenX, groundY, el, ps);
          break;
        case 'sign':
          this._drawSign(ctx, screenX, groundY, el, ps);
          break;
        case 'tree':
          this._drawTree(ctx, screenX, groundY, el, ps);
          break;
        default:
          break;
      }

      // Item collection logic
      if (el.type === 'item' && !el.collected) {
        const dist = Math.abs(this.worldX - el.x);
        if (dist < 30) {
          el.collected = true;
          this.collectedItems.push(el);
          this.collectEffects.push({
            x: screenX,
            y: groundY - (el.height || 40),
            label: el.label || '+1',
            alpha: 1,
            vy: -2,
          });
        }
      }
    });
  },

  _drawBuilding(ctx, x, groundY, el, ps) {
    const w = (el.width || 80);
    const h = (el.height || 120);
    ctx.fillStyle = el.color || '#4a5568';
    ctx.fillRect(x, groundY - h, w, h);

    // Windows
    ctx.fillStyle = '#fbbf24';
    const winSize = ps * 3;
    for (let wy = groundY - h + 15; wy < groundY - 15; wy += winSize * 3) {
      for (let wx = x + 10; wx < x + w - 10; wx += winSize * 3) {
        ctx.fillRect(wx, wy, winSize, winSize);
      }
    }

    // Label
    if (el.label) {
      this.drawPixelText(ctx, el.label, x + w / 2, groundY - h - 14, '#ffffff', 1);
    }
  },

  _drawItem(ctx, x, groundY, el, ps) {
    if (el.collected) return;

    const y = groundY - (el.height || 40);
    const bobble = Math.sin(this.worldX * 0.05 + el.x * 0.1) * 4;

    // Glow
    ctx.fillStyle = 'rgba(251,191,36,0.25)';
    ctx.fillRect(x - 6*ps, y + bobble - 6*ps, 12*ps, 12*ps);

    // Item (coin/star shape)
    ctx.fillStyle = el.color || '#fbbf24';
    ctx.fillRect(x - 3*ps, y + bobble - 3*ps, 6*ps, 6*ps);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 2*ps, y + bobble - 2*ps, 4*ps, 4*ps);
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(x - ps, y + bobble - ps, 2*ps, 2*ps);

    // Floating label
    if (el.label) {
      this.drawPixelText(ctx, el.label, x, y + bobble - 18, '#fbbf24', 1);
    }
  },

  _drawObstacle(ctx, x, groundY, el, ps) {
    const h = el.height || 30;
    ctx.fillStyle = el.color || '#ef4444';
    ctx.fillRect(x - 10, groundY - h, 20, h);

    // Warning stripes
    ctx.fillStyle = '#fbbf24';
    for (let sy = groundY - h; sy < groundY; sy += ps * 4) {
      ctx.fillRect(x - 10, sy, 20, ps * 2);
    }
  },

  _drawSign(ctx, x, groundY, el, ps) {
    // Post
    ctx.fillStyle = '#8b5e34';
    ctx.fillRect(x - ps, groundY - 50, ps * 2, 50);

    // Sign board
    const textW = (el.label || '').length * 6 + 16;
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(x - textW / 2, groundY - 70, textW, 24);
    ctx.strokeStyle = '#8b5e34';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - textW / 2, groundY - 70, textW, 24);

    if (el.label) {
      this.drawPixelText(ctx, el.label, x, groundY - 62, '#4a3728', 1);
    }
  },

  _drawTree(ctx, x, groundY, el, ps) {
    const h = el.height || 60;
    // Trunk
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(x - 2*ps, groundY - h * 0.4, 4*ps, h * 0.4);

    // Canopy layers
    ctx.fillStyle = el.color || '#22863a';
    ctx.fillRect(x - 8*ps, groundY - h, 16*ps, h * 0.3);
    ctx.fillRect(x - 6*ps, groundY - h * 0.85, 12*ps, h * 0.25);
    ctx.fillRect(x - 10*ps, groundY - h * 0.55, 20*ps, h * 0.2);
  },

  // ── Collection Effect ────────────────────────────────────
  drawCollectEffect(ctx, effect) {
    if (effect.alpha <= 0) return;
    ctx.globalAlpha = effect.alpha;
    this.drawPixelText(ctx, effect.label, effect.x, effect.y, '#22c55e', 1.5);
    ctx.globalAlpha = 1;
  },

  _updateCollectEffects() {
    for (let i = this.collectEffects.length - 1; i >= 0; i--) {
      const e = this.collectEffects[i];
      e.y += e.vy;
      e.alpha -= 0.02;
      if (e.alpha <= 0) {
        this.collectEffects.splice(i, 1);
      }
    }
  },

  // ── HUD ──────────────────────────────────────────────────
  drawHUD(ctx, level) {
    const W = this.canvasW;
    const ps = this.pixelSize;

    // Level name
    if (level && level.name) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(8, 8, level.name.length * 7 + 16, 22);
      this.drawPixelText(ctx, level.name, 16 + (level.name.length * 7) / 2, 14, '#ffffff', 1);
    }

    // Progress bar
    const barW = Math.min(200, W * 0.3);
    const barH = 8;
    const barX = W - barW - 12;
    const barY = 12;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

    ctx.fillStyle = '#374151';
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(barX, barY, barW * this.progress, barH);

    // Collected items count
    if (this.collectedItems.length > 0) {
      const countText = this.collectedItems.length + 'x';
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(barX - 50, barY - 2, 44, barH + 4);
      this.drawPixelText(ctx, countText, barX - 28, barY + 2, '#fbbf24', 1);
    }
  },

  // ── Instruction Text ─────────────────────────────────────
  _drawInstruction(ctx, W, H) {
    ctx.globalAlpha = this.instructionOpacity;

    // Background pill
    const text = 'SCROLLUJ DOLU A SLEDUJ PRIBEH';
    const textW = text.length * 7 + 30;
    const pillX = (W - textW) / 2;
    const pillY = H / 2 - 16;

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(pillX, pillY, textW, 32);

    this.drawPixelText(ctx, text, W / 2, pillY + 11, '#ffffff', 1);

    // Down arrow hint
    const arrowX = W / 2;
    const arrowY = pillY + 40;
    const bounce = Math.sin(Date.now() * 0.004) * 4;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(arrowX - 1, arrowY + bounce, 2, 10);
    ctx.fillRect(arrowX - 4, arrowY + bounce + 7, 8, 2);
    ctx.fillRect(arrowX - 2, arrowY + bounce + 9, 4, 2);

    ctx.globalAlpha = 1;
  },

  // ── End Screen ───────────────────────────────────────────
  drawEndScreen(ctx, W, H) {
    // Overlay
    const alpha = Math.min(1, (this.progress - 0.95) / 0.05) * 0.85;
    ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
    ctx.fillRect(0, 0, W, H);

    if (alpha < 0.3) return;

    // Confetti
    this.updateConfetti();
    this.confettiParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    // Title
    this.drawPixelText(ctx, 'SCORE: NOVY ZIVOT', W / 2, H * 0.2, '#22c55e', 2);

    // Collected items list
    const startY = H * 0.35;
    this.collectedItems.forEach((item, i) => {
      if (i > 6) return; // Max 7 items shown
      const label = item.label || 'Bonus';
      this.drawPixelText(ctx, '+ ' + label, W / 2, startY + i * 22, '#fbbf24', 1);
    });

    if (this.collectedItems.length === 0) {
      this.drawPixelText(ctx, 'TVUJ PRIBEH ZACINA!', W / 2, startY, '#60a5fa', 1);
    }

    // Create CTA if not yet
    this._createEndCTA();
  },

  // ── Confetti ─────────────────────────────────────────────
  spawnConfetti() {
    const colors = ['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899'];
    for (let i = 0; i < 60; i++) {
      this.confettiParticles.push({
        x: Math.random() * this.canvasW,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        size: this.pixelSize + Math.random() * this.pixelSize,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.05 + Math.random() * 0.05,
      });
    }
  },

  updateConfetti() {
    // Spawn once if empty and end screen showing
    if (this.confettiParticles.length === 0 && this.showEndScreen) {
      this.spawnConfetti();
    }

    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const p = this.confettiParticles[i];
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;

      // Remove if off screen
      if (p.y > this.canvasH + 20) {
        this.confettiParticles.splice(i, 1);
      }
    }

    // Respawn if running low during end screen
    if (this.confettiParticles.length < 15 && this.showEndScreen) {
      this.spawnConfetti();
    }
  },

  // ── Pixel Text Renderer ──────────────────────────────────
  drawPixelText(ctx, text, x, y, color, scale) {
    if (!text) return;
    scale = scale || 1;
    const charW = 5;
    const charH = 7;
    const spacing = 1;
    const totalW = text.length * (charW + spacing) - spacing;
    const ps = scale;

    // Center-align
    let cursorX = x - (totalW * ps) / 2;

    const upper = text.toUpperCase();

    for (let i = 0; i < upper.length; i++) {
      let ch = upper[i];
      let baseChar = ch;
      let hasCaron = false;
      let hasAcute = false;
      let hasRing = false;

      // Check Czech diacritics (also check original case)
      const origCh = text[i];
      if (this.DIACRITICS[origCh]) {
        baseChar = this.DIACRITICS[origCh];
        if (this.CARONS.has(origCh)) hasCaron = true;
        else if (this.RINGS.has(origCh)) hasRing = true;
        else hasAcute = true;
      } else if (this.DIACRITICS[ch]) {
        baseChar = this.DIACRITICS[ch];
        if (this.CARONS.has(ch)) hasCaron = true;
        else if (this.RINGS.has(ch)) hasRing = true;
        else hasAcute = true;
      }

      const glyph = this.FONT[baseChar];
      if (glyph) {
        ctx.fillStyle = color;
        for (let row = 0; row < charH; row++) {
          const bits = glyph[row];
          for (let col = 0; col < charW; col++) {
            if (bits & (1 << (charW - 1 - col))) {
              ctx.fillRect(
                cursorX + col * ps,
                y + row * ps,
                ps,
                ps
              );
            }
          }
        }

        // Diacritic marks above the character
        if (hasCaron) {
          ctx.fillRect(cursorX + 1 * ps, y - 2 * ps, ps, ps);
          ctx.fillRect(cursorX + 2 * ps, y - 1 * ps, ps, ps);
          ctx.fillRect(cursorX + 3 * ps, y - 2 * ps, ps, ps);
        } else if (hasAcute) {
          ctx.fillRect(cursorX + 2 * ps, y - 2 * ps, ps, ps);
          ctx.fillRect(cursorX + 3 * ps, y - 3 * ps, ps, ps);
        } else if (hasRing) {
          ctx.fillRect(cursorX + 1.5 * ps, y - 3 * ps, 2 * ps, ps);
          ctx.fillRect(cursorX + 1 * ps, y - 2 * ps, ps, ps);
          ctx.fillRect(cursorX + 3 * ps, y - 2 * ps, ps, ps);
          ctx.fillRect(cursorX + 1.5 * ps, y - 1 * ps, 2 * ps, ps);
        }
      }

      cursorX += (charW + spacing) * ps;
    }
  },
};
