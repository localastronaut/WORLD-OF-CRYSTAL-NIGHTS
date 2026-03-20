/* =============================================================
   CRYSTAL NIGHTS — player.js
   Cassette player UI + real audio playback.
   Handles: tracklist selection, play/pause/skip,
   spinning reel animation, VU meter animation,
   scrolling ticker text, HTML5 audio.
============================================================= */

'use strict';

/* ─── TRACK DATA ─────────────────────────────────────────── */
const TRACKS = [
  { num: '01', name: 'Intro',                time: '—', src: 'EP/1.Intro.mp3' },
  { num: '02', name: 'Buffering My Heart',   time: '—', src: 'EP/2.Buffering%20My%20Heart.mp3' },
  { num: '03', name: 'Somewhere in Between', time: '—', src: 'EP/3.Somewhere%20in%20Between.mp3' },
  { num: '04', name: 'Bedroom Stardust',     time: '—', src: 'EP/4.Bedroom%20Stardust.mp3' },
  { num: '05', name: 'Signals',              time: '—', src: 'EP/5.Signals.mp3' },
];

/* ─── AUDIO ──────────────────────────────────────────────── */
const audio = new Audio();
audio.volume = 0.85;

audio.addEventListener('ended', () => nextTrack());

audio.addEventListener('durationchange', () => {
  const t = TRACKS[currentTrack];
  if (audio.duration && isFinite(audio.duration)) {
    const m = Math.floor(audio.duration / 60);
    const s = Math.floor(audio.duration % 60).toString().padStart(2, '0');
    t.time = `${m}:${s}`;
    updateTicker();
    // Update tracklist DOM label
    const el = trackEls[currentTrack];
    if (el) {
      el.textContent = `${t.num} — ${t.name}`;
    }
  }
});

/* ─── STATE ──────────────────────────────────────────────── */
let isPlaying    = false;
let currentTrack = 0;
let vuRafHandle  = null;
let vuBars       = [];

/* ─── DOM REFS ───────────────────────────────────────────── */
const trackList  = document.getElementById('tracklist');
const trackEls   = trackList ? Array.from(trackList.querySelectorAll('.track-item')) : [];
const btnPlay    = document.getElementById('btn-play');
const btnPrev    = document.getElementById('btn-prev');
const btnNext    = document.getElementById('btn-next');
const reelA      = document.getElementById('reel-a');
const reelB      = document.getElementById('reel-b');
const vuMeters   = document.getElementById('vu-meters');
const tickerText = document.getElementById('ticker-text');

/* Cache VU bars */
if (vuMeters) {
  vuBars = Array.from(vuMeters.querySelectorAll('.vu-bar'));
}

/* ─── PLAY / PAUSE ───────────────────────────────────────── */

function setPlaying(playing) {
  isPlaying = playing;

  if (isPlaying) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }

  if (btnPlay) {
    btnPlay.textContent = isPlaying ? '❚❚' : '▶';
    btnPlay.classList.toggle('playing', isPlaying);
    btnPlay.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  }

  if (reelA && reelB) {
    reelA.classList.toggle('spinning', isPlaying);
    reelB.classList.toggle('spinning', isPlaying);
  }

  if (isPlaying) {
    startVU();
  } else {
    stopVU();
    resetVU();
  }

  updateTicker();
}

function togglePlay() {
  setPlaying(!isPlaying);
}

/* ─── TRACK SELECTION ────────────────────────────────────── */

function loadTrack(idx) {
  const t = TRACKS[idx];
  audio.src = t.src;
  audio.load();
}

function selectTrack(idx) {
  currentTrack = ((idx % TRACKS.length) + TRACKS.length) % TRACKS.length;

  loadTrack(currentTrack);

  trackEls.forEach((el, i) => {
    el.classList.toggle('active', i === currentTrack);
  });

  updateTicker();

  if (isPlaying) {
    audio.play().catch(() => {});
  }
}

function nextTrack() {
  selectTrack(currentTrack + 1);
  if (!isPlaying) setPlaying(true);
}

function prevTrack() {
  selectTrack(currentTrack - 1);
  if (!isPlaying) setPlaying(true);
}

/* ─── TICKER ─────────────────────────────────────────────── */

function updateTicker() {
  if (!tickerText) return;
  const track = TRACKS[currentTrack];
  const status = isPlaying ? 'NOW PLAYING' : 'CRYSTAL NIGHTS';
  tickerText.textContent =
    `${status} — ${track.num}. ${track.name}${track.time !== '—' ? ' [' + track.time + ']' : ''} — `;
}

/* ─── VU METERS ──────────────────────────────────────────── */

const VU_TARGETS = new Array(12).fill(0);
const VU_CURRENT = new Array(12).fill(0);

function startVU() {
  if (vuRafHandle) return;
  vuBars.forEach(bar => bar.classList.add('active'));
  animateVU();
}

function stopVU() {
  if (vuRafHandle) {
    cancelAnimationFrame(vuRafHandle);
    vuRafHandle = null;
  }
  vuBars.forEach(bar => bar.classList.remove('active'));
}

function resetVU() {
  vuBars.forEach(bar => { bar.style.height = '15%'; });
  VU_CURRENT.fill(0);
  VU_TARGETS.fill(0);
}

let vuFrame = 0;

function animateVU() {
  vuFrame++;
  if (vuFrame % 8 === 0) {
    for (let i = 0; i < 12; i++) {
      const base = Math.sin(vuFrame * 0.04 + i * 0.9) * 0.5 + 0.5;
      const noise = Math.random() * 0.3;
      VU_TARGETS[i] = Math.min(0.95, base * 0.7 + noise);
    }
  }
  for (let i = 0; i < 12; i++) {
    VU_CURRENT[i] += (VU_TARGETS[i] - VU_CURRENT[i]) * 0.18;
    if (vuBars[i]) vuBars[i].style.height = Math.max(5, VU_CURRENT[i] * 95) + '%';
  }
  vuRafHandle = requestAnimationFrame(animateVU);
}

/* ─── EVENT LISTENERS ────────────────────────────────────── */

if (btnPlay) btnPlay.addEventListener('click', togglePlay);
if (btnPrev) btnPrev.addEventListener('click', prevTrack);
if (btnNext) btnNext.addEventListener('click', nextTrack);

trackEls.forEach((el, i) => {
  el.addEventListener('click', () => {
    if (i === currentTrack) {
      togglePlay();
    } else {
      selectTrack(i);
      setPlaying(true);
    }
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
  });
});

/* Auto-play when finale screen becomes active.
   Must play immediately (no setTimeout) to stay within the
   user-gesture chain that triggered the event. */
document.addEventListener('crystalNightsFinale', () => {
  currentTrack = 0;
  loadTrack(0);
  trackEls.forEach((el, i) => el.classList.toggle('active', i === 0));
  updateTicker();
  // Slight rAF delay keeps us in the gesture chain while letting
  // the finale CSS transition begin, without breaking autoplay policy
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setPlaying(true);
    });
  });
});

/* ─── INIT ───────────────────────────────────────────────── */

(function initPlayer() {
  // Populate tracklist DOM with real track names
  trackEls.forEach((el, i) => {
    if (TRACKS[i]) {
      el.textContent = `${TRACKS[i].num} — ${TRACKS[i].name}`;
      el.setAttribute('data-track', i);
    }
  });

  selectTrack(0);
  updateTicker();
})();

/* Public API */
window.CrystalPlayer = { togglePlay, selectTrack, setPlaying, isPlaying: () => isPlaying };
