// =============================================================================
// Woker Mario-Style Scroll Game — Level Definitions
// Total world width: 5000px (5 levels x ~1000px each)
// =============================================================================

const TOTAL_WORLD_WIDTH = 5000;

// ---------------------------------------------------------------------------
// Jump arc positions for Level 4 obstacles
// Each entry: { startX, endX, peakY } — defines a parabolic arc the player
// follows when passing over an obstacle
// ---------------------------------------------------------------------------
const JUMP_ARCS = [
  { startX: 3200, endX: 3320, peakY: 260 },  // bureaucracy wall
  { startX: 3550, endX: 3670, peakY: 240 },  // language barrier sign
  { startX: 3800, endX: 3900, peakY: 270 },  // small rubble pile
];

// ---------------------------------------------------------------------------
// Level definitions
// ---------------------------------------------------------------------------
const LEVELS = [
  // =========================================================================
  // Level 1: Ceska republika (0–1000)
  // Feeling: bleak, grey, boring — the monotone Czech grind
  // =========================================================================
  {
    name: 'Czech Republic',
    nameCS: 'Ceska republika',
    startX: 0,
    endX: 1000,
    skyGradient: ['#7a7a7a', '#b0b0b0'],
    groundColor: '#6b6b5e',
    groundY: 360,
    saturation: 0,
    groundTile: 'greyGrassTile',
    elements: [
      // Panelak buildings (background)
      { type: 'panelak', x: 60, y: 220, scale: 2.2 },
      { type: 'panelak', x: 280, y: 240, scale: 1.8 },
      { type: 'panelak', x: 520, y: 210, scale: 2.5 },
      { type: 'panelak', x: 780, y: 230, scale: 2.0 },

      // Small sad coins
      { type: 'coin', x: 150, y: 310, label: '15 000 Kc' },
      { type: 'coin', x: 350, y: 310, label: '15 000 Kc' },
      { type: 'coin', x: 600, y: 310, label: '15 000 Kc' },

      // Ambient details
      { type: 'lampPost', x: 200, y: 290 },
      { type: 'bench', x: 450, y: 345 },
      { type: 'cloud', x: 100, y: 60, scale: 1.2, color: '#999' },
      { type: 'cloud', x: 500, y: 40, scale: 1.0, color: '#aaa' },
      { type: 'cloud', x: 800, y: 70, scale: 0.8, color: '#999' },
    ],
    triggers: [],
  },

  // =========================================================================
  // Level 2: Objev Wokeru (1000–2000)
  // Discovery — mystery box spawns Wooky, first hope appears
  // =========================================================================
  {
    name: 'Discover Woker',
    nameCS: 'Objev Wokeru',
    startX: 1000,
    endX: 2000,
    skyGradient: ['#8a8a9a', '#aab4a8'],
    groundColor: '#7a7a6a',
    groundY: 360,
    saturation: 0.3,
    groundTile: 'greyGrassTile',
    elements: [
      // Transition buildings — still some panelaks but fewer
      { type: 'panelak', x: 1050, y: 240, scale: 1.6 },
      { type: 'panelak', x: 1400, y: 250, scale: 1.4 },

      // Mystery box — the key moment
      { type: 'mysteryBox', x: 1300, y: 280 },

      // First green elements — hope emerges
      { type: 'bush', x: 1500, y: 345, color: '#5a7a4a' },
      { type: 'tree', x: 1700, y: 280, color: '#5a8a4a' },
      { type: 'bush', x: 1850, y: 345, color: '#5a7a4a' },

      // Small coins — slightly better
      { type: 'coin', x: 1150, y: 310, label: '15 000 Kc' },
      { type: 'coin', x: 1600, y: 310, label: '20 000 Kc' },

      // Clouds getting lighter
      { type: 'cloud', x: 1100, y: 50, scale: 1.0, color: '#b0b5b8' },
      { type: 'cloud', x: 1500, y: 70, scale: 1.2, color: '#b5babb' },
      { type: 'cloud', x: 1800, y: 40, scale: 0.9, color: '#c0c5c8' },

      // Text popup when Wooky spawns
      { type: 'textPopup', x: 1350, y: 220, text: 'Wooky: Pojd, ukazу ti cestu!' },
    ],
    triggers: [
      { x: 1300, type: 'spawnWooky' },
    ],
  },

  // =========================================================================
  // Level 3: Priprava (2000–3000)
  // Preparation — collect power-ups (CV, guide book, permit)
  // =========================================================================
  {
    name: 'Preparation',
    nameCS: 'Priprava',
    startX: 2000,
    endX: 3000,
    skyGradient: ['#6a8aaa', '#a0c0a0'],
    groundColor: '#5a8a4a',
    groundY: 360,
    saturation: 0.6,
    groundTile: 'grassTile',
    elements: [
      // Trees and nature — world is greener
      { type: 'tree', x: 2050, y: 270, color: '#4a8a3a' },
      { type: 'tree', x: 2350, y: 260, color: '#3a7a2a' },
      { type: 'bush', x: 2200, y: 345, color: '#4a7a3a' },
      { type: 'tree', x: 2700, y: 275, color: '#4a8a3a' },
      { type: 'bush', x: 2900, y: 345, color: '#4a7a3a' },

      // Platforms at varying heights
      { type: 'platform', x: 2150, y: 300, width: 80 },
      { type: 'platform', x: 2400, y: 270, width: 80 },
      { type: 'platform', x: 2650, y: 290, width: 80 },

      // Power-ups to collect
      { type: 'powerUp', x: 2180, y: 260, variant: 'cv', label: 'Zivotopis' },
      { type: 'powerUp', x: 2430, y: 230, variant: 'book', label: 'Pruvodce DE' },
      { type: 'powerUp', x: 2680, y: 250, variant: 'permit', label: 'Povoleni L/B' },

      // Coins
      { type: 'coin', x: 2100, y: 310, label: '25 000 Kc' },
      { type: 'coin', x: 2500, y: 310, label: '25 000 Kc' },
      { type: 'coin', x: 2850, y: 310, label: '30 000 Kc' },

      // Clouds — whiter, friendlier
      { type: 'cloud', x: 2100, y: 50, scale: 1.1, color: '#dde5ea' },
      { type: 'cloud', x: 2500, y: 30, scale: 1.3, color: '#d5dde2' },
      { type: 'cloud', x: 2800, y: 60, scale: 0.9, color: '#dde5ea' },
    ],
    triggers: [],
  },

  // =========================================================================
  // Level 4: Cesta (3000–4000)
  // The journey — obstacles, mixed terrain, Alps appear on horizon
  // =========================================================================
  {
    name: 'The Journey',
    nameCS: 'Cesta',
    startX: 3000,
    endX: 4000,
    skyGradient: ['#5a8aca', '#90b8d0'],
    groundColor: '#8a7a5a',
    groundY: 360,
    saturation: 0.8,
    groundTile: 'pathTile',
    elements: [
      // Alps mountains — far background
      { type: 'mountain', x: 3100, y: 120, scale: 2.5, color: '#8a9aaa', snow: true },
      { type: 'mountain', x: 3500, y: 100, scale: 3.0, color: '#7a8a9a', snow: true },
      { type: 'mountain', x: 3850, y: 130, scale: 2.2, color: '#8a9aaa', snow: true },

      // Trees along the path
      { type: 'tree', x: 3050, y: 270, color: '#3a7a2a' },
      { type: 'tree', x: 3450, y: 265, color: '#2a6a1a' },
      { type: 'tree', x: 3700, y: 275, color: '#3a7a2a' },

      // Obstacles — player jumps over these
      { type: 'obstacle', x: 3220, y: 340, variant: 'bureaucracyWall', label: 'Byrokracie' },
      { type: 'obstacle', x: 3570, y: 340, variant: 'languageBarrier', label: 'Jazykova bariera' },
      { type: 'obstacle', x: 3820, y: 345, variant: 'rubble', label: '' },

      // Signpost
      { type: 'sign', x: 3000, y: 320, text: 'Schweiz 1000m ->' },

      // Coins — getting better
      { type: 'coin', x: 3100, y: 310, label: '2 000 CHF' },
      { type: 'coin', x: 3400, y: 310, label: '2 000 CHF' },
      { type: 'coin', x: 3750, y: 310, label: '3 000 CHF' },

      // Clouds
      { type: 'cloud', x: 3200, y: 40, scale: 1.0, color: '#e5eaf0' },
      { type: 'cloud', x: 3600, y: 55, scale: 1.2, color: '#e0e8ee' },
    ],
    triggers: [],
  },

  // =========================================================================
  // Level 5: Svycarsko (4000–5000)
  // Switzerland — beautiful, vibrant, coins everywhere, celebration
  // =========================================================================
  {
    name: 'Switzerland',
    nameCS: 'Svycarsko',
    startX: 4000,
    endX: 5000,
    skyGradient: ['#3a7ae0', '#7ac0f0'],
    groundColor: '#3a9a2a',
    groundY: 360,
    saturation: 1.0,
    groundTile: 'grassTile',
    elements: [
      // Alps mountains — prominent, majestic
      { type: 'mountain', x: 4000, y: 80, scale: 3.5, color: '#6a7a8a', snow: true },
      { type: 'mountain', x: 4300, y: 60, scale: 4.0, color: '#5a6a7a', snow: true },
      { type: 'mountain', x: 4700, y: 90, scale: 3.2, color: '#6a7a8a', snow: true },

      // Swiss chalets
      { type: 'chalet', x: 4100, y: 290, scale: 1.5 },
      { type: 'chalet', x: 4500, y: 285, scale: 1.8 },
      { type: 'chalet', x: 4800, y: 290, scale: 1.4 },

      // Swiss flags
      { type: 'swissFlag', x: 4150, y: 250 },
      { type: 'swissFlag', x: 4550, y: 245 },
      { type: 'swissFlag', x: 4850, y: 250 },

      // Trees — lush green
      { type: 'tree', x: 4050, y: 270, color: '#2a8a1a' },
      { type: 'tree', x: 4250, y: 265, color: '#1a7a0a' },
      { type: 'tree', x: 4450, y: 275, color: '#2a8a1a' },
      { type: 'tree', x: 4650, y: 268, color: '#1a7a0a' },
      { type: 'tree', x: 4900, y: 272, color: '#2a8a1a' },

      // BIG coins — lots of them! Swiss salary
      { type: 'coin', x: 4080, y: 310, label: '6 000 CHF' },
      { type: 'coin', x: 4180, y: 295, label: '6 000 CHF' },
      { type: 'coin', x: 4280, y: 310, label: '6 000 CHF' },
      { type: 'coin', x: 4380, y: 300, label: '6 000 CHF' },
      { type: 'coin', x: 4480, y: 310, label: '6 000 CHF' },
      { type: 'coin', x: 4580, y: 290, label: '6 000 CHF' },
      { type: 'coin', x: 4680, y: 310, label: '6 000 CHF' },
      { type: 'coin', x: 4780, y: 305, label: '6 000 CHF' },
      { type: 'coin', x: 4880, y: 310, label: '6 000 CHF' },
      { type: 'coin', x: 4950, y: 295, label: '6 000 CHF' },

      // Flowers — celebrating nature
      { type: 'flower', x: 4120, y: 350 },
      { type: 'flower', x: 4340, y: 352 },
      { type: 'flower', x: 4560, y: 348 },
      { type: 'flower', x: 4750, y: 351 },

      // Clouds — bright white, fluffy
      { type: 'cloud', x: 4100, y: 35, scale: 1.3, color: '#ffffff' },
      { type: 'cloud', x: 4400, y: 50, scale: 1.5, color: '#f8fbff' },
      { type: 'cloud', x: 4700, y: 30, scale: 1.1, color: '#ffffff' },
      { type: 'cloud', x: 4900, y: 55, scale: 0.9, color: '#f8fbff' },
    ],
    triggers: [
      { x: 4500, type: 'confetti' },
    ],
  },
];

// ---------------------------------------------------------------------------
// End screen overlay config (shown when progress > 0.95)
// ---------------------------------------------------------------------------
const END_SCREEN = {
  title: 'SCORE: Novy zivot',
  subtitle: 'Gratulujeme! Dorazil jsi do Svycarska.',
  cta: {
    text: 'Zacni svou cestu ->',
    link: '#pricing',
  },
  background: 'rgba(0, 0, 0, 0.75)',
};

// ---------------------------------------------------------------------------
// Confetti particle config (triggered at Level 5, x > 4500)
// ---------------------------------------------------------------------------
const CONFETTI_CONFIG = {
  colors: ['#ff0000', '#ffffff', '#ffcc00', '#00cc66', '#3399ff'],
  particleCount: 40,
  spread: 120,
  gravity: 0.15,
  fadeOut: 0.98,
};

// ===========================================================================
// Helper functions
// ===========================================================================

/**
 * Returns the current level object for a given world X position.
 * @param {number} worldX — horizontal position in the game world (0–5000)
 * @returns {object} level object from LEVELS array
 */
function getLevel(worldX) {
  const clampedX = Math.max(0, Math.min(worldX, TOTAL_WORLD_WIDTH));
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (clampedX >= LEVELS[i].startX) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Returns 0–1 progress within the current level.
 * @param {number} worldX — horizontal position in the game world
 * @returns {number} progress (0 = level start, 1 = level end)
 */
function getLevelProgress(worldX) {
  const level = getLevel(worldX);
  const levelWidth = level.endX - level.startX;
  if (levelWidth === 0) return 1;
  return Math.max(0, Math.min(1, (worldX - level.startX) / levelWidth));
}

/**
 * Returns the overall game progress (0–1).
 * @param {number} worldX — horizontal position in the game world
 * @returns {number} overall progress
 */
function getOverallProgress(worldX) {
  return Math.max(0, Math.min(1, worldX / TOTAL_WORLD_WIDTH));
}

/**
 * Returns the ground Y position at a given world X, accounting for jump arcs
 * over obstacles in Level 4.
 * @param {number} worldX — horizontal position in the game world
 * @returns {number} Y position of the ground / player path
 */
function getTerrainY(worldX) {
  const level = getLevel(worldX);
  const baseY = level.groundY;

  // Check if we're in a jump arc (Level 4 obstacles)
  for (const arc of JUMP_ARCS) {
    if (worldX >= arc.startX && worldX <= arc.endX) {
      // Parabolic arc: peaks at midpoint, returns to baseY at edges
      const midX = (arc.startX + arc.endX) / 2;
      const halfWidth = (arc.endX - arc.startX) / 2;
      const normalizedDist = (worldX - midX) / halfWidth; // -1 to 1
      const arcHeight = baseY - arc.peakY;
      const arcOffset = arcHeight * (1 - normalizedDist * normalizedDist);
      return baseY - arcOffset;
    }
  }

  return baseY;
}

/**
 * Returns the interpolated saturation for a given world X position.
 * Smoothly transitions between level saturation values.
 * @param {number} worldX — horizontal position in the game world
 * @returns {number} saturation value (0–1)
 */
function getSaturation(worldX) {
  const level = getLevel(worldX);
  return level.saturation;
}

/**
 * Returns the interpolated sky gradient colors for a given world X position.
 * @param {number} worldX — horizontal position in the game world
 * @returns {string[]} [topColor, bottomColor]
 */
function getSkyGradient(worldX) {
  const level = getLevel(worldX);
  return level.skyGradient;
}

/**
 * Checks whether the end screen should be displayed.
 * @param {number} worldX — horizontal position in the game world
 * @returns {boolean}
 */
function shouldShowEndScreen(worldX) {
  return getOverallProgress(worldX) > 0.95;
}
