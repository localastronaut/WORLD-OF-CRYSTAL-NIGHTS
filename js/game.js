/* =============================================================
   CRYSTAL NIGHTS — game.js
   Top-down RPG engine.  5 maps · 4 NPCs · Crystal collection
   · Finale at Crystal Shop.
   Author: World of Crystal Nights (2026)
============================================================= */
'use strict';

/* ─────────────────────────────────────────────────────────────
   TILE CONSTANTS
───────────────────────────────────────────────────────────── */
const T = {
  VOID:  0,
  FLOOR: 1,
  WALL:  2,
  BUILD: 3,
  ROAD:  4,
  SIDE:  5,
  GRASS: 6,
  WATER: 7,
  CTR:   8,
  WIN:   9,
  PLAT:  10,
  TRACK: 11,
  SEAT:  12,
};

const SOLID = new Set([T.WALL, T.BUILD, T.WATER, T.CTR, T.WIN, T.SEAT]);

const TILE_COLORS = {
  [T.VOID]:  '#000000',
  [T.FLOOR]: '#1a1428',
  [T.WALL]:  '#2a2040',
  [T.BUILD]: '#181228',
  [T.ROAD]:  '#0f0e18',
  [T.SIDE]:  '#221a36',
  [T.GRASS]: '#0c1a10',
  [T.WATER]: '#040c20',
  [T.CTR]:   '#1e1430',
  [T.WIN]:   '#0a0818',
  [T.PLAT]:  '#201830',
  [T.TRACK]: '#080610',
  [T.SEAT]:  '#16102a',
};

const TS = 32; // tile size in pixels

/* ─────────────────────────────────────────────────────────────
   MAP DEFINITIONS
───────────────────────────────────────────────────────────── */

// Helper: build a 2D array
function grid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function buildCityMap() {
  const W = 42, H = 24;
  const m = grid(W, H, T.FLOOR);

  // Row 0-1: top wall, gap at col 15 for hills exit
  for (let x = 0; x < W; x++) {
    m[0][x] = T.WALL;
    m[1][x] = (x === 15) ? T.FLOOR : T.WALL;
  }

  // Rows 2-5: north buildings (BUILD tiles)
  // Rosa's Crystal Shop occupies cols 1-9
  for (let y = 2; y <= 5; y++) {
    for (let x = 0; x < W; x++) {
      if (x === 0 || x === W - 1) { m[y][x] = T.WALL; continue; }
      // Rosa's shop: cols 1-9
      if (x >= 1 && x <= 9) {
        m[y][x] = (y === 5 && x === 8) ? T.FLOOR : T.BUILD; // door at (8,5)
      } else if (x >= 10 && x <= 14) {
        m[y][x] = T.BUILD;
      } else if (x >= 15 && x <= 22) {
        m[y][x] = T.BUILD;
      } else if (x >= 23 && x <= 30) {
        m[y][x] = T.BUILD;
      } else if (x >= 31 && x <= 40) {
        m[y][x] = T.BUILD;
      }
    }
  }
  // Windows on buildings row 3
  for (let x = 2; x <= 8; x += 2) m[3][x] = T.WIN;
  for (let x = 11; x <= 14; x += 2) m[3][x] = T.WIN;
  for (let x = 17; x <= 21; x += 2) m[3][x] = T.WIN;
  for (let x = 25; x <= 29; x += 2) m[3][x] = T.WIN;
  for (let x = 33; x <= 39; x += 2) m[3][x] = T.WIN;

  // Alley through north buildings at cols 14-16 — path to hills exit
  for (let y = 1; y <= 5; y++) {
    m[y][14] = T.SIDE;
    m[y][15] = T.SIDE;
    m[y][16] = T.SIDE;
  }

  // Row 6: north sidewalk
  for (let x = 1; x < W - 1; x++) m[6][x] = T.SIDE;
  m[6][0] = T.WALL; m[6][W-1] = T.WALL;

  // Rows 7-8: main road
  for (let y = 7; y <= 8; y++) {
    for (let x = 0; x < W; x++) m[y][x] = (x === 0 || x === W-1) ? T.WALL : T.ROAD;
  }

  // Row 9: south sidewalk
  for (let x = 1; x < W - 1; x++) m[9][x] = T.SIDE;
  m[9][0] = T.WALL; m[9][W-1] = T.WALL;

  // Rows 10-14: south buildings
  for (let y = 10; y <= 14; y++) {
    for (let x = 0; x < W; x++) {
      if (x === 0 || x === W-1) { m[y][x] = T.WALL; continue; }
      if (x >= 1 && x <= 12) m[y][x] = T.BUILD;
      else if (x >= 13 && x <= 22) m[y][x] = T.BUILD;
      else if (x >= 23 && x <= 32) m[y][x] = T.BUILD;
      else if (x >= 33 && x <= 40) m[y][x] = T.BUILD;
    }
  }
  // Underground entrance — open gap through row 10 and stairs at (28,11)
  m[10][27] = T.SIDE; m[10][28] = T.SIDE; m[10][29] = T.SIDE;
  m[11][27] = T.FLOOR; m[11][28] = T.FLOOR; m[11][29] = T.FLOOR;
  m[12][28] = T.FLOOR;
  // Windows on south buildings row 12
  for (let x = 3; x <= 11; x += 2) m[12][x] = T.WIN;
  for (let x = 15; x <= 21; x += 2) m[12][x] = T.WIN;
  for (let x = 25; x <= 31; x += 2) m[12][x] = T.WIN;
  for (let x = 35; x <= 39; x += 2) m[12][x] = T.WIN;

  // Row 15: back alley sidewalk
  for (let x = 1; x < W-1; x++) m[15][x] = T.SIDE;
  m[15][0] = T.WALL; m[15][W-1] = T.WALL;

  // Row 16: back road
  for (let x = 0; x < W; x++) m[16][x] = (x === 0 || x === W-1) ? T.WALL : T.ROAD;

  // Row 17: south sidewalk
  for (let x = 1; x < W-1; x++) m[17][x] = T.SIDE;
  m[17][0] = T.WALL; m[17][W-1] = T.WALL;

  // Row 18: wall
  for (let x = 0; x < W; x++) m[18][x] = T.WALL;

  // Rows 19-22: park
  for (let y = 19; y <= 22; y++) {
    for (let x = 0; x < W; x++) {
      if (x === 0 || x === W-1) { m[y][x] = T.WALL; continue; }
      m[y][x] = T.GRASS;
    }
  }
  // Water fountain cols 5-9, row 20
  for (let x = 5; x <= 9; x++) m[20][x] = T.WATER;
  m[21][7] = T.WATER;

  // Row 23: bottom wall
  for (let x = 0; x < W; x++) m[23][x] = T.WALL;

  return m;
}

function buildHillsMap() {
  const W = 32, H = 20;
  const m = grid(W, H, T.GRASS);

  // Walls on 3 sides, south open (except center gap)
  for (let x = 0; x < W; x++) {
    m[0][x] = T.WALL;
    m[1][x] = (x >= 14 && x <= 17) ? T.GRASS : T.WALL; // northern exit marker area
  }
  for (let y = 0; y < H; y++) {
    m[y][0] = T.WALL;
    m[y][W-1] = T.WALL;
  }
  // South row: gap in center for return exit
  for (let x = 0; x < W; x++) {
    if (x >= 14 && x <= 17) continue; // gap to return south
    m[H-1][x] = T.WALL;
  }

  // Winding path (FLOOR tiles)
  const path = [
    [15,18],[15,17],[15,16],[16,15],[17,14],[17,13],[17,12],
    [16,11],[16,10],[16,9],[16,8],[16,7],[16,6],[15,5],[14,5],
  ];
  path.forEach(([x,y]) => { if (m[y]) m[y][x] = T.FLOOR; });
  // Widen path
  path.forEach(([x,y]) => {
    [-1,0,1].forEach(dx => {
      if (m[y] && m[y][x+dx] !== T.WALL) m[y][x+dx] = T.FLOOR;
    });
  });

  return m;
}

function buildUndergroundMap() {
  const W = 30, H = 16;
  const m = grid(W, H, T.WALL);

  // Interior: rows 2-13, cols 1-28
  for (let y = 2; y <= 13; y++) {
    for (let x = 1; x <= 28; x++) m[y][x] = T.FLOOR;
  }

  // Platform rows 4-6 and 9-11 on left side
  for (let y = 4; y <= 6; y++) for (let x = 1; x <= 10; x++) m[y][x] = T.PLAT;
  for (let y = 9; y <= 11; y++) for (let x = 1; x <= 10; x++) m[y][x] = T.PLAT;

  // Platform right side
  for (let y = 4; y <= 6; y++) for (let x = 19; x <= 28; x++) m[y][x] = T.PLAT;
  for (let y = 9; y <= 11; y++) for (let x = 19; x <= 28; x++) m[y][x] = T.PLAT;

  // Track rows 7-8 in middle
  for (let x = 1; x <= 28; x++) {
    m[7][x] = T.TRACK;
    m[8][x] = T.TRACK;
  }

  // Stairs up at (5,3)
  m[3][5] = T.FLOOR; m[3][6] = T.FLOOR;

  // Train trigger at right cols 27-28, rows 5-10
  for (let y = 5; y <= 10; y++) for (let x = 27; x <= 28; x++) m[y][x] = T.FLOOR;

  return m;
}

function buildTrainMap() {
  const W = 26, H = 10;
  const m = grid(W, H, T.WALL);

  // Interior
  for (let y = 1; y <= 8; y++) for (let x = 1; x <= 24; x++) m[y][x] = T.FLOOR;

  // Seat tiles along top and bottom
  for (let x = 2; x <= 23; x += 3) {
    m[1][x] = T.SEAT;
    m[8][x] = T.SEAT;
  }

  // Windows (WIN tiles) in walls
  for (let x = 3; x <= 22; x += 4) {
    m[0][x] = T.WIN;
    m[9][x] = T.WIN;
  }

  // Aisle floor
  for (let x = 1; x <= 24; x++) {
    m[4][x] = T.FLOOR;
    m[5][x] = T.FLOOR;
  }

  return m;
}

function buildFinalShopMap() {
  const W = 22, H = 16;
  const m = grid(W, H, T.WALL);

  // Interior floor
  for (let y = 2; y <= 13; y++) for (let x = 1; x <= 20; x++) m[y][x] = T.FLOOR;

  // Back wall windows — glowing display niches
  for (let x = 3; x <= 19; x += 4) m[2][x] = T.WIN;

  // Front display cases (three case banks)
  for (let x = 3; x <= 7; x++) { m[4][x] = T.CTR; m[5][x] = T.CTR; }
  for (let x = 9; x <= 13; x++) { m[4][x] = T.CTR; m[5][x] = T.CTR; }
  for (let x = 15; x <= 19; x++) { m[4][x] = T.CTR; m[5][x] = T.CTR; }

  // Top-row altar shelf
  for (let x = 3; x <= 19; x += 2) m[3][x] = T.CTR;

  // Left wall display alcoves
  for (let y = 7; y <= 9; y++) { m[y][1] = T.CTR; m[y][2] = T.CTR; }
  for (let y = 11; y <= 12; y++) { m[y][1] = T.CTR; m[y][2] = T.CTR; }

  // Right wall display alcoves
  for (let y = 7; y <= 9; y++) { m[y][19] = T.CTR; m[y][20] = T.CTR; }
  for (let y = 11; y <= 12; y++) { m[y][19] = T.CTR; m[y][20] = T.CTR; }

  // Central platform — raised stage around the recording station
  for (let y = 6; y <= 9; y++) for (let x = 8; x <= 14; x++) m[y][x] = T.PLAT;
  // Keep path through the platform walkable
  for (let y = 6; y <= 9; y++) { m[y][10] = T.FLOOR; m[y][11] = T.FLOOR; }
  for (let x = 8; x <= 14; x++) { m[9][x] = T.FLOOR; }

  // Exit at bottom row 14
  m[14][10] = T.FLOOR; m[14][11] = T.FLOOR;
  for (let x = 0; x < W; x++) {
    if (x === 10 || x === 11) continue;
    m[14][x] = T.WALL;
  }
  for (let x = 0; x < W; x++) m[15][x] = T.WALL;

  return m;
}

/* ─────────────────────────────────────────────────────────────
   WORLD DATA
───────────────────────────────────────────────────────────── */

const WORLD = {
  city: {
    name: 'MAIN STREET',
    ambient: 'Wet pavement. A neon sign hums. Rain on the awning.',
    tiles: buildCityMap(),
    entities: [
      // ── NPCs
      { type:'npc', id:'rosa', x:7*TS+16, y:6*TS+20 },
      // ── Crystals (18 scattered)
      { type:'crystal', id:'c_city_0',  x:3*TS+8,  y:6*TS+8  },
      { type:'crystal', id:'c_city_1',  x:10*TS+4, y:6*TS+8  },
      { type:'crystal', id:'c_city_2',  x:18*TS+4, y:6*TS+8  },
      { type:'crystal', id:'c_city_3',  x:25*TS+12,y:6*TS+8  },
      { type:'crystal', id:'c_city_4',  x:35*TS+8, y:6*TS+8  },
      { type:'crystal', id:'c_city_5',  x:38*TS+4, y:9*TS+8  },
      { type:'crystal', id:'c_city_6',  x:14*TS+4, y:9*TS+8  },
      { type:'crystal', id:'c_city_7',  x:6*TS+4,  y:9*TS+8  },
      { type:'crystal', id:'c_city_8',  x:21*TS+8, y:15*TS+8 },
      { type:'crystal', id:'c_city_9',  x:30*TS+4, y:15*TS+8 },
      { type:'crystal', id:'c_city_10', x:39*TS+4, y:17*TS+8 },
      { type:'crystal', id:'c_city_11', x:5*TS+4,  y:19*TS+8 },
      { type:'crystal', id:'c_city_12', x:12*TS+8, y:21*TS+8 },
      { type:'crystal', id:'c_city_13', x:20*TS+4, y:20*TS+8 },
      { type:'crystal', id:'c_city_14', x:30*TS+12,y:22*TS+8 },
      { type:'crystal', id:'c_city_15', x:37*TS+4, y:21*TS+8 },
      { type:'crystal', id:'c_city_16', x:17*TS+8, y:17*TS+8 },
      { type:'crystal', id:'c_city_17', x:8*TS+4,  y:17*TS+8, color:'#00c8ff' },
      // ── Triggers
      { type:'trigger', id:'t_hills',      x:15*TS+16, y:1*TS+8,  label:'THE HILLS', toMap:'hills', toX:15*TS+16, toY:17*TS+16, requires:'rosa' },
      { type:'trigger', id:'t_underground',x:28*TS+8, y:11*TS+16,label:'UNDERGROUND',toMap:'underground', toX:5*TS+16, toY:5*TS+16 },
      // ── Signs
      { type:'sign', id:'s_shop',  x:4*TS, y:2*TS+4, text:['CRYSTAL NIGHTS', 'EST. 2019'] },
    ],
  },

  hills: {
    name: 'THE HILLS',
    ambient: 'Wind across the canyon. The city below, breathing.',
    tiles: buildHillsMap(),
    entities: [
      { type:'npc', id:'leo', x:16*TS+16, y:6*TS+16 },
      // Crystals (12)
      { type:'crystal', id:'c_hills_0',  x:16*TS+4,  y:16*TS+8 },
      { type:'crystal', id:'c_hills_1',  x:17*TS+4,  y:14*TS+8 },
      { type:'crystal', id:'c_hills_2',  x:17*TS+12, y:11*TS+8 },
      { type:'crystal', id:'c_hills_3',  x:16*TS+4,  y:9*TS+8  },
      { type:'crystal', id:'c_hills_4',  x:15*TS+8,  y:7*TS+8  },
      { type:'crystal', id:'c_hills_5',  x:14*TS+4,  y:5*TS+8  },
      { type:'crystal', id:'c_hills_6',  x:10*TS+8,  y:10*TS+8, color:'#ffc94a' },
      { type:'crystal', id:'c_hills_7',  x:8*TS+4,   y:14*TS+8 },
      { type:'crystal', id:'c_hills_8',  x:6*TS+8,   y:8*TS+8  },
      { type:'crystal', id:'c_hills_9',  x:20*TS+4,  y:12*TS+8 },
      { type:'crystal', id:'c_hills_10', x:22*TS+8,  y:7*TS+8  },
      { type:'crystal', id:'c_hills_11', x:25*TS+4,  y:15*TS+8 },
      // Triggers
      { type:'trigger', id:'t_back_city', x:15*TS+8, y:18*TS+8, label:'MAIN STREET', toMap:'city', toX:15*TS+16, toY:5*TS+16 },
      // Sign
      { type:'sign', id:'s_hills', x:14*TS, y:2*TS+4, text:['HILLSIDE STUDIO', '2:18 AM'] },
    ],
  },

  underground: {
    name: 'UNDERGROUND',
    ambient: 'Concrete echo. A train somewhere deep below.',
    tiles: buildUndergroundMap(),
    entities: [
      { type:'npc', id:'marcus', x:8*TS+16, y:5*TS+16 },
      // Crystals (10)
      { type:'crystal', id:'c_ug_0',  x:3*TS+8,   y:4*TS+8 },
      { type:'crystal', id:'c_ug_1',  x:7*TS+4,   y:4*TS+8 },
      { type:'crystal', id:'c_ug_2',  x:3*TS+4,   y:11*TS+8 },
      { type:'crystal', id:'c_ug_3',  x:7*TS+8,   y:11*TS+8 },
      { type:'crystal', id:'c_ug_4',  x:22*TS+4,  y:4*TS+8,  color:'#ff8c14' },
      { type:'crystal', id:'c_ug_5',  x:25*TS+8,  y:4*TS+8 },
      { type:'crystal', id:'c_ug_6',  x:22*TS+4,  y:11*TS+8 },
      { type:'crystal', id:'c_ug_7',  x:25*TS+4,  y:11*TS+8 },
      { type:'crystal', id:'c_ug_8',  x:13*TS+8,  y:5*TS+8 },
      { type:'crystal', id:'c_ug_9',  x:16*TS+4,  y:10*TS+8 },
      // Triggers
      { type:'trigger', id:'t_train',     x:27*TS+8, y:7*TS+8, label:'LINE 7 TRAIN', toMap:'train', toX:2*TS+16, toY:4*TS+16, requires:'marcus' },
      { type:'trigger', id:'t_up_city',   x:5*TS+8,  y:3*TS+8, label:'MAIN STREET',  toMap:'city',  toX:28*TS+16, toY:10*TS+16 },
      // Sign
      { type:'sign', id:'s_ug', x:12*TS, y:2*TS+4, text:['METRO B', 'PLATFORM 3'] },
    ],
  },

  train: {
    name: 'LATE TRAIN',
    ambient: 'Rails against steel. The city as a blur of light.',
    tiles: buildTrainMap(),
    entities: [
      { type:'npc', id:'jin', x:20*TS+16, y:4*TS+16 },
      // Crystals (8)
      { type:'crystal', id:'c_tr_0',  x:3*TS+8,   y:3*TS+8 },
      { type:'crystal', id:'c_tr_1',  x:6*TS+4,   y:3*TS+8 },
      { type:'crystal', id:'c_tr_2',  x:9*TS+8,   y:6*TS+8 },
      { type:'crystal', id:'c_tr_3',  x:12*TS+4,  y:3*TS+8 },
      { type:'crystal', id:'c_tr_4',  x:15*TS+8,  y:6*TS+8, color:'#ffc94a' },
      { type:'crystal', id:'c_tr_5',  x:18*TS+4,  y:3*TS+8 },
      { type:'crystal', id:'c_tr_6',  x:21*TS+8,  y:6*TS+8 },
      { type:'crystal', id:'c_tr_7',  x:23*TS+4,  y:3*TS+8 },
      // Trigger: exit right to finalshop (requires all 4 items)
      { type:'trigger', id:'t_finalshop', x:24*TS+8, y:4*TS+16, label:'CRYSTAL SHOP', toMap:'finalshop', toX:11*TS, toY:12*TS+16, requiresAll: true },
      // Sign
      { type:'sign', id:'s_train', x:11*TS, y:0, text:['LINE 7', 'LAST CAR'] },
    ],
  },

  finalshop: {
    name: 'CRYSTAL SHOP',
    ambient: '◆ Every crystal in this room has been waiting for you. The signal is ready.',
    tiles: buildFinalShopMap(),
    entities: [
      // Deco crystal clusters — scattered throughout the shop
      { type:'deco', id:'d_cluster_a', x:4*TS,    y:6*TS   },
      { type:'deco', id:'d_cluster_b', x:16*TS,   y:6*TS   },
      { type:'deco', id:'d_cluster_c', x:10*TS,   y:12*TS  },
      { type:'deco', id:'d_cluster_d', x:2*TS+8,  y:10*TS  },
      { type:'deco', id:'d_cluster_e', x:19*TS+8, y:10*TS  },
      { type:'deco', id:'d_cluster_f', x:7*TS,    y:13*TS  },
      { type:'deco', id:'d_cluster_g', x:14*TS,   y:13*TS  },
      // Recording station — interact to trigger finale
      { type:'station', id:'recording', x:10*TS+16, y:7*TS+16 },
      // Crystals — dense scatter in all colors
      { type:'crystal', id:'c_fs_0',  x:4*TS+8,  y:7*TS+8,  color:'#b060ff' },
      { type:'crystal', id:'c_fs_1',  x:8*TS+4,  y:10*TS+8  },
      { type:'crystal', id:'c_fs_2',  x:12*TS+8, y:11*TS+8, color:'#00c8ff' },
      { type:'crystal', id:'c_fs_3',  x:16*TS+4, y:7*TS+8,  color:'#ff8c14' },
      { type:'crystal', id:'c_fs_4',  x:18*TS+8, y:10*TS+8, color:'#ffc94a' },
      { type:'crystal', id:'c_fs_5',  x:6*TS+4,  y:12*TS+8, color:'#b060ff' },
      { type:'crystal', id:'c_fs_6',  x:3*TS+4,  y:9*TS+8,  color:'#ffc94a' },
      { type:'crystal', id:'c_fs_7',  x:19*TS+4, y:8*TS+8,  color:'#00c8ff' },
      { type:'crystal', id:'c_fs_8',  x:14*TS+8, y:12*TS+8, color:'#b060ff' },
      { type:'crystal', id:'c_fs_9',  x:5*TS+4,  y:11*TS+8, color:'#ff8c14' },
      { type:'crystal', id:'c_fs_10', x:17*TS+4, y:12*TS+8, color:'#ffc94a' },
      { type:'crystal', id:'c_fs_11', x:9*TS+8,  y:13*TS+4, color:'#00c8ff' },
      { type:'crystal', id:'c_fs_12', x:13*TS+4, y:13*TS+4, color:'#b060ff' },
      { type:'crystal', id:'c_fs_13', x:2*TS+8,  y:12*TS+8, color:'#b060ff' },
      { type:'crystal', id:'c_fs_14', x:20*TS,   y:12*TS+8, color:'#ff8c14' },
      // Trigger: exit
      { type:'trigger', id:'t_back_city2', x:10*TS+8, y:13*TS+16, label:'MAIN STREET', toMap:'city', toX:10*TS, toY:8*TS },
      // Signs
      { type:'sign', id:'s_shop',  x:8*TS,    y:2*TS+4, text:['CRYSTAL NIGHTS', 'THE SHOP'] },
      { type:'sign', id:'s_left',  x:3*TS,    y:3*TS+4, text:['RARE SPECIMENS'] },
      { type:'sign', id:'s_right', x:14*TS,   y:3*TS+4, text:['THE ARCHIVE'] },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────
   NPC DATA
───────────────────────────────────────────────────────────── */
const NPCS = {
  rosa: {
    id: 'rosa', name: 'MADAME ROSA', role: 'Keeper of the Crystal Gate',
    color: '#b060ff', item: 'amethyst', unlocks: ['hills','underground'],
    dialog: [
      'You found it. Not everyone does. This city hides its doors from the ones who are rushing.',
      'Before there was a song, there was energy. Before the energy — a silence deep enough to feel something stir.',
      'This amethyst is not a stone. It is a tuning fork for everything you are about to find. It hums at the frequency of what has not yet been made.',
      'Take it. Let it pull you where it wants to go. Head north to the hills. Go underground. The signal is already waiting.',
    ],
  },
  leo: {
    id: 'leo', name: 'LEO', role: 'Keeper of the Oscillator',
    color: '#00c8ff', item: 'synth', unlocks: [],
    dialog: [
      "I came up here the night the synthesizer first spoke. Not metaphor — it literally answered back. I changed a filter and the room changed with it.",
      'A synth has no memory of what it was before you touched it. Every session it is newborn. That\'s why it never lies.',
      'We ran it through rooms we\'d never enter sober. Wet reverb, cold tape. The sound of being underwater and perfectly calm at the same time.',
      'This unit carries those frequencies still. Every patch saved like a scar. It belongs in the song — take it.',
    ],
  },
  marcus: {
    id: 'marcus', name: 'MARCUS', role: 'Keeper of the Pulse',
    color: '#ff8c14', item: 'sp404', unlocks: ['train'],
    dialog: [
      'The SP404 is not a tool. It is a time machine. Press a pad and a moment plays back — not just sound, but the whole feeling of the room it was born in.',
      'We sampled everything. A train door closing. A chord played once on a piano that no longer exists. Rain on a skylight at 3am when there was no reason to be awake except this.',
      'Sampling is the oldest music there is. The first musician heard a bird and tried to sing it back. We are all just doing that, with better equipment.',
      'Jin is on the 7 train — last car. She has the microphone. Go now, before the line stops running.',
    ],
  },
  jin: {
    id: 'jin', name: 'JIN', role: 'Keeper of the Voice',
    color: '#ffc94a', item: 'mic', unlocks: [],
    dialog: [
      'The microphone does not record sound. It records intention. You lean in close and something true comes out.',
      'We sang into this one for three years. Broke it twice, fixed it, broke it again. The capsule still carries every room we have been in.',
      'Your voice is the only instrument that was inside your body before you ever heard music. That is not nothing.',
      'Everything you need is here now. The signal is complete. Go find the Crystal Shop — let the crystals finish what we started.',
    ],
  },
};

const ALL_ITEMS = ['amethyst', 'synth', 'sp404', 'mic'];

/* ─────────────────────────────────────────────────────────────
   GAME STATE
───────────────────────────────────────────────────────────── */
const G = {
  mapId: 'city',
  player: { x: 12*TS + 16, y: 6*TS + 16, vx: 0, vy: 0, facing: 'd', speed: 120 },
  camera: { x: 0, y: 0 },
  crystals: 0,
  inventory: new Set(),
  completedNPCs: new Set(),
  collectedCrystals: new Set(),
  shopUnlocked: false,
  dialog: null,
  keys: { up:false, down:false, left:false, right:false, action:false },
  transitioning: false,
  particles: [],
  rainDrops: [],
  stars: [],
  time: 0,
  lastTime: 0,
  started: false,
};

/* ─────────────────────────────────────────────────────────────
   SAVE / LOAD
───────────────────────────────────────────────────────────── */
const SAVE_KEY = 'cn_rpg_v1';

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    mapId:            G.mapId,
    playerX:          G.player.x,
    playerY:          G.player.y,
    crystals:         G.crystals,
    inventory:        [...G.inventory],
    completedNPCs:    [...G.completedNPCs],
    collectedCrystals:[...G.collectedCrystals],
    shopUnlocked:     G.shopUnlocked,
  }));
}

function loadGame() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!d) return false;
    G.mapId            = d.mapId || 'city';
    G.player.x         = d.playerX || 15*TS+16;
    G.player.y         = d.playerY || 8*TS+16;
    G.crystals         = d.crystals || 0;
    G.inventory        = new Set(d.inventory || []);
    G.completedNPCs    = new Set(d.completedNPCs || []);
    G.collectedCrystals= new Set(d.collectedCrystals || []);
    G.shopUnlocked     = d.shopUnlocked || false;
    return G.inventory.size > 0 || G.crystals > 0;
  } catch(e) {
    return false;
  }
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

/* ─────────────────────────────────────────────────────────────
   CANVAS SETUP
───────────────────────────────────────────────────────────── */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ─────────────────────────────────────────────────────────────
   INPUT
───────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':    case 'w': case 'W': G.keys.up    = true; e.preventDefault(); break;
    case 'ArrowDown':  case 's': case 'S': G.keys.down  = true; e.preventDefault(); break;
    case 'ArrowLeft':  case 'a': case 'A': G.keys.left  = true; e.preventDefault(); break;
    case 'ArrowRight': case 'd': case 'D': G.keys.right = true; e.preventDefault(); break;
    case 'z': case 'Z': case 'Enter': case ' ':
      G.keys.action = true;
      e.preventDefault();
      handleAction();
      break;
    case 'Escape':
      if (G.dialog) closeDialog();
      break;
    case 'm': case 'M':
      if (G.started && !G.dialog) showMapToast();
      break;
  }
});

document.addEventListener('keyup', e => {
  switch (e.key) {
    case 'ArrowUp':    case 'w': case 'W': G.keys.up    = false; break;
    case 'ArrowDown':  case 's': case 'S': G.keys.down  = false; break;
    case 'ArrowLeft':  case 'a': case 'A': G.keys.left  = false; break;
    case 'ArrowRight': case 'd': case 'D': G.keys.right = false; break;
    case 'z': case 'Z': case 'Enter': case ' ': G.keys.action = false; break;
  }
});

/* ─────────────────────────────────────────────────────────────
   COLLISION
───────────────────────────────────────────────────────────── */
function getTile(mapId, tx, ty) {
  const m = WORLD[mapId]?.tiles;
  if (!m) return T.WALL;
  if (ty < 0 || ty >= m.length || tx < 0 || tx >= m[0].length) return T.WALL;
  return m[ty][tx];
}

function isSolid(mapId, tx, ty) {
  return SOLID.has(getTile(mapId, tx, ty));
}

function playerCanMoveTo(mapId, nx, ny) {
  // Player hitbox: 14×18 centered on feet position
  const hw = 7, ht = 9;
  const left  = nx - hw;
  const right  = nx + hw - 1;
  const top    = ny - ht;
  const bottom = ny + ht - 1;

  const corners = [
    [Math.floor(left / TS),  Math.floor(top / TS)],
    [Math.floor(right / TS), Math.floor(top / TS)],
    [Math.floor(left / TS),  Math.floor(bottom / TS)],
    [Math.floor(right / TS), Math.floor(bottom / TS)],
  ];
  return corners.every(([tx,ty]) => !isSolid(mapId, tx, ty));
}

/* ─────────────────────────────────────────────────────────────
   MOVEMENT
───────────────────────────────────────────────────────────── */
function movePlayer(dt) {
  if (G.dialog || G.transitioning) return;
  const p   = G.player;
  const spd = p.speed * dt;
  let dx = 0, dy = 0;

  if (G.keys.up)    { dy -= spd; p.facing = 'u'; }
  if (G.keys.down)  { dy += spd; p.facing = 'd'; }
  if (G.keys.left)  { dx -= spd; p.facing = 'l'; }
  if (G.keys.right) { dx += spd; p.facing = 'r'; }

  if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

  const map   = WORLD[G.mapId];
  const maxX  = (map.tiles[0].length) * TS - 1;
  const maxY  = (map.tiles.length)    * TS - 1;

  const newX = Math.max(8, Math.min(maxX - 8, p.x + dx));
  const newY = Math.max(9, Math.min(maxY - 9, p.y + dy));

  // Separate X and Y resolution
  if (playerCanMoveTo(G.mapId, newX, p.y)) p.x = newX;
  if (playerCanMoveTo(G.mapId, p.x, newY)) p.y = newY;
}

/* ─────────────────────────────────────────────────────────────
   CAMERA
───────────────────────────────────────────────────────────── */
function updateCamera() {
  const p    = G.player;
  const map  = WORLD[G.mapId];
  const mw   = map.tiles[0].length * TS;
  const mh   = map.tiles.length    * TS;
  const cw   = canvas.width;
  const ch   = canvas.height;

  const targetX = p.x - cw / 2;
  const targetY = p.y - ch / 2;

  const maxCX = Math.max(0, mw - cw);
  const maxCY = Math.max(0, mh - ch);

  G.camera.x += (Math.max(0, Math.min(maxCX, targetX)) - G.camera.x) * 0.12;
  G.camera.y += (Math.max(0, Math.min(maxCY, targetY)) - G.camera.y) * 0.12;
}

/* ─────────────────────────────────────────────────────────────
   CRYSTAL PICKUP
───────────────────────────────────────────────────────────── */
function checkCrystalPickup() {
  const p   = G.player;
  const map = WORLD[G.mapId];
  map.entities.forEach(e => {
    if (e.type !== 'crystal') return;
    if (G.collectedCrystals.has(e.id)) return;
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    if (Math.sqrt(dx*dx + dy*dy) < 18) {
      G.collectedCrystals.add(e.id);
      G.crystals++;
      updateCrystalHUD();
      spawnSparkle(e.x, e.y, e.color || '#b060ff');
    }
  });
}

function spawnSparkle(x, y, color) {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.3;
    const speed = 40 + Math.random() * 60;
    G.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

/* ─────────────────────────────────────────────────────────────
   TRIGGER CHECK
───────────────────────────────────────────────────────────── */
function checkTriggers() {
  if (G.dialog || G.transitioning) return;
  const p = G.player;
  const map = WORLD[G.mapId];
  map.entities.forEach(e => {
    if (e.type !== 'trigger') return;
    const dx = Math.abs(p.x - e.x);
    const dy = Math.abs(p.y - e.y);
    if (dx < 20 && dy < 20) {
      autoTrigger(e);
    }
  });
}

function autoTrigger(e) {
  // requiresAll: need all 4 items
  if (e.requiresAll) {
    if (!ALL_ITEMS.every(id => G.inventory.has(id))) {
      showToast('You need all 4 instruments to enter the Crystal Shop.');
      return;
    }
  }
  // requires: single NPC done
  if (e.requires && !G.completedNPCs.has(e.requires)) {
    const npc = NPCS[e.requires];
    showToast('Speak to ' + (npc ? npc.name : e.requires) + ' first.');
    return;
  }
  transitionToMap(e.toMap, e.toX, e.toY);
}

/* ─────────────────────────────────────────────────────────────
   INTERACTION
───────────────────────────────────────────────────────────── */
function handleAction() {
  if (!G.started) return;
  if (G.transitioning) return;

  // If dialog is open — collect if done, otherwise advance
  if (G.dialog) {
    if (G.dialog.done) {
      collectItem();
    } else {
      advanceDialog();
    }
    return;
  }

  // Find nearest NPC within 48px
  const p   = G.player;
  const map = WORLD[G.mapId];
  let nearest = null, nearestDist = 48;

  map.entities.forEach(e => {
    if (e.type === 'npc') {
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < nearestDist) { nearest = e; nearestDist = d; }
    }
    if (e.type === 'station') {
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < nearestDist) { nearest = e; nearestDist = d; }
    }
  });

  if (nearest) {
    if (nearest.type === 'npc') {
      openDialog(nearest.id);
    } else if (nearest.type === 'station') {
      triggerFinale();
    }
    return;
  }

  // Find nearest trigger within 36px
  let nearestTrig = null; let trigDist = 36;
  map.entities.forEach(e => {
    if (e.type === 'trigger') {
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < trigDist) { nearestTrig = e; trigDist = d; }
    }
  });
  if (nearestTrig) autoTrigger(nearestTrig);
}

/* ─────────────────────────────────────────────────────────────
   DIALOG
───────────────────────────────────────────────────────────── */
let _typeTimer    = null;
let _typeTarget   = '';
let _typeIndex    = 0;

function openDialog(npcId) {
  const npc = NPCS[npcId];
  if (!npc) return;

  const alreadyDone = G.completedNPCs.has(npcId);

  G.dialog = {
    npc: npcId,
    lineIndex: 0,
    typing: true,
    typeText: '',
    done: false,
    alreadyDone,
  };

  const portrait = document.getElementById('dialog-portrait');
  const nameEl   = document.getElementById('dialog-npc-name');
  const roleEl   = document.getElementById('dialog-npc-role');
  const collectBtn = document.getElementById('dialog-collect');
  const nextBtn    = document.getElementById('dialog-next');

  portrait.className = 'portrait-' + npcId;
  nameEl.textContent  = npc.name;
  nameEl.style.color  = npc.color;
  roleEl.textContent  = npc.role;
  collectBtn.style.display = 'none';
  nextBtn.style.display    = 'inline-flex';

  document.getElementById('dialog-box').classList.add('active');
  document.body.classList.add('dialog-open');
  typeDialogLine(npc.dialog[0]);
}

function typeDialogLine(text) {
  clearTimeout(_typeTimer);
  _typeTarget = text;
  _typeIndex  = 0;
  const el    = document.getElementById('dialog-text');
  el.textContent = '';

  function tick() {
    if (_typeIndex < _typeTarget.length) {
      el.textContent += _typeTarget[_typeIndex++];
      _typeTimer = setTimeout(tick, 28);
    } else {
      if (G.dialog) G.dialog.typing = false;
    }
  }
  tick();
}

function advanceDialog() {
  if (!G.dialog) return;
  const d   = G.dialog;
  const npc = NPCS[d.npc];
  const el  = document.getElementById('dialog-text');

  // If still typing, skip to end
  if (el.textContent !== _typeTarget) {
    clearTimeout(_typeTimer);
    el.textContent = _typeTarget;
    d.typing = false;
    return;
  }

  // If already done and re-reading, just close
  if (d.alreadyDone) {
    closeDialog();
    return;
  }

  d.lineIndex++;
  if (d.lineIndex >= npc.dialog.length) {
    // Last line — show collect button
    const collectBtn = document.getElementById('dialog-collect');
    const nextBtn    = document.getElementById('dialog-next');
    nextBtn.style.display    = 'none';
    collectBtn.style.display = 'inline-flex';
    collectBtn.textContent   = '[ Z ]  TAKE THE ' + npc.item.toUpperCase();
    collectBtn.style.setProperty('--btn-color', npc.color);
    d.done = true;
  } else {
    typeDialogLine(npc.dialog[d.lineIndex]);
  }
}

function collectItem() {
  if (!G.dialog || !G.dialog.done) return;
  const d   = G.dialog;
  const npc = NPCS[d.npc];

  G.inventory.add(npc.item);
  G.completedNPCs.add(npc.id);

  // Check win condition
  const allDone = ALL_ITEMS.every(id => G.inventory.has(id));
  if (allDone && !G.shopUnlocked) {
    G.shopUnlocked = true;
  }

  saveGame();
  closeDialog();
  updateInventoryHUD();

  // Toast notification
  let msg = '◆  ' + npc.item.toUpperCase() + ' collected.';
  if (npc.unlocks.length) {
    msg += '\n' + npc.unlocks.map(id => WORLD[id]?.name || id).join(' & ') + ' now accessible.';
  }
  if (allDone) msg += '\n★  ALL INSTRUMENTS FOUND. CRYSTAL SHOP UNLOCKED.';
  showToast(msg);

  // Sparkle at NPC position
  const map = WORLD[G.mapId];
  map.entities.forEach(e => {
    if (e.type === 'npc' && e.id === d.npc) {
      for (let i = 0; i < 20; i++) spawnSparkle(e.x, e.y, npc.color);
    }
  });
}

function closeDialog() {
  clearTimeout(_typeTimer);
  G.dialog = null;
  document.getElementById('dialog-box').classList.remove('active');
  document.body.classList.remove('dialog-open');
  document.getElementById('dialog-collect').style.display = 'none';
  document.getElementById('dialog-next').style.display    = 'inline-flex';
}

/* ─────────────────────────────────────────────────────────────
   MAP TRANSITION
───────────────────────────────────────────────────────────── */
function transitionToMap(toMap, toX, toY) {
  if (G.transitioning) return;
  G.transitioning = true;

  // hills events
  if (G.mapId === 'hills') {
    document.dispatchEvent(new CustomEvent('roomWillLeave', { detail: { from: 'room-roof' } }));
  }

  const overlay = document.getElementById('transition-overlay');
  overlay.classList.add('active');

  setTimeout(() => {
    const prevMap = G.mapId;
    G.mapId      = toMap;
    G.player.x   = toX;
    G.player.y   = toY;
    G.particles  = [];
    G.rainDrops  = initRain();
    G.stars      = initStars();
    G.camera.x   = G.player.x - canvas.width  / 2;
    G.camera.y   = G.player.y - canvas.height / 2;

    updateHUDLocation();

    overlay.classList.remove('active');
    G.transitioning = false;

    if (toMap === 'hills') {
      document.dispatchEvent(new CustomEvent('roomDidEnter', { detail: { room: 'room-roof' } }));
    }
    saveGame();
  }, 300);
}

/* ─────────────────────────────────────────────────────────────
   FINALE
───────────────────────────────────────────────────────────── */
function triggerFinale() {
  const finaleScreen = document.getElementById('finale-screen');
  finaleScreen.classList.add('active');
  document.dispatchEvent(new CustomEvent('crystalNightsFinale'));
  showToast('★ THE TRANSMISSION INITIATED.');
}

/* ─────────────────────────────────────────────────────────────
   HUD UPDATES
───────────────────────────────────────────────────────────── */
function updateCrystalHUD() {
  const el = document.getElementById('crystal-count');
  if (el) el.textContent = '◆ ' + G.crystals;
}

function updateInventoryHUD() {
  ALL_ITEMS.forEach(id => {
    const slot = document.getElementById('inv-' + id);
    if (slot) slot.classList.toggle('has-item', G.inventory.has(id));
  });
}

function updateHUDLocation() {
  const el = document.getElementById('hud-location');
  if (el) el.textContent = WORLD[G.mapId]?.name || '';
}

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
let _toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
}

function showMapToast() {
  const map  = WORLD[G.mapId];
  let msg = '◆ ' + map.name;
  if (map.ambient) msg += '\n' + map.ambient;
  showToast(msg);
}

/* ─────────────────────────────────────────────────────────────
   AMBIENT EFFECTS
───────────────────────────────────────────────────────────── */
function initRain() {
  return Array.from({ length: 60 }, () => ({
    x: Math.random() * 3000,
    y: Math.random() * 3000,
    speed: 200 + Math.random() * 200,
    len: 8 + Math.random() * 12,
    alpha: 0.1 + Math.random() * 0.2,
  }));
}

function initStars() {
  return Array.from({ length: 120 }, () => ({
    x: Math.random() * 3000,
    y: Math.random() * 1000,
    r: 0.5 + Math.random() * 1.5,
    alpha: 0.3 + Math.random() * 0.7,
    twinkle: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 1.5,
  }));
}

/* ─────────────────────────────────────────────────────────────
   UPDATE
───────────────────────────────────────────────────────────── */
function update(dt) {
  G.time += dt;

  movePlayer(dt);
  checkCrystalPickup();
  checkTriggers();
  updateCamera();

  // Update particles
  G.particles = G.particles.filter(p => {
    p.x    += p.vx * dt;
    p.y    += p.vy * dt;
    p.vy   += 60 * dt; // gravity
    p.life -= dt * 2;
    return p.life > 0;
  });

  // Update rain
  const mh = (WORLD[G.mapId]?.tiles.length || 24) * TS;
  G.rainDrops.forEach(r => {
    r.y += r.speed * dt;
    if (r.y > mh) r.y = -20;
  });

  // Update stars twinkle
  G.stars.forEach(s => { s.twinkle += s.speed * dt; });
}

/* ─────────────────────────────────────────────────────────────
   RENDER
───────────────────────────────────────────────────────────── */
function render() {
  const cw  = canvas.width;
  const ch  = canvas.height;
  const cx  = Math.floor(G.camera.x);
  const cy  = Math.floor(G.camera.y);
  const map = WORLD[G.mapId];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cw, ch);

  ctx.save();
  ctx.translate(-cx, -cy);

  drawTiles(map, cx, cy, cw, ch);
  drawAmbientEffects();
  drawEntities(map);
  drawPlayer();
  drawParticles();
  drawNeonSigns(map, cx, cy, cw, ch);

  ctx.restore();
}

/* ─── TILE RENDERING ─────────────────────────────────────── */
function drawTiles(map, cx, cy, cw, ch) {
  const tiles = map.tiles;
  const rows  = tiles.length;
  const cols  = tiles[0].length;

  const startX = Math.max(0, Math.floor(cx / TS) - 1);
  const startY = Math.max(0, Math.floor(cy / TS) - 1);
  const endX   = Math.min(cols - 1, Math.floor((cx + cw) / TS) + 1);
  const endY   = Math.min(rows - 1, Math.floor((cy + ch) / TS) + 1);

  for (let ty = startY; ty <= endY; ty++) {
    for (let tx = startX; tx <= endX; tx++) {
      const tile = tiles[ty][tx];
      const px   = tx * TS;
      const py   = ty * TS;

      ctx.fillStyle = TILE_COLORS[tile] || '#000';
      ctx.fillRect(px, py, TS, TS);

      // Tile details
      drawTileDetail(tile, px, py, tx, ty);
    }
  }
}

function drawTileDetail(tile, px, py, tx, ty) {
  switch (tile) {
    case T.ROAD:
      // Center dashes
      ctx.fillStyle = 'rgba(255,255,150,0.08)';
      if ((tx + ty) % 4 === 0) ctx.fillRect(px + TS/2 - 1, py + 4, 2, TS - 8);
      // Slight gradient
      ctx.fillStyle = 'rgba(255,255,255,0.015)';
      ctx.fillRect(px, py, TS, 2);
      break;

    case T.SIDE:
      // Sidewalk grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth   = 0.5;
      ctx.strokeRect(px + 0.5, py + 0.5, TS - 1, TS - 1);
      break;

    case T.BUILD:
      // Building face detail
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(px, py, TS, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(px, py + TS - 1, TS, 1);
      break;

    case T.WIN: {
      // Glowing window
      const t = G.time;
      const flicker = 0.5 + 0.5 * Math.sin(t * 1.3 + tx * 0.7 + ty * 1.1);
      const alpha = 0.3 + flicker * 0.4;
      // Window colors vary
      const winColors = ['#4a2a70', '#1a3a5a', '#2a1a40', '#3a2a10'];
      ctx.fillStyle = winColors[(tx + ty) % winColors.length];
      ctx.fillRect(px + 4, py + 4, TS - 8, TS - 8);
      // Glow
      const grd = ctx.createRadialGradient(px+TS/2, py+TS/2, 0, px+TS/2, py+TS/2, TS);
      grd.addColorStop(0, `rgba(176,96,255,${alpha * 0.3})`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(px - TS/2, py - TS/2, TS * 2, TS * 2);
      break;
    }

    case T.GRASS:
      // Subtle grass texture
      ctx.fillStyle = 'rgba(0,80,0,0.06)';
      if ((tx * 3 + ty * 7) % 5 === 0) ctx.fillRect(px + 8, py + 12, 2, 6);
      if ((tx * 7 + ty * 3) % 5 === 0) ctx.fillRect(px + 20, py + 8, 2, 5);
      break;

    case T.WATER: {
      // Animated water
      const wave = Math.sin(G.time * 2 + tx * 0.5) * 2;
      ctx.fillStyle = `rgba(0,80,200,0.15)`;
      ctx.fillRect(px, py + TS/2 + wave, TS, TS/2 - wave);
      ctx.fillStyle = 'rgba(0,200,255,0.06)';
      ctx.fillRect(px, py, TS, 3);
      break;
    }

    case T.PLAT:
      // Platform edge highlight
      ctx.fillStyle = 'rgba(176,96,255,0.08)';
      ctx.fillRect(px, py + TS - 3, TS, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(px, py, TS, TS/2);
      break;

    case T.TRACK:
      // Rail lines
      ctx.fillStyle = 'rgba(100,100,120,0.3)';
      ctx.fillRect(px + 4, py + 6, 3, TS - 12);
      ctx.fillRect(px + TS - 7, py + 6, 3, TS - 12);
      // Ties
      if (tx % 2 === 0) {
        ctx.fillStyle = 'rgba(80,60,40,0.3)';
        ctx.fillRect(px, py + TS/2 - 2, TS, 4);
      }
      break;

    case T.CTR:
      // Counter top highlight
      ctx.fillStyle = 'rgba(176,96,255,0.12)';
      ctx.fillRect(px, py, TS, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(px + 2, py + 4, TS - 4, TS - 8);
      break;

    case T.FLOOR:
      // Interior floor detail
      ctx.fillStyle = 'rgba(176,96,255,0.02)';
      if ((tx + ty) % 2 === 0) ctx.fillRect(px, py, TS, TS);
      break;
  }
}

/* ─── AMBIENT EFFECTS ────────────────────────────────────── */
function drawAmbientEffects() {
  if (G.mapId === 'city') drawRain();
  if (G.mapId === 'hills') drawStars();
}

function drawRain() {
  ctx.save();
  G.rainDrops.forEach(r => {
    ctx.strokeStyle = `rgba(150,180,255,${r.alpha})`;
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x - 1, r.y + r.len);
    ctx.stroke();
  });
  ctx.restore();
}

function drawStars() {
  ctx.save();
  G.stars.forEach(s => {
    const a = (Math.sin(s.twinkle) * 0.5 + 0.5) * s.alpha;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/* ─── ENTITY RENDERING ───────────────────────────────────── */
function drawEntities(map) {
  map.entities.forEach(e => {
    switch (e.type) {
      case 'crystal': drawCrystal(e); break;
      case 'npc':     drawNPC(e);     break;
      case 'trigger': drawTrigger(e); break;
      case 'station': drawStation(e); break;
      case 'deco':    drawDeco(e);    break;
    }
  });
}

function drawCrystal(e) {
  if (G.collectedCrystals.has(e.id)) return;
  const color = e.color || '#b060ff';
  const t     = G.time;
  const bob   = Math.sin(t * 2 + e.x * 0.01) * 3;
  const rot   = t * 1.5 + e.x * 0.05;
  const px    = e.x;
  const py    = e.y + bob;
  const size  = 6;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(rot);

  // Glow
  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
  grd.addColorStop(0, color + '55');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(-18, -18, 36, 36);

  // Diamond shape
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.6, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.6, 0);
  ctx.closePath();
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(size * 0.25, -size * 0.1);
  ctx.lineTo(0, size * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawNPC(e) {
  const npc   = NPCS[e.id];
  if (!npc) return;
  const color = npc.color;
  const bob   = Math.sin(G.time * 1.8 + e.x * 0.02) * 2.5;
  const px    = e.x;
  const py    = e.y + bob;
  const done  = G.completedNPCs.has(e.id);

  ctx.save();

  // Subtle aura
  const grd = ctx.createRadialGradient(px, py - 8, 0, px, py - 8, 28);
  grd.addColorStop(0, color + '22');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(px - 28, py - 36, 56, 56);

  // Body
  ctx.fillStyle = adjustColor(color, -60);
  ctx.fillRect(px - 7, py - 8, 14, 16);

  // Head
  ctx.fillStyle = adjustColor(color, -20);
  ctx.beginPath();
  ctx.arc(px, py - 14, 8, 0, Math.PI * 2);
  ctx.fill();

  // Face highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.arc(px - 2, py - 17, 3, 0, Math.PI * 2);
  ctx.fill();

  // Exclamation if not yet spoken
  if (!done) {
    const pulse = Math.sin(G.time * 4) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255,220,0,${pulse})`;
    ctx.font      = 'bold 10px Courier New';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur  = 6;
    ctx.fillText('!', px, py - 27);
    ctx.shadowBlur  = 0;
  }

  // Name tag
  ctx.font      = '7px Courier New';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  const tw = ctx.measureText(npc.name).width + 8;
  ctx.fillRect(px - tw/2, py - 45, tw, 11);
  ctx.fillStyle = color;
  ctx.fillText(npc.name, px, py - 36);

  ctx.restore();
}

function drawTrigger(e) {
  const t  = G.time;
  const px = e.x;
  const py = e.y;

  // Distance to player
  const dx = G.player.x - px;
  const dy = G.player.y - py;
  const d  = Math.sqrt(dx*dx + dy*dy);

  const alpha = Math.max(0, 1 - d / 80) * (0.4 + Math.sin(t * 3) * 0.3);
  if (alpha < 0.05) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Arrow pointing down
  ctx.fillStyle   = '#00c8ff';
  ctx.shadowColor = '#00c8ff';
  ctx.shadowBlur  = 8;
  ctx.beginPath();
  ctx.moveTo(px, py + 6);
  ctx.lineTo(px - 5, py - 2);
  ctx.lineTo(px + 5, py - 2);
  ctx.closePath();
  ctx.fill();

  // Label
  ctx.shadowBlur = 0;
  ctx.font       = '7px Courier New';
  ctx.textAlign  = 'center';
  ctx.fillStyle  = '#ffffff';
  ctx.fillText(e.label, px, py - 8);

  ctx.restore();
}

function drawStation(e) {
  const px = e.x;
  const py = e.y;
  const t  = G.time;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.5);

  ctx.save();

  // Glow
  const grd = ctx.createRadialGradient(px, py, 0, px, py, 32);
  grd.addColorStop(0, `rgba(176,96,255,${0.2 + pulse * 0.2})`);
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(px - 32, py - 32, 64, 64);

  // Station icon (★)
  ctx.font      = '20px Courier New';
  ctx.textAlign = 'center';
  ctx.fillStyle = `rgba(176,96,255,${0.6 + pulse * 0.4})`;
  ctx.shadowColor = '#b060ff';
  ctx.shadowBlur  = 12 + pulse * 8;
  ctx.fillText('★', px, py + 7);

  // Label
  ctx.font      = '7px Courier New';
  ctx.fillStyle = 'rgba(176,96,255,0.9)';
  ctx.shadowBlur = 4;
  ctx.fillText('◆ THE SIGNAL ◆', px, py - 16);
  ctx.fillText('[ Z ] TRANSMIT', px, py + 22);

  ctx.restore();
}

function drawDeco(e) {
  // Crystal display deco — draw small crystal cluster
  for (let i = 0; i < 5; i++) {
    const ox   = (i - 2) * 14;
    const t    = G.time + i * 0.7;
    const bob  = Math.sin(t * 1.5) * 2;
    const colors = ['#b060ff','#00c8ff','#ff8c14','#ffc94a','#b060ff'];
    ctx.save();
    ctx.translate(e.x + ox, e.y + bob);
    ctx.rotate(Math.sin(t) * 0.2);
    ctx.fillStyle   = colors[i % colors.length];
    ctx.shadowColor = colors[i % colors.length];
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, 8);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/* ─── PLAYER RENDERING ───────────────────────────────────── */
function drawPlayer() {
  const p   = G.player;
  const t   = G.time;
  const bob = Math.abs(Math.sin(t * 8)) * 1.5;

  ctx.save();

  // Purple aura
  const grd = ctx.createRadialGradient(p.x, p.y - 8, 0, p.x, p.y - 8, 22);
  grd.addColorStop(0, 'rgba(176,96,255,0.25)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(p.x - 22, p.y - 30, 44, 44);

  // Shadow on ground
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 2, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = '#3a1860';
  ctx.fillRect(p.x - 7, p.y - 8 + bob, 14, 14);

  // Cloak trim
  ctx.fillStyle = '#6030a0';
  ctx.fillRect(p.x - 8, p.y - 4 + bob, 16, 2);

  // Head
  ctx.fillStyle = '#d0a8e8';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 14 + bob, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eyes based on facing
  ctx.fillStyle = '#1a0830';
  if (p.facing === 'd' || p.facing === 'u') {
    ctx.beginPath();
    ctx.arc(p.x - 3, p.y - 14 + bob, 1.5, 0, Math.PI * 2);
    ctx.arc(p.x + 3, p.y - 14 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Direction indicator
  ctx.fillStyle = 'rgba(176,96,255,0.7)';
  const dMap = { u:[0,-11], d:[0,3], l:[-10,-5], r:[10,-5] };
  const [ddx, ddy] = dMap[p.facing] || [0, 3];
  ctx.beginPath();
  ctx.arc(p.x + ddx * 0.7, p.y + ddy + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ─── PARTICLES ──────────────────────────────────────────── */
function drawParticles() {
  G.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle   = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

/* ─── NEON SIGNS ─────────────────────────────────────────── */
function drawNeonSigns(map, cx, cy, cw, ch) {
  const signs = map.entities.filter(e => e.type === 'sign');
  if (!signs.length) return;

  // Map-specific neon sign configs
  const configs = {
    city: [
      { text: 'CRYSTAL NIGHTS', x: 5 * TS, y: 2 * TS + 4, color: '#b060ff', size: 11 },
    ],
    hills: [
      { text: 'HILLSIDE STUDIO', x: 14 * TS, y: 2 * TS + 4, color: '#00c8ff', size: 10 },
    ],
    underground: [
      { text: 'METRO B', x: 12 * TS, y: 2 * TS + 8, color: '#ff8c14', size: 12 },
    ],
    train: [
      { text: 'LINE 7', x: 11 * TS, y: 1 * TS - 4, color: '#ffc94a', size: 11 },
    ],
    finalshop: [
      { text: 'CRYSTAL NIGHTS', x: 7 * TS,  y: 2 * TS + 4,  color: '#b060ff', size: 11 },
      { text: 'RARE SPECIMENS', x: 3 * TS,  y: 3 * TS + 12, color: '#ffc94a', size: 8  },
      { text: 'THE ARCHIVE',    x: 14 * TS, y: 3 * TS + 12, color: '#00c8ff', size: 8  },
    ],
  };

  const mapSigns = configs[G.mapId] || [];
  const t        = G.time;

  mapSigns.forEach(s => {
    const flicker = 0.85 + 0.15 * Math.sin(t * 3.7 + s.x);
    ctx.save();
    ctx.font      = `${s.size}px 'Courier New'`;
    ctx.textAlign = 'left';
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur  = 14 * flicker;
    ctx.globalAlpha = flicker;
    ctx.fillText(s.text, s.x, s.y);

    // Second pass for extra glow
    ctx.shadowBlur  = 28 * flicker;
    ctx.globalAlpha = flicker * 0.4;
    ctx.fillText(s.text, s.x, s.y);
    ctx.restore();
  });
}

/* ─────────────────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────────────────── */
function adjustColor(hex, amount) {
  // Darken/lighten a hex color
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

/* ─────────────────────────────────────────────────────────────
   GAME LOOP
───────────────────────────────────────────────────────────── */
function loop(ts) {
  const dt = Math.min((ts - G.lastTime) / 1000, 0.05);
  G.lastTime = ts;

  if (G.started) {
    update(dt);
    render();
  }

  requestAnimationFrame(loop);
}

/* ─────────────────────────────────────────────────────────────
   START GAME
───────────────────────────────────────────────────────────── */
function startGame() {
  document.getElementById('title-screen').classList.add('hide');
  setTimeout(() => {
    document.getElementById('title-screen').style.display = 'none';
  }, 500);

  const hud = document.getElementById('hud');
  if (hud) hud.classList.remove('hide');

  G.started = true;
  document.body.classList.add('game-active');
  G.rainDrops = initRain();
  G.stars     = initStars();

  // Snap camera
  G.camera.x = G.player.x - canvas.width  / 2;
  G.camera.y = G.player.y - canvas.height / 2;

  updateCrystalHUD();
  updateInventoryHUD();
  updateHUDLocation();

  // Ambient toast after a moment
  setTimeout(() => showToast(WORLD[G.mapId].ambient), 800);
}

/* ─────────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Hide HUD initially
  const hud = document.getElementById('hud');
  if (hud) hud.classList.add('hide');

  // Load saved state
  const hasSave = loadGame();

  // Update HUD from loaded state (won't show yet)
  updateInventoryHUD();
  updateCrystalHUD();
  updateHUDLocation();

  // Title screen
  document.getElementById('btn-start')?.addEventListener('click', startGame);

  // Enter key on title
  document.addEventListener('keydown', e => {
    if (!G.started && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      startGame();
    }
  });

  // Dialog buttons
  document.getElementById('dialog-next')?.addEventListener('click', advanceDialog);
  document.getElementById('dialog-collect')?.addEventListener('click', collectItem);

  // Reset
  document.getElementById('btn-reset')?.addEventListener('click', resetGame);

  // Finale play-again
  document.getElementById('btn-play-again')?.addEventListener('click', resetGame);

  // If returning player with save, skip title
  if (hasSave) {
    startGame();
  }

  // Mobile D-pad touch handlers
  function bindDpadKey(id, key) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('touchstart', e => { e.preventDefault(); G.keys[key] = true; }, { passive: false });
    btn.addEventListener('touchend',   e => { e.preventDefault(); G.keys[key] = false; }, { passive: false });
    btn.addEventListener('touchcancel', () => { G.keys[key] = false; });
  }
  bindDpadKey('dpad-up',    'up');
  bindDpadKey('dpad-down',  'down');
  bindDpadKey('dpad-left',  'left');
  bindDpadKey('dpad-right', 'right');

  const btnActionMobile = document.getElementById('btn-action-mobile');
  if (btnActionMobile) {
    btnActionMobile.addEventListener('touchstart', e => {
      e.preventDefault();
      handleAction();
    }, { passive: false });
  }

  // Kick off loop
  requestAnimationFrame(loop);
});
