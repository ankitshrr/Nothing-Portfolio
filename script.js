const themeBtn = document.getElementById('themeBtn');
const html = document.documentElement;

// Theme toggle
themeBtn.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);

  themeBtn.innerHTML = newTheme === 'dark'
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
});

// Footer stamps
document.getElementById('yearNow').textContent = new Date().getFullYear();
document.getElementById('buildStamp').textContent = new Date().toISOString().slice(0,10);

// Mini glyph trigger
function triggerGlyph(element) {
  const glyphs = element.querySelectorAll('.p-glyph');
  glyphs.forEach((glyph, i) => {
    glyph.classList.remove('triggered');
    void glyph.offsetWidth;
    setTimeout(() => { glyph.classList.add('triggered'); }, i * 50);
    setTimeout(() => { glyph.classList.remove('triggered'); }, 700);
  });
}
window.triggerGlyph = triggerGlyph;

// Hero glyph
function runGlyphSequence() {
  const segments = document.querySelectorAll('.glyph-segment');
  segments.forEach((seg, i) => {
    const delay = (i === 0) ? 0 : (i * 120) + (Math.random() * 100);
    setTimeout(() => {
      seg.classList.add('active');
      setTimeout(() => seg.classList.remove('active'), 150);

      if (seg.classList.contains('gs-arc') || seg.classList.contains('gs-bottom-bar')) {
        setTimeout(() => {
          seg.classList.add('active');
          setTimeout(() => seg.classList.remove('active'), 100);
        }, 250);
      }
    }, delay);
  });

  setTimeout(() => {
    segments.forEach(seg => seg.classList.add('idle'));
  }, 1200);
}

function heroGlyphBurst() {
  const segments = document.querySelectorAll('.glyph-segment');
  segments.forEach(seg => seg.classList.remove('idle', 'active'));
  void document.getElementById('glyphSystem').offsetWidth;
  runGlyphSequence();
}

let heroAutoTimer = null;
function startHeroAutoplay(){
  if (heroAutoTimer) clearInterval(heroAutoTimer);
  heroAutoTimer = setInterval(() => {
    const home = document.getElementById('home');
    const rect = home.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.2) heroGlyphBurst();
  }, 2300);
}

// Nav expand
const brandBtn = document.getElementById('brandBtn');
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.nav-link');

brandBtn.addEventListener('click', () => heroGlyphBurst());

navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('expanded');
  const expanded = mainNav.classList.contains('expanded');
  navToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
});

navLinks.forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('expanded');
  navToggle.setAttribute('aria-expanded', 'false');
}));

document.addEventListener('click', (e) => {
  if (!mainNav.contains(e.target)) {
    mainNav.classList.remove('expanded');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Nav glyph scan on any click
mainNav.addEventListener('click', () => {
  const glyphs = mainNav.querySelectorAll('.nav-glyph');
  glyphs.forEach(g => { g.classList.remove('active'); void g.offsetWidth; g.classList.add('active'); });
});

// Active link on scroll (more stable)
const sectionEls = Array.from(document.querySelectorAll('section.widget'));
function setActiveByScroll(){
  const y = window.scrollY + 140;
  let currentId = sectionEls[0]?.id || "home";
  for (const s of sectionEls){
    if (s.offsetTop <= y) currentId = s.id;
  }
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === `#${currentId}`);
  });
}
window.addEventListener('scroll', setActiveByScroll, { passive:true });

// Playground logic
const board = document.getElementById('playBoard');
const boardLabel = document.getElementById('boardLabel');
const boardSegs = Array.from(board.querySelectorAll('.play-seg'));
const modeLabel = document.getElementById('modeLabel');
const speedLabel = document.getElementById('speedLabel');
const autoToggle = document.getElementById('autoToggle');

let playTimer = null;
let speedMs = 160;
let mode = "SWEEP";
let autoMode = true;

function setMode(m){ mode = m; modeLabel.textContent = m; }
function setSpeed(s){
  if (s === "slow") { speedMs = 260; speedLabel.textContent = "SLOW"; }
  if (s === "med")  { speedMs = 160; speedLabel.textContent = "MED"; }
  if (s === "fast") { speedMs = 90;  speedLabel.textContent = "FAST"; }
  if (autoMode) startPlayAuto();
}

function allOff(){ boardSegs.forEach(seg => seg.classList.remove('on')); }
function light(indexes){ allOff(); indexes.forEach(i => boardSegs[i]?.classList.add('on')); }
function stopPlay(){ if (playTimer) clearInterval(playTimer); playTimer = null; allOff(); }

function runSweep(){
  stopPlay();
  let i = 0;
  playTimer = setInterval(() => { light([i, (i + 3) % boardSegs.length]); i = (i + 1) % boardSegs.length; }, speedMs);
}
function runPulse(){
  stopPlay();
  let on = false;
  playTimer = setInterval(() => {
    on = !on;
    if (on) boardSegs.forEach(seg => seg.classList.add('on'));
    else allOff();
  }, Math.max(120, speedMs * 1.35));
}
function runChaos(){
  stopPlay();
  playTimer = setInterval(() => {
    const picks = new Set();
    while (picks.size < 3) picks.add(Math.floor(Math.random() * boardSegs.length));
    light([...picks]);
  }, speedMs);
}
function runHeartbeat(){
  stopPlay();
  const beat = () => {
    light([0,2,4,7,8]);
    setTimeout(() => light([1,3,5,6,8]), 120);
    setTimeout(() => allOff(), 240);
  };
  beat();
  playTimer = setInterval(beat, Math.max(800, speedMs * 6));
}
function runStairs(){
  stopPlay();
  const steps = [[0],[0,1],[0,1,2],[0,1,2,3],[2,3,4],[4,5,6],[6,7,8],[8]];
  let i = 0;
  playTimer = setInterval(() => { light(steps[i]); i = (i + 1) % steps.length; }, Math.max(90, speedMs));
}

function runCurrentPattern(){
  if (mode === "SWEEP") runSweep();
  if (mode === "PULSE") runPulse();
  if (mode === "CHAOS") runChaos();
  if (mode === "HEARTBEAT") runHeartbeat();
  if (mode === "STAIRS") runStairs();
}

function startPlayAuto(){
  autoMode = true;
  autoToggle.classList.add('on');
  autoToggle.setAttribute('aria-checked','true');
  boardLabel.textContent = "AUTO_RUNNING";
  runCurrentPattern();
}
function setPlayManual(){
  autoMode = false;
  autoToggle.classList.remove('on');
  autoToggle.setAttribute('aria-checked','false');
  boardLabel.textContent = "CLICK_TO_TRIGGER";
  stopPlay();
}
function toggleAuto(){ if (autoMode) setPlayManual(); else startPlayAuto(); }

autoToggle.addEventListener('click', toggleAuto);
autoToggle.addEventListener('keydown', (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleAuto(); }
});

document.getElementById('btnStopPlay').addEventListener('click', () => {
  stopPlay();
  boardLabel.textContent = autoMode ? "AUTO_RUNNING" : "CLICK_TO_TRIGGER";
});

function setActiveButton(activeId){
  ['btnSweep','btnPulse','btnChaos','btnBeat','btnStairs'].forEach(id => {
    const b = document.getElementById(id);
    if (id === activeId) b.classList.remove('btn-ghost');
    else b.classList.add('btn-ghost');
  });
}

document.getElementById('btnSweep').addEventListener('click', () => { setMode('SWEEP'); setActiveButton('btnSweep'); if (autoMode) startPlayAuto(); });
document.getElementById('btnPulse').addEventListener('click', () => { setMode('PULSE'); setActiveButton('btnPulse'); if (autoMode) startPlayAuto(); });
document.getElementById('btnChaos').addEventListener('click', () => { setMode('CHAOS'); setActiveButton('btnChaos'); if (autoMode) startPlayAuto(); });
document.getElementById('btnBeat').addEventListener('click', () => { setMode('HEARTBEAT'); setActiveButton('btnBeat'); if (autoMode) startPlayAuto(); });
document.getElementById('btnStairs').addEventListener('click', () => { setMode('STAIRS'); setActiveButton('btnStairs'); if (autoMode) startPlayAuto(); });

document.querySelectorAll('[data-speed]').forEach(btn => {
  btn.addEventListener('click', () => {
    setSpeed(btn.getAttribute('data-speed'));
    document.querySelectorAll('[data-speed]').forEach(b => b.classList.add('btn-ghost'));
    btn.classList.remove('btn-ghost');
  });
});

board.addEventListener('click', () => {
  if (!autoMode) { runCurrentPattern(); setTimeout(stopPlay, 1800); }
  heroGlyphBurst();
});

// Copy email (modern + fallback)
const copyBtn = document.getElementById('copyEmailBtn');
const copyToast = document.getElementById('copyToast');
copyBtn.addEventListener('click', async () => {
  const email = "ankitprogressx@gmail.com";
  try{
    if (navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(email);
    } else {
      const t = document.createElement("textarea");
      t.value = email;
      t.style.position = "fixed";
      t.style.left = "-9999px";
      document.body.appendChild(t);
      t.focus(); t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    copyToast.style.opacity = "1";
    copyToast.style.transform = "translateY(0)";
    setTimeout(() => {
      copyToast.style.opacity = "0";
      copyToast.style.transform = "translateY(4px)";
    }, 900);
  } catch (err){
    console.error("Copy failed:", err);
  }
});

window.addEventListener('load', () => {
  runGlyphSequence();
  startHeroAutoplay();
  setSpeed('med');
  setMode('SWEEP');
  setActiveButton('btnSweep');
  startPlayAuto();
  setActiveByScroll();
});
