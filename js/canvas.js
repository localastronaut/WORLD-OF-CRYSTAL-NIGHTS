/* =============================================================
   CRYSTAL NIGHTS — canvas.js
   Animated skyline canvas for the ROOF room.
   Features: stars, moon, procedural buildings, lit windows,
   neon rooftop signs, rain, wet ground reflection,
   3 lanes of car headlights, occasional trains.
   Also draws the telescope scope overlay canvas.
============================================================= */

'use strict';

/* ─── SKYLINE CANVAS ─────────────────────────────────────── */

const skylineCanvas = document.getElementById('skyline-canvas');
let skyCtx = skylineCanvas ? skylineCanvas.getContext('2d') : null;

/* Scene state */
let skyW = 0, skyH = 0;
let skyAnimFrame = null;
let skyActive = false;

/* Procedurally generated scene data */
let stars     = [];
let buildings = [];
let cars      = [];
let train     = null;
let trainTimer = 0;
let rainDrops = [];
let frameCount = 0;
let moonGlow  = 0;

/* Neon sign definitions */
const NEON_TEXTS  = ['MOTEL', 'BAR', 'OPEN', '24H', 'DINER', 'ROOMS', 'EAT'];
const NEON_COLORS = ['#ff3eb5', '#00c8ff', '#ffc94a', '#00ffb3', '#b060ff', '#ff6060', '#ffc94a'];

/* ─── INIT SCENE ─────────────────────────────────────────── */

function initSkyline() {
  if (!skylineCanvas) return;

  skyW = skylineCanvas.width  = window.innerWidth;
  skyH = skylineCanvas.height = window.innerHeight;

  generateStars();
  generateBuildings();
  generateCars();
  generateRain();

  // Start train timer
  trainTimer = Math.random() * 20000 + 20000; // 20-40 seconds
}

function generateStars() {
  stars = [];
  const count = 200;
  for (let i = 0; i < count; i++) {
    stars.push({
      x:         Math.random() * skyW,
      y:         Math.random() * skyH * 0.55,
      r:         Math.random() * 1.5 + 0.3,
      brightness: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }
}

function generateBuildings() {
  buildings = [];
  let x = 0;
  const groundY = skyH * 0.72; // buildings sit above this

  while (x < skyW + 80) {
    const w = Math.random() * 80 + 30;
    const h = Math.random() * (skyH * 0.45) + skyH * 0.08;
    const y = groundY - h;

    // Generate windows grid
    const windows = [];
    const cols = Math.floor(w / 14);
    const rows = Math.floor(h / 16);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.25) { // 75% chance of existing window
          windows.push({
            col: c, row: r,
            lit: Math.random() > 0.35,
            blinkPhase: Math.random() * Math.PI * 2,
            blinkSpeed: Math.random() * 0.004 + 0.001,
            color: windowColor(),
          });
        }
      }
    }

    // Neon sign on rooftop
    const hasSign = Math.random() > 0.65;
    const signIdx = Math.floor(Math.random() * NEON_TEXTS.length);
    const signColorIdx = Math.floor(Math.random() * NEON_COLORS.length);

    buildings.push({
      x, y, w, h,
      color: buildingColor(),
      windows,
      hasSign,
      signText:  NEON_TEXTS[signIdx],
      signColor: NEON_COLORS[signColorIdx],
      signFlicker: Math.random() * Math.PI * 2,
      signFlickerSpeed: Math.random() * 0.05 + 0.02,
    });

    x += w + Math.random() * 6 - 2;
  }
}

function buildingColor() {
  const v = Math.floor(Math.random() * 20 + 8);
  return `rgb(${v+2}, ${v}, ${v+4})`;
}

function windowColor() {
  const choices = [
    'rgba(255, 240, 180, 0.9)',  // warm yellow
    'rgba(200, 230, 255, 0.85)', // cool blue-white
    'rgba(255, 200, 100, 0.9)',  // amber
    'rgba(180, 255, 200, 0.75)', // greenish
    'rgba(255, 180, 100, 0.85)', // orange
  ];
  return choices[Math.floor(Math.random() * choices.length)];
}

/* ─── CARS ───────────────────────────────────────────────── */

const CAR_LANES = [0.80, 0.855, 0.91]; // y positions as fraction of skyH

function generateCars() {
  cars = [];
  for (let lane = 0; lane < 3; lane++) {
    const count = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < count; i++) {
      spawnCar(lane, i * (skyW / count + Math.random() * 200));
    }
  }
}

function spawnCar(lane, startX) {
  const goingLeft = Math.random() > 0.5;
  cars.push({
    x:       startX !== undefined ? startX : (goingLeft ? skyW + 20 : -20),
    lane,
    speed:   (Math.random() * 1.5 + 0.8) * (goingLeft ? -1 : 1),
    goingLeft,
    color1:  carHeadlightColor(goingLeft),
    color2:  carHeadlightColor(goingLeft),
    w:       Math.random() * 8 + 10,
  });
}

function carHeadlightColor(goingLeft) {
  // Going right = headlights (white/yellow), going left = tail lights (red)
  if (!goingLeft) {
    return Math.random() > 0.3 ? 'rgba(255,248,220,0.9)' : 'rgba(255,230,160,0.85)';
  } else {
    return 'rgba(255,40,40,0.8)';
  }
}

/* ─── RAIN ───────────────────────────────────────────────── */

function generateRain() {
  rainDrops = [];
  const count = 160;
  for (let i = 0; i < count; i++) {
    rainDrops.push(newRainDrop());
  }
}

function newRainDrop() {
  return {
    x:     Math.random() * skyW,
    y:     Math.random() * skyH,
    speed: Math.random() * 6 + 4,
    len:   Math.random() * 14 + 8,
    alpha: Math.random() * 0.35 + 0.1,
  };
}

/* ─── TRAIN ──────────────────────────────────────────────── */

function spawnTrain() {
  const groundY = skyH * 0.74;
  const goLeft = Math.random() > 0.5;
  train = {
    x:       goLeft ? skyW + 40 : -400,
    y:       groundY - 24,
    speed:   (Math.random() * 2 + 2.5) * (goLeft ? -1 : 1),
    cars:    Math.floor(Math.random() * 4) + 3,
    goLeft,
  };
}

/* ─── DRAW LOOP ──────────────────────────────────────────── */

function drawSkyline(ts) {
  if (!skyActive || !skyCtx) return;

  frameCount++;
  const t = frameCount * 0.016; // approx seconds

  skyCtx.clearRect(0, 0, skyW, skyH);

  // ── Sky gradient ─────────────────────────────────────────
  const skyGrad = skyCtx.createLinearGradient(0, 0, 0, skyH * 0.75);
  skyGrad.addColorStop(0,   '#010208');
  skyGrad.addColorStop(0.4, '#030510');
  skyGrad.addColorStop(0.7, '#060918');
  skyGrad.addColorStop(1,   '#0a0d20');
  skyCtx.fillStyle = skyGrad;
  skyCtx.fillRect(0, 0, skyW, skyH * 0.75);

  // ── Stars ─────────────────────────────────────────────────
  for (const star of stars) {
    star.twinklePhase += star.twinkleSpeed;
    const alpha = (Math.sin(star.twinklePhase) * 0.4 + 0.6) * star.brightness;
    skyCtx.beginPath();
    skyCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    skyCtx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    skyCtx.fill();
  }

  // ── Moon ──────────────────────────────────────────────────
  moonGlow = Math.sin(t * 0.3) * 0.1 + 0.9;
  const moonX = skyW * 0.82;
  const moonY = skyH * 0.12;
  const moonR = 28;

  // Glow
  const moonGlowGrad = skyCtx.createRadialGradient(moonX, moonY, moonR, moonX, moonY, moonR * 3);
  moonGlowGrad.addColorStop(0,   `rgba(232,224,200,${(0.2 * moonGlow).toFixed(3)})`);
  moonGlowGrad.addColorStop(1,   'rgba(232,224,200,0)');
  skyCtx.fillStyle = moonGlowGrad;
  skyCtx.beginPath();
  skyCtx.arc(moonX, moonY, moonR * 3, 0, Math.PI * 2);
  skyCtx.fill();

  // Moon body
  const moonBodyGrad = skyCtx.createRadialGradient(moonX - 6, moonY - 6, 2, moonX, moonY, moonR);
  moonBodyGrad.addColorStop(0,   '#f0e8cc');
  moonBodyGrad.addColorStop(0.5, '#d8c888');
  moonBodyGrad.addColorStop(1,   '#b8a860');
  skyCtx.fillStyle = moonBodyGrad;
  skyCtx.beginPath();
  skyCtx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  skyCtx.fill();

  // ── Buildings ─────────────────────────────────────────────
  const groundY = skyH * 0.72;

  for (const b of buildings) {
    // Building silhouette
    skyCtx.fillStyle = b.color;
    skyCtx.fillRect(b.x, b.y, b.w, b.h);

    // Windows
    const winW = 6, winH = 7, padX = 4, padY = 6;
    for (const win of b.windows) {
      win.blinkPhase += win.blinkSpeed;
      // Occasionally toggle lit state
      if (Math.random() < 0.0003) win.lit = !win.lit;

      if (!win.lit) continue;

      // Subtle blink
      const blink = Math.sin(win.blinkPhase) * 0.1 + 0.9;
      const wx = b.x + padX + win.col * (winW + 5);
      const wy = b.y + padY + win.row * (winH + 6);

      if (wx + winW > b.x + b.w) continue;
      if (wy + winH > b.y + b.h) continue;

      skyCtx.globalAlpha = blink * 0.85;
      skyCtx.fillStyle = win.color;
      skyCtx.fillRect(wx, wy, winW, winH);
      skyCtx.globalAlpha = 1;

      // Window glow
      const wgGrad = skyCtx.createRadialGradient(wx + winW/2, wy + winH/2, 0, wx + winW/2, wy + winH/2, 8);
      wgGrad.addColorStop(0, win.color.replace('0.9', '0.08').replace('0.85', '0.06').replace('0.75', '0.05'));
      wgGrad.addColorStop(1, 'rgba(0,0,0,0)');
      skyCtx.fillStyle = wgGrad;
      skyCtx.fillRect(wx - 4, wy - 4, winW + 8, winH + 8);
    }

    // Neon sign on roof
    if (b.hasSign) {
      b.signFlicker += b.signFlickerSpeed;
      const flickerAlpha = Math.abs(Math.sin(b.signFlicker)) * 0.4 + 0.6;
      // Occasional hard flicker
      const hardFlicker = Math.random() > 0.992 ? 0.1 : 1;

      skyCtx.globalAlpha = flickerAlpha * hardFlicker;
      skyCtx.font = '8px "Share Tech Mono", monospace';
      skyCtx.fillStyle = b.signColor;
      skyCtx.textAlign = 'center';
      skyCtx.fillText(b.signText, b.x + b.w / 2, b.y - 4);

      // Sign glow
      skyCtx.shadowBlur   = 8;
      skyCtx.shadowColor  = b.signColor;
      skyCtx.fillText(b.signText, b.x + b.w / 2, b.y - 4);
      skyCtx.shadowBlur   = 0;
      skyCtx.globalAlpha  = 1;
      skyCtx.textAlign    = 'left';
    }
  }

  // ── Ground (roof surface — dark tar) ──────────────────────
  const groundGrad = skyCtx.createLinearGradient(0, groundY, 0, skyH);
  groundGrad.addColorStop(0,   '#0d1020');
  groundGrad.addColorStop(0.3, '#080c18');
  groundGrad.addColorStop(1,   '#060810');
  skyCtx.fillStyle = groundGrad;
  skyCtx.fillRect(0, groundY, skyW, skyH - groundY);

  // ── Wet Ground Reflection (at very bottom) ────────────────
  const reflY    = skyH * 0.88;
  const reflH    = skyH - reflY;
  const reflGrad = skyCtx.createLinearGradient(0, reflY, 0, skyH);
  reflGrad.addColorStop(0,   'rgba(10,14,30,0)');
  reflGrad.addColorStop(0.3, 'rgba(12,18,40,0.4)');
  reflGrad.addColorStop(1,   'rgba(15,20,45,0.7)');
  skyCtx.fillStyle = reflGrad;
  skyCtx.fillRect(0, reflY, skyW, reflH);

  // Draw smeared neon reflections in the puddles
  for (const b of buildings) {
    if (!b.hasSign) continue;
    const rx = b.x + b.w / 2;
    const ry = skyH * 0.91;
    skyCtx.globalAlpha = 0.12;
    skyCtx.font = '6px "Share Tech Mono", monospace';
    skyCtx.fillStyle = b.signColor;
    skyCtx.textAlign = 'center';
    skyCtx.save();
    skyCtx.scale(1, -0.3);
    skyCtx.fillText(b.signText, rx, -ry);
    skyCtx.restore();
    skyCtx.globalAlpha = 1;
    skyCtx.textAlign = 'left';
  }

  // ── Cars ──────────────────────────────────────────────────
  for (let i = cars.length - 1; i >= 0; i--) {
    const car = cars[i];
    car.x += car.speed;

    const carY = CAR_LANES[car.lane] * skyH;
    const scale = 0.6 + car.lane * 0.2; // perspective scale

    // Remove if off-screen, respawn
    if (car.goingLeft && car.x < -60) {
      cars.splice(i, 1);
      spawnCar(car.lane);
      continue;
    } else if (!car.goingLeft && car.x > skyW + 60) {
      cars.splice(i, 1);
      spawnCar(car.lane);
      continue;
    }

    const cw = car.w * scale;
    const ch = 5 * scale;

    // Car body silhouette
    skyCtx.fillStyle = 'rgba(20,22,30,0.9)';
    skyCtx.fillRect(car.x - cw/2, carY - ch, cw, ch);

    // Headlight / taillight glow
    const glowR = 10 * scale;
    const lightX1 = car.goingLeft ? car.x + cw/2 : car.x - cw/2;
    const lightX2 = car.goingLeft ? car.x + cw/2 - 4*scale : car.x - cw/2 + 4*scale;

    const hGrad1 = skyCtx.createRadialGradient(lightX1, carY - ch/2, 0, lightX1, carY - ch/2, glowR);
    hGrad1.addColorStop(0, car.color1);
    hGrad1.addColorStop(1, 'rgba(0,0,0,0)');
    skyCtx.fillStyle = hGrad1;
    skyCtx.beginPath();
    skyCtx.arc(lightX1, carY - ch/2, glowR, 0, Math.PI * 2);
    skyCtx.fill();

    // Reflection of car on wet ground
    skyCtx.globalAlpha = 0.12;
    skyCtx.fillStyle = car.color1;
    skyCtx.fillRect(car.x - cw/2, carY, cw, ch * 0.4);
    skyCtx.globalAlpha = 1;
  }

  // ── Train ─────────────────────────────────────────────────
  if (train) {
    train.x += train.speed;
    const tY = skyH * 0.73 - 20;
    const carH = 20, carW = 55, gap = 4;

    for (let ci = 0; ci < train.cars; ci++) {
      const cx = train.x + ci * (carW + gap) * (train.goingLeft ? -1 : 1);

      // Car body
      skyCtx.fillStyle = '#1a1828';
      skyCtx.fillRect(cx, tY, carW, carH);
      skyCtx.strokeStyle = 'rgba(255,255,255,0.05)';
      skyCtx.lineWidth = 1;
      skyCtx.strokeRect(cx, tY, carW, carH);

      // Windows
      const winCount = Math.floor(carW / 14);
      for (let wi = 0; wi < winCount; wi++) {
        const lit = Math.random() > 0.2;
        if (lit) {
          skyCtx.fillStyle = 'rgba(255,240,180,0.8)';
          skyCtx.fillRect(cx + 5 + wi * 12, tY + 4, 7, 8);
        }
      }
    }

    // Check if train has left screen
    const trainEnd = train.x + train.cars * (carW + gap) * (train.goingLeft ? -1 : 1);
    if ((train.goingLeft && trainEnd < -carW) || (!train.goingLeft && train.x > skyW + carW)) {
      train = null;
      trainTimer = Math.random() * 20000 + 20000;
    }
  }

  // ── Rain ──────────────────────────────────────────────────
  skyCtx.strokeStyle = 'rgba(160,190,240,0.35)';
  skyCtx.lineWidth = 1;

  for (const drop of rainDrops) {
    drop.y += drop.speed;
    drop.x += drop.speed * 0.25; // diagonal

    if (drop.y > skyH) {
      drop.y = -drop.len;
      drop.x = Math.random() * skyW;
    }

    skyCtx.globalAlpha = drop.alpha;
    skyCtx.beginPath();
    skyCtx.moveTo(drop.x, drop.y);
    skyCtx.lineTo(drop.x + drop.len * 0.25, drop.y + drop.len);
    skyCtx.stroke();
  }
  skyCtx.globalAlpha = 1;

  // ── Train timer (counts in frames, ~60fps) ────────────────
  trainTimer -= 16.67;
  if (!train && trainTimer <= 0) {
    spawnTrain();
    trainTimer = Math.random() * 20000 + 20000;
  }

  // ── Next frame ────────────────────────────────────────────
  skyAnimFrame = requestAnimationFrame(drawSkyline);
}

/* ─── START / STOP ───────────────────────────────────────── */

function startSkyline() {
  if (skyActive) return;
  skyActive = true;
  initSkyline();
  skyAnimFrame = requestAnimationFrame(drawSkyline);
}

function stopSkyline() {
  skyActive = false;
  if (skyAnimFrame) {
    cancelAnimationFrame(skyAnimFrame);
    skyAnimFrame = null;
  }
}

/* ─── RESIZE ─────────────────────────────────────────────── */

window.addEventListener('resize', () => {
  if (skyActive) {
    initSkyline(); // reinit with new dimensions
  }
});

/* ─── ROOM ENTER/LEAVE LISTENERS ────────────────────────── */

document.addEventListener('roomDidEnter', (e) => {
  if (e.detail.room === 'room-roof') {
    startSkyline();
  }
});

document.addEventListener('roomWillLeave', (e) => {
  if (e.detail.from === 'room-roof') {
    stopSkyline();
  }
});

/* ─── TELESCOPE SCOPE CANVAS ─────────────────────────────── */

const scopeCanvas = document.getElementById('scope-canvas');
let scopeCtx = scopeCanvas ? scopeCanvas.getContext('2d') : null;
let scopeFrame = null;
let scopeActive = false;

function drawScope(ts) {
  if (!scopeCtx || !scopeActive) return;

  const w = scopeCanvas.width;
  const h = scopeCanvas.height;
  const t = ts * 0.001;

  scopeCtx.clearRect(0, 0, w, h);

  // Dark sky
  const bg = scopeCtx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#010208');
  bg.addColorStop(0.6, '#030510');
  bg.addColorStop(1, '#060818');
  scopeCtx.fillStyle = bg;
  scopeCtx.fillRect(0, 0, w, h);

  // Stars (fewer, for scope view)
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 73.7 + 11) % w);
    const sy = ((i * 43.1 + 7) % (h * 0.55));
    const alpha = (Math.sin(t * 2 + i) * 0.3 + 0.7) * 0.9;
    scopeCtx.beginPath();
    scopeCtx.arc(sx, sy, 1, 0, Math.PI * 2);
    scopeCtx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    scopeCtx.fill();
  }

  // Moon in scope
  const mGrad = scopeCtx.createRadialGradient(w*0.7, h*0.18, 2, w*0.7, h*0.18, 18);
  mGrad.addColorStop(0, '#f0e8cc');
  mGrad.addColorStop(0.6, '#d8c888');
  mGrad.addColorStop(1, 'rgba(180,160,80,0)');
  scopeCtx.fillStyle = mGrad;
  scopeCtx.beginPath();
  scopeCtx.arc(w*0.7, h*0.18, 18, 0, Math.PI * 2);
  scopeCtx.fill();

  // City silhouette
  const groundY = h * 0.62;
  scopeCtx.fillStyle = '#0a0c16';

  // Simple building silhouettes
  const bldgData = [
    {x: 0,    bw: 30, bh: 80},
    {x: 28,   bw: 45, bh: 60},
    {x: 70,   bw: 25, bh: 100},
    {x: 92,   bw: 38, bh: 70},
    {x: 126,  bw: 55, bh: 90},
    {x: 178,  bw: 30, bh: 65},
    {x: 205,  bw: 50, bh: 85},
    {x: 250,  bw: 35, bh: 75},
    {x: 280,  bw: 60, bh: 55},
    {x: 336,  bw: 44, bh: 90},
    {x: 376,  bw: 30, bh: 68},
  ];

  for (const bd of bldgData) {
    const by = groundY - bd.bh;
    scopeCtx.fillRect(bd.x, by, bd.bw, bd.bh + (h - groundY));

    // Lit windows
    for (let r = 0; r < Math.floor(bd.bh / 14); r++) {
      for (let c = 0; c < Math.floor(bd.bw / 10); c++) {
        if (Math.random() > 0.4) {
          scopeCtx.fillStyle = 'rgba(255,240,160,0.7)';
          scopeCtx.fillRect(bd.x + 3 + c*9, by + 4 + r*12, 5, 6);
          scopeCtx.fillStyle = '#0a0c16';
        }
      }
    }
  }

  // Ground
  const gGrad = scopeCtx.createLinearGradient(0, groundY, 0, h);
  gGrad.addColorStop(0, '#0d1020');
  gGrad.addColorStop(1, '#080c18');
  scopeCtx.fillStyle = gGrad;
  scopeCtx.fillRect(0, groundY, w, h - groundY);

  // Rain in scope
  for (let i = 0; i < 40; i++) {
    const rx = (i * 37 + t * 80) % w;
    const ry = ((i * 19 + t * 120) % h);
    scopeCtx.strokeStyle = 'rgba(140,180,240,0.25)';
    scopeCtx.lineWidth = 1;
    scopeCtx.beginPath();
    scopeCtx.moveTo(rx, ry);
    scopeCtx.lineTo(rx + 3, ry + 10);
    scopeCtx.stroke();
  }

  // Slight vignette inside scope
  const vGrad = scopeCtx.createRadialGradient(w/2, h/2, w*0.3, w/2, h/2, w*0.55);
  vGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
  scopeCtx.fillStyle = vGrad;
  scopeCtx.fillRect(0, 0, w, h);

  scopeFrame = requestAnimationFrame(drawScope);
}

function startScope() {
  if (scopeActive) return;
  scopeActive = true;
  scopeFrame = requestAnimationFrame(drawScope);
}

function stopScope() {
  scopeActive = false;
  if (scopeFrame) {
    cancelAnimationFrame(scopeFrame);
    scopeFrame = null;
  }
}

/* Scope overlay visibility hooks */
const telescopeOverlay = document.getElementById('overlay-telescope');

// MutationObserver to watch for overlay being shown/hidden
if (telescopeOverlay && scopeCanvas) {
  const obs = new MutationObserver(() => {
    if (!telescopeOverlay.hidden) {
      startScope();
    } else {
      stopScope();
    }
  });
  obs.observe(telescopeOverlay, { attributes: true, attributeFilter: ['hidden'] });
}

/* Public API */
window.CrystalCanvas = { startSkyline, stopSkyline, startScope, stopScope };

