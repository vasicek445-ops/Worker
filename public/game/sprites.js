// =============================================================================
// Woker Comic Book Style Game — Canvas 2D Drawing Functions
// Brand colors: #39ff6e (green), #2bcc58 (dark green), #ff6b2c (orange), #1a1a2e (dark)
// Style: Thick outlines, flat bold colors, Ben-Day dots, hand-drawn feel
// =============================================================================

const Comic = {

  // -------------------------------------------------------------------------
  // Helper: set comic outline style
  // -------------------------------------------------------------------------
  setOutlineStyle(ctx, width) {
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = width || 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  },

  // -------------------------------------------------------------------------
  // Helper: draw rounded rect with thick outline
  // -------------------------------------------------------------------------
  roundedRect(ctx, x, y, w, h, r, fill, stroke) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke !== false) {
      if (typeof stroke === 'string') ctx.strokeStyle = stroke;
      else Comic.setOutlineStyle(ctx, 2.5);
      ctx.stroke();
    }
  },

  // -------------------------------------------------------------------------
  // Draw Ben-Day dots pattern (for comic shading)
  // -------------------------------------------------------------------------
  drawBenDayDots(ctx, x, y, w, h, color, spacing) {
    spacing = spacing || 6;
    const dotR = spacing * 0.25;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = color || 'rgba(0,0,0,0.15)';
    for (let dx = 0; dx < w + spacing; dx += spacing) {
      for (let dy = 0; dy < h + spacing; dy += spacing) {
        const offsetX = (Math.floor(dy / spacing) % 2) * (spacing / 2);
        ctx.beginPath();
        ctx.arc(x + dx + offsetX, y + dy, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw speed lines (horizontal motion lines behind character)
  // -------------------------------------------------------------------------
  drawSpeedLines(ctx, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    const lineCount = 6;
    for (let i = 0; i < lineCount; i++) {
      const ly = y + (h / (lineCount + 1)) * (i + 1) + (Math.random() - 0.5) * 3;
      const lx = x + Math.random() * w * 0.2;
      const lw = w * (0.4 + Math.random() * 0.6);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + lw, ly);
      ctx.stroke();
    }
    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw star burst (behind action words)
  // -------------------------------------------------------------------------
  drawStarBurst(ctx, x, y, radius, color) {
    const points = 12;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? radius : radius * 0.55;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color || '#ffdd00';
    ctx.fill();
    Comic.setOutlineStyle(ctx, 2);
    ctx.stroke();
    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw comic panel border (thick black frame)
  // -------------------------------------------------------------------------
  drawPanelBorder(ctx, x, y, w, h) {
    ctx.save();
    Comic.setOutlineStyle(ctx, 4);
    ctx.strokeRect(x, y, w, h);
    // Inner shadow lines
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw main character (Czech worker) — side view, walking
  // ~60px tall at scale 1. Brown hair, friendly face, blue jeans, grey t-shirt, sneakers.
  // frame: 0 = stand, 1 = walk left leg forward, 2 = walk right leg forward
  // -------------------------------------------------------------------------
  drawCharacter(ctx, x, y, scale, frame, options) {
    scale = scale || 1;
    frame = frame || 0;
    options = options || {};
    const s = scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    Comic.setOutlineStyle(ctx, 2.5 / s);

    // --- Hair ---
    ctx.beginPath();
    ctx.arc(15, 8, 11, Math.PI, 0, false);
    ctx.closePath();
    ctx.fillStyle = '#5c3317';
    ctx.fill();
    ctx.stroke();

    // --- Head ---
    ctx.beginPath();
    ctx.arc(15, 14, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#fcd9b6';
    ctx.fill();
    ctx.stroke();

    // Hair on top (over head circle)
    ctx.beginPath();
    ctx.moveTo(5, 12);
    ctx.quadraticCurveTo(8, 2, 18, 2);
    ctx.quadraticCurveTo(26, 2, 26, 10);
    ctx.lineTo(26, 12);
    ctx.quadraticCurveTo(24, 8, 18, 6);
    ctx.quadraticCurveTo(12, 6, 5, 12);
    ctx.closePath();
    ctx.fillStyle = '#5c3317';
    ctx.fill();
    ctx.stroke();

    // --- Eye ---
    ctx.beginPath();
    ctx.ellipse(20, 13, 2, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    // Pupil
    ctx.beginPath();
    ctx.arc(21, 13, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    // Eye shine
    ctx.beginPath();
    ctx.arc(21.5, 12, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Eyebrow
    ctx.beginPath();
    ctx.moveTo(18, 9.5);
    ctx.lineTo(23, 9);
    ctx.strokeStyle = '#5c3317';
    ctx.lineWidth = 1.5 / s;
    ctx.stroke();
    Comic.setOutlineStyle(ctx, 2.5 / s);

    // --- Nose ---
    ctx.beginPath();
    ctx.moveTo(23, 14);
    ctx.quadraticCurveTo(25, 16, 23, 17);
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 1.5 / s;
    ctx.stroke();
    Comic.setOutlineStyle(ctx, 2.5 / s);

    // --- Mouth (friendly smile) ---
    ctx.beginPath();
    ctx.arc(20, 19, 3, 0.1, Math.PI - 0.1);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1.5 / s;
    ctx.stroke();
    Comic.setOutlineStyle(ctx, 2.5 / s);

    // --- Ear ---
    ctx.beginPath();
    ctx.ellipse(5, 14, 3, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fcd9b6';
    ctx.fill();
    ctx.stroke();

    // --- Neck ---
    ctx.beginPath();
    ctx.rect(12, 23, 8, 4);
    ctx.fillStyle = '#fcd9b6';
    ctx.fill();

    // --- T-shirt (grey) ---
    ctx.beginPath();
    ctx.moveTo(4, 27);
    ctx.lineTo(8, 27);
    ctx.lineTo(10, 30);
    ctx.lineTo(4, 42);
    ctx.lineTo(4, 27);
    ctx.closePath();
    ctx.fillStyle = '#d0d0d0';
    ctx.fill();
    ctx.stroke();

    // Main torso
    ctx.beginPath();
    ctx.moveTo(8, 27);
    ctx.lineTo(24, 27);
    ctx.lineTo(26, 42);
    ctx.lineTo(4, 42);
    ctx.closePath();
    ctx.fillStyle = '#d0d0d0';
    ctx.fill();
    ctx.stroke();

    // Right sleeve area
    ctx.beginPath();
    ctx.moveTo(24, 27);
    ctx.lineTo(28, 27);
    ctx.lineTo(28, 34);
    ctx.lineTo(24, 34);
    ctx.closePath();
    ctx.fillStyle = '#d0d0d0';
    ctx.fill();
    ctx.stroke();

    // Arm (skin) — right visible arm
    ctx.beginPath();
    ctx.moveTo(26, 34);
    ctx.lineTo(30, 34);
    ctx.lineTo(30, 44);
    ctx.quadraticCurveTo(30, 46, 28, 46);
    ctx.lineTo(26, 46);
    ctx.quadraticCurveTo(24, 46, 24, 44);
    ctx.lineTo(24, 34);
    ctx.closePath();
    ctx.fillStyle = '#fcd9b6';
    ctx.fill();
    ctx.stroke();

    // Hand
    ctx.beginPath();
    ctx.arc(28, 46, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fcd9b6';
    ctx.fill();
    ctx.stroke();

    // --- Belt ---
    ctx.beginPath();
    ctx.rect(4, 41, 22, 3);
    ctx.fillStyle = '#4a3728';
    ctx.fill();
    ctx.stroke();
    // Belt buckle
    ctx.beginPath();
    ctx.rect(13, 41, 4, 3);
    ctx.fillStyle = '#daa520';
    ctx.fill();
    ctx.stroke();

    // --- Jeans ---
    const legSpread = frame === 0 ? 0 : 4;
    const leftLegX = frame === 1 ? 4 : (frame === 2 ? 10 : 6);
    const rightLegX = frame === 1 ? 18 : (frame === 2 ? 14 : 16);
    const leftLegOffY = frame === 1 ? -2 : (frame === 2 ? 2 : 0);
    const rightLegOffY = frame === 1 ? 2 : (frame === 2 ? -2 : 0);

    // Left leg
    ctx.beginPath();
    ctx.moveTo(leftLegX, 44);
    ctx.lineTo(leftLegX + 8, 44);
    ctx.lineTo(leftLegX + 8, 54 + leftLegOffY);
    ctx.lineTo(leftLegX, 54 + leftLegOffY);
    ctx.closePath();
    ctx.fillStyle = '#3b6cb5';
    ctx.fill();
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(rightLegX - 4, 44);
    ctx.lineTo(rightLegX + 4, 44);
    ctx.lineTo(rightLegX + 4, 54 + rightLegOffY);
    ctx.lineTo(rightLegX - 4, 54 + rightLegOffY);
    ctx.closePath();
    ctx.fillStyle = '#3b6cb5';
    ctx.fill();
    ctx.stroke();

    // --- Sneakers ---
    // Left shoe
    ctx.beginPath();
    Comic.setOutlineStyle(ctx, 2 / s);
    ctx.moveTo(leftLegX - 1, 54 + leftLegOffY);
    ctx.lineTo(leftLegX + 11, 54 + leftLegOffY);
    ctx.quadraticCurveTo(leftLegX + 13, 54 + leftLegOffY, leftLegX + 13, 56 + leftLegOffY);
    ctx.lineTo(leftLegX + 13, 58 + leftLegOffY);
    ctx.lineTo(leftLegX - 1, 58 + leftLegOffY);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    // Sole
    ctx.beginPath();
    ctx.rect(leftLegX - 1, 57 + leftLegOffY, 14, 2);
    ctx.fillStyle = '#555555';
    ctx.fill();

    // Right shoe
    ctx.beginPath();
    ctx.moveTo(rightLegX - 5, 54 + rightLegOffY);
    ctx.lineTo(rightLegX + 7, 54 + rightLegOffY);
    ctx.quadraticCurveTo(rightLegX + 9, 54 + rightLegOffY, rightLegX + 9, 56 + rightLegOffY);
    ctx.lineTo(rightLegX + 9, 58 + rightLegOffY);
    ctx.lineTo(rightLegX - 5, 58 + rightLegOffY);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(rightLegX - 5, 57 + rightLegOffY, 14, 2);
    ctx.fillStyle = '#555555';
    ctx.fill();

    Comic.setOutlineStyle(ctx, 2.5 / s);

    // --- Backpack (if traveling) ---
    if (options.backpack !== false) {
      ctx.beginPath();
      ctx.moveTo(0, 28);
      ctx.lineTo(-4, 30);
      ctx.quadraticCurveTo(-8, 30, -8, 34);
      ctx.lineTo(-8, 44);
      ctx.quadraticCurveTo(-8, 47, -5, 47);
      ctx.lineTo(4, 47);
      ctx.lineTo(4, 28);
      ctx.closePath();
      ctx.fillStyle = '#ff6b2c';
      ctx.fill();
      ctx.stroke();
      // Backpack pocket
      Comic.roundedRect(ctx, -6, 35, 8, 7, 2, '#e55a1f', true);
      // Strap
      ctx.beginPath();
      ctx.moveTo(4, 28);
      ctx.quadraticCurveTo(8, 28, 10, 30);
      ctx.strokeStyle = '#cc4400';
      ctx.lineWidth = 2 / s;
      ctx.stroke();
      Comic.setOutlineStyle(ctx, 2.5 / s);
    }

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw Wooky robot companion — cute, green, comic style
  // ~45px tall at scale 1. Green body (#39ff6e), round head, big LED eyes,
  // small antenna, orange chest light (#ff6b2c). Bounces when moving.
  // -------------------------------------------------------------------------
  drawWooky(ctx, x, y, scale, frame) {
    scale = scale || 1;
    frame = frame || 0;
    const s = scale;
    const bounce = Math.sin((frame || 0) * 0.5) * 2;
    ctx.save();
    ctx.translate(x, y + bounce);
    ctx.scale(s, s);
    Comic.setOutlineStyle(ctx, 2.5 / s);

    // --- Antenna ---
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(16, -8);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2 / s;
    ctx.stroke();
    // Antenna ball
    ctx.beginPath();
    ctx.arc(16, -10, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b2c';
    ctx.fill();
    Comic.setOutlineStyle(ctx, 2 / s);
    ctx.stroke();

    // --- Head (round) ---
    Comic.setOutlineStyle(ctx, 2.5 / s);
    ctx.beginPath();
    ctx.arc(16, 10, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#39ff6e';
    ctx.fill();
    ctx.stroke();

    // --- Face plate (lighter area) ---
    ctx.beginPath();
    ctx.ellipse(16, 11, 9, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#5aff8a';
    ctx.fill();
    ctx.stroke();

    // --- Eyes (big, friendly, LED-style) ---
    // Left eye
    ctx.beginPath();
    ctx.ellipse(11, 9, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    // Left pupil
    ctx.beginPath();
    ctx.arc(12, 9, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    // Left eye shine
    ctx.beginPath();
    ctx.arc(12.5, 7.5, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#39ff6e';
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.ellipse(21, 9, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    // Right pupil
    ctx.beginPath();
    ctx.arc(22, 9, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    // Right eye shine
    ctx.beginPath();
    ctx.arc(22.5, 7.5, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#39ff6e';
    ctx.fill();

    // --- Mouth (happy arc) ---
    ctx.beginPath();
    ctx.arc(16, 14, 4, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1.5 / s;
    ctx.stroke();
    Comic.setOutlineStyle(ctx, 2.5 / s);

    // --- Body ---
    ctx.beginPath();
    ctx.moveTo(8, 22);
    ctx.lineTo(24, 22);
    ctx.lineTo(26, 38);
    ctx.lineTo(6, 38);
    ctx.closePath();
    ctx.fillStyle = '#39ff6e';
    ctx.fill();
    ctx.stroke();

    // Chest light (orange circle)
    ctx.beginPath();
    ctx.arc(16, 28, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b2c';
    ctx.fill();
    ctx.stroke();
    // Chest light inner glow
    ctx.beginPath();
    ctx.arc(16, 27, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffaa66';
    ctx.fill();

    // --- Arms ---
    // Left arm
    ctx.beginPath();
    ctx.moveTo(8, 24);
    ctx.lineTo(2, 24);
    ctx.quadraticCurveTo(-1, 24, -1, 27);
    ctx.lineTo(-1, 34);
    ctx.quadraticCurveTo(-1, 37, 2, 37);
    ctx.lineTo(6, 37);
    ctx.lineTo(6, 24);
    ctx.closePath();
    ctx.fillStyle = '#2bcc58';
    ctx.fill();
    ctx.stroke();
    // Left hand (claw)
    ctx.beginPath();
    ctx.arc(1, 37, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#39ff6e';
    ctx.fill();
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(24, 24);
    ctx.lineTo(30, 24);
    ctx.quadraticCurveTo(33, 24, 33, 27);
    ctx.lineTo(33, 34);
    ctx.quadraticCurveTo(33, 37, 30, 37);
    ctx.lineTo(26, 37);
    ctx.lineTo(26, 24);
    ctx.closePath();
    ctx.fillStyle = '#2bcc58';
    ctx.fill();
    ctx.stroke();
    // Right hand
    ctx.beginPath();
    ctx.arc(31, 37, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#39ff6e';
    ctx.fill();
    ctx.stroke();

    // --- Legs ---
    const legPhase = frame % 3;
    const leftOff = legPhase === 1 ? -2 : (legPhase === 2 ? 2 : 0);
    const rightOff = legPhase === 1 ? 2 : (legPhase === 2 ? -2 : 0);

    // Left leg
    Comic.roundedRect(ctx, 8 + leftOff, 38, 6, 8, 2, '#2bcc58', true);
    // Left foot
    Comic.roundedRect(ctx, 6 + leftOff, 45, 10, 4, 2, '#1a8a3e', true);

    // Right leg
    Comic.roundedRect(ctx, 18 + rightOff, 38, 6, 8, 2, '#2bcc58', true);
    // Right foot
    Comic.roundedRect(ctx, 16 + rightOff, 45, 10, 4, 2, '#1a8a3e', true);

    // --- Panel lines (decorative) ---
    ctx.beginPath();
    ctx.moveTo(10, 32);
    ctx.lineTo(22, 32);
    ctx.strokeStyle = '#2bcc58';
    ctx.lineWidth = 1 / s;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 35);
    ctx.lineTo(22, 35);
    ctx.stroke();

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw speech bubble with text
  // tailDir: 'left', 'right', 'down'
  // -------------------------------------------------------------------------
  drawSpeechBubble(ctx, x, y, text, tailDir, options) {
    options = options || {};
    ctx.save();
    const fontSize = options.fontSize || 13;
    ctx.font = `bold ${fontSize}px "Comic Sans MS", "Chalkboard SE", cursive`;
    const padding = 10;
    const maxWidth = options.maxWidth || 180;

    // Word wrap
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';
    for (let i = 1; i < words.length; i++) {
      const test = currentLine + ' ' + words[i];
      if (ctx.measureText(test).width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = test;
      }
    }
    lines.push(currentLine);

    const lineHeight = fontSize * 1.3;
    const textW = Math.min(maxWidth, Math.max(...lines.map(l => ctx.measureText(l).width)));
    const bubbleW = textW + padding * 2;
    const bubbleH = lines.length * lineHeight + padding * 2;
    const bx = x - bubbleW / 2;
    const by = y - bubbleH;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    Comic.roundedRect(ctx, bx + 3, by + 3, bubbleW, bubbleH, 12, 'rgba(0,0,0,0.1)', false);

    // Bubble
    Comic.roundedRect(ctx, bx, by, bubbleW, bubbleH, 12, options.fill || '#ffffff', true);

    // Tail
    ctx.beginPath();
    Comic.setOutlineStyle(ctx, 2);
    if (tailDir === 'left') {
      ctx.moveTo(bx + 15, by + bubbleH - 2);
      ctx.lineTo(bx - 8, by + bubbleH + 14);
      ctx.lineTo(bx + 28, by + bubbleH - 2);
    } else if (tailDir === 'right') {
      ctx.moveTo(bx + bubbleW - 28, by + bubbleH - 2);
      ctx.lineTo(bx + bubbleW + 8, by + bubbleH + 14);
      ctx.lineTo(bx + bubbleW - 15, by + bubbleH - 2);
    } else {
      ctx.moveTo(x - 8, by + bubbleH - 2);
      ctx.lineTo(x, by + bubbleH + 14);
      ctx.lineTo(x + 8, by + bubbleH - 2);
    }
    ctx.fillStyle = options.fill || '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Cover tail join with fill
    ctx.fillStyle = options.fill || '#ffffff';
    if (tailDir === 'left') {
      ctx.fillRect(bx + 14, by + bubbleH - 3, 16, 4);
    } else if (tailDir === 'right') {
      ctx.fillRect(bx + bubbleW - 30, by + bubbleH - 3, 16, 4);
    } else {
      ctx.fillRect(x - 9, by + bubbleH - 3, 18, 4);
    }

    // Text
    ctx.fillStyle = options.textColor || '#1a1a2e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, by + padding + i * lineHeight);
    }

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw thought bubble (smaller circles leading to cloud)
  // -------------------------------------------------------------------------
  drawThoughtBubble(ctx, x, y, text) {
    ctx.save();
    const fontSize = 12;
    ctx.font = `bold ${fontSize}px "Comic Sans MS", cursive`;
    const padding = 10;
    const maxW = 150;

    const words = text.split(' ');
    const lines = [];
    let cur = words[0] || '';
    for (let i = 1; i < words.length; i++) {
      const test = cur + ' ' + words[i];
      if (ctx.measureText(test).width > maxW) { lines.push(cur); cur = words[i]; }
      else cur = test;
    }
    lines.push(cur);

    const lineH = fontSize * 1.3;
    const textW = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)));
    const bw = textW + padding * 2;
    const bh = lines.length * lineH + padding * 2;
    const bx = x - bw / 2;
    const by = y - bh - 20;

    // Leading dots
    Comic.setOutlineStyle(ctx, 2);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 5, y - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 8, y - 16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cloud shape (bumpy rounded rect)
    ctx.beginPath();
    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    const rx = bw / 2 + 5;
    const ry = bh / 2 + 5;
    const bumps = 10;
    for (let i = 0; i <= bumps; i++) {
      const angle = (i / bumps) * Math.PI * 2;
      const bumpR = 6 + Math.sin(i * 3) * 3;
      const px = cx + Math.cos(angle) * rx + Math.cos(angle) * bumpR;
      const py = cy + Math.sin(angle) * ry + Math.sin(angle) * bumpR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    Comic.setOutlineStyle(ctx, 2);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#1a1a2e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, by + padding + i * lineH);
    }
    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw action word ("WOW!", "BOOM!", etc) with comic styling
  // -------------------------------------------------------------------------
  drawActionWord(ctx, x, y, text, color, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation || 0) * Math.PI / 180);
    const fontSize = 22;
    ctx.font = `900 ${fontSize}px "Impact", "Arial Black", sans-serif`;
    const tw = ctx.measureText(text).width;

    // Starburst behind
    Comic.drawStarBurst(ctx, 0, 0, tw * 0.8, color || '#ffdd00');

    // Text with outline
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw Czech apartment building (panelak) — comic style
  // -------------------------------------------------------------------------
  drawPanelak(ctx, x, y, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2.5);

    // Main building body
    Comic.roundedRect(ctx, 0, 0, 80, 100, 3, '#b0b0b0', true);

    // Ben-Day dots for concrete texture
    Comic.drawBenDayDots(ctx, 2, 2, 76, 96, 'rgba(0,0,0,0.08)', 5);

    // Windows (4 columns x 5 rows)
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 5; row++) {
        const wx = 8 + col * 18;
        const wy = 8 + row * 18;
        Comic.roundedRect(ctx, wx, wy, 12, 12, 1, '#7eb8da', true);
        // Window cross
        ctx.beginPath();
        ctx.moveTo(wx + 6, wy);
        ctx.lineTo(wx + 6, wy + 12);
        ctx.moveTo(wx, wy + 6);
        ctx.lineTo(wx + 12, wy + 6);
        ctx.strokeStyle = '#5a8aa5';
        ctx.lineWidth = 1;
        ctx.stroke();
        Comic.setOutlineStyle(ctx, 2.5);
      }
    }

    // Door
    Comic.roundedRect(ctx, 30, 80, 20, 20, 3, '#8b6333', true);
    // Door handle
    ctx.beginPath();
    ctx.arc(44, 92, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#daa520';
    ctx.fill();
    ctx.stroke();

    // Roof line
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(82, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#888888';
    ctx.stroke();

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw Swiss chalet — comic style with charm
  // -------------------------------------------------------------------------
  drawChalet(ctx, x, y, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2.5);

    // Roof (triangle)
    ctx.beginPath();
    ctx.moveTo(40, -20);
    ctx.lineTo(-10, 30);
    ctx.lineTo(90, 30);
    ctx.closePath();
    ctx.fillStyle = '#8b2500';
    ctx.fill();
    ctx.stroke();

    // Roof overhang lines
    ctx.beginPath();
    ctx.moveTo(-12, 30);
    ctx.lineTo(92, 30);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Main body (wood)
    Comic.roundedRect(ctx, 5, 30, 70, 55, 3, '#d4a06a', true);

    // Wood plank lines
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(7, 40 + i * 10);
      ctx.lineTo(73, 40 + i * 10);
      ctx.strokeStyle = '#b8844a';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    Comic.setOutlineStyle(ctx, 2.5);

    // Balcony
    ctx.beginPath();
    ctx.rect(20, 35, 40, 3);
    ctx.fillStyle = '#8b6333';
    ctx.fill();
    ctx.stroke();
    // Balcony rails
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(24 + i * 8, 38);
      ctx.lineTo(24 + i * 8, 50);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#8b6333';
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.rect(20, 49, 40, 2);
    ctx.fillStyle = '#8b6333';
    ctx.fill();

    Comic.setOutlineStyle(ctx, 2.5);

    // Windows
    Comic.roundedRect(ctx, 12, 55, 18, 16, 2, '#7eb8da', true);
    Comic.roundedRect(ctx, 50, 55, 18, 16, 2, '#7eb8da', true);

    // Window shutters (red)
    Comic.roundedRect(ctx, 8, 54, 5, 18, 1, '#cc2222', true);
    Comic.roundedRect(ctx, 31, 54, 5, 18, 1, '#cc2222', true);
    Comic.roundedRect(ctx, 46, 54, 5, 18, 1, '#cc2222', true);
    Comic.roundedRect(ctx, 69, 54, 5, 18, 1, '#cc2222', true);

    // Door
    Comic.roundedRect(ctx, 30, 68, 20, 17, 3, '#5c3317', true);
    ctx.beginPath();
    ctx.arc(44, 78, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#daa520';
    ctx.fill();
    ctx.stroke();

    // Chimney
    Comic.roundedRect(ctx, 58, -10, 10, 25, 2, '#aa4422', true);

    // Flower box under window
    Comic.roundedRect(ctx, 11, 71, 20, 4, 1, '#5c3317', true);
    // Flowers
    const flowerColors = ['#ff4466', '#ffaa22', '#ff66aa'];
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(16 + i * 6, 69, 3, 0, Math.PI * 2);
      ctx.fillStyle = flowerColors[i];
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw car (for the road trip level)
  // -------------------------------------------------------------------------
  drawCar(ctx, x, y, scale, color) {
    scale = scale || 1;
    color = color || '#3b6cb5';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2.5);

    // Body
    ctx.beginPath();
    ctx.moveTo(10, 20);
    ctx.lineTo(10, 10);
    ctx.quadraticCurveTo(10, 5, 15, 5);
    ctx.lineTo(25, 5);
    ctx.lineTo(30, -8);
    ctx.lineTo(55, -8);
    ctx.lineTo(60, 5);
    ctx.lineTo(75, 5);
    ctx.quadraticCurveTo(80, 5, 80, 10);
    ctx.lineTo(80, 20);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    // Windows
    ctx.beginPath();
    ctx.moveTo(32, -5);
    ctx.lineTo(35, 5);
    ctx.lineTo(42, 5);
    ctx.lineTo(42, -5);
    ctx.closePath();
    ctx.fillStyle = '#c8e0f0';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(45, -5);
    ctx.lineTo(45, 5);
    ctx.lineTo(56, 5);
    ctx.lineTo(53, -5);
    ctx.closePath();
    ctx.fillStyle = '#c8e0f0';
    ctx.fill();
    ctx.stroke();

    // Headlight
    ctx.beginPath();
    ctx.ellipse(78, 12, 4, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffdd44';
    ctx.fill();
    ctx.stroke();

    // Taillight
    ctx.beginPath();
    ctx.ellipse(12, 12, 3, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff3333';
    ctx.fill();
    ctx.stroke();

    // Wheels
    ctx.beginPath();
    ctx.arc(25, 22, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(25, 22, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#888888';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(65, 22, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(65, 22, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#888888';
    ctx.fill();

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw mountain with snow cap
  // -------------------------------------------------------------------------
  drawMountain(ctx, x, y, scale, snow) {
    scale = scale || 1;
    snow = snow !== false;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2.5);

    // Mountain body
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(50, 0);
    ctx.lineTo(100, 80);
    ctx.closePath();
    ctx.fillStyle = '#6b7b3a';
    ctx.fill();
    ctx.stroke();

    // Snow cap
    if (snow) {
      ctx.beginPath();
      ctx.moveTo(35, 20);
      ctx.lineTo(50, 0);
      ctx.lineTo(65, 20);
      ctx.quadraticCurveTo(60, 25, 55, 22);
      ctx.quadraticCurveTo(50, 28, 45, 22);
      ctx.quadraticCurveTo(40, 25, 35, 20);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();
    }

    // Rock details
    ctx.beginPath();
    ctx.moveTo(30, 60);
    ctx.lineTo(40, 50);
    ctx.lineTo(50, 60);
    ctx.strokeStyle = '#5a6a2a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(55, 65);
    ctx.lineTo(65, 55);
    ctx.lineTo(72, 65);
    ctx.stroke();

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw tree (comic style — round canopy, trunk)
  // -------------------------------------------------------------------------
  drawTree(ctx, x, y, scale, color) {
    scale = scale || 1;
    color = color || '#2bcc58';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2.5);

    // Trunk
    ctx.beginPath();
    ctx.moveTo(13, 30);
    ctx.lineTo(13, 55);
    ctx.quadraticCurveTo(13, 58, 10, 58);
    ctx.lineTo(22, 58);
    ctx.quadraticCurveTo(19, 58, 19, 55);
    ctx.lineTo(19, 30);
    ctx.closePath();
    ctx.fillStyle = '#8b6333';
    ctx.fill();
    ctx.stroke();

    // Canopy (overlapping circles for organic shape)
    const circles = [
      { cx: 16, cy: 18, r: 16 },
      { cx: 6, cy: 24, r: 12 },
      { cx: 26, cy: 24, r: 12 },
      { cx: 10, cy: 12, r: 11 },
      { cx: 22, cy: 12, r: 11 },
      { cx: 16, cy: 6, r: 10 },
    ];
    // Fill all circles first
    circles.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
    // Then stroke outer ones
    circles.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw coin (golden circle with CHF/Kc text)
  // -------------------------------------------------------------------------
  drawCoin(ctx, x, y, scale, label) {
    scale = scale || 1;
    label = label || 'W';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2.5);

    // Outer ring
    ctx.beginPath();
    ctx.arc(10, 10, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#daa520';
    ctx.fill();
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(10, 10, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.font = 'bold 10px "Arial Black", sans-serif';
    ctx.fillStyle = '#8b6914';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 10, 10);

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw Swiss flag
  // -------------------------------------------------------------------------
  drawSwissFlag(ctx, x, y, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2.5);

    // Red square
    Comic.roundedRect(ctx, 0, 0, 24, 24, 2, '#ff0000', true);

    // White cross
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 4, 6, 16);
    ctx.fillRect(4, 9, 16, 6);

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw couch/sofa (for living room scene)
  // -------------------------------------------------------------------------
  drawCouch(ctx, x, y, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2.5);

    // Back
    Comic.roundedRect(ctx, 0, 0, 80, 25, 6, '#cc5544', true);

    // Seat
    Comic.roundedRect(ctx, 5, 20, 70, 18, 4, '#e06655', true);

    // Arms
    Comic.roundedRect(ctx, -5, 10, 12, 30, 5, '#cc5544', true);
    Comic.roundedRect(ctx, 73, 10, 12, 30, 5, '#cc5544', true);

    // Cushion line
    ctx.beginPath();
    ctx.moveTo(40, 22);
    ctx.lineTo(40, 36);
    ctx.strokeStyle = '#aa3322';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Legs
    ctx.fillStyle = '#5c3317';
    ctx.fillRect(8, 38, 4, 6);
    ctx.fillRect(68, 38, 4, 6);

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw phone/tablet showing TikTok
  // -------------------------------------------------------------------------
  drawPhone(ctx, x, y, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2);

    // Phone body
    Comic.roundedRect(ctx, 0, 0, 20, 36, 3, '#1a1a2e', true);

    // Screen
    Comic.roundedRect(ctx, 2, 4, 16, 26, 1, '#222244', false);

    // TikTok-ish icon (musical note)
    ctx.beginPath();
    ctx.arc(10, 18, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ff3366';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, 18);
    ctx.lineTo(13, 10);
    ctx.lineTo(15, 8);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Home button
    ctx.beginPath();
    ctx.arc(10, 33, 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#444466';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw family group (simple comic people)
  // -------------------------------------------------------------------------
  drawFamily(ctx, x, y, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    function drawPerson(px, py, h, hairColor, shirtColor) {
      Comic.setOutlineStyle(ctx, 2);
      // Head
      ctx.beginPath();
      ctx.arc(px, py, h * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = '#fcd9b6';
      ctx.fill();
      ctx.stroke();
      // Hair
      ctx.beginPath();
      ctx.arc(px, py - h * 0.06, h * 0.18, Math.PI, 0, true);
      ctx.fillStyle = hairColor;
      ctx.fill();
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.arc(px - h * 0.06, py - h * 0.02, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + h * 0.06, py - h * 0.02, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.beginPath();
      ctx.arc(px, py + h * 0.05, h * 0.06, 0, Math.PI);
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Body
      Comic.roundedRect(ctx, px - h * 0.15, py + h * 0.16, h * 0.3, h * 0.35, 3, shirtColor, true);
      // Legs
      ctx.fillStyle = '#3b6cb5';
      ctx.fillRect(px - h * 0.12, py + h * 0.5, h * 0.1, h * 0.3);
      ctx.fillRect(px + h * 0.02, py + h * 0.5, h * 0.1, h * 0.3);
      Comic.setOutlineStyle(ctx, 2);
      ctx.strokeRect(px - h * 0.12, py + h * 0.5, h * 0.1, h * 0.3);
      ctx.strokeRect(px + h * 0.02, py + h * 0.5, h * 0.1, h * 0.3);
    }

    // Dad
    drawPerson(0, 0, 50, '#5c3317', '#3b6cb5');
    // Mom
    drawPerson(25, 3, 45, '#8b4513', '#cc5544');
    // Kid
    drawPerson(12, 16, 30, '#5c3317', '#39ff6e');

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw road sign
  // -------------------------------------------------------------------------
  drawRoadSign(ctx, x, y, text) {
    ctx.save();
    ctx.translate(x, y);
    Comic.setOutlineStyle(ctx, 2.5);

    // Post
    ctx.beginPath();
    ctx.rect(13, 25, 4, 35);
    ctx.fillStyle = '#888888';
    ctx.fill();
    ctx.stroke();

    // Sign board
    Comic.roundedRect(ctx, -5, 0, 40, 25, 4, '#2266aa', true);

    // Border on sign
    Comic.roundedRect(ctx, -2, 3, 34, 19, 2, false, '#ffffff');

    // Text
    ctx.font = 'bold 10px "Arial Black", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || 'CH', 15, 13);

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw lamp post
  // -------------------------------------------------------------------------
  drawLampPost(ctx, x, y, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2);

    // Pole
    ctx.beginPath();
    ctx.rect(8, 15, 4, 55);
    ctx.fillStyle = '#555555';
    ctx.fill();
    ctx.stroke();

    // Arm
    ctx.beginPath();
    ctx.moveTo(10, 15);
    ctx.quadraticCurveTo(10, 5, 20, 5);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#555555';
    ctx.stroke();
    Comic.setOutlineStyle(ctx, 2);

    // Lamp housing
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(26, 0);
    ctx.lineTo(28, 8);
    ctx.lineTo(14, 8);
    ctx.closePath();
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.stroke();

    // Light glow
    ctx.beginPath();
    ctx.ellipse(21, 8, 5, 3, 0, 0, Math.PI);
    ctx.fillStyle = '#ffee88';
    ctx.fill();

    // Base
    ctx.beginPath();
    ctx.moveTo(4, 68);
    ctx.lineTo(16, 68);
    ctx.lineTo(14, 70);
    ctx.lineTo(6, 70);
    ctx.closePath();
    ctx.fillStyle = '#555555';
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw flower
  // -------------------------------------------------------------------------
  drawFlower(ctx, x, y, color) {
    color = color || '#ff6688';
    ctx.save();
    ctx.translate(x, y);
    Comic.setOutlineStyle(ctx, 1.5);

    // Stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-2, 6, 0, 12);
    ctx.strokeStyle = '#2bcc58';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Leaf
    ctx.beginPath();
    ctx.ellipse(4, 7, 4, 2, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#2bcc58';
    ctx.fill();
    Comic.setOutlineStyle(ctx, 1.5);
    ctx.stroke();

    // Petals
    const petals = 5;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const px = Math.cos(angle) * 4;
      const py = Math.sin(angle) * 4;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }

    // Center
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },

  // -------------------------------------------------------------------------
  // Draw cloud
  // -------------------------------------------------------------------------
  drawCloud(ctx, x, y, scale, color) {
    scale = scale || 1;
    color = color || '#ffffff';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    Comic.setOutlineStyle(ctx, 2);

    ctx.beginPath();
    ctx.arc(20, 20, 14, 0, Math.PI * 2);
    ctx.arc(38, 18, 16, 0, Math.PI * 2);
    ctx.arc(55, 20, 13, 0, Math.PI * 2);
    ctx.arc(30, 12, 12, 0, Math.PI * 2);
    ctx.arc(45, 10, 11, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },

};

// Make Comic globally available
if (typeof window !== 'undefined') window.Comic = Comic;

// =============================================================================
// LEGACY STUBS — keep so woker-game.js doesn't error
// =============================================================================

const SPRITES = {
  czechWorker: { width: 16, height: 24, frames: [[]] },
  wookyRobot: { width: 16, height: 16, frames: [[]] },
  panelak: { width: 80, height: 100, frames: [[]] },
  swissChalet: { width: 80, height: 100, frames: [[]] },
  alpsMountains: { width: 100, height: 80, frames: [[]] },
  grassTile: { width: 16, height: 16, frames: [[]] },
  pathTile: { width: 16, height: 16, frames: [[]] },
  greyGrassTile: { width: 16, height: 16, frames: [[]] },
  coin: { width: 16, height: 16, frames: [[]] },
  mysteryBox: { width: 16, height: 16, frames: [[]] },
  cvDocument: { width: 16, height: 16, frames: [[]] },
  book: { width: 16, height: 16, frames: [[]] },
  permitScroll: { width: 16, height: 16, frames: [[]] },
  bureaucracyWall: { width: 16, height: 32, frames: [[]] },
  languageBarrierSign: { width: 16, height: 32, frames: [[]] },
  swissFlag: { width: 16, height: 16, frames: [[]] },

  // Confetti helpers (kept functional)
  confettiColors: ['#39ff6e', '#ff6b2c', '#ffd700', '#ff4444', '#4488ff', '#ff88cc', '#ffffff'],
  createConfettiParticle(x, y) {
    const color = this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)];
    const size = 1 + Math.floor(Math.random() * 3);
    const vx = (Math.random() - 0.5) * 4;
    const vy = -2 - Math.random() * 4;
    return { x, y, vx, vy, gravity: 0.15, color, size, rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.3, life: 1.0 };
  },
  updateConfettiParticle(p) {
    p.x += p.vx;
    p.vy += p.gravity;
    p.y += p.vy;
    p.rotation += p.rotSpeed;
    p.life -= 0.008;
    return p.life > 0;
  },
  drawConfettiParticle(ctx, p, scale) {
    if (p.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size * scale / 2, -p.size * scale / 2, p.size * scale, p.size * scale * 0.6);
    ctx.restore();
  },

  // Legacy rendering stubs
  drawSprite(ctx, sprite, frameIndex, posX, posY, scale) {
    // No-op stub — pixel rendering replaced by Comic.draw* functions
  },
  cacheSprite(sprite, scale) {
    return sprite;
  },
};

// Support both module and script tag usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Comic, SPRITES };
}
