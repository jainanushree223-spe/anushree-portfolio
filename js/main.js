/* ════════════════════════════════════════════════════════════
   Anushree Jain — Motion Prototype V1
   Motion layer only. Nothing here changes the layout: every
   animated property is transform / opacity / clip.

   CONFIG lives at the top so timings can be tuned without
   hunting through the file.
   ════════════════════════════════════════════════════════════ */

const CONFIG = {
  hero: {
    /* how much scroll the hero→intro wave transition consumes,
       as a multiple of viewport height */
    pinLength: 1.15,
    /* fraction of the pin during which the wave rises (0 → this) */
    waveEnd: 0.80,
    /* fraction of the pin at which the intro copy is allowed in.
       The gap between waveEnd and copyStart IS the breathing room. */
    copyStart: 0.86,
    contentDrift: -86,   // px the hero content lifts across the pin
    skyDrift: -34,       // px the sky lifts (slower = depth)
    sunDrift: -20
  },
  marquee: {
    speed: 22,           // seconds for one full cycle (desktop)
    speedMobile: 20,     // seconds for one full cycle (mobile)
    hoverScale: 0.12     // timeScale when hovering (near-pause)
  },
  letter: { y: -4, scale: 1.03, rot: 1.6, dur: 0.42 },
  reveal: { y: 42, dur: 0.95, stagger: 0.14 },
  grid:   { y: 46, scale: 0.972, dur: 1.05, stagger: 0.125 },
  cards:  { y: 52, dur: 1.0, stagger: 0.11 },
  peek:   { y: 46, dur: 0.95, stagger: 0.11, drift: 90 },
  ctaWave: { pinLength: 0.6, waveEnd: 0.85 },
  parallax: { funBg: 16, funFg: 30 },
  /* per-cluster breeze — each flower cluster sways independently
     with its own rotation range, duration and delay, so the motion
     reads as natural wind rather than a single animation effect.
     transform-origin is always bottom-center (set in the slice CSS). */
  wind: [
    { rot: 1.5,  dur: 2.8, delay: 0.0 },   // cluster 1  (small flowers)
    { rot: 2.0,  dur: 3.4, delay: 0.5 },   // cluster 2  (taller stems)
    { rot: 1.5,  dur: 2.6, delay: 1.0 },   // cluster 3  (grasses)
    { rot: 2.5,  dur: 3.8, delay: 0.3 },   // cluster 4  (lavender)
    { rot: 2.0,  dur: 3.2, delay: 0.7 }    // cluster 5  (mixed)
  ]
};

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE  = window.matchMedia('(max-width: 760px)').matches;
document.documentElement.classList.add('js');

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ─────────────────────────────────────────────
   Text splitting helpers
   ───────────────────────────────────────────── */
function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  const out = [];
  for (const c of text) {
    const s = document.createElement('span');
    s.className = 'ch' + (c === ' ' ? ' ch--space' : '');
    s.textContent = c === ' ' ? ' ' : c;
    el.appendChild(s);
    if (c !== ' ') out.push(s);
  }
  return out;
}

/* words wrapped in an overflow mask — used for editorial heading reveals */
function splitWordsMasked(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  el.style.visibility = 'visible';
  const inners = [];
  words.forEach((w, i) => {
    const mask = document.createElement('span');
    mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top';
    const inner = document.createElement('span');
    inner.className = 'sw';
    inner.textContent = w;
    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    inners.push(inner);
  });
  return inners;
}

/* ─────────────────────────────────────────────
   01 · HERO — load-in
   ───────────────────────────────────────────── */
const heroLine1 = $('.hero__title .line[data-split]');
const line1Chars = splitChars(heroLine1);
const swapEl = $('#swap');

/* "Builds" stays permanently — split into chars for hover interaction.
   bindLetterHover is called in init() after it's defined. */
let swapChars = splitChars(swapEl);

function heroIntro() {
  if (REDUCED) return;
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from('.nav__loc',  { y: -14, opacity: 0, duration: .8 }, 0)
    .from('.nav__pill', { y: -18, opacity: 0, duration: .9 }, .05)
    .from('.hero__sun', { scale: .82, opacity: 0, duration: 1.4, ease: 'expo.out', transformOrigin: '50% 50%' }, .1)
    .from('.hero__cloud', { xPercent: 8, opacity: 0, duration: 1.6, stagger: .12 }, .15)
    .from('.hero__kicker', { y: 16, opacity: 0, duration: .9 }, .35)
    .from('.hero__vertical', { y: 20, opacity: 0, duration: .9 }, .42)
    .from(line1Chars, { y: 46, opacity: 0, duration: 1.05, stagger: .028, ease: 'expo.out' }, .3)
    .from(swapChars,  { y: 46, opacity: 0, duration: 1.05, stagger: .028, ease: 'expo.out' }, .46)
    .from('.player',  { y: 26, scale: .965, opacity: 0, duration: 1.1, ease: 'expo.out' }, .58)
    ;
  return tl;
}

/* — decorative loop: clouds drift, sun breathes — */
function heroAmbient() {
  if (REDUCED) return;
  gsap.to('.hero__cloud--a', { x: 26, duration: 16, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.hero__cloud--b', { x: -18, duration: 19, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.hero__sun', { rotation: 360, duration: 220, repeat: -1, ease: 'none' });
}

/* 01a · Word cycler — REMOVED
   "Builds" is now permanent. No cycling. */

/* ─────────────────────────────────────────────
   01b · Per-letter hover
   ───────────────────────────────────────────── */
function bindLetterHover(chars) {
  if (REDUCED || MOBILE) return;
  chars.forEach((ch, i) => {
    const rot = (i % 2 ? 1 : -1) * CONFIG.letter.rot;
    ch.addEventListener('pointerenter', () => {
      ch.classList.add('is-hot');
      gsap.to(ch, {
        y: CONFIG.letter.y, scale: CONFIG.letter.scale, rotation: rot,
        duration: CONFIG.letter.dur, ease: 'back.out(2.6)', overwrite: 'auto'
      });
    });
    ch.addEventListener('pointerleave', () => {
      ch.classList.remove('is-hot');
      gsap.to(ch, { y: 0, scale: 1, rotation: 0, duration: .55, ease: 'power3.out', overwrite: 'auto' });
    });
  });
}
bindLetterHover(line1Chars);

/* ─────────────────────────────────────────────
   01c · Cassette audio player
   ───────────────────────────────────────────── */
(function player() {
  const el = $('#player'), audio = $('#audio'), btn = $('#playBtn');
  const fill = $('#fill'), knob = $('#knob'), track = $('#track');
  const tNow = $('#tNow'), tEnd = $('#tEnd');
  let reelTween = null;

  const fmt = s => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  audio.addEventListener('loadedmetadata', () => { tEnd.textContent = fmt(audio.duration); });

  function paint() {
    const p = audio.duration ? audio.currentTime / audio.duration : 0;
    fill.style.width = (p * 100) + '%';
    knob.style.left  = (p * 100) + '%';
    tNow.textContent = fmt(audio.currentTime);
  }
  audio.addEventListener('timeupdate', paint);
  audio.addEventListener('ended', () => setPlaying(false));

  function spin(on) {
    if (REDUCED) { gsap.set('.player__reel', { opacity: on ? .5 : 0 }); return; }
    if (on && !reelTween) {
      reelTween = gsap.to('.player__reel', {
        opacity: .62, scale: 1.12, duration: 1.15,
        repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: .18
      });
    } else if (!on && reelTween) {
      reelTween.kill(); reelTween = null;
      gsap.to('.player__reel', { opacity: 0, scale: 1, duration: .5 });
    }
  }

  function setPlaying(on) {
    el.classList.toggle('is-playing', on);
    btn.setAttribute('aria-label', on ? 'Pause track' : 'Play track');
    spin(on);
  }

  /* never autoplay — audio only ever starts from this click */
  btn.addEventListener('click', () => {
    if (audio.paused) { audio.play().then(() => setPlaying(true)).catch(() => {}); }
    else { audio.pause(); setPlaying(false); }   // resumes from currentTime
  });

  /* tactile feedback */
  if (!REDUCED) {
    el.addEventListener('pointerenter', () => gsap.to(el, { scale: 1.014, duration: .5 }));
    el.addEventListener('pointerleave', () => gsap.to(el, { scale: 1, duration: .6 }));
    btn.addEventListener('pointerdown', () => gsap.to(btn, { scale: .88, duration: .12, ease: 'power2.out' }));
    ['pointerup', 'pointerleave'].forEach(e =>
      btn.addEventListener(e, () => gsap.to(btn, { scale: 1, duration: .45, ease: 'back.out(3)' })));
  }

  track.addEventListener('click', e => {
    const r = track.getBoundingClientRect();
    if (audio.duration) { audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration; paint(); }
  });
})();

/* ─────────────────────────────────────────────
   01d · HERO → 02 transition
   The hero is pinned. The cream cloud edge physically rises and
   covers the blue. Only once it has, the intro copy is allowed in.
   ───────────────────────────────────────────── */
const introItems = $$('.intro [data-reveal]');

function heroTransition() {
  if (REDUCED) { gsap.set(introItems, { opacity: 1, y: 0 }); return; }

  const hero  = $('#hero');
  const sheet = $('#heroSheet');
  const art   = $('.hero__art');
  const vh    = () => window.innerHeight;

  gsap.set(introItems, { y: CONFIG.reveal.y });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: () => '+=' + (vh() * CONFIG.hero.pinLength),
      pin: hero,
      pinSpacing: true,
      scrub: 0.9,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  const W = CONFIG.hero.waveEnd;   // the wave finishes covering here

  /* Stages 2–4 — the cream edge physically rises and swallows the blue.
     The hero is never faded; it is covered.
     The remaining (1 − W) of the pin is the HOLD: a beat of pure cream
     before anything else is allowed to happen. */
  tl.to(sheet, {
      y: () => -(hero.offsetHeight + 40),
      duration: W, ease: 'none'
    }, 0)
    .to('[data-layer="content"]', { y: CONFIG.hero.contentDrift, duration: W, ease: 'none' }, 0)
    .to('[data-layer="sky"]',     { y: CONFIG.hero.skyDrift,     duration: W, ease: 'none' }, 0)
    .to('.hero__sun',             { y: CONFIG.hero.sunDrift,     duration: W, ease: 'none' }, 0)
    .to({}, { duration: 1 - W }, W);

  tl.totalDuration(1);

  /* Stage 5 — the copy is only allowed in once the cream owns the viewport.
     It reveals on its own trigger, well after the pin has released. */
  gsap.to(introItems, {
    opacity: 1, y: 0, duration: CONFIG.reveal.dur, ease: 'power3.out',
    stagger: CONFIG.reveal.stagger,
    scrollTrigger: { trigger: '.intro', start: 'top 80%' }
  });
}

/* ─────────────────────────────────────────────
   02/03/05/06 · editorial heading reveals
   ───────────────────────────────────────────── */
function headingReveals() {
  $$('[data-split-words]').forEach(el => {
    const inners = splitWordsMasked(el);
    if (REDUCED) { gsap.set(inners, { opacity: 1 }); return; }
    /* The CTA heading enters later so it follows the body copy;
       all other headings use the standard 86% trigger. */
    const isCta = el.closest('.cta') !== null;
    gsap.fromTo(inners,
      { yPercent: 115, opacity: 0 },
      {
        yPercent: 0, opacity: 1, duration: 1.05, ease: 'expo.out', stagger: 0.055,
        scrollTrigger: { trigger: el, start: isCta ? 'top 62%' : 'top 86%' }
      });
  });
}

/* ─────────────────────────────────────────────
   03 · work grid
   ───────────────────────────────────────────── */
function workGrid() {
  const cells = $$('[data-cell]');
  if (REDUCED) { gsap.set(cells, { opacity: 1 }); }
  else {
    gsap.fromTo(cells,
      { y: CONFIG.grid.y, scale: CONFIG.grid.scale, opacity: 0 },
      {
        y: 0, scale: 1, opacity: 1, duration: CONFIG.grid.dur, ease: 'expo.out',
        stagger: CONFIG.grid.stagger,
        scrollTrigger: { trigger: '.work__grid', start: 'top 82%' }
      });
  }
  if (REDUCED || MOBILE) return;

  /* premium image hover — scale stays inside the rounded container */
  $$('.cell').forEach(cell => {
    const img = cell.querySelector('img');
    if (!img) { hoverLift(cell, 4, 1.006); return; }
    const xTo = gsap.quickTo(img, 'x', { duration: .9, ease: 'power3.out' });
    const yTo = gsap.quickTo(img, 'y', { duration: .9, ease: 'power3.out' });
    cell.addEventListener('pointerenter', () => gsap.to(img, { scale: 1.035, duration: 1.1, ease: 'power3.out' }));
    cell.addEventListener('pointerleave', () => { gsap.to(img, { scale: 1, duration: 1.1, ease: 'power3.out' }); xTo(0); yTo(0); });
    cell.addEventListener('pointermove', e => {
      const r = cell.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - .5) * 12);
      yTo(((e.clientY - r.top) / r.height - .5) * 12);
    });
  });
}
function hoverLift(el, y, s) {
  el.addEventListener('pointerenter', () => gsap.to(el, { y: -y, scale: s, duration: .6 }));
  el.addEventListener('pointerleave', () => gsap.to(el, { y: 0, scale: 1, duration: .7 }));
}

/* ─────────────────────────────────────────────
   04 · other projects — landscape parallax + cards
   ───────────────────────────────────────────── */
function funSection() {
  const cards = $$('[data-fcard]');
  if (REDUCED) { gsap.set(cards, { opacity: 1 }); }
  else {
    gsap.fromTo(cards,
      { y: CONFIG.cards.y, opacity: 0 },
      {
        y: 0, opacity: 1, duration: CONFIG.cards.dur, ease: 'expo.out',
        stagger: CONFIG.cards.stagger,
        scrollTrigger: { trigger: '.fun__cards', start: 'top 88%' }
      });

    /* background slower, foreground faster — depth without noticing it */
    if (!MOBILE) {
      /* background slower than the page, foreground faster.
         Both are zero when the section is centred, so the composition
         is exact at the moment it is actually being looked at. */
      gsap.fromTo('#funBg', { y: -CONFIG.parallax.funBg }, {
        y: CONFIG.parallax.funBg, ease: 'none',
        scrollTrigger: { trigger: '.fun', start: 'top bottom', end: 'bottom top', scrub: true }
      });
      gsap.fromTo('#funFg', { y: CONFIG.parallax.funFg }, {
        y: -CONFIG.parallax.funFg, ease: 'none',
        scrollTrigger: { trigger: '.fun', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  }

  if (REDUCED || MOBILE) return;
  cards.forEach(card => {
    const img = card.querySelector('.fcard__thumb img');
    card.addEventListener('pointerenter', () => {
      gsap.to(card, { y: -7, scale: 1.02, duration: .55, ease: 'power3.out',
        boxShadow: '0 calc(26 * var(--s)) calc(52 * var(--s)) rgba(46,60,32,.22)' });
      gsap.to(img, { scale: 1.05, duration: 1.0, ease: 'power3.out' });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, { y: 0, scale: 1, duration: .7, ease: 'power3.out',
        boxShadow: '0 calc(14 * var(--s)) calc(34 * var(--s)) rgba(46,60,32,.14)' });
      gsap.to(img, { scale: 1, duration: 1.0, ease: 'power3.out' });
    });
  });
}

/* ─────────────────────────────────────────────
   05 · sneak peek — continuous horizontal marquee
   ───────────────────────────────────────────── */
function peekSection() {
  const strip = $('#peekStrip');
  const items = $$('[data-peek]', strip);

  /* Make all items visible */
  gsap.set(items, { opacity: 1 });

  if (REDUCED) return;

  /* --- duplicate the card set for seamless infinite loop --- */
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.removeAttribute('data-peek');   /* avoid re-hiding by CSS base state */
    clone.style.opacity = '1';           /* ensure clone is visible */
    /* force-eager load cloned images */
    const img = clone.querySelector('img');
    if (img) { img.loading = 'eager'; img.decoding = 'sync'; }
    strip.appendChild(clone);
  });

  /* --- continuous marquee via GSAP --- */
  const totalItems = items.length;  // original count (before duplication)
  /* We move by exactly 50% (the original set width) then snap back to 0 */
  const marquee = gsap.to(strip, {
    xPercent: -50,
    duration: MOBILE ? CONFIG.marquee.speedMobile : CONFIG.marquee.speed,
    ease: 'none',
    repeat: -1
  });

  /* --- hover: slow/pause on desktop --- */
  if (!MOBILE) {
    const peekContainer = $('.peek');
    let slowTween = null;
    peekContainer.addEventListener('pointerenter', () => {
      slowTween = gsap.to(marquee, { timeScale: CONFIG.marquee.hoverScale, duration: 0.8, ease: 'power2.out' });
    });
    peekContainer.addEventListener('pointerleave', () => {
      if (slowTween) slowTween.kill();
      gsap.to(marquee, { timeScale: 1, duration: 1.2, ease: 'power2.inOut' });
    });

    /* individual image hover — subtle scale */
    $$('.peek__item', strip).forEach(it => {
      const img = it.querySelector('img');
      it.addEventListener('pointerenter', () => gsap.to(img, { scale: 1.04, duration: 1.0, ease: 'power3.out' }));
      it.addEventListener('pointerleave', () => gsap.to(img, { scale: 1, duration: 1.0, ease: 'power3.out' }));
    });
  }
}

/* ─────────────────────────────────────────────
   05b · PEEK → CTA wave transition
   Echoes the hero→intro wave. The CTA wave sheet rises from
   below to physically cover the sneak-peek section, then the
   CTA content reveals sequentially.
   ───────────────────────────────────────────── */
function peekCtaTransition() {
  if (REDUCED) return;

  const pin   = $('#peekCtaPin');
  const sheet = $('#ctaSheet');
  const vh    = () => window.innerHeight;

  const W = CONFIG.ctaWave.waveEnd;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => '+=' + (vh() * CONFIG.ctaWave.pinLength),
      pin: pin,
      pinSpacing: true,
      scrub: 0.9,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  /* The sheet starts off-screen below and rises to cover the viewport */
  tl.to(sheet, {
    y: () => -(pin.offsetHeight + 80),
    duration: W, ease: 'none'
  }, 0)
  .to({}, { duration: 1 - W }, W);  /* breathing room hold */

  tl.totalDuration(1);
}

/* ─────────────────────────────────────────────
   06 · final CTA — landscape rise + per-cluster wind
   The plants layer is the original artwork, cut along the hill
   crest, then clipped into clusters. Each cluster pivots on its
   own base, so nothing is redrawn and the hill line never moves.
   ───────────────────────────────────────────── */
const PLANT_SEAMS = [0, 0.20, 0.41, 0.665, 0.855, 1];

function ctaSection() {
  const holder = $('#ctaPlants');

  PLANT_SEAMS.slice(0, -1).forEach((a, i) => {
    const b = PLANT_SEAMS[i + 1];
    /* Overlap each slice by 2% on each inner edge to prevent visible
       seams when the wind animation rotates adjacent clusters apart. */
    const overlap = 0.04;
    const clipL = i === 0 ? 0 : Math.max(0, a - overlap);
    const clipR = i === PLANT_SEAMS.length - 2 ? 1 : Math.min(1, b + overlap);
    const slice = document.createElement('div');
    slice.className = 'slice';
    slice.style.clipPath = `inset(0 ${(1 - clipR) * 100}% 0 ${clipL * 100}%)`;
    slice.style.transformOrigin = `${((a + b) / 2) * 100}% 100%`;
    const img = document.createElement('img');
    img.src = 'assets/illustrations/cta-plants.webp';
    img.alt = '';
    slice.appendChild(img);
    holder.appendChild(slice);
  });

  const slices = $$('.slice', holder);
  const body = $('.cta__body');

  if (REDUCED) { gsap.set(body, { opacity: 1 }); return; }

  gsap.set(body, { y: CONFIG.reveal.y });

  /* Sequential reveal — content enters only AFTER the wave has
     settled and the CTA section is well inside the viewport.
     Order: supporting copy → heading → landscape / plants.
     Each stage is clearly separated so nothing appears at once. */
  gsap.timeline({ scrollTrigger: { trigger: '.cta', start: 'top 52%' } })
    .to(body, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0)
    .from('#ctaScene', { y: 80, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.55)
    .from(slices, { yPercent: 8, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.75);

  /* per-cluster breeze — each flower/plant cluster sways with its own
     rotation, duration and delay so the motion reads as natural wind.
     Alternating direction per cluster; transform-origin is 50% 100%
     (bottom-center), set in the CSS on .slice. */
  slices.forEach((s, i) => {
    const w = CONFIG.wind[i] || CONFIG.wind[CONFIG.wind.length - 1];
    const dir = i % 2 ? 1 : -1;
    gsap.to(s, {
      rotation: dir * w.rot,
      duration: w.dur,
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: w.delay
    });
  });

  /* subtle parallax on the hills layer only — does NOT target
     #ctaScene which already has an entrance .from() tween,
     so there's no competing-y-property conflict. */
  if (!MOBILE) {
    gsap.fromTo('.cta__hills', { y: 34 }, {
      y: 0, ease: 'none',
      scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true }
    });
  }
}

/* ─────────────────────────────────────────────
   NAV — subtle behaviour only
   ───────────────────────────────────────────── */
function navBehaviour() {
  const pill = $('.nav__pill');
  ScrollTrigger.create({
    start: 'top -60',
    onToggle: self => {
      gsap.to(pill, {
        backgroundColor: self.isActive ? 'rgba(255,255,255,.72)' : 'rgba(255,255,255,.34)',
        duration: .45
      });
      gsap.to('.nav__loc', { color: self.isActive ? '#12100D' : '#ffffff', duration: .45 });
    }
  });
}

/* ─────────────────────────────────────────────
   boot
   ───────────────────────────────────────────── */
function init() {
  bindLetterHover(swapChars);
  heroIntro();
  heroAmbient();
  heroTransition();
  headingReveals();
  workGrid();
  funSection();
  peekSection();
  peekCtaTransition();
  ctaSection();
  navBehaviour();
  ScrollTrigger.refresh();
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => requestAnimationFrame(init));
} else {
  window.addEventListener('load', init);
}
window.addEventListener('resize', () => ScrollTrigger.refresh());
