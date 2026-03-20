/* =============================================================
   CRYSTAL NIGHTS — interactions.js
   All interactive elements: secrets system, overlays,
   phone ringing, telescope, inspect popups,
   amethyst click counter, toast notifications, HUD updates.
============================================================= */

'use strict';

/* ─── INSPECT CONTENT ────────────────────────────────────── */
const INSPECT_DATA = {
  'clear-quartz': {
    title: 'CLEAR QUARTZ',
    body: 'Master healer. Amplifies energy and intention. Said to absorb, store, release and regulate energy.\n\nThese particular specimens were found just outside the city. Someone left them here a long time ago.'
  },
  'citrine': {
    title: 'CITRINE',
    body: 'The merchant\'s stone. Sunny, warm, like afternoon light through a dirty window.\n\nGood for creativity and abundance. Also good for sitting on a shelf at 2am while the city hums outside.'
  },
  'selenite': {
    title: 'SELENITE',
    body: 'Named after Selene, the moon goddess. Liquid light, they say — frozen moonbeam.\n\nThis piece was grown in a cave somewhere in Morocco. It took centuries to form.'
  },
  'rose-quartz': {
    title: 'ROSE QUARTZ',
    body: 'The love stone. Pale pink and soft, like the city looks through a bus window on a rainy night.\n\nThe owner says it keeps the shop calm. Something in the air does seem different in here.'
  },
  'obsidian': {
    title: 'OBSIDIAN',
    body: 'Volcanic glass. Formed when lava cools too quickly to crystallize.\n\nBrings hidden truths to the surface. Protection stone. Also genuinely very sharp — this one drew blood once.'
  },
  'labradorite': {
    title: 'LABRADORITE',
    body: 'Flip it in the light. There — did you see that? Labradorescence. A flash of blue or green, depending on the angle.\n\nLike catching a frequency on an old radio. It\'s there and then it isn\'t.'
  },
  'tourmaline': {
    title: 'BLACK TOURMALINE',
    body: 'Strongest protective stone. A shield.\n\nMost of the people who come in here at 3am are looking for something to protect them. Some find it in stone. Some find it in music. A few find both.'
  },
  'radio': {
    title: 'TRANSISTOR RADIO',
    body: '// FM 91.3\n// SIGNAL: INTERMITTENT\n// CURRENTLY PLAYING: unknown\n\nThe owner leaves it on all night. You can barely hear it over the hum of the refrigerator case and the rain.\n\nSomething about the static is almost musical.'
  },
  'reel': {
    title: 'REVOX A77 — REEL-TO-REEL',
    body: 'Professional studio tape machine. This one has been modified for broadcast.\n\n7.5 ips / 15 ips selectable. Full-track mono or half-track stereo.\n\nThe tape on here is warm — the kind of warm that analog gets when it\'s been used a thousand times. Digital doesn\'t know how to do that.'
  },
  'record-cn': {
    title: 'CRYSTAL NIGHTS — FULL CATALOGUE',
    body: '// CRYSTAL NIGHTS\n// NOW STREAMING ON SPOTIFY\n// 8 TRACKS\n\nA collection of late-night transmissions from the backroom of a crystal shop.\n\nFM 91.3 — available between 1am and 4am only.'
  },
  'photo-city': {
    title: 'PHOTOGRAPH — DOWNTOWN, 2:18 AM',
    body: 'The intersection at 5th and Hill. Shot on cheap 35mm from the roof of this building.\n\nThe bus in the foreground is route 720. It runs all night. Sometimes we ride it just to have somewhere to be.\n\nThe lights at the top of the frame — that\'s the hill. Someone\'s up there.'
  },
  'note-freq': {
    title: 'FM 91.3',
    body: '// BROADCAST FREQUENCY — CRYSTAL NIGHTS RADIO\n// TRANSMISSION HOURS: 1:00 AM — 4:00 AM\n// SIGNAL ORIGIN: CLASSIFIED\n\nDon\'t look for it during the day. It isn\'t there.\n\nSome people hear it from their car. Some from their bedroom. One person said they heard it in an elevator once but we don\'t believe them.'
  },
  'tape-label': {
    title: 'CASSETTE LABEL — CRYSTAL NIGHTS SIDE A',
    body: 'Hand-written label on a TDK SA-90.\n\nSIDE A:\n  01 — Signal Found\n  02 — Hills Above the City\n  03 — Wet Pavement\n  04 — Late Train\n\nThis copy was mixed in this room, on a Tuesday night, while it rained for six hours straight.'
  },
};

/* ─── PHONE MESSAGES ─────────────────────────────────────── */
const PHONE_MESSAGES = [
  '"...hello? Is someone there? This is the frequency. You\'re on the right one. Meet me at the corner of 5th and Hill. Midnight. Bring a blank tape."\n\n[click]',
  '"We\'re broadcasting tonight. 91.3. Be listening at 2am. The signal comes in better when it\'s raining.\n\nAnd it\'s going to rain."\n\n[static]',
  '"I found your record at the shop. The one with the blue sleeve. I\'ve been playing it every night since.\n\nI think I understand what you were saying now."\n\n[dial tone]',
  '"34.01°N 118.49°W. Look up. The antenna is blinking. That means we\'re live.\n\nI\'ll leave the light on."\n\n[click]',
  '"...still there? It\'s late. Doesn\'t matter. The city\'s always on.\n\nThat\'s the thing about nights like this. They never really end, they just change frequency."\n\n[long static]',
];

/* ─── SECRET MESSAGES ────────────────────────────────────── */
const SECRET_MESSAGES = [
  // 0: puddle
  'The reflection holds more than water. A frequency flashes in the wet pavement — FM 91.3. For a moment the whole city is one circuit.',
  // 1: amethyst
  'The crystal pulses three times and goes still. A tone — almost inaudible. The entire shelf shimmers for a moment. Then quiet.',
  // 2: receipt
  'CRYSTAL NIGHTS SHOP\n1131 MAIN ST.\n—\nDate: unknown\nAmount: —\n\n"34.01°N 118.49°W\nsee you tonight"\n\n[handwritten on the back]',
  // 3: transmission log
  'TRANSMISSION LOG — FM 91.3\n\n02:18 — SIGNAL ACQUIRED\n02:21 — TAPE LOADED — SIDE A\n02:25 — BROADCAST LIVE\n03:47 — INTERFERENCE (source unknown)\n03:58 — SIGNAL RESTORED\n04:00 — BROADCAST END\n\nNote: "the crystals were louder tonight"\n\n— see you next week',
  // 4: telescope
  '(handled by telescope overlay)',
];

/* ─── SECRETS STATE ──────────────────────────────────────── */

function loadSecrets() {
  try {
    return JSON.parse(localStorage.getItem('cn-secrets') || '[]');
  } catch (_) {
    return [];
  }
}

function saveSecrets(arr) {
  localStorage.setItem('cn-secrets', JSON.stringify(arr));
}

let collectedSecrets = loadSecrets();

/* ─── HUD DOTS UPDATE ────────────────────────────────────── */

function updateHUDDots() {
  const dots = document.querySelectorAll('#hud-signals .signal-dot');
  const countEl = document.getElementById('hud-signal-count');

  dots.forEach((dot, i) => {
    dot.classList.toggle('collected', collectedSecrets.includes(i));
  });

  if (countEl) {
    countEl.textContent = `${collectedSecrets.length}/5`;
  }
}

/* ─── TOAST ──────────────────────────────────────────────── */
const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(message) {
  if (!toastEl) return;

  toastEl.textContent = message;
  toastEl.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3500);
}

/* ─── COLLECT SECRET ─────────────────────────────────────── */

function collectSecret(idx) {
  if (collectedSecrets.includes(idx)) return false; // already collected

  collectedSecrets.push(idx);
  saveSecrets(collectedSecrets);
  updateHUDDots();

  // Toast notification
  showToast(`SIGNAL FRAGMENT FOUND · ${collectedSecrets.length}/5`);

  // If all found, trigger all-found overlay after a delay
  if (collectedSecrets.length === 5) {
    setTimeout(showAllFoundOverlay, 2000);
  }

  return true;
}

/* ─── OVERLAYS ───────────────────────────────────────────── */

function showOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.hidden = false;
  // Trap focus inside overlay
  const firstFocusable = overlay.querySelector('button, [tabindex]');
  if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);
}

function hideOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.hidden = true;
}

// Close buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-close]');
  if (!btn) return;
  const overlayId = btn.dataset.close;
  if (overlayId) hideOverlay(overlayId);
});

// Close overlay on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('overlay') && !e.target.hidden) {
    e.target.hidden = true;
  }
});

// ESC key closes overlays
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.overlay:not([hidden])').forEach(o => {
    o.hidden = true;
  });
});

/* ─── INSPECT OVERLAY ────────────────────────────────────── */

function showInspect(key) {
  const data = INSPECT_DATA[key];
  if (!data) return;

  const titleEl = document.getElementById('overlay-inspect-title');
  const bodyEl  = document.getElementById('overlay-inspect-body');

  if (titleEl) titleEl.textContent = data.title;
  if (bodyEl) {
    // Convert newlines to <br> elements
    bodyEl.innerHTML = data.body.replace(/\n/g, '<br>');
  }

  showOverlay('overlay-inspect');
}

// Listen for clicks on .inspectable elements
document.addEventListener('click', (e) => {
  const target = e.target.closest('.inspectable[data-inspect]');
  if (!target) return;
  showInspect(target.dataset.inspect);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const target = e.target.closest('.inspectable[data-inspect]');
  if (!target) return;
  e.preventDefault();
  showInspect(target.dataset.inspect);
});

/* ─── SECRET OVERLAYS ────────────────────────────────────── */

function showSecretInspect(idx) {
  const titleEl = document.getElementById('overlay-inspect-title');
  const bodyEl  = document.getElementById('overlay-inspect-body');

  const titles = [
    'SIGNAL FRAGMENT 0 — WET PAVEMENT',
    'SIGNAL FRAGMENT 1 — CRYSTAL HUM',
    'SIGNAL FRAGMENT 2 — COORDINATES',
    'SIGNAL FRAGMENT 3 — TRANSMISSION LOG',
    'SIGNAL FRAGMENT 4 — TELESCOPE',
  ];

  if (titleEl) titleEl.textContent = titles[idx] || `SIGNAL FRAGMENT ${idx}`;
  if (bodyEl) {
    bodyEl.innerHTML = SECRET_MESSAGES[idx].replace(/\n/g, '<br>');
  }
  showOverlay('overlay-inspect');
}

/* ─── SECRET 0 — PUDDLE ──────────────────────────────────── */

const secretPuddle = document.getElementById('secret-puddle');
if (secretPuddle) {
  function handlePuddle() {
    const found = collectSecret(0);
    if (found) {
      setTimeout(() => showSecretInspect(0), 400);
    } else {
      // Already collected — still show the message
      showSecretInspect(0);
    }
  }

  secretPuddle.addEventListener('click', handlePuddle);
  secretPuddle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePuddle(); }
  });
}

/* ─── SECRET 1 — AMETHYST (3 clicks) ────────────────────── */

const secretAmethyst = document.getElementById('secret-amethyst');
let amethystClickCount = parseInt(localStorage.getItem('cn-amethyst-clicks') || '0', 10);

// Restore click state from localStorage
if (secretAmethyst) {
  secretAmethyst.dataset.clicks = Math.min(amethystClickCount, 3).toString();
}

if (secretAmethyst) {
  function handleAmethyst() {
    if (collectedSecrets.includes(1)) {
      showSecretInspect(1);
      return;
    }

    amethystClickCount++;
    localStorage.setItem('cn-amethyst-clicks', amethystClickCount.toString());
    secretAmethyst.dataset.clicks = Math.min(amethystClickCount, 3).toString();

    if (amethystClickCount === 1) {
      showToast('The amethyst glows brighter...');
    } else if (amethystClickCount === 2) {
      showToast('The amethyst pulses...');
    } else if (amethystClickCount >= 3) {
      collectSecret(1);
      setTimeout(() => showSecretInspect(1), 400);
      // Reset counter for future visits
      amethystClickCount = 3;
    }
  }

  secretAmethyst.addEventListener('click', handleAmethyst);
  secretAmethyst.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAmethyst(); }
  });
}

/* ─── SECRET 2 — RECEIPT ─────────────────────────────────── */

const secretReceipt = document.getElementById('secret-receipt');
if (secretReceipt) {
  function handleReceipt() {
    const found = collectSecret(2);
    if (found || true) { // always show content
      showSecretInspect(2);
    }
  }

  secretReceipt.addEventListener('click', handleReceipt);
  secretReceipt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleReceipt(); }
  });
}

/* ─── SECRET 3 — TRANSMISSION LOG ───────────────────────── */

const secretLog = document.getElementById('secret-log');
if (secretLog) {
  function handleLog() {
    const found = collectSecret(3);
    if (found || true) {
      showSecretInspect(3);
    }
  }

  secretLog.addEventListener('click', handleLog);
  secretLog.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLog(); }
  });
}

/* ─── SECRET 4 — TELESCOPE ───────────────────────────────── */

const secretTelescope = document.getElementById('secret-telescope');
if (secretTelescope) {
  function handleTelescope() {
    collectSecret(4); // collect even if already found
    showOverlay('overlay-telescope');
  }

  secretTelescope.addEventListener('click', handleTelescope);
  secretTelescope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTelescope(); }
  });
}

/* ─── PHONE RINGING ──────────────────────────────────────── */

const rotaryPhone     = document.getElementById('rotary-phone');
const phoneRingIndicator = document.getElementById('phone-ring');
const phoneMessageEl  = document.getElementById('phone-message');
const phoneStaticEl   = document.getElementById('phone-static-text');
let phoneRingTimer    = null;
let phoneIsRinging    = false;
let phoneAnswered     = false;
let phoneRingInterval = null;

/**
 * Start the phone ringing.
 * Only triggers when the user is in the shop.
 */
function startPhoneRinging() {
  if (phoneIsRinging) return;
  phoneIsRinging = true;
  phoneAnswered  = false;

  // Show ring indicator on phone
  if (phoneRingIndicator) {
    phoneRingIndicator.textContent = 'RINGING...';
    phoneRingIndicator.classList.add('ringing');
  }

  // Auto-stop ringing after 12 seconds if not answered
  phoneRingInterval = setTimeout(() => {
    stopPhoneRinging();
  }, 12000);
}

function stopPhoneRinging() {
  phoneIsRinging = false;
  if (phoneRingIndicator) {
    phoneRingIndicator.classList.remove('ringing');
    phoneRingIndicator.textContent = '';
  }
  if (phoneRingInterval) {
    clearTimeout(phoneRingInterval);
    phoneRingInterval = null;
  }
  scheduleNextRing();
}

/**
 * Schedule the next ring. Only in shop room.
 * Fires 45s after entering shop, then random 30–90s intervals.
 */
let ringScheduled = false;

function scheduleNextRing() {
  if (phoneRingTimer) clearTimeout(phoneRingTimer);
  const delay = ringScheduled
    ? (Math.random() * 60000 + 30000) // 30–90 seconds
    : 45000; // first ring: 45 seconds
  ringScheduled = true;

  phoneRingTimer = setTimeout(() => {
    // Only ring if still in shop
    const shopRoom = document.getElementById('room-shop');
    if (shopRoom && shopRoom.classList.contains('active')) {
      startPhoneRinging();
    } else {
      scheduleNextRing(); // reschedule if not in shop
    }
  }, delay);
}

/**
 * Answer the phone — show overlay with message.
 */
function answerPhone() {
  if (!phoneIsRinging) {
    // Phone not ringing but click it — show "no answer" inspect
    showInspect('radio'); // repurpose — actually show phone flavor
    return;
  }

  stopPhoneRinging();
  phoneAnswered = true;

  // Pick random message
  const msg = PHONE_MESSAGES[Math.floor(Math.random() * PHONE_MESSAGES.length)];

  if (phoneMessageEl) {
    phoneMessageEl.textContent = '';
  }

  showOverlay('overlay-phone');

  // Simulate picking up — brief static then message types in
  if (phoneStaticEl) {
    phoneStaticEl.textContent = '· · · · · · · · · · · ·';
  }

  setTimeout(() => {
    if (phoneStaticEl) phoneStaticEl.textContent = '';
    if (phoneMessageEl) {
      typewriterEffect(phoneMessageEl, msg, 30);
    }
  }, 1200);
}

/**
 * Typewriter effect for phone message.
 */
function typewriterEffect(el, text, speed) {
  el.textContent = '';
  let i = 0;
  function next() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(next, speed);
    }
  }
  next();
}

// Phone click handler
if (rotaryPhone) {
  rotaryPhone.addEventListener('click', answerPhone);
  rotaryPhone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); answerPhone(); }
  });
}

// Start phone ring schedule when entering shop room
document.addEventListener('roomDidEnter', (e) => {
  if (e.detail.room === 'room-shop') {
    if (!ringScheduled) {
      scheduleNextRing();
    }
  }
});

// Cancel ring if leaving shop
document.addEventListener('roomWillLeave', (e) => {
  if (e.detail.from === 'room-shop') {
    if (phoneIsRinging) {
      stopPhoneRinging();
    }
  }
});

/* ─── ALL SECRETS FOUND OVERLAY ──────────────────────────── */

function showAllFoundOverlay() {
  showOverlay('overlay-all-found');
}

// "Enter the Transmission" button
const btnEnterSecret = document.getElementById('btn-enter-secret');
if (btnEnterSecret) {
  btnEnterSecret.addEventListener('click', () => {
    hideOverlay('overlay-all-found');
    setTimeout(() => {
      if (window.CrystalEngine) {
        // Temporarily unlock secret room by overriding check
        window.CrystalEngine.goToRoom('room-secret');
      }
    }, 400);
  });
}

/* ─── INIT ───────────────────────────────────────────────── */

(function init() {
  // Restore HUD dots from saved secrets
  updateHUDDots();

  // Restore amethyst click count visual state
  if (secretAmethyst) {
    secretAmethyst.dataset.clicks = Math.min(amethystClickCount, 3).toString();
  }

  // If all secrets already collected, make sure secret room is accessible
  if (collectedSecrets.length === 5) {
    // Mark secret room nav items as accessible
    document.querySelectorAll('[data-go="room-secret"]').forEach(el => {
      el.style.opacity = '1';
    });
  }

  console.log(`[Crystal Nights] Loaded. Secrets collected: ${collectedSecrets.length}/5`);
})();

/* Public API */
window.CrystalInteractions = {
  collectSecret,
  showInspect,
  showToast,
  showOverlay,
  hideOverlay,
  getCollectedSecrets: () => collectedSecrets,
};

