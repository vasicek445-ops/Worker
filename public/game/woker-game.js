/**
 * Woker Game Engine — Comic Book style scroll-driven story game
 *
 * Dependencies (must be loaded before this script):
 *   - sprites.js  (SPRITES — legacy, Comic object used if available)
 *   - levels.js   (LEVELS, getLevel, getTerrainY)
 *   - parallax.js (Parallax — optional, used for sky gradients)
 */

// Comic, LEVELS, getLevel, getTerrainY etc. are provided by sprites.js and levels.js
// They share the global lexical scope via <script> tags — no redeclaration needed.
// Just verify Comic is available:
if (typeof Comic === 'undefined') {
  console.error('[WokerGame] Comic not found! Load sprites.js before woker-game.js.');
}


// =============================================================================
// WokerGame — Comic Book Engine
// =============================================================================

const WokerGame = {
  // ── Config ───────────────────────────────────────────────
  canvas: null,
  ctx: null,
  wrapper: null,
  container: null,
  canvasW: 900,
  canvasH: 460,
  pixelSize: 3,  // kept for sizing calculations only
  totalWorldWidth: 8000,
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
  lastWorldX: 0,  // for speed calculation

  // ── Init ─────────────────────────────────────────────────
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn('[WokerGame] Canvas not found:', canvasId);
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.wrapper = document.getElementById('game-wrapper');

    // Smooth rendering for comic style
    this.ctx.imageSmoothingEnabled = true;

    // Responsive sizing
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // ── Wheel scroll on canvas → horizontal game movement ──
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const speed = 0.0004;
      this.progress = Math.max(0, Math.min(1, this.progress + e.deltaY * speed));
      this.render(this.progress);
    }, { passive: false });

    // ── Touch drag on mobile → horizontal game movement ──
    let touchStartX = 0;
    let touchStartProgress = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartProgress = this.progress;
      this.canvas.style.cursor = 'grabbing';
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const dx = touchStartX - e.touches[0].clientX;
      const speed = 0.001;
      this.progress = Math.max(0, Math.min(1, touchStartProgress + dx * speed));
      this.render(this.progress);
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.canvas.style.cursor = 'grab';
    }, { passive: true });

    // ── Mouse drag on desktop ──
    let dragging = false;
    let dragStartX = 0;
    let dragStartProgress = 0;
    this.canvas.addEventListener('mousedown', (e) => {
      dragging = true;
      dragStartX = e.clientX;
      dragStartProgress = this.progress;
      this.canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = dragStartX - e.clientX;
      const speed = 0.0008;
      this.progress = Math.max(0, Math.min(1, dragStartProgress + dx * speed));
      this.render(this.progress);
    });
    window.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        this.canvas.style.cursor = 'grab';
      }
    });

    // Initial render
    this.render(0);
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
      'font-family:"Comic Sans MS","Chalkboard SE",sans-serif',
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

    if (this.wrapper) {
      this.wrapper.appendChild(this.endCTA);
    } else {
      this.canvas.parentElement.appendChild(this.endCTA);
    }
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
    this.ctx.imageSmoothingEnabled = true;

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

    // Speed for effects
    const speed = Math.abs(this.worldX - this.lastWorldX);
    this.lastWorldX = this.worldX;

    // Current level
    const level = (typeof getLevel === 'function')
      ? getLevel(this.worldX)
      : null;

    // Character walk frame
    this.walkFrame = this.worldX / 30;

    // Character Y from terrain
    this.characterY = (typeof getTerrainY === 'function')
      ? getTerrainY(this.worldX)
      : H - 100;

    // Wooky spawns after mystery box (Level 2, x=1300)
    if (!this.wookySpawned && this.worldX > 1300) {
      this.wookySpawned = true;
    }

    // End screen after 95%
    this.showEndScreen = progress > 0.95;

    // ── Clear canvas
    ctx.clearRect(0, 0, W, H);

    // ── 1. Background (comic style painted look)
    this._drawComicBackground(ctx, W, H, level);

    // ── 2. Ground
    this._drawGround(ctx, W, H, level);

    // ── 3. Level elements from ALL levels visible in viewport
    if (typeof LEVELS !== 'undefined') {
      LEVELS.forEach(lv => this.drawElements(ctx, lv));
    } else {
      this.drawElements(ctx, level);
    }

    // ── 4. Speed lines behind character when moving fast
    if (speed > 5) {
      const cx = W / 2;
      const cy = this.characterY - 20;
      Comic.drawSpeedLines(ctx, cx - 80, cy - 15, 60, 30);
    }

    // ── 5. Main character
    this.drawCharacter(ctx);

    // ── 6. Wooky companion
    if (this.wookySpawned) {
      this.drawWooky(ctx);
    }

    // ── 7. Collection effects
    this._updateCollectEffects();
    this.collectEffects.forEach(e => this.drawCollectEffect(ctx, e));

    // ── 8. HUD — removed (bottom progress bar replaces it)

    // ── 9. Instruction (speech bubble from Wooky)
    if (progress < 0.05) {
      this.instructionOpacity = 1 - (progress / 0.05);
      this._drawInstruction(ctx, W, H);
    }

    // ── 10. End screen (just confetti)
    if (this.showEndScreen) {
      this.updateConfetti();
      this.confettiParticles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life || 1;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = p.color;
        Comic.roundedRect(ctx, -p.size / 2, -p.size / 2, p.size, p.size * 0.6, 1, p.color, null);
        ctx.restore();
      });
    }

    // ── 11. Comic panel border
    this._drawPanelBorder(ctx, W, H);

    // ── 12. Bottom progress bar (loading style)
    this._drawBottomProgressBar(ctx, W, H, progress);
  },

  // ── Comic Panel Border ─────────────────────────────────────
  _drawPanelBorder(ctx, W, H) {
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, W - 4, H - 4);
    // Inner highlight line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, W - 10, H - 10);
  },

  // ── Bottom Progress Bar (game loading style) ──────────────
  _drawBottomProgressBar(ctx, W, H, progress) {
    const barH = 22;
    const margin = 8;
    const barW = W - margin * 2;
    const barX = margin;
    const barY = H - barH - margin;
    const pct = Math.round(progress * 100);

    ctx.save();

    // Dark background panel
    Comic.roundedRect(ctx, barX - 2, barY - 2, barW + 4, barH + 4, 6, 'rgba(0,0,0,0.7)', null);

    // Bar track (dark inset)
    Comic.roundedRect(ctx, barX, barY, barW, barH, 4, '#1a1a2e', null);

    // Inner shadow for depth
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    Comic.roundedRect(ctx, barX + 1, barY + 1, barW - 2, barH - 2, 3, null, 'rgba(0,0,0,0.5)');

    // Filled portion
    const fillW = barW * progress;
    if (fillW > 4) {
      // Clip to rounded bar shape
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(barX + r, barY);
      ctx.lineTo(barX + barW - r, barY);
      ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + r);
      ctx.lineTo(barX + barW, barY + barH - r);
      ctx.quadraticCurveTo(barX + barW, barY + barH, barX + barW - r, barY + barH);
      ctx.lineTo(barX + r, barY + barH);
      ctx.quadraticCurveTo(barX, barY + barH, barX, barY + barH - r);
      ctx.lineTo(barX, barY + r);
      ctx.quadraticCurveTo(barX, barY, barX + r, barY);
      ctx.closePath();
      ctx.clip();

      // Green gradient fill
      const grad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
      grad.addColorStop(0, '#4dff88');
      grad.addColorStop(0.4, '#39ff6e');
      grad.addColorStop(0.6, '#2bcc58');
      grad.addColorStop(1, '#1fa044');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, fillW, barH);

      // Animated shine stripe
      const shineX = barX + ((Date.now() * 0.08) % (barW + 60)) - 30;
      if (shineX < barX + fillW) {
        const shineGrad = ctx.createLinearGradient(shineX - 15, 0, shineX + 15, 0);
        shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
        shineGrad.addColorStop(0.5, 'rgba(255,255,255,0.25)');
        shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = shineGrad;
        ctx.fillRect(shineX - 15, barY, 30, barH);
      }

      // Segment notches (10% marks)
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 10; i++) {
        const nx = barX + barW * (i / 10);
        if (nx < barX + fillW) {
          ctx.beginPath();
          ctx.moveTo(nx, barY);
          ctx.lineTo(nx, barY + barH);
          ctx.stroke();
        }
      }
    }

    ctx.restore();

    // Thick comic border on top
    ctx.save();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    Comic.roundedRect(ctx, barX, barY, barW, barH, 4, null, '#1a1a2e');

    // Percentage text
    const label = pct + '%';
    ctx.font = 'bold 13px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.strokeText(label, W / 2, barY + barH / 2);
    ctx.fillStyle = pct >= 100 ? '#ffd700' : '#ffffff';
    ctx.fillText(label, W / 2, barY + barH / 2);

    // "LOADING..." text on the left when not complete
    if (pct < 100) {
      ctx.font = 'bold 10px "Comic Sans MS", "Chalkboard SE", sans-serif';
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeText('LOADING...', barX + 8, barY + barH / 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('LOADING...', barX + 8, barY + barH / 2);
    } else {
      // "COMPLETE!" when at 100%
      ctx.font = 'bold 10px "Comic Sans MS", "Chalkboard SE", sans-serif';
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeText('KOMPLETNI!', barX + 8, barY + barH / 2);
      ctx.fillStyle = '#ffd700';
      ctx.fillText('KOMPLETNI!', barX + 8, barY + barH / 2);
    }

    ctx.restore();

    // Request animation frame for shine effect when scrolling
    if (this._shineRAF) cancelAnimationFrame(this._shineRAF);
    this._shineRAF = requestAnimationFrame(() => {
      // Only re-render for shine animation if not actively scrolling
    });
  },

  // ── Comic Background ──────────────────────────────────────
  _drawComicBackground(ctx, W, H, level) {
    // Sky gradient
    const skyTop = (level && level.skyGradient) ? level.skyGradient[0] : '#1a1a2e';
    const skyBot = (level && level.skyGradient) ? level.skyGradient[1] : '#16213e';
    const grad = ctx.createLinearGradient(0, 0, 0, H * 0.75);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle Ben-Day dots on sky for comic texture
    const sat = level ? (level.saturation || 0) : 0;
    if (sat < 0.5) {
      Comic.drawBenDayDots(ctx, 0, 0, W, H * 0.6, 'rgba(255,255,255,0.03)', 12);
    }

    // Stars for dark levels
    if (sat < 0.3) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137 + 42) % W);
        const sy = ((i * 97 + 42) % (H * 0.45));
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sun for bright levels
    if (sat > 0.5) {
      const sunX = W * 0.82;
      const sunY = H * 0.15;
      // Glow
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 40);
      sunGrad.addColorStop(0, 'rgba(255,236,153,0.5)');
      sunGrad.addColorStop(1, 'rgba(255,236,153,0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = '#fbd38d';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fefcbf';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Background mountains (parallax)
    this._drawBackgroundMountains(ctx, W, H, level);
  },

  // ── Background Mountains (smooth parallax) ────────────────
  _drawBackgroundMountains(ctx, W, H, level) {
    const sat = level ? (level.saturation || 0) : 0;
    const groundY = H - 60;

    // Far mountains (0.2x parallax)
    ctx.fillStyle = sat > 0.5 ? '#7a8aaa' : '#3a3a5a';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= W; x += 3) {
      const wx = (x + this.cameraX * 0.2) * 0.015;
      const mtnH = Math.sin(wx) * 50 + Math.cos(wx * 0.6) * 30 + 80;
      ctx.lineTo(x, groundY - mtnH);
    }
    ctx.lineTo(W, groundY);
    ctx.closePath();
    ctx.fill();

    // Mid mountains (0.35x parallax)
    ctx.fillStyle = sat > 0.5 ? '#6a7a9a' : '#2a2a4a';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= W; x += 3) {
      const wx = (x + this.cameraX * 0.35) * 0.02;
      const mtnH = Math.sin(wx + 1) * 35 + Math.cos(wx * 0.5) * 25 + 55;
      ctx.lineTo(x, groundY - mtnH);
    }
    ctx.lineTo(W, groundY);
    ctx.closePath();
    ctx.fill();
  },

  // ── Ground ───────────────────────────────────────────────
  _drawGround(ctx, W, H, level) {
    const groundY = H - 60;
    const groundColor = level && level.groundColor ? level.groundColor : '#2d5016';
    const sat = level ? (level.saturation || 0) : 0;
    const dirtColor = sat < 0.5 ? '#4a4a3a' : '#4a3728';

    // Ground body — smooth painted look
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    groundGrad.addColorStop(0, groundColor);
    groundGrad.addColorStop(0.15, groundColor);
    groundGrad.addColorStop(1, dirtColor);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Grass edge — wavy line on top
    ctx.strokeStyle = '#3d7a1e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= W; x += 8) {
      const wx = x + this.cameraX;
      const wave = Math.sin(wx * 0.08) * 2 + Math.sin(wx * 0.15) * 1;
      ctx.lineTo(x, groundY + wave);
    }
    ctx.stroke();

    // Horizon line
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();
  },

  // ── Character ────────────────────────────────────────────
  drawCharacter(ctx) {
    const cx = this.canvasW / 2;
    const groundY = this.canvasH - 60;
    const baseY = (typeof getTerrainY === 'function')
      ? getTerrainY(this.worldX)
      : groundY;
    const cy = baseY - 5;

    Comic.drawCharacter(ctx, cx, cy, this.pixelSize / 3, this.walkFrame);
  },

  // ── Wooky Companion ──────────────────────────────────────
  drawWooky(ctx) {
    const cx = this.canvasW / 2 - 60;
    const groundY = this.canvasH - 60;
    const baseY = (typeof getTerrainY === 'function')
      ? getTerrainY(this.worldX - 60)
      : groundY;
    const cy = baseY - 2;

    Comic.drawWooky(ctx, cx, cy, this.pixelSize / 3.5, this.walkFrame);
  },

  // ── Level Elements ───────────────────────────────────────
  drawElements(ctx, level) {
    if (!level || !level.elements) return;

    const cam = this.cameraX;
    const W = this.canvasW;
    const groundY = this.canvasH - 60;

    level.elements.forEach(el => {
      const screenX = el.x - cam;
      if (screenX < -300 || screenX > W + 300) return;

      switch (el.type) {
        case 'panelak':
          Comic.drawPanelak(ctx, screenX, groundY, el.scale || 2);
          break;

        case 'chalet':
          Comic.drawChalet(ctx, screenX, groundY, el.scale || 1.5);
          break;

        case 'coin':
          this._drawCoin(ctx, screenX, el);
          break;

        case 'mysteryBox':
          this._drawMysteryBox(ctx, screenX, el);
          break;

        case 'powerUp':
          this._drawPowerUp(ctx, screenX, el);
          break;

        case 'obstacle':
          this._drawObstacle(ctx, screenX, groundY, el);
          break;

        case 'sign':
          Comic.drawRoadSign(ctx, screenX, groundY, el.text || el.label || '');
          break;

        case 'tree':
          Comic.drawTree(ctx, screenX, groundY, el.scale || 1, el.color);
          break;

        case 'bush':
          this._drawBush(ctx, screenX, el);
          break;

        case 'cloud':
          Comic.drawCloud(ctx, screenX, el.y || 50, el.scale || 1, el.color);
          break;

        case 'mountain':
          Comic.drawMountain(ctx, screenX, el.y || 120, el.scale || 2, el.snow);
          break;

        case 'swissFlag':
          Comic.drawSwissFlag(ctx, screenX, el.y || 250, 1);
          break;

        case 'flower':
          Comic.drawFlower(ctx, screenX, el.y || (this.canvasH - 65));
          break;

        case 'textPopup':
          this._drawTextPopup(ctx, screenX, el);
          break;

        case 'platform':
          this._drawPlatform(ctx, screenX, el);
          break;

        case 'lampPost':
          Comic.drawLampPost(ctx, screenX, groundY, 1);
          break;

        case 'bench':
          this._drawBench(ctx, screenX, groundY);
          break;

        case 'princess':
          this._drawPrincess(ctx, screenX, groundY, el);
          break;

        case 'car':
          Comic.drawCar(ctx, screenX, groundY, el.scale || 1.2, el.color || '#cc0000');
          break;

        case 'coupleInCar':
          this._drawCoupleInCar(ctx, screenX, groundY, el);
          break;

        case 'landmark':
          this._drawLandmark(ctx, screenX, groundY, el);
          break;

        case 'heart':
          this._drawHeart(ctx, screenX, el);
          break;

        case 'palmTree':
          this._drawPalmTree(ctx, screenX, groundY, el);
          break;

        default:
          break;
      }

      // Collectible logic (coins, powerUps)
      if ((el.type === 'coin' || el.type === 'powerUp') && !el.collected) {
        const dist = Math.abs(this.worldX - el.x);
        if (dist < 40) {
          el.collected = true;
          this.collectedItems.push(el);
          this.collectEffects.push({
            x: screenX,
            y: (el.y || groundY - 40) - 20,
            label: el.label || '+1',
            alpha: 1,
            vy: -2,
          });
        }
      }
    });
  },

  // ── Coin ──
  _drawCoin(ctx, screenX, el) {
    if (el.collected) return;
    const y = el.y || (this.canvasH - 100);
    const bobble = Math.sin(this.worldX * 0.05 + el.x * 0.1) * 4;
    Comic.drawCoin(ctx, screenX, y + bobble, 1, el.label);

    // Label above
    if (el.label) {
      ctx.save();
      ctx.font = 'bold 10px "Comic Sans MS", "Chalkboard SE", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeText(el.label, screenX, y + bobble - 16);
      ctx.fillText(el.label, screenX, y + bobble - 16);
      ctx.restore();
    }
  },

  // ── Mystery Box ──
  _drawMysteryBox(ctx, screenX, el) {
    const y = el.y || (this.canvasH - 100);
    const bobble = Math.sin(this.worldX * 0.03) * 3;
    const s = 20;

    // Box
    Comic.roundedRect(ctx, screenX - s, y + bobble - s, s * 2, s * 2, 5, '#ff6b2c', '#cc5520');

    // Inner border
    Comic.roundedRect(ctx, screenX - s + 3, y + bobble - s + 3, s * 2 - 6, s * 2 - 6, 3, null, '#ffaa66');

    // "?" text
    ctx.save();
    ctx.font = 'bold 22px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cc5520';
    ctx.lineWidth = 2;
    ctx.strokeText('?', screenX, y + bobble);
    ctx.fillText('?', screenX, y + bobble);
    ctx.restore();

    // Action word above
    Comic.drawActionWord(ctx, screenX + 25, y + bobble - s - 10, 'WOW!', '#fbbf24', -15);
  },

  // ── Power-Up ──
  _drawPowerUp(ctx, screenX, el) {
    if (el.collected) return;
    const y = el.y || (this.canvasH - 100);
    const bobble = Math.sin(this.worldX * 0.04 + el.x * 0.2) * 5;

    // Glow
    ctx.save();
    const glow = ctx.createRadialGradient(screenX, y + bobble, 3, screenX, y + bobble, 25);
    glow.addColorStop(0, 'rgba(57,255,110,0.3)');
    glow.addColorStop(1, 'rgba(57,255,110,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(screenX, y + bobble, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Icon based on variant
    const s = 12;
    if (el.variant === 'cv') {
      // Document icon
      Comic.roundedRect(ctx, screenX - s, y + bobble - s * 1.3, s * 2, s * 2.6, 3, '#f5f5f5', '#999');
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CV', screenX, y + bobble - 2);
      // Lines
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(screenX - 6, y + bobble + 4 + i * 4);
        ctx.lineTo(screenX + 6, y + bobble + 4 + i * 4);
        ctx.stroke();
      }
    } else if (el.variant === 'book') {
      // Book icon
      Comic.roundedRect(ctx, screenX - s, y + bobble - s, s * 2, s * 2.2, 3, '#2bcc58', '#1a6b30');
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CH', screenX, y + bobble + 2);
    } else if (el.variant === 'permit') {
      // Permit scroll
      Comic.roundedRect(ctx, screenX - s, y + bobble - s * 1.2, s * 2, s * 2.4, 3, '#f5e6c8', '#c4a880');
      // Red seal
      ctx.fillStyle = '#cc0000';
      ctx.beginPath();
      ctx.arc(screenX + 4, y + bobble + 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PERMIT', screenX, y + bobble - 2);
    }

    // Label above
    if (el.label) {
      ctx.save();
      ctx.font = 'bold 10px "Comic Sans MS", "Chalkboard SE", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#39ff6e';
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeText(el.label, screenX, y + bobble - s * 1.5 - 8);
      ctx.fillText(el.label, screenX, y + bobble - s * 1.5 - 8);
      ctx.restore();
    }
  },

  // ── Obstacle ──
  _drawObstacle(ctx, x, groundY, el) {
    const h = 35;

    // Barrier
    Comic.roundedRect(ctx, x - 18, groundY - h, 36, h, 3, '#9e9e9e', '#666');

    // Red tape stripes
    ctx.save();
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(x - 18, groundY - h + 6, 36, 4);
    ctx.fillRect(x - 18, groundY - h + 18, 36, 4);
    ctx.restore();

    // "STOP!" action word
    Comic.drawActionWord(ctx, x, groundY - h - 12, 'STOP!', '#ef4444', -5);

    if (el.label) {
      ctx.save();
      ctx.font = 'bold 9px "Comic Sans MS", "Chalkboard SE", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(el.label, x, groundY - h + 30);
      ctx.restore();
    }
  },

  // ── Bush ──
  _drawBush(ctx, x, el) {
    const y = el.y || (this.canvasH - 60);
    const color = el.color || '#4a7a3a';
    ctx.save();
    ctx.fillStyle = color;
    // Rounded bush shape
    ctx.beginPath();
    ctx.arc(x - 6, y - 6, 8, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 6, 8, 0, Math.PI * 2);
    ctx.arc(x, y - 10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a5a1a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  },

  // ── Text Popup (speech bubble) ──
  _drawTextPopup(ctx, screenX, el) {
    const y = el.y || 220;
    const dist = Math.abs(this.worldX - el.x);
    if (dist > 200) return;
    const alpha = Math.max(0, 1 - dist / 200);
    ctx.save();
    ctx.globalAlpha = alpha;
    Comic.drawSpeechBubble(ctx, screenX, y, el.text || '', 'down', {
      bg: 'rgba(255,255,255,0.95)',
      border: '#1a1a2e',
      color: '#1a1a2e',
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  },

  // ── Platform ──
  _drawPlatform(ctx, screenX, el) {
    const y = el.y || 300;
    const w = el.width || 80;
    // Wooden platform
    Comic.roundedRect(ctx, screenX, y, w, 10, 3, '#8B4513', '#6b3410');
    // Wood grain lines
    ctx.save();
    ctx.strokeStyle = '#6b3410';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(screenX + 5, y + 2 + i * 3);
      ctx.lineTo(screenX + w - 5, y + 2 + i * 3);
      ctx.stroke();
    }
    ctx.restore();
  },

  // ── Bench ──
  _drawBench(ctx, x, groundY) {
    ctx.save();
    // Seat
    Comic.roundedRect(ctx, x - 14, groundY - 14, 28, 4, 2, '#8b5e34', '#6b4020');
    // Legs
    ctx.fillStyle = '#8b5e34';
    ctx.strokeStyle = '#6b4020';
    ctx.lineWidth = 1;
    ctx.fillRect(x - 11, groundY - 14, 3, 14);
    ctx.strokeRect(x - 11, groundY - 14, 3, 14);
    ctx.fillRect(x + 8, groundY - 14, 3, 14);
    ctx.strokeRect(x + 8, groundY - 14, 3, 14);
    // Back rest
    Comic.roundedRect(ctx, x - 14, groundY - 22, 28, 4, 2, '#8b5e34', '#6b4020');
    ctx.restore();
  },

  // ── Princess ──
  _drawPrincess(ctx, x, groundY, el) {
    const s = el.scale || 1;
    const bobble = Math.sin(Date.now() * 0.003) * 2;
    ctx.save();
    ctx.translate(x, groundY + bobble);

    // Dress (red/gold Swiss style)
    ctx.fillStyle = '#cc2244';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14 * s, -20 * s);
    ctx.lineTo(-20 * s, 0);
    ctx.lineTo(20 * s, 0);
    ctx.lineTo(14 * s, -20 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dress detail — gold belt
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-13 * s, -22 * s, 26 * s, 4 * s);

    // Body
    ctx.fillStyle = '#fcd5b8';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -32 * s, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair (blonde)
    ctx.fillStyle = '#f5d442';
    ctx.beginPath();
    ctx.arc(0, -36 * s, 11 * s, Math.PI, Math.PI * 2);
    ctx.fill();
    // Side curls
    ctx.beginPath();
    ctx.arc(-10 * s, -30 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(10 * s, -30 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();

    // Crown
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8 * s, -44 * s);
    ctx.lineTo(-10 * s, -52 * s);
    ctx.lineTo(-4 * s, -48 * s);
    ctx.lineTo(0, -54 * s);
    ctx.lineTo(4 * s, -48 * s);
    ctx.lineTo(10 * s, -52 * s);
    ctx.lineTo(8 * s, -44 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crown jewels
    ctx.fillStyle = '#cc2244';
    ctx.beginPath();
    ctx.arc(0, -49 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(-4 * s, -33 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.arc(4 * s, -33 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#cc6666';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -29 * s, 4 * s, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#fcd5b8';
    ctx.fillRect(-5 * s, 0, 4 * s, 10 * s);
    ctx.fillRect(1 * s, 0, 4 * s, 10 * s);

    ctx.restore();

    // Swiss cross on dress
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 3, groundY + bobble - 15 * s, 6, 2);
    ctx.fillRect(x - 1, groundY + bobble - 17 * s, 2, 6);
    ctx.restore();
  },

  // ── Couple in Car ──
  _drawCoupleInCar(ctx, x, groundY, el) {
    const s = el.scale || 1.5;
    const bounce = Math.sin(this.worldX * 0.02 + x * 0.01) * 1.5;
    ctx.save();
    ctx.translate(x, groundY + bounce);

    // Car body
    ctx.fillStyle = el.color || '#cc0000';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    // Lower body
    Comic.roundedRect(ctx, -40 * s, -18 * s, 80 * s, 18 * s, 4 * s, el.color || '#cc0000', '#1a1a2e');
    // Cabin
    ctx.fillStyle = '#7ac0f0';
    ctx.beginPath();
    ctx.moveTo(-20 * s, -18 * s);
    ctx.lineTo(-14 * s, -34 * s);
    ctx.lineTo(18 * s, -34 * s);
    ctx.lineTo(24 * s, -18 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Window divider
    ctx.beginPath();
    ctx.moveTo(2 * s, -18 * s);
    ctx.lineTo(2 * s, -33 * s);
    ctx.stroke();

    // Driver (character) - left window
    ctx.fillStyle = '#fcd5b8';
    ctx.beginPath();
    ctx.arc(-8 * s, -28 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Driver hair
    ctx.fillStyle = '#5c3317';
    ctx.beginPath();
    ctx.arc(-8 * s, -31 * s, 5 * s, Math.PI, Math.PI * 2);
    ctx.fill();

    // Princess - right window
    ctx.fillStyle = '#fcd5b8';
    ctx.beginPath();
    ctx.arc(12 * s, -28 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Princess blonde hair
    ctx.fillStyle = '#f5d442';
    ctx.beginPath();
    ctx.arc(12 * s, -31 * s, 5.5 * s, Math.PI, Math.PI * 2);
    ctx.fill();
    // Mini crown
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(8 * s, -35 * s);
    ctx.lineTo(9 * s, -39 * s);
    ctx.lineTo(12 * s, -37 * s);
    ctx.lineTo(15 * s, -39 * s);
    ctx.lineTo(16 * s, -35 * s);
    ctx.closePath();
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-22 * s, 2 * s, 7 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(22 * s, 2 * s, 7 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Hubcaps
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(-22 * s, 2 * s, 3 * s, 0, Math.PI * 2);
    ctx.arc(22 * s, 2 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(40 * s, -8 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Heart above car
    this._drawHeart(ctx, x, { y: groundY + bounce - 44 * s, scale: 0.8, animated: true });
  },

  // ── Heart ──
  _drawHeart(ctx, x, el) {
    const y = el.y || 200;
    const s = el.scale || 1;
    const pulse = el.animated ? (1 + Math.sin(Date.now() * 0.005) * 0.15) : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * pulse, s * pulse);
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-10, -6, -18, 2, -10, 10);
    ctx.lineTo(0, 18);
    ctx.lineTo(10, 10);
    ctx.bezierCurveTo(18, 2, 10, -6, 0, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(-4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // ── Landmark (famous world places) ──
  _drawLandmark(ctx, x, groundY, el) {
    const variant = el.variant || 'eiffel';
    const s = el.scale || 1;
    ctx.save();

    switch (variant) {
      case 'eiffel': {
        // Eiffel Tower
        const h = 100 * s;
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = '#7a7a7a';
        // Main structure
        ctx.beginPath();
        ctx.moveTo(x - 20 * s, groundY);
        ctx.lineTo(x - 8 * s, groundY - h * 0.5);
        ctx.lineTo(x - 5 * s, groundY - h * 0.8);
        ctx.lineTo(x - 2 * s, groundY - h);
        ctx.lineTo(x + 2 * s, groundY - h);
        ctx.lineTo(x + 5 * s, groundY - h * 0.8);
        ctx.lineTo(x + 8 * s, groundY - h * 0.5);
        ctx.lineTo(x + 20 * s, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Platform lines
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1.5;
        [0.35, 0.55, 0.78].forEach(pct => {
          const py = groundY - h * pct;
          const pw = 20 * s * (1 - pct) + 4;
          ctx.beginPath();
          ctx.moveTo(x - pw, py);
          ctx.lineTo(x + pw, py);
          ctx.stroke();
        });
        // Antenna
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, groundY - h);
        ctx.lineTo(x, groundY - h - 12 * s);
        ctx.stroke();
        break;
      }
      case 'pyramid': {
        // Egyptian Pyramid
        const h = 70 * s;
        const w = 80 * s;
        ctx.fillStyle = '#d4a843';
        ctx.strokeStyle = '#8b7320';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, groundY - h);
        ctx.lineTo(x - w / 2, groundY);
        ctx.lineTo(x + w / 2, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Shadow side
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.moveTo(x, groundY - h);
        ctx.lineTo(x + w / 2, groundY);
        ctx.lineTo(x, groundY);
        ctx.closePath();
        ctx.fill();
        // Brick lines
        ctx.strokeStyle = 'rgba(139,115,32,0.3)';
        ctx.lineWidth = 0.5;
        for (let i = 1; i < 6; i++) {
          const py = groundY - h + (h / 6) * i;
          const pw = (w / 2) * (i / 6);
          ctx.beginPath();
          ctx.moveTo(x - pw, py);
          ctx.lineTo(x + pw, py);
          ctx.stroke();
        }
        break;
      }
      case 'statue': {
        // Statue of Liberty (simplified)
        const h = 85 * s;
        ctx.fillStyle = '#6baa87';
        ctx.strokeStyle = '#3a7a5a';
        ctx.lineWidth = 2;
        // Body
        ctx.beginPath();
        ctx.moveTo(x - 10 * s, groundY);
        ctx.lineTo(x - 12 * s, groundY - h * 0.4);
        ctx.lineTo(x - 8 * s, groundY - h * 0.7);
        ctx.lineTo(x - 5 * s, groundY - h * 0.85);
        ctx.lineTo(x + 5 * s, groundY - h * 0.85);
        ctx.lineTo(x + 8 * s, groundY - h * 0.7);
        ctx.lineTo(x + 12 * s, groundY - h * 0.4);
        ctx.lineTo(x + 10 * s, groundY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(x, groundY - h * 0.9, 6 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Crown
        ctx.fillStyle = '#6baa87';
        for (let i = 0; i < 5; i++) {
          const angle = -Math.PI / 2 + (i - 2) * 0.35;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * 6 * s, groundY - h * 0.9 + Math.sin(angle) * 6 * s);
          ctx.lineTo(x + Math.cos(angle) * 12 * s, groundY - h * 0.9 + Math.sin(angle) * 12 * s);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        // Torch (raised arm)
        ctx.beginPath();
        ctx.moveTo(x + 8 * s, groundY - h * 0.75);
        ctx.lineTo(x + 14 * s, groundY - h);
        ctx.lineWidth = 3;
        ctx.stroke();
        // Flame
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x + 14 * s, groundY - h - 4 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'torii': {
        // Japanese Torii gate
        const h = 70 * s;
        ctx.fillStyle = '#cc2200';
        ctx.strokeStyle = '#8b1500';
        ctx.lineWidth = 2;
        // Pillars
        ctx.fillRect(x - 22 * s, groundY - h, 5 * s, h);
        ctx.strokeRect(x - 22 * s, groundY - h, 5 * s, h);
        ctx.fillRect(x + 17 * s, groundY - h, 5 * s, h);
        ctx.strokeRect(x + 17 * s, groundY - h, 5 * s, h);
        // Top beam
        ctx.fillRect(x - 28 * s, groundY - h, 56 * s, 6 * s);
        ctx.strokeRect(x - 28 * s, groundY - h, 56 * s, 6 * s);
        // Curved top
        ctx.beginPath();
        ctx.moveTo(x - 30 * s, groundY - h - 2 * s);
        ctx.quadraticCurveTo(x, groundY - h - 10 * s, x + 30 * s, groundY - h - 2 * s);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#cc2200';
        ctx.stroke();
        // Middle beam
        ctx.fillRect(x - 20 * s, groundY - h + 15 * s, 40 * s, 4 * s);
        break;
      }
      case 'colosseum': {
        // Roman Colosseum
        const h = 60 * s;
        const w = 90 * s;
        ctx.fillStyle = '#c4a882';
        ctx.strokeStyle = '#8a7a60';
        ctx.lineWidth = 2;
        // Main structure (elliptical)
        ctx.beginPath();
        ctx.ellipse(x, groundY - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Arches
        ctx.strokeStyle = '#8a7a60';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 7; i++) {
          const ax = x - w / 2 + 8 + i * (w / 7);
          ctx.beginPath();
          ctx.arc(ax, groundY - h * 0.35, 5 * s, Math.PI, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(ax, groundY - h * 0.65, 4 * s, Math.PI, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
    }

    // Label below
    if (el.label) {
      ctx.font = 'bold 10px "Comic Sans MS", "Chalkboard SE", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeText(el.label, x, groundY + 14);
      ctx.fillText(el.label, x, groundY + 14);
    }

    ctx.restore();
  },

  // ── Palm Tree ──
  _drawPalmTree(ctx, x, groundY, el) {
    const s = el.scale || 1;
    ctx.save();
    // Trunk (curved)
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 6 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.quadraticCurveTo(x + 5 * s, groundY - 40 * s, x - 2 * s, groundY - 70 * s);
    ctx.stroke();

    // Leaves
    const lx = x - 2 * s;
    const ly = groundY - 70 * s;
    const leafColors = ['#2a8a1a', '#3a9a2a', '#1a7a0a'];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.strokeStyle = leafColors[i % 3];
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      const endX = lx + Math.cos(angle) * 30 * s;
      const endY = ly + Math.sin(angle) * 20 * s - 5 * s;
      const cpX = lx + Math.cos(angle) * 20 * s;
      const cpY = ly + Math.sin(angle) * 8 * s - 10 * s;
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
    }
    // Coconuts
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(lx - 3, ly + 3, 3 * s, 0, Math.PI * 2);
    ctx.arc(lx + 3, ly + 2, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // ── Collection Effect ────────────────────────────────────
  drawCollectEffect(ctx, effect) {
    if (effect.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = effect.alpha;
    ctx.font = 'bold 14px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.strokeText(effect.label, effect.x, effect.y);
    ctx.fillStyle = '#22c55e';
    ctx.fillText(effect.label, effect.x, effect.y);
    ctx.globalAlpha = 1;
    ctx.restore();
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

  // ── HUD (comic styled) ──────────────────────────────────
  drawHUD(ctx, level) {
    const W = this.canvasW;

    // Level name in comic panel box
    const levelName = (level && level.nameCS) || (level && level.name) || '';
    if (levelName) {
      const nameW = levelName.length * 7.5 + 20;
      Comic.roundedRect(ctx, 8, 8, nameW, 26, 4, '#ffffff', '#1a1a2e');
      ctx.save();
      ctx.font = 'bold 12px "Comic Sans MS", "Chalkboard SE", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1a1a2e';
      ctx.fillText(levelName, 18, 21);
      ctx.restore();
    }

    // Progress bar with thick border
    const barW = Math.min(200, W * 0.3);
    const barH = 12;
    const barX = W - barW - 16;
    const barY = 12;

    // Bar background
    Comic.roundedRect(ctx, barX, barY, barW, barH, 4, '#374151', '#1a1a2e');

    // Bar fill
    const fillW = barW * this.progress;
    if (fillW > 2) {
      ctx.save();
      ctx.beginPath();
      // Clip to rounded shape
      const r = 3;
      ctx.moveTo(barX + r, barY + 1);
      ctx.lineTo(barX + fillW - 1, barY + 1);
      ctx.lineTo(barX + fillW - 1, barY + barH - 1);
      ctx.lineTo(barX + r, barY + barH - 1);
      ctx.quadraticCurveTo(barX + 1, barY + barH - 1, barX + 1, barY + barH - r);
      ctx.lineTo(barX + 1, barY + r);
      ctx.quadraticCurveTo(barX + 1, barY + 1, barX + r, barY + 1);
      ctx.closePath();
      ctx.clip();
      const barGrad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
      barGrad.addColorStop(0, '#39ff6e');
      barGrad.addColorStop(1, '#22c55e');
      ctx.fillStyle = barGrad;
      ctx.fillRect(barX, barY, fillW, barH);
      ctx.restore();
    }

    // Thick border on top
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    Comic.roundedRect(ctx, barX, barY, barW, barH, 4, null, '#1a1a2e');

    // Collected items count
    if (this.collectedItems.length > 0) {
      const countText = this.collectedItems.length + 'x';
      Comic.roundedRect(ctx, barX - 42, barY, 36, barH, 4, '#ffffff', '#1a1a2e');
      ctx.save();
      ctx.font = 'bold 10px "Comic Sans MS", "Chalkboard SE", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(countText, barX - 24, barY + barH / 2);
      ctx.restore();
    }
  },

  // ── Instruction Text (speech bubble) ─────────────────────
  _drawInstruction(ctx, W, H) {
    ctx.save();
    ctx.globalAlpha = this.instructionOpacity;

    // Speech bubble from Wooky
    const bubbleX = W / 2;
    const bubbleY = H / 2 - 20;
    Comic.drawSpeechBubble(ctx, bubbleX, bubbleY, 'SCROLLUJ A SLEDUJ PRIBEH', 'down', {
      bg: '#ffffff',
      border: '#1a1a2e',
      color: '#1a1a2e',
      font: 'bold 14px "Comic Sans MS", "Chalkboard SE", sans-serif',
    });

    // Down arrow hint (bouncing)
    const arrowX = W / 2;
    const arrowY = bubbleY + 35;
    const bounce = Math.sin(Date.now() * 0.004) * 5;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY + bounce);
    ctx.lineTo(arrowX, arrowY + bounce + 14);
    ctx.moveTo(arrowX - 6, arrowY + bounce + 8);
    ctx.lineTo(arrowX, arrowY + bounce + 14);
    ctx.lineTo(arrowX + 6, arrowY + bounce + 8);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();
  },

  // ── End Screen ───────────────────────────────────────────
  drawEndScreen(ctx, W, H) {
    const alpha = Math.min(1, (this.progress - 0.95) / 0.05) * 0.85;
    ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
    ctx.fillRect(0, 0, W, H);

    if (alpha < 0.3) return;

    // Confetti
    this.updateConfetti();
    this.confettiParticles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life || 1;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      ctx.fillStyle = p.color;
      Comic.roundedRect(ctx, -p.size / 2, -p.size / 2, p.size, p.size * 0.6, 1, p.color, null);
      ctx.restore();
    });

    // Title
    ctx.save();
    ctx.font = 'bold 24px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.strokeText('SCORE: NOVY ZIVOT', W / 2, H * 0.2);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('SCORE: NOVY ZIVOT', W / 2, H * 0.2);
    ctx.restore();

    // Collected items
    const startY = H * 0.35;
    ctx.save();
    ctx.font = 'bold 14px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this.collectedItems.forEach((item, i) => {
      if (i > 6) return;
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      const text = '+ ' + (item.label || 'Bonus');
      ctx.strokeText(text, W / 2, startY + i * 24);
      ctx.fillText(text, W / 2, startY + i * 24);
    });

    if (this.collectedItems.length === 0) {
      ctx.fillStyle = '#60a5fa';
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeText('TVUJ PRIBEH ZACINA!', W / 2, startY);
      ctx.fillText('TVUJ PRIBEH ZACINA!', W / 2, startY);
    }
    ctx.restore();

    // No CTA — pricing is below on the landing page
  },

  // ── Confetti ─────────────────────────────────────────────
  spawnConfetti() {
    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    for (let i = 0; i < 60; i++) {
      this.confettiParticles.push({
        x: Math.random() * this.canvasW,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.05 + Math.random() * 0.05,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        life: 1.0,
      });
    }
  },

  updateConfetti() {
    if (this.confettiParticles.length === 0 && this.showEndScreen) {
      this.spawnConfetti();
    }

    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const p = this.confettiParticles[i];
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rotation += (p.rotSpeed || 0);
      p.life = (p.life || 1) - 0.005;

      if (p.y > this.canvasH + 20 || p.life <= 0) {
        this.confettiParticles.splice(i, 1);
      }
    }

    if (this.confettiParticles.length < 15 && this.showEndScreen) {
      this.spawnConfetti();
    }
  },

  // ── Comic Text Renderer (replaces drawPixelText) ─────────
  drawComicText(ctx, text, x, y, color, size) {
    if (!text) return;
    size = size || 12;
    ctx.save();
    ctx.font = 'bold ' + size + 'px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Outline for readability
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color || '#ffffff';
    ctx.fillText(text, x, y);
    ctx.restore();
  },
};
