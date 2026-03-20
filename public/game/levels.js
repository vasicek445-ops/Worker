// =============================================================================
// Woker Mario-Style Scroll Game — Level Definitions
// Příběh: Z obýváku v Česku do lepšího života ve Švýcarsku
// Total world width: 5000px (5 levels x ~1000px each)
// =============================================================================

const TOTAL_WORLD_WIDTH = 8000;

// ---------------------------------------------------------------------------
// Jump arc positions for Level 4 obstacles (bureaucracy on the road)
// ---------------------------------------------------------------------------
const JUMP_ARCS = [
  { startX: 3300, endX: 3420, peakY: 260 },  // toll booth
  { startX: 3650, endX: 3770, peakY: 250 },  // border control
];

// ---------------------------------------------------------------------------
// Level definitions — emotional story arc
// ---------------------------------------------------------------------------
const LEVELS = [
  // =========================================================================
  // Level 1: Obývák v Česku (0–1000)
  // Sedí na gauči, kouká na TikTok, šedý nudný život, nízký plat
  // =========================================================================
  {
    name: 'Cesko - Obyvak',
    nameCS: 'Cesko - Obyvak',
    startX: 0,
    endX: 1000,
    skyGradient: ['#2a2a3a', '#4a4a5a'],  // dark evening indoor feeling
    groundColor: '#6b5e4a',  // wooden floor
    groundY: 360,
    saturation: 0,
    groundTile: 'pathTile',
    elements: [
      // Living room furniture
      { type: 'panelak', x: -50, y: 200, scale: 2.5 },  // apartment building outside window

      // Couch (custom furniture)
      { type: 'platform', x: 80, y: 340, width: 120 },  // couch base
      { type: 'textPopup', x: 140, y: 310, text: '*sedis na gauci*' },

      // TV / Phone with TikTok
      { type: 'sign', x: 300, y: 300, text: 'TikTok: Prace ve Svycarsku?' },

      // Sad salary
      { type: 'coin', x: 450, y: 310, label: '25 000 Kc' },
      { type: 'textPopup', x: 450, y: 270, text: 'Mesicni vyplata... :(' },

      // More apartment buildings outside
      { type: 'panelak', x: 550, y: 220, scale: 2.0 },
      { type: 'panelak', x: 750, y: 210, scale: 2.2 },

      // Lamp, clock - indoor details
      { type: 'lampPost', x: 200, y: 290 },

      // Grey clouds
      { type: 'cloud', x: 100, y: 40, scale: 1.2, color: '#666' },
      { type: 'cloud', x: 400, y: 60, scale: 1.0, color: '#777' },
      { type: 'cloud', x: 700, y: 35, scale: 0.9, color: '#666' },
      { type: 'cloud', x: 900, y: 55, scale: 1.1, color: '#777' },
    ],
    triggers: [],
  },

  // =========================================================================
  // Level 2: Objev Wokeru na TikToku (1000–2000)
  // Na TikToku najde Woker, Wooky se materializuje, naděje!
  // =========================================================================
  {
    name: 'Objev Wokeru',
    nameCS: 'Objev Wokeru',
    startX: 1000,
    endX: 2000,
    skyGradient: ['#3a3a4a', '#6a7a6a'],  // slowly getting brighter
    groundColor: '#6b6b5e',
    groundY: 360,
    saturation: 0.2,
    groundTile: 'pathTile',
    elements: [
      // Phone / screen showing Woker
      { type: 'sign', x: 1100, y: 280, text: '@gowoker na TikToku!' },
      { type: 'textPopup', x: 1100, y: 240, text: 'Hmm, co je tohle?' },

      // Mystery box — Wooky appears!
      { type: 'mysteryBox', x: 1300, y: 280 },
      { type: 'textPopup', x: 1350, y: 220, text: 'Wooky: Ahoj! Pomuzу ti!' },

      // First green elements — hope
      { type: 'bush', x: 1500, y: 345, color: '#4a6a3a' },
      { type: 'tree', x: 1650, y: 280, color: '#4a7a3a' },

      // Reading about Switzerland
      { type: 'sign', x: 1700, y: 290, text: 'Plat 6000 CHF/mesic?!' },
      { type: 'textPopup', x: 1700, y: 250, text: 'To je 4x vic!' },

      // Decision moment
      { type: 'sign', x: 1900, y: 290, text: 'Rozhodl jsem se. Jedu!' },

      // Clouds getting lighter
      { type: 'cloud', x: 1100, y: 50, scale: 1.0, color: '#888' },
      { type: 'cloud', x: 1500, y: 70, scale: 1.2, color: '#999' },
      { type: 'cloud', x: 1800, y: 40, scale: 0.9, color: '#aaa' },
    ],
    triggers: [
      { x: 1300, type: 'spawnWooky' },
    ],
  },

  // =========================================================================
  // Level 3: Rozloučení s rodinou (2000–3000)
  // Stojí u domu, mává rodině, balí kufry, emociální moment
  // =========================================================================
  {
    name: 'Rozlouceni',
    nameCS: 'Rozlouceni',
    startX: 2000,
    endX: 3000,
    skyGradient: ['#6a7a8a', '#a0b0a0'],  // morning sky
    groundColor: '#5a7a4a',
    groundY: 360,
    saturation: 0.4,
    groundTile: 'grassTile',
    elements: [
      // Family house
      { type: 'chalet', x: 2050, y: 290, scale: 1.8 },  // using chalet as house
      { type: 'textPopup', x: 2150, y: 230, text: 'Rodina: Drzime palce!' },

      // Family members (represented as signs)
      { type: 'sign', x: 2200, y: 300, text: 'Mama, tata, sestra' },

      // Suitcase / packing power-ups
      { type: 'powerUp', x: 2400, y: 290, variant: 'cv', label: 'Zivotopis' },
      { type: 'powerUp', x: 2550, y: 290, variant: 'book', label: 'Nemcina A2' },
      { type: 'powerUp', x: 2700, y: 290, variant: 'permit', label: 'Povoleni L' },

      { type: 'textPopup', x: 2400, y: 240, text: 'Wooky pripravil CV!' },
      { type: 'textPopup', x: 2700, y: 240, text: 'Vse pripraveno!' },

      // Car waiting
      { type: 'sign', x: 2850, y: 300, text: 'Auto je nabalene!' },
      { type: 'textPopup', x: 2900, y: 250, text: 'Tak jdem na to!' },

      // Trees and garden
      { type: 'tree', x: 2300, y: 270, color: '#4a8a3a' },
      { type: 'flower', x: 2350, y: 350 },
      { type: 'flower', x: 2450, y: 352 },
      { type: 'bush', x: 2800, y: 345, color: '#4a7a3a' },

      // Clouds — morning
      { type: 'cloud', x: 2100, y: 50, scale: 1.1, color: '#ccd5da' },
      { type: 'cloud', x: 2500, y: 30, scale: 1.3, color: '#c5d0d5' },
      { type: 'cloud', x: 2800, y: 60, scale: 0.9, color: '#ccd5da' },
    ],
    triggers: [],
  },

  // =========================================================================
  // Level 4: Cesta autem do Švýcarska (3000–4000)
  // Silnice, cedule, hranice, Alpy se blíží, road trip feeling
  // =========================================================================
  {
    name: 'Cesta do Svycarska',
    nameCS: 'Cesta do Svycarska',
    startX: 3000,
    endX: 4000,
    skyGradient: ['#5a8aca', '#90b8d0'],  // beautiful blue sky
    groundColor: '#6a6a5a',  // asphalt road
    groundY: 360,
    saturation: 0.7,
    groundTile: 'pathTile',
    elements: [
      // Road signs
      { type: 'sign', x: 3050, y: 300, text: 'Praha -> Zurich: 850km' },
      { type: 'sign', x: 3300, y: 300, text: 'DE/AT Grenze' },
      { type: 'sign', x: 3600, y: 300, text: 'Willkommen in der Schweiz!' },
      { type: 'swissFlag', x: 3650, y: 260 },

      // Text narration
      { type: 'textPopup', x: 3100, y: 250, text: '850 km pred nami...' },
      { type: 'textPopup', x: 3350, y: 250, text: 'Nemecko, Rakousko...' },
      { type: 'textPopup', x: 3650, y: 230, text: 'Svycarsko! Konecne!' },

      // Obstacles on the road
      { type: 'obstacle', x: 3350, y: 340, variant: 'tollBooth', label: 'Dalnice' },
      { type: 'obstacle', x: 3700, y: 340, variant: 'border', label: 'Hranice' },

      // Alps mountains appearing and growing
      { type: 'mountain', x: 3200, y: 140, scale: 2.0, color: '#8a9aaa', snow: true },
      { type: 'mountain', x: 3500, y: 110, scale: 2.8, color: '#7a8a9a', snow: true },
      { type: 'mountain', x: 3800, y: 90, scale: 3.5, color: '#6a7a8a', snow: true },

      // Trees along the road
      { type: 'tree', x: 3100, y: 270, color: '#3a7a2a' },
      { type: 'tree', x: 3400, y: 265, color: '#2a6a1a' },
      { type: 'tree', x: 3750, y: 270, color: '#2a8a1a' },
      { type: 'tree', x: 3900, y: 268, color: '#1a7a0a' },

      // Coins getting bigger — anticipation
      { type: 'coin', x: 3200, y: 310, label: '50 000 Kc?' },
      { type: 'coin', x: 3500, y: 310, label: '100 000 Kc?!' },
      { type: 'coin', x: 3850, y: 300, label: '150 000 Kc!!!' },

      // Clouds — nice weather
      { type: 'cloud', x: 3100, y: 40, scale: 1.0, color: '#e5eaf0' },
      { type: 'cloud', x: 3400, y: 55, scale: 1.2, color: '#e0e8ee' },
      { type: 'cloud', x: 3750, y: 35, scale: 1.1, color: '#eef2f6' },
    ],
    triggers: [],
  },

  // =========================================================================
  // Level 5: Život ve Švýcarsku (4000–5000)
  // Pracuje, vydělává 6000 CHF, krásná příroda, lepší život, happy end
  // =========================================================================
  {
    name: 'Svycarsko!',
    nameCS: 'Zivot ve Svycarsku',
    startX: 4000,
    endX: 5000,
    skyGradient: ['#3a7ae0', '#7ac0f0'],  // perfect blue sky
    groundColor: '#3a9a2a',  // lush green
    groundY: 360,
    saturation: 1.0,
    groundTile: 'grassTile',
    elements: [
      // Majestic Alps
      { type: 'mountain', x: 4000, y: 70, scale: 3.5, color: '#6a7a8a', snow: true },
      { type: 'mountain', x: 4300, y: 50, scale: 4.0, color: '#5a6a7a', snow: true },
      { type: 'mountain', x: 4650, y: 80, scale: 3.2, color: '#6a7a8a', snow: true },
      { type: 'mountain', x: 4900, y: 60, scale: 3.8, color: '#5a6a7a', snow: true },

      // Swiss workplace
      { type: 'chalet', x: 4100, y: 290, scale: 1.5 },
      { type: 'textPopup', x: 4150, y: 230, text: 'Nova prace!' },

      // Big salary!
      { type: 'coin', x: 4200, y: 300, label: '150 000 Kc' },
      { type: 'coin', x: 4350, y: 290, label: '150 000 Kc' },
      { type: 'coin', x: 4500, y: 295, label: '150 000 Kc' },

      // Nice apartment
      { type: 'chalet', x: 4550, y: 285, scale: 1.8 },
      { type: 'textPopup', x: 4600, y: 225, text: 'Vlastni byt v Zurichu!' },

      // More coins
      { type: 'coin', x: 4700, y: 300, label: '150 000 Kc' },
      { type: 'coin', x: 4850, y: 295, label: '150 000 Kc' },

      // Swiss flags everywhere
      { type: 'swissFlag', x: 4150, y: 250 },
      { type: 'swissFlag', x: 4550, y: 245 },
      { type: 'swissFlag', x: 4850, y: 250 },

      // Happy ending narration
      { type: 'textPopup', x: 4250, y: 240, text: '25 000 Kc -> 150 000 Kc!' },
      { type: 'textPopup', x: 4750, y: 240, text: '6x vetsi plat!' },
      { type: 'textPopup', x: 4950, y: 220, text: 'Lepsi zivot pro rodinu!' },

      // Beautiful nature
      { type: 'tree', x: 4050, y: 270, color: '#2a8a1a' },
      { type: 'tree', x: 4250, y: 265, color: '#1a7a0a' },
      { type: 'tree', x: 4450, y: 275, color: '#2a8a1a' },
      { type: 'tree', x: 4650, y: 268, color: '#1a7a0a' },
      { type: 'tree', x: 4850, y: 272, color: '#2a8a1a' },

      // Flowers — life is beautiful
      { type: 'flower', x: 4120, y: 350 },
      { type: 'flower', x: 4340, y: 352 },
      { type: 'flower', x: 4560, y: 348 },
      { type: 'flower', x: 4750, y: 351 },
      { type: 'flower', x: 4900, y: 349 },

      // Bright happy clouds
      { type: 'cloud', x: 4100, y: 35, scale: 1.3, color: '#ffffff' },
      { type: 'cloud', x: 4400, y: 50, scale: 1.5, color: '#f8fbff' },
      { type: 'cloud', x: 4700, y: 30, scale: 1.1, color: '#ffffff' },
      { type: 'cloud', x: 4900, y: 55, scale: 0.9, color: '#f8fbff' },
    ],
    triggers: [
      { x: 4500, type: 'confetti' },
    ],
  },

  // =========================================================================
  // Level 6: Svycarska princezna (5000–6000)
  // Potka krásnou Švýcarku, zamilují se, srdíčka všude
  // =========================================================================
  {
    name: 'Princezna',
    nameCS: 'Svycarska princezna',
    startX: 5000,
    endX: 6000,
    skyGradient: ['#ff7eb3', '#ff758c'],  // romantic sunset pink
    groundColor: '#3a9a2a',
    groundY: 360,
    saturation: 1.0,
    groundTile: 'grassTile',
    elements: [
      // Beautiful Swiss scenery
      { type: 'mountain', x: 5000, y: 60, scale: 3.5, color: '#6a7a8a', snow: true },
      { type: 'mountain', x: 5400, y: 70, scale: 3.0, color: '#7a8a9a', snow: true },
      { type: 'mountain', x: 5800, y: 55, scale: 3.8, color: '#5a6a7a', snow: true },

      // Swiss chalets
      { type: 'chalet', x: 5050, y: 290, scale: 1.5 },
      { type: 'chalet', x: 5700, y: 285, scale: 1.8 },

      // Money still flowing
      { type: 'coin', x: 5100, y: 300, label: '150 000 Kc' },
      { type: 'coin', x: 5250, y: 295, label: '150 000 Kc' },

      // Meet the princess!
      { type: 'textPopup', x: 5300, y: 220, text: 'Kdo je tahle krasavice?' },
      { type: 'princess', x: 5400, scale: 1.2 },
      { type: 'textPopup', x: 5450, y: 200, text: 'Ahoj! Jsem Heidi!' },

      // Hearts appear!
      { type: 'heart', x: 5350, y: 180, scale: 0.6, animated: true },
      { type: 'heart', x: 5450, y: 160, scale: 0.8, animated: true },
      { type: 'heart', x: 5500, y: 175, scale: 0.5, animated: true },

      // Romance
      { type: 'textPopup', x: 5550, y: 230, text: 'Laska na prvni pohled!' },
      { type: 'bench', x: 5600 },
      { type: 'heart', x: 5600, y: 270, scale: 1.0, animated: true },

      // More hearts trail
      { type: 'heart', x: 5650, y: 190, scale: 0.5, animated: true },
      { type: 'heart', x: 5700, y: 170, scale: 0.7, animated: true },
      { type: 'heart', x: 5750, y: 185, scale: 0.4, animated: true },

      { type: 'textPopup', x: 5800, y: 220, text: 'Pojd, objedeme svet!' },

      // Flowers everywhere — romantic
      { type: 'flower', x: 5150, y: 350 },
      { type: 'flower', x: 5300, y: 352 },
      { type: 'flower', x: 5500, y: 348 },
      { type: 'flower', x: 5650, y: 351 },
      { type: 'flower', x: 5850, y: 349 },

      // Trees
      { type: 'tree', x: 5200, y: 268, color: '#2a8a1a' },
      { type: 'tree', x: 5500, y: 265, color: '#1a7a0a' },
      { type: 'tree', x: 5900, y: 270, color: '#2a8a1a' },

      // Romantic clouds (pink tinted)
      { type: 'cloud', x: 5100, y: 35, scale: 1.2, color: '#ffd4e0' },
      { type: 'cloud', x: 5400, y: 55, scale: 1.0, color: '#ffb8cc' },
      { type: 'cloud', x: 5700, y: 40, scale: 1.3, color: '#ffd4e0' },
      { type: 'cloud', x: 5900, y: 50, scale: 0.9, color: '#ffb8cc' },

      // Swiss flags
      { type: 'swissFlag', x: 5050, y: 250 },
    ],
    triggers: [],
  },

  // =========================================================================
  // Level 7: Nasedaji do auta (6000–7000)
  // Spolu sednou do červeného auta, jedou na cestu kolem světa
  // =========================================================================
  {
    name: 'Road Trip!',
    nameCS: 'Spolecna cesta',
    startX: 6000,
    endX: 7000,
    skyGradient: ['#4a90d9', '#87ceeb'],  // bright travel sky
    groundColor: '#6a6a5a',  // road
    groundY: 360,
    saturation: 0.9,
    groundTile: 'pathTile',
    elements: [
      // The couple's car!
      { type: 'coupleInCar', x: 6100, scale: 1.5, color: '#cc0000' },
      { type: 'textPopup', x: 6100, y: 200, text: 'Na cestu kolem sveta!' },
      { type: 'heart', x: 6100, y: 170, scale: 0.7, animated: true },

      // Road signs — destinations
      { type: 'sign', x: 6200, y: 300, text: 'Pariz 500km' },
      { type: 'sign', x: 6400, y: 300, text: 'Roma 850km' },
      { type: 'sign', x: 6600, y: 300, text: 'Atheny 2000km' },
      { type: 'sign', x: 6800, y: 300, text: 'Tokio 9500km' },

      // Coins — they have the money!
      { type: 'coin', x: 6150, y: 300, label: 'CHF' },
      { type: 'coin', x: 6350, y: 290, label: 'EUR' },
      { type: 'coin', x: 6550, y: 300, label: 'EUR' },
      { type: 'coin', x: 6750, y: 295, label: 'YEN' },
      { type: 'coin', x: 6900, y: 300, label: 'USD' },

      // Trees along the road
      { type: 'tree', x: 6100, y: 270, color: '#2a8a1a' },
      { type: 'tree', x: 6300, y: 268, color: '#1a7a0a' },
      { type: 'palmTree', x: 6500, scale: 1.0 },
      { type: 'palmTree', x: 6700, scale: 1.1 },
      { type: 'palmTree', x: 6900, scale: 0.9 },

      // Text narration
      { type: 'textPopup', x: 6300, y: 230, text: 'Prvni zastavka: Francie!' },
      { type: 'textPopup', x: 6500, y: 230, text: 'Italie, pizza, gelato!' },
      { type: 'textPopup', x: 6700, y: 230, text: 'Recko, more, slunce!' },
      { type: 'textPopup', x: 6900, y: 230, text: 'Japonsko, ramen, sakury!' },

      // More hearts along the way
      { type: 'heart', x: 6300, y: 180, scale: 0.5, animated: true },
      { type: 'heart', x: 6500, y: 175, scale: 0.6, animated: true },
      { type: 'heart', x: 6700, y: 185, scale: 0.5, animated: true },

      // Clouds
      { type: 'cloud', x: 6100, y: 40, scale: 1.1, color: '#ffffff' },
      { type: 'cloud', x: 6400, y: 55, scale: 1.3, color: '#f0f8ff' },
      { type: 'cloud', x: 6700, y: 35, scale: 1.0, color: '#ffffff' },
      { type: 'cloud', x: 6900, y: 50, scale: 0.8, color: '#f0f8ff' },

      // Mountains transitioning to flat
      { type: 'mountain', x: 6000, y: 80, scale: 3.0, color: '#6a7a8a', snow: true },
      { type: 'mountain', x: 6400, y: 100, scale: 2.5, color: '#7a8a9a', snow: false },
    ],
    triggers: [],
  },

  // =========================================================================
  // Level 8: Kolem sveta (7000–8000)
  // Slavné památky, šťastný konec, viděli svět díky Wokeru
  // =========================================================================
  {
    name: 'Kolem sveta!',
    nameCS: 'Kolem sveta!',
    startX: 7000,
    endX: 8000,
    skyGradient: ['#ff9a56', '#ffcc33'],  // golden sunset / world tour
    groundColor: '#c4a843',  // sandy world terrain
    groundY: 360,
    saturation: 1.0,
    groundTile: 'pathTile',
    elements: [
      // World landmarks!
      { type: 'landmark', x: 7100, variant: 'eiffel', scale: 0.9, label: 'Pariz' },
      { type: 'textPopup', x: 7100, y: 200, text: 'Baguette a Eiffelovka!' },
      { type: 'palmTree', x: 7050, scale: 0.7 },

      { type: 'landmark', x: 7300, variant: 'colosseum', scale: 1.0, label: 'Rim' },
      { type: 'textPopup', x: 7300, y: 200, text: 'Koloseum! Mamma mia!' },

      { type: 'landmark', x: 7500, variant: 'pyramid', scale: 0.9, label: 'Egypt' },
      { type: 'textPopup', x: 7500, y: 200, text: 'Pyramidy a faraoni!' },
      { type: 'palmTree', x: 7450, scale: 1.0 },
      { type: 'palmTree', x: 7570, scale: 0.8 },

      { type: 'landmark', x: 7680, variant: 'torii', scale: 0.9, label: 'Tokio' },
      { type: 'textPopup', x: 7680, y: 200, text: 'Koniciwa! Subarashii!' },

      { type: 'landmark', x: 7850, variant: 'statue', scale: 0.8, label: 'New York' },
      { type: 'textPopup', x: 7850, y: 200, text: 'Socha Svobody! WOW!' },

      // Final couple in car
      { type: 'coupleInCar', x: 7950, scale: 1.3, color: '#cc0000' },

      // Final message
      { type: 'textPopup', x: 7950, y: 180, text: 'A vsechno zacalo na Wokeru!' },

      // Hearts everywhere — happy ending
      { type: 'heart', x: 7100, y: 160, scale: 0.5, animated: true },
      { type: 'heart', x: 7300, y: 155, scale: 0.6, animated: true },
      { type: 'heart', x: 7500, y: 165, scale: 0.5, animated: true },
      { type: 'heart', x: 7700, y: 150, scale: 0.7, animated: true },
      { type: 'heart', x: 7900, y: 160, scale: 0.8, animated: true },
      { type: 'heart', x: 7950, y: 140, scale: 1.0, animated: true },

      // Coins — world currencies
      { type: 'coin', x: 7150, y: 300, label: 'EUR' },
      { type: 'coin', x: 7350, y: 295, label: 'EUR' },
      { type: 'coin', x: 7550, y: 300, label: 'EGP' },
      { type: 'coin', x: 7720, y: 295, label: 'YEN' },
      { type: 'coin', x: 7880, y: 300, label: 'USD' },

      // Clouds — golden sunset
      { type: 'cloud', x: 7100, y: 35, scale: 1.2, color: '#ffe4b5' },
      { type: 'cloud', x: 7350, y: 50, scale: 1.0, color: '#ffd700' },
      { type: 'cloud', x: 7600, y: 40, scale: 1.3, color: '#ffe4b5' },
      { type: 'cloud', x: 7850, y: 55, scale: 1.1, color: '#ffd700' },
    ],
    triggers: [
      { x: 7800, type: 'confetti' },
    ],
  },
];

// ---------------------------------------------------------------------------
// End screen overlay config (shown when progress > 0.95)
// ---------------------------------------------------------------------------
const END_SCREEN = {
  title: 'Novy zivot ve Svycarsku!',
  subtitle: 'A vsechno to zacalo na TikToku...',
  cta: {
    text: 'Chci to taky! ->',
    link: '#pricing',
  },
  background: 'rgba(0, 0, 0, 0.75)',
};

// ---------------------------------------------------------------------------
// Confetti particle config (triggered at Level 5)
// ---------------------------------------------------------------------------
const CONFETTI_CONFIG = {
  colors: ['#ff0000', '#ffffff', '#ffcc00', '#39ff6e', '#3399ff'],
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
 */
function getLevelProgress(worldX) {
  const level = getLevel(worldX);
  const range = level.endX - level.startX;
  return Math.max(0, Math.min(1, (worldX - level.startX) / range));
}

/**
 * Returns 0–1 overall progress.
 */
function getOverallProgress(worldX) {
  return Math.max(0, Math.min(1, worldX / TOTAL_WORLD_WIDTH));
}

/**
 * Returns the Y position of the terrain at a given worldX.
 * Includes jump arcs for obstacles.
 */
function getTerrainY(worldX) {
  const level = getLevel(worldX);
  const baseY = level ? (level.groundY || 360) : 360;

  // Check if worldX falls within a jump arc
  for (let i = 0; i < JUMP_ARCS.length; i++) {
    const arc = JUMP_ARCS[i];
    if (worldX >= arc.startX && worldX <= arc.endX) {
      const t = (worldX - arc.startX) / (arc.endX - arc.startX);
      const jumpHeight = baseY - arc.peakY;
      const yOffset = Math.sin(t * Math.PI) * jumpHeight;
      return baseY - yOffset;
    }
  }

  return baseY;
}

/**
 * Returns current saturation (0=grey, 1=full color).
 */
function getSaturation(worldX) {
  const level = getLevel(worldX);
  return level ? (level.saturation || 0) : 0;
}

/**
 * Returns sky gradient for current position.
 */
function getSkyGradient(worldX) {
  const level = getLevel(worldX);
  return level ? (level.skyGradient || ['#1a1a2e', '#16213e']) : ['#1a1a2e', '#16213e'];
}

/**
 * Returns true if end screen should be shown.
 */
function shouldShowEndScreen(worldX) {
  return worldX >= TOTAL_WORLD_WIDTH * 0.95;
}
