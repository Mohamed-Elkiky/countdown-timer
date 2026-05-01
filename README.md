# Countdown Timer

A clean, minimal countdown timer built with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies — just three files.

## Features

- Set a custom duration in days, hours, minutes, and seconds
- Choose an alarm sound on completion — sad, happy, or alarm
- Editable timer name — click the title to rename
- Start, pause, resume, and reset controls
- Roller animation on each digit tick
- Progress bar with percentage elapsed and estimated end time
- Pulsing status indicator (Ready / Running / Paused / Done)
- Fully responsive down to mobile

## Project Structure
countdown-timer/
├── index.html   # Markup and structure
├── style.css    # All styling and layout
└── script.js    # Timer logic and DOM interactions

## Getting Started

No build step required. Just clone the repo and open `index.html` in your browser.

```bash
git clone https://github.com/Mohamed-Elkiky/countdown-timer.git
cd countdown-timer
open index.html
```

## Usage

1. Set your desired duration using the **Days**, **Hours**, **Minutes**, and **Seconds** inputs
2. Choose an alarm sound — **Sad**, **Happy**, or **Alarm**
3. Click the title to give your timer a name
4. Hit **Start** to begin the countdown
5. Use **Pause** / **Resume** to control it mid-run
6. **Reset** clears everything and returns to the setup screen

## Tech Stack

- HTML5
- CSS3 (custom properties, grid, keyframe animations)
- Vanilla JavaScript (ES6+)
- Web Audio API (for generated alarm sounds — no audio files needed)

## License

MIT