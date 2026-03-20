/* =============================================================
   CRYSTAL NIGHTS — engine.js
   Room navigation engine.
   Handles: room transitions, HUD updates, ambient text,
   localStorage persistence, room label flashes.
============================================================= */

'use strict';

/* ─── ROOM DEFINITIONS ───────────────────────────────────── */
const ROOMS = {
  'loading-screen': {
    name: '',
    ambient: ''
  },
  'room-street': {
    name: 'STREET',
    ambient: 'Rain on pavement. Distant traffic. A sign hums overhead.'
  },
  'room-shop': {
    name: 'SHOP',
    ambient: 'A small radio plays. Faint incense. The crystals hum in the dark.'
  },
  'room-backroom': {
    name: 'BACKROOM',
    ambient: 'Reel-to-reel hum. Static between stations. Rain against the window.'
  },
  'room-roof': {
    name: 'ROOF',
    ambient: 'Wind. A distant train. The city breathes below. The antenna hums.'
  },
  'room-secret': {
    name: 'THE TRANSMISSION',
    ambient: 'Static resolves into music. You are tuned in. The signal is clear.'
  }
};

/* ─── STATE ──────────────────────────────────────────────── */
let currentRoomId = 'loading-screen';
let isTransitioning = false;

/* ─── DOM REFS ───────────────────────────────────────────── */
const hudRoomName  = document.getElementById('hud-room-name');
const ambientText  = document.getElementById('ambient-text');
const roomLabel    = document.getElementById('room-label');
let roomLabelTimer = null;

/* ─── NAVIGATION ─────────────────────────────────────────── */

/**
 * Navigate to a room by its element ID.
 * Triggers fade-out on current, fade-in on next.
 */
function goToRoom(roomId) {
  if (isTransitioning) return;
  if (roomId === currentRoomId) return;

  // Make sure target room exists
  const nextRoom = document.getElementById(roomId);
  if (!nextRoom) {
    console.warn('[engine] Room not found:', roomId);
    return;
  }

  // Check secret room is unlocked
  if (roomId === 'room-secret') {
    const secrets = getCollectedSecrets();
    if (secrets.length < 5) {
      console.log('[engine] Secret room not unlocked yet.');
      return;
    }
  }

  isTransitioning = true;

  const prevRoom = document.getElementById(currentRoomId);

  // Notify other modules about room change
  document.dispatchEvent(new CustomEvent('roomWillLeave', {
    detail: { from: currentRoomId, to: roomId }
  }));

  // Start leaving animation on current room
  if (prevRoom) {
    prevRoom.classList.add('leaving');
    prevRoom.classList.remove('active');
  }

  // After transition completes, clean up
  const transitionDuration = 500; // match CSS var --transition-room

  setTimeout(() => {
    // Remove previous room from view
    if (prevRoom) {
      prevRoom.classList.remove('leaving');
    }

    // Activate next room
    nextRoom.classList.add('active');
    currentRoomId = roomId;

    // Save to localStorage
    localStorage.setItem('cn-current-room', roomId);

    // Update HUD
    updateHUD(roomId);

    // Show room label flash
    flashRoomLabel(ROOMS[roomId]?.name || '');

    isTransitioning = false;

    // Notify other modules
    document.dispatchEvent(new CustomEvent('roomDidEnter', {
      detail: { room: roomId }
    }));

  }, transitionDuration);
}

/**
 * Update HUD room name and ambient text.
 */
function updateHUD(roomId) {
  const roomDef = ROOMS[roomId];
  if (!roomDef) return;

  // Update room name
  if (hudRoomName) {
    hudRoomName.textContent = roomDef.name;
  }

  // Fade ambient text transition
  if (ambientText) {
    ambientText.style.opacity = '0';
    setTimeout(() => {
      ambientText.textContent = roomDef.ambient;
      ambientText.style.opacity = '0.6';
    }, 400);
  }
}

/**
 * Brief room name flash in center of screen.
 */
function flashRoomLabel(name) {
  if (!name || !roomLabel) return;

  // Clear any existing timer
  if (roomLabelTimer) clearTimeout(roomLabelTimer);

  roomLabel.textContent = name;
  roomLabel.classList.add('show');

  roomLabelTimer = setTimeout(() => {
    roomLabel.classList.remove('show');
  }, 1400);
}

/* ─── CLICK DELEGATION ───────────────────────────────────── */

/**
 * Listen for clicks on any element with data-go="room-id"
 */
document.addEventListener('click', (e) => {
  // Traverse up to find a data-go element
  const target = e.target.closest('[data-go]');
  if (!target) return;

  const roomId = target.dataset.go;
  goToRoom(roomId);
});

/**
 * Also allow Enter/Space keyboard activation for accessibility.
 */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const target = e.target.closest('[data-go]');
  if (!target) return;
  e.preventDefault();
  goToRoom(target.dataset.go);
});

/* ─── LOADING SCREEN ─────────────────────────────────────── */

const loadingEnterBtn = document.getElementById('loading-enter');

if (loadingEnterBtn) {
  loadingEnterBtn.addEventListener('click', () => {
    goToRoom('room-street');
  });
}

/* ─── RESTORE FROM localStorage ─────────────────────────── */

/**
 * On page load, restore the previously visited room.
 * But always start from street (not the loading screen)
 * unless the user hasn't visited before.
 */
function restoreRoom() {
  const saved = localStorage.getItem('cn-current-room');

  // If there's a saved room and it's not loading, restore it
  // (But we still show loading screen first as an intro)
  // User must click "ENTER" to start; after that we could auto-restore.
  // For immersion, we always start from loading screen.
  // Store for after loading is clicked.
  if (saved && saved !== 'loading-screen') {
    loadingEnterBtn.dataset.restoreRoom = saved;
  }
}

// Adjust loading enter to restore or go to street
if (loadingEnterBtn) {
  loadingEnterBtn.addEventListener('click', () => {
    // Already handled above — this is a duplicate listener guard.
    // The above listener fires first and calls goToRoom('room-street')
    // which is fine; we always start from street on enter.
  });
}

/* ─── SECRETS HELPER ─────────────────────────────────────── */

/** Returns array of collected secret indices */
function getCollectedSecrets() {
  try {
    return JSON.parse(localStorage.getItem('cn-secrets') || '[]');
  } catch (_) {
    return [];
  }
}

/* ─── INIT ───────────────────────────────────────────────── */

(function init() {
  // Ensure loading screen is active
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('active');
  }

  // Set initial ambient text
  updateHUD('loading-screen');

  // Don't show HUD on loading screen
  const hud = document.getElementById('hud');
  const ambientDiv = document.getElementById('ambient-text');
  const spotifyLink = document.getElementById('spotify-link');

  function setHudVisible(visible) {
    if (hud)         hud.style.opacity         = visible ? '1' : '0';
    if (ambientDiv)  ambientDiv.style.opacity   = visible ? '0.6' : '0';
    if (spotifyLink) spotifyLink.style.opacity  = visible ? '0.5' : '0';
  }

  setHudVisible(false);

  document.addEventListener('roomDidEnter', (e) => {
    if (e.detail.room !== 'loading-screen') {
      setHudVisible(true);
    }
  });

  restoreRoom();
})();

/* ─── PUBLIC API ─────────────────────────────────────────── */
window.CrystalEngine = { goToRoom, getCollectedSecrets };

