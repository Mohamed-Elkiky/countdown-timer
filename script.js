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
  return (d * 86400) + (h * 3600) + (m * 60);
}

function startTimer() {
  const dur = getDuration();
  if (dur <= 0) return;

  totalSeconds = dur;
  remaining    = dur;
  prevValues   = { days: null, hours: null, minutes: null, seconds: null };

  timerName.textContent = titleDisplay.textContent;

  setupView.classList.add('hidden');
  timerView.classList.remove('hidden');

  doneMsg.style.display = 'none';
  updateDisplay(remaining);
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

// ── Roller animation ──
function pad(n) { return String(n).padStart(2, '0'); }

function rollDigit(id, newValue) {
  const roller   = document.getElementById(id);
  const oldInner = roller.querySelector('.digit-inner');
  const newVal   = pad(newValue);

  // animate old digit out downward
  oldInner.classList.add('roll-out');

  // create new digit entering from top
  const newInner = document.createElement('div');
  newInner.classList.add('digit-inner', 'roll-in');
  newInner.textContent = newVal;

  oldInner.addEventListener('animationend', () => {
    roller.innerHTML = '';
    roller.appendChild(newInner);
  }, { once: true });

  roller.appendChild(newInner);
}

function updateDisplay(secs) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  const cur = { days: d, hours: h, minutes: m, seconds: s };

  for (const key of ['days', 'hours', 'minutes', 'seconds']) {
    if (prevValues[key] !== cur[key]) {
      rollDigit(key, cur[key]);
      prevValues[key] = cur[key];
    }
  }

  const pct = totalSeconds > 0
    ? Math.round(((totalSeconds - secs) / totalSeconds) * 100)
    : 0;

  progressFill.style.width  = pct + '%';
  progressLabel.textContent = pct + '% elapsed';

  progressTime.textContent = secs > 0
    ? 'ends ' + new Date(Date.now() + secs * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '–';
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