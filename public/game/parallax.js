/**
 * Parallax background rendering system for Woker Mario-style scroll game.
 *
 * Layers (back to front):
 *   L0 — Sky        (0.0x, fixed gradient)
 *   L1 — Clouds     (0.1x, repeating pixel puffs)
 *   L2 — Mountains  (0.2x, silhouettes / Alps)
 *   L3 — Buildings  (0.5x, panelaky / chalets)
 *   L4 — Ground     (1.0x, tiled at groundY)
 *
 * Canvas: 900x460 desktop, 360x200 mobile.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Seeded pseudo-random for deterministic placement (xorshift32). */
function seededRandom(seed) {
  let s = seed | 0 || 1;
  return function () {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return ((s >>> 0) / 4294967296);
  };
}

/** Lerp between two hex colour strings ("#rrggbb"). */
function lerpColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 0xff) * (1 - t) + ((pb >> 16) & 0xff) * t);
  const g = Math.round(((pa >> 8) & 0xff) * (1 - t) + ((pb >> 8) & 0xff) * t);
  const bl = Math.round((pa & 0xff) * (1 - t) + (pb & 0xff) * t);
  return `rgb(${r},${g},${bl})`;
}

// ---------------------------------------------------------------------------
// Pre-computed cloud shapes (pixel art puffs, 8-12px wide)
// Each shape is an array of {dx, dy, w, h} rectangles relative to origin.
// ---------------------------------------------------------------------------

const CLOUD_SHAPES = [
  // Shape 0: wide flat cloud (12px)
  [
    { dx: 2, dy: 4, w: 8, h: 4 },
    { dx: 0, dy: 6, w: 12, h: 3 },
    { dx: 1, dy: 9, w: 10, h: 2 },
  ],
  // Shape 1: tall puff (10px)
  [
    { dx: 3, dy: 2, w: 4, h: 3 },
    { dx: 1, dy: 5, w: 8, h: 4 },
    { dx: 0, dy: 7, w: 10, h: 3 },
  ],
  // Shape 2: small round (8px)
  [
    { dx: 2, dy: 3, w: 4, h: 3 },
    { dx: 0, dy: 5, w: 8, h: 4 },
    { dx: 1, dy: 8, w: 6, h: 2 },
  ],
  // Shape 3: long streaky (12px)
  [
    { dx: 0, dy: 6, w: 12, h: 2 },
    { dx: 2, dy: 4, w: 8, h: 2 },
    { dx: 4, dy: 3, w: 4, h: 1 },
  ],
];

// Repeating tile width for clouds (pixels before the pattern repeats)
const CLOUD_TILE_W = 600;

// Pre-generate cloud positions within one tile
const CLOUD_POSITIONS = (() => {
  const rng = seededRandom(42);
  const positions = [];
  for (let i = 0; i < 8; i++) {
    positions.push({
      x: Math.floor(rng() * CLOUD_TILE_W),
      y: Math.floor(rng() * 60) + 15,  // 15-75px from top
      shape: Math.floor(rng() * CLOUD_SHAPES.length),
      scale: 1.5 + rng() * 2,          // 1.5x - 3.5x
    });
  }
  return positions;
})();

// ---------------------------------------------------------------------------
// Pre-computed star positions (for Czech night levels 1-2)
// ---------------------------------------------------------------------------

const STAR_POSITIONS = (() => {
  const rng = seededRandom(7777);
  const stars = [];
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: rng(),  // 0-1 fraction of canvasW
      y: rng() * 0.45, // upper 45% of canvas
      size: Math.floor(rng() * 2) + 1, // 1 or 2px
      brightness: 0.4 + rng() * 0.6,
    });
  }
  return stars;
})();

// ---------------------------------------------------------------------------
// Mountain generation
// ---------------------------------------------------------------------------

/** Generate simple grey hill points for levels 1-3. */
function drawSimpleHills(ctx, offsetX, canvasW, canvasH, color, baseY, amplitude, wavelength) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, canvasH);
  for (let x = -2; x <= canvasW + 2; x += 4) {
    const worldX = x + offsetX;
    const y = baseY
      - Math.sin(worldX / wavelength) * amplitude
      - Math.sin(worldX / (wavelength * 0.4)) * (amplitude * 0.3)
      - Math.sin(worldX / (wavelength * 1.7)) * (amplitude * 0.5);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvasW, canvasH);
  ctx.closePath();
  ctx.fill();
}

/** Draw Alps-style mountains with snow caps for levels 4-5. */
function drawAlpsMountains(ctx, offsetX, canvasW, canvasH, baseY) {
  const rng = seededRandom(314);
  const peaks = [];
  // Generate peaks across a wide range
  const startX = Math.floor((offsetX - canvasW) / 200) * 200;
  const endX = offsetX + canvasW * 2;
  for (let wx = startX; wx < endX; wx += 200) {
    const localRng = seededRandom(wx * 137);
    peaks.push({
      worldX: wx + localRng() * 100,
      height: 80 + localRng() * 100,
      width: 120 + localRng() * 80,
      snowLine: 0.35 + localRng() * 0.15,
    });
  }

  for (const peak of peaks) {
    const screenX = peak.worldX - offsetX;
    if (screenX < -peak.width || screenX > canvasW + peak.width) continue;

    const peakY = baseY - peak.height;
    const halfW = peak.width / 2;

    // Mountain body (dark grey-blue)
    ctx.fillStyle = '#4a5568';
    ctx.beginPath();
    ctx.moveTo(screenX - halfW, baseY);
    ctx.lineTo(screenX, peakY);
    ctx.lineTo(screenX + halfW, baseY);
    ctx.closePath();
    ctx.fill();

    // Snow cap
    const snowY = peakY + peak.height * peak.snowLine;
    const snowHalfW = halfW * peak.snowLine;
    ctx.fillStyle = '#e8edf2';
    ctx.beginPath();
    ctx.moveTo(screenX - snowHalfW, snowY);
    ctx.lineTo(screenX, peakY);
    ctx.lineTo(screenX + snowHalfW, snowY);
    // Jagged snow line
    const steps = 6;
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const sx = screenX - snowHalfW + (snowHalfW * 2) * t;
      const jag = Math.sin(t * Math.PI * 3) * 6 + Math.sin(t * Math.PI * 7) * 3;
      ctx.lineTo(sx, snowY + jag);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Building generation (L3 — near buildings at 0.5x)
// ---------------------------------------------------------------------------

/** Draw Czech panelaky (panel apartment blocks) for levels 1-2. */
function drawPanelaky(ctx, offsetX, canvasW, canvasH, baseY) {
  const buildingW = 80;
  const gap = 40;
  const period = buildingW + gap;

  const startIdx = Math.floor((offsetX - buildingW) / period);
  const endIdx = Math.ceil((offsetX + canvasW + buildingW) / period);

  for (let i = startIdx; i <= endIdx; i++) {
    const rng = seededRandom(i * 997);
    const worldX = i * period;
    const screenX = worldX - offsetX;

    const floors = 3 + Math.floor(rng() * 5); // 3-7 floors
    const height = floors * 22;
    const topY = baseY - height;
    const w = 60 + Math.floor(rng() * 30);

    // Main block (grey concrete)
    const grey = 140 + Math.floor(rng() * 40);
    ctx.fillStyle = `rgb(${grey},${grey - 5},${grey - 10})`;
    ctx.fillRect(screenX, topY, w, height);

    // Darker edge
    ctx.fillStyle = `rgb(${grey - 25},${grey - 30},${grey - 35})`;
    ctx.fillRect(screenX + w - 4, topY, 4, height);

    // Windows (yellow lit or dark)
    const winW = 8;
    const winH = 10;
    const winGapX = 14;
    const winGapY = 22;
    const winStartX = screenX + 8;
    const winStartY = topY + 6;
    const cols = Math.floor((w - 16) / winGapX);

    for (let fy = 0; fy < floors; fy++) {
      for (let fx = 0; fx < cols; fx++) {
        const lit = rng() > 0.4;
        ctx.fillStyle = lit ? `rgb(${200 + Math.floor(rng() * 55)},${180 + Math.floor(rng() * 40)},${80 + Math.floor(rng() * 40)})` : '#2d3748';
        ctx.fillRect(winStartX + fx * winGapX, winStartY + fy * winGapY, winW, winH);
      }
    }
  }
}

/** Draw Swiss chalets for levels 4-5. */
function drawChalets(ctx, offsetX, canvasW, canvasH, baseY) {
  const period = 180;

  const startIdx = Math.floor((offsetX - 100) / period);
  const endIdx = Math.ceil((offsetX + canvasW + 100) / period);

  for (let i = startIdx; i <= endIdx; i++) {
    const rng = seededRandom(i * 1237);
    const worldX = i * period + Math.floor(rng() * 60);
    const screenX = worldX - offsetX;

    const w = 60 + Math.floor(rng() * 30);
    const wallH = 30 + Math.floor(rng() * 15);
    const roofH = 20 + Math.floor(rng() * 10);
    const topY = baseY - wallH - roofH;

    // Wooden walls
    const brown = 120 + Math.floor(rng() * 40);
    ctx.fillStyle = `rgb(${brown},${brown - 40},${brown - 70})`;
    ctx.fillRect(screenX, baseY - wallH, w, wallH);

    // Roof (dark triangle with overhang)
    const overhang = 10;
    ctx.fillStyle = '#5a3a28';
    ctx.beginPath();
    ctx.moveTo(screenX - overhang, baseY - wallH);
    ctx.lineTo(screenX + w / 2, topY);
    ctx.lineTo(screenX + w + overhang, baseY - wallH);
    ctx.closePath();
    ctx.fill();

    // Snow on roof
    ctx.fillStyle = '#e8edf2';
    ctx.beginPath();
    ctx.moveTo(screenX - overhang + 3, baseY - wallH + 2);
    ctx.lineTo(screenX + w / 2, topY + 2);
    ctx.lineTo(screenX + w + overhang - 3, baseY - wallH + 2);
    ctx.lineTo(screenX + w + overhang - 3, baseY - wallH + 6);
    ctx.lineTo(screenX + w / 2, topY + 7);
    ctx.lineTo(screenX - overhang + 3, baseY - wallH + 6);
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = '#f6e05e';
    const winY = baseY - wallH + 10;
    ctx.fillRect(screenX + 10, winY, 10, 10);
    if (w > 50) {
      ctx.fillRect(screenX + w - 20, winY, 10, 10);
    }

    // Door
    ctx.fillStyle = '#7b341e';
    ctx.fillRect(screenX + w / 2 - 5, baseY - 20, 10, 20);
  }
}

// ---------------------------------------------------------------------------
// Ground tiles (L4 — 1.0x scroll)
// ---------------------------------------------------------------------------

const TILE_COLORS = {
  grass: { top: '#48bb78', body: '#6b4226' },
  dirt: { top: '#a0875c', body: '#6b4226' },
  stone: { top: '#a0aec0', body: '#718096' },
  snow: { top: '#e8edf2', body: '#a0aec0' },
  ice: { top: '#bee3f8', body: '#90cdf4' },
};

// ---------------------------------------------------------------------------
// Parallax — public API
// ---------------------------------------------------------------------------

const Parallax = {
  /**
   * Draw all background layers.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cameraX       — current camera offset in world pixels
   * @param {number} canvasW       — canvas width (900 or 360)
   * @param {number} canvasH       — canvas height (460 or 200)
   * @param {object} level         — level descriptor { skyGradient, tileType, index, ... }
   * @param {number} saturation    — 0 (fully grey) to 1 (full colour)
   */
  drawBackground(ctx, cameraX, canvasW, canvasH, level, saturation) {
    const lvl = level.index ?? 1;
    const groundY = level.groundY ?? (canvasH - 40);
    const scale = canvasW >= 600 ? 1 : canvasW / 600;

    // L0 — Sky
    this.drawSky(ctx, canvasW, canvasH, level.skyGradient, saturation);

    // Stars (Czech night levels)
    if (lvl <= 2 && level.night) {
      this.drawStars(ctx, canvasW, canvasH);
    }

    // Sun
    if (!level.night) {
      const progress = level.progress ?? 0;
      this.drawSun(ctx, canvasW, canvasH, progress);
    }

    // L1 — Clouds
    this.drawClouds(ctx, cameraX, canvasW, canvasH, saturation);

    // L2 — Mountains
    this.drawMountains(ctx, cameraX, canvasW, canvasH, lvl, groundY);

    // L3 — Buildings
    this.drawBuildings(ctx, cameraX, canvasW, canvasH, lvl, groundY);

    // L4 — Ground
    this.drawGround(ctx, cameraX, canvasW, canvasH, groundY, level.tileType ?? 'grass', scale);

    // Saturation overlay (desaturate when saturation < 1)
    if (saturation < 1) {
      ctx.fillStyle = `rgba(128,128,128,${(1 - saturation) * 0.55})`;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
  },

  /**
   * Draw the sky gradient (L0 — fixed, no scroll).
   */
  drawSky(ctx, canvasW, canvasH, gradient, saturation) {
    if (!gradient || gradient.length < 2) {
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(0, 0, canvasW, canvasH);
      return;
    }
    const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
    const step = 1 / (gradient.length - 1);
    for (let i = 0; i < gradient.length; i++) {
      grad.addColorStop(i * step, gradient[i]);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);
  },

  /**
   * Draw tiling pixel-art clouds (L1 — 0.1x scroll).
   */
  drawClouds(ctx, cameraX, canvasW, canvasH, saturation) {
    const parallaxX = cameraX * 0.1;
    const tileOffset = parallaxX % CLOUD_TILE_W;

    ctx.fillStyle = 'rgba(255,255,255,0.85)';

    // Draw two tiles to cover seam
    for (let tile = -1; tile <= 1; tile++) {
      const tileBaseX = tile * CLOUD_TILE_W - tileOffset;
      for (const cloud of CLOUD_POSITIONS) {
        const cx = tileBaseX + cloud.x;
        const cy = cloud.y;
        if (cx + 40 < 0 || cx - 10 > canvasW) continue;
        const shape = CLOUD_SHAPES[cloud.shape];
        const s = cloud.scale;
        for (const rect of shape) {
          ctx.fillRect(
            Math.round(cx + rect.dx * s),
            Math.round(cy + rect.dy * s),
            Math.round(rect.w * s),
            Math.round(rect.h * s)
          );
        }
      }
    }
  },

  /**
   * Draw far mountains (L2 — 0.2x scroll).
   */
  drawMountains(ctx, cameraX, canvasW, canvasH, level, groundY) {
    const parallaxX = cameraX * 0.2;
    const baseY = (groundY ?? canvasH - 40) + 10;

    if (level >= 4) {
      // Alps with snow caps
      drawAlpsMountains(ctx, parallaxX, canvasW, canvasH, baseY);
    } else {
      // Simple grey hills — two layers for depth
      drawSimpleHills(ctx, parallaxX * 0.7, canvasW, canvasH, '#9aadbf', baseY - 10, 30, 300);
      drawSimpleHills(ctx, parallaxX, canvasW, canvasH, '#7a8a9a', baseY, 45, 200);
    }
  },

  /**
   * Draw near buildings/scenery (L3 — 0.5x scroll).
   */
  drawBuildings(ctx, cameraX, canvasW, canvasH, level, groundY) {
    const parallaxX = cameraX * 0.5;
    const baseY = groundY ?? (canvasH - 40);

    if (level >= 4) {
      drawChalets(ctx, parallaxX, canvasW, canvasH, baseY);
    } else {
      drawPanelaky(ctx, parallaxX, canvasW, canvasH, baseY);
    }
  },

  /**
   * Draw repeating ground tiles (L4 — 1.0x scroll).
   */
  drawGround(ctx, cameraX, canvasW, canvasH, groundY, tileType, scale) {
    const colors = TILE_COLORS[tileType] ?? TILE_COLORS.grass;
    const tileW = 32;
    const tileH = canvasH - groundY;

    // Top strip (grass / surface)
    ctx.fillStyle = colors.top;
    ctx.fillRect(0, groundY, canvasW, Math.min(6, tileH));

    // Body (dirt / rock)
    ctx.fillStyle = colors.body;
    ctx.fillRect(0, groundY + 6, canvasW, Math.max(0, tileH - 6));

    // Tile grid lines for texture
    const offsetX = cameraX % tileW;
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let x = -offsetX; x < canvasW; x += tileW) {
      ctx.fillRect(Math.round(x), groundY, 1, tileH);
    }

    // Horizontal sub-line
    if (tileH > 16) {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, groundY + Math.floor(tileH * 0.5), canvasW, 1);
    }

    // Small dirt detail pixels
    const detailRng = seededRandom(12345);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let i = 0; i < 30; i++) {
      const dx = detailRng() * canvasW;
      const dy = groundY + 8 + detailRng() * Math.max(0, tileH - 10);
      ctx.fillRect(((dx - cameraX * 0.3) % canvasW + canvasW) % canvasW, dy, 2, 2);
    }
  },

  /**
   * Draw stars for Czech night sky (levels 1-2).
   */
  drawStars(ctx, canvasW, canvasH) {
    for (const star of STAR_POSITIONS) {
      const x = Math.round(star.x * canvasW);
      const y = Math.round(star.y * canvasH);
      const alpha = star.brightness;
      ctx.fillStyle = `rgba(255,255,240,${alpha})`;
      ctx.fillRect(x, y, star.size, star.size);
    }
  },

  /**
   * Draw a pixel sun that rises as game progresses.
   * @param {number} progress — 0 (start) to 1 (level complete)
   */
  drawSun(ctx, canvasW, canvasH, progress) {
    // Sun rises from lower-right toward upper area
    const startY = canvasH * 0.5;
    const endY = canvasH * 0.12;
    const sunY = startY + (endY - startY) * Math.min(progress, 1);
    const sunX = canvasW * 0.78;
    const radius = 14;

    // Glow
    ctx.fillStyle = 'rgba(255,236,153,0.25)';
    ctx.fillRect(sunX - radius * 2, sunY - radius * 2, radius * 4, radius * 4);

    // Core (pixel circle approximation using rects)
    ctx.fillStyle = '#fbd38d';
    ctx.fillRect(sunX - radius, sunY - radius + 4, radius * 2, radius * 2 - 8);
    ctx.fillRect(sunX - radius + 4, sunY - radius, radius * 2 - 8, radius * 2);
    ctx.fillRect(sunX - radius + 2, sunY - radius + 2, radius * 2 - 4, radius * 2 - 4);

    // Bright center
    ctx.fillStyle = '#fefcbf';
    ctx.fillRect(sunX - 4, sunY - 4, 8, 8);

    // Rays (small pixel lines)
    ctx.fillStyle = 'rgba(251,211,141,0.5)';
    const rayLen = 6;
    // Top
    ctx.fillRect(sunX - 1, sunY - radius - rayLen, 2, rayLen);
    // Bottom
    ctx.fillRect(sunX - 1, sunY + radius, 2, rayLen);
    // Left
    ctx.fillRect(sunX - radius - rayLen, sunY - 1, rayLen, 2);
    // Right
    ctx.fillRect(sunX + radius, sunY - 1, rayLen, 2);
  },
};

// Export for both module and script-tag usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Parallax;
}
