// ── Element refs ──
const titleDisplay  = document.getElementById('titleDisplay');
const titleInput    = document.getElementById('titleInput');
const timerName     = document.getElementById('timerName');
const startBtn      = document.getElementById('startBtn');
const pauseBtn      = document.getElementById('pauseBtn');
const resumeBtn     = document.getElementById('resumeBtn');
const resetBtn      = document.getElementById('resetBtn');
const setupView     = document.getElementById('setupView');
const timerView     = document.getElementById('timerView');
const statusDot     = document.getElementById('statusDot');
const statusText    = document.getElementById('statusText');
const doneMsg       = document.getElementById('doneMsg');
const progressFill  = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const progressTime  = document.getElementById('progressTime');

// ── State ──
let totalSeconds = 0;
let remaining    = 0;
let interval     = null;
let running      = false;
let prevValues   = { days: null, hours: null, minutes: null, seconds: null };

// ── Title editing ──
titleDisplay.addEventListener('click', () => {
  titleInput.value           = titleDisplay.textContent === 'Untitled Timer' ? '' : titleDisplay.textContent;
  titleDisplay.style.display = 'none';
  titleInput.style.display   = 'block';
  titleInput.focus();
});

titleInput.addEventListener('blur', commitTitle);
titleInput.addEventListener('keydown', e => { if (e.key === 'Enter') titleInput.blur(); });

function commitTitle() {
  const val                  = titleInput.value.trim();
  titleDisplay.textContent   = val || 'Untitled Timer';
  titleInput.style.display   = 'none';
  titleDisplay.style.display = 'block';
}

// ── Button events ──
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resumeBtn.addEventListener('click', resumeTimer);
resetBtn.addEventListener('click', resetTimer);

// ── Timer logic ──
function getDuration() {
  const d = parseInt(document.getElementById('inputDays').value)    || 0;
  const h = parseInt(document.getElementById('inputHours').value)   || 0;
  const m = parseInt(document.getElementById('inputMinutes').value) || 0;
  const s = parseInt(document.getElementById('inputSeconds').value) || 0;
  return (d * 86400) + (h * 3600) + (m * 60) + s;
}

function startTimer() {
  const dur = getDuration();
  if (dur <= 0) return;

  totalSeconds = dur;
  remaining    = dur;

  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  prevValues = { days: d, hours: h, minutes: m, seconds: s };

  timerName.textContent = titleDisplay.textContent;
  setupView.classList.add('hidden');
  timerView.classList.remove('hidden');

  doneMsg.style.display = 'none';
  renderDisplay(remaining);
  setStatus('running');
  setButtonState('running');

  clearInterval(interval);
  interval = setInterval(tick, 1000);
  running  = true;
}

function tick() {
  remaining--;
  updateDisplay(remaining);

  if (remaining <= 0) {
    clearInterval(interval);
    running = false;
    setStatus('done');
    setButtonState('idle');
    doneMsg.style.display = 'block';

    const selected = document.querySelector('input[name="sound"]:checked').value;
    if (selected === 'sad')   playSad();
    if (selected === 'happy') playHappy();
    if (selected === 'alarm') playAlarm();
  }
}

function pauseTimer() {
  clearInterval(interval);
  running = false;
  setStatus('paused');
  setButtonState('paused');
}

function resumeTimer() {
  running  = true;
  interval = setInterval(tick, 1000);
  setStatus('running');
  setButtonState('running');
}

function resetTimer() {
  clearInterval(interval);
  running      = false;
  remaining    = 0;
  totalSeconds = 0;
  prevValues   = { days: null, hours: null, minutes: null, seconds: null };

  timerView.classList.add('hidden');
  setupView.classList.remove('hidden');

  doneMsg.style.display     = 'none';
  progressFill.style.width  = '0%';
  progressLabel.textContent = '0% elapsed';
  progressTime.textContent  = '–';
}

// ── Helpers ──
function pad(n) { return String(n).padStart(2, '0'); }

function decompose(secs) {
  return {
    days:    Math.floor(secs / 86400),
    hours:   Math.floor((secs % 86400) / 3600),
    minutes: Math.floor((secs % 3600) / 60),
    seconds: secs % 60,
  };
}

// ── Initial render (no animation) ──
function renderDisplay(secs) {
  const cur = decompose(secs);
  for (const key of ['days', 'hours', 'minutes', 'seconds']) {
    const roller = document.getElementById(key);
    roller.innerHTML = `<div class="digit-inner">${pad(cur[key])}</div>`;
  }
  updateProgress(secs);
}

// ── Tick render (with animation, only changed digits) ──
function updateDisplay(secs) {
  const cur = decompose(secs);

  for (const key of ['days', 'hours', 'minutes', 'seconds']) {
    if (prevValues[key] === cur[key]) continue;
    rollDigit(key, cur[key]);
    prevValues[key] = cur[key];
  }

  updateProgress(secs);
}

// ── Roller animation ──
function rollDigit(id, newValue) {
  const roller = document.getElementById(id);
  const newVal = pad(newValue);

  roller.innerHTML = '';

  const newInner = document.createElement('div');
  newInner.classList.add('digit-inner', 'roll-in');
  newInner.textContent = newVal;
  roller.appendChild(newInner);

  newInner.addEventListener('animationend', () => {
    newInner.classList.remove('roll-in');
  }, { once: true });
}

// ── Progress bar ──
function updateProgress(secs) {
  const pct = totalSeconds > 0
    ? Math.round(((totalSeconds - secs) / totalSeconds) * 100)
    : 0;

  progressFill.style.width  = pct + '%';
  progressLabel.textContent = pct + '% elapsed';
  progressTime.textContent  = secs > 0
    ? 'ends ' + new Date(Date.now() + secs * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '–';
}

// ── Sound engine ──
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(frequency, type, startTime, duration, volume = 0.3) {
  const ctx  = getCtx();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type      = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playSad() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // descending minor melody — slow and heavy
  const notes = [392, 349, 330, 294, 262];
  notes.forEach((freq, i) => {
    playTone(freq, 'sine', now + i * 0.6, 0.8, 0.25);
  });
}

function playHappy() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // ascending major arpeggio — bright and quick
  const notes = [262, 330, 392, 523, 659];
  notes.forEach((freq, i) => {
    playTone(freq, 'triangle', now + i * 0.18, 0.3, 0.3);
  });
}

function playAlarm() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // alternating two-tone beep — classic alarm
  for (let i = 0; i < 6; i++) {
    const freq = i % 2 === 0 ? 880 : 1100;
    playTone(freq, 'square', now + i * 0.25, 0.2, 0.15);
  }
}

// ── Status indicator ──
function setStatus(state) {
  statusDot.className = 'status-dot';
  const labels = { running: 'Running', paused: 'Paused', done: 'Done', ready: 'Ready' };
  if (state === 'running') statusDot.classList.add('running');
  if (state === 'done')    statusDot.classList.add('done');
  statusText.textContent = labels[state] || 'Ready';
}

// ── Button visibility ──
function setButtonState(state) {
  pauseBtn.style.display  = state === 'running' ? 'inline-block' : 'none';
  resumeBtn.style.display = state === 'paused'  ? 'inline-block' : 'none';
}