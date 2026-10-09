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
    pinLength: 0.75,
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
  ctaWave: { pinLength: 0.6, waveEnd: 1 },
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
   CUSTOM CURSOR — SAME AS ABOUT PAGE
   ───────────────────────────────────────────── */

function customCursor(){

  if(!window.matchMedia('(pointer:fine)').matches) return;

  const c = document.querySelector('.cursor');

  if(!c) return;

  document.documentElement.classList.add('has-cursor');

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  let cx = x;
  let cy = y;

  window.addEventListener('mousemove', e => {
    x = e.clientX;
    y = e.clientY;
    c.style.opacity = 1;
  });

  document.addEventListener('mouseleave', () => {
    c.style.opacity = 0;
  });

  function loop(){

    cx += (x - cx) * .2;
    cy += (y - cy) * .2;

    c.style.transform =
      `translate3d(${cx}px, ${cy}px, 0)`;

    requestAnimationFrame(loop);
  }

  loop();

  document
    .querySelectorAll('a, button, .cell, .fcard, .peek__item, .player')
    .forEach(el => {

      el.addEventListener('mouseenter', () => {
        c.classList.add('big');
      });

      el.addEventListener('mouseleave', () => {
        c.classList.remove('big');
      });

    });
}
/* ========================================================
   ABOUT FOOTER PLANTS
======================================================== */

const FOOTER_PLANTS = [
  {f:"plant-00.png",x:3.174,y:66.151,w:10.042,h:23.907},
  {f:"plant-01.png",x:27.035,y:74.494,w:4,h:14.366},
  {f:"plant-03.png",x:31.592,y:72,w:5,h:16},
  {f:"plant-05.png",x:36.1,y:73.348,w:4,h:13.486},
  {f:"plant-06.png",x:44.401,y:55.277,w:22.217,h:30.251},
  {f:"plant-08.png",x:70.459,y:69.057,w:3,h:13.593},
  {f:"plant-09.png",x:75.049,y:70.123,w:4,h:14.739},
  {f:"plant-10.png",x:77.979,y:72.281,w:4,h:14.046},
  {f:"plant-11.png",x:80.892,y:81,w:6,h:6},
  {f:"plant-12.png",x:82.601,y:68.843,w:2.62,h:16.711},
  {f:"plant-13.png",x:86.019,y:64.526,w:7,h:19.51}
];

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
    mask.style.cssText = 'display:inline-block;overflow:visible;vertical-align:top';
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
  gsap.fromTo(
  introItems,
  {
    y: 34,
    opacity: 0,
    filter: 'blur(6px)'
  },
  {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1.15,
    ease: 'power3.out',
    stagger: 0.22,
    scrollTrigger: {
      trigger: '.intro',
      start: 'top 78%',
      toggleActions: 'play none none reverse'
    }
  }
);
}
/* ─────────────────────────────────────────────
   02/03/05/06 · editorial heading reveals
   ───────────────────────────────────────────── */
function headingReveals() {

  $$('[data-split-words]').forEach(el => {

    const inners = splitWordsMasked(el);

    if (REDUCED) {
      gsap.set(inners, {
        yPercent:0,
        opacity:1
      });
      return;
    }

    gsap.fromTo(
      inners,
      {
        yPercent:115,
        opacity:0
      },
      {
        yPercent:0,
        opacity:1,
        duration:1.05,
        ease:'expo.out',
        stagger:0.055,

        scrollTrigger:{
          trigger:el,
          start:'top 86%',

          once:true
        },

        onComplete:()=>{
          gsap.set(inners,{
            clearProps:'transform',
            opacity:1
          });
        }
      }
    );

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

  if (!img) {
    hoverLift(cell, 4, 1.006);
    return;
  }

  /* Work cards now use CSS hover reveal.
     Don't let GSAP animate their image transform. */
  if (cell.classList.contains('work-card')) {
    return;
  }

  const xTo = gsap.quickTo(img, 'x', {
    duration: .9,
    ease: 'power3.out'
  });

  const yTo = gsap.quickTo(img, 'y', {
    duration: .9,
    ease: 'power3.out'
  });

  cell.addEventListener('pointerenter', () =>
    gsap.to(img, {
      scale: 1.035,
      duration: 1.1,
      ease: 'power3.out'
    })
  );

  cell.addEventListener('pointerleave', () => {

    gsap.to(img, {
      scale: 1,
      duration: 1.1,
      ease: 'power3.out'
    });

    xTo(0);
    yTo(0);

  });

  cell.addEventListener('pointermove', e => {

    const r = cell.getBoundingClientRect();

    xTo(
      ((e.clientX - r.left) / r.width - .5) * 12
    );

    yTo(
      ((e.clientY - r.top) / r.height - .5) * 12
    );

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
/* ========================================================
   ABOUT FOOTER
======================================================== */

function aboutFooter(){

  const garden = document.querySelector('.about-footer__garden');

  if(!garden) return;


  /* ---------------------------------------
     Create flowers
  --------------------------------------- */

  const plantEls = FOOTER_PLANTS.map(p => {

    const plant = document.createElement('div');

    plant.className = 'about-footer__plant';

    Object.assign(plant.style,{
      left:p.x + '%',
      top:p.y + '%',
      width:p.w + '%',
      height:p.h + '%'
    });

    plant.innerHTML =
  `<img src="assets/illustrations/${p.f}" alt="">`;

    garden.appendChild(plant);

    return plant;

  });


  /* Reduced motion */

  if(REDUCED) return;


  /* ---------------------------------------
     CTA title
  --------------------------------------- */

  gsap.fromTo(
    '.about-footer__heading a',

    {
      scale:.22
    },

    {
      scale:1,

      ease:'power2.out',

      scrollTrigger:{
        trigger:'.about-footer',

        start:'top 85%',
        end:'bottom bottom',

        scrub:.6
      }
    }
  );


  /* ---------------------------------------
     Description
  --------------------------------------- */

  gsap.from(
    '.about-footer__copy',
    {
      y:40,

      opacity:0,

      ease:'power2.out',

      scrollTrigger:{
        trigger:'.about-footer',

        start:'top 80%',
        end:'top 20%',

        scrub:.6
      }
    }
  );


  /* ---------------------------------------
     Garden ground
  --------------------------------------- */

  gsap.from(
    '.about-footer__ground',
    {
      yPercent:22,

      ease:'power2.out',

      scrollTrigger:{
        trigger:'.about-footer',

        start:'top bottom',
        end:'bottom bottom',

        scrub:.6
      }
    }
  );


  /* ---------------------------------------
     Flowers grow + sway
  --------------------------------------- */

  plantEls.forEach((el,i) => {

    const img = el.querySelector('img');


    gsap.fromTo(
      el,

      {
        scaleY:0,
        scaleX:.6,
        yPercent:22
      },

      {
        scaleY:1,
        scaleX:1,
        yPercent:0,

        ease:'back.out(1.6)',

        scrollTrigger:{
          trigger:'.about-footer',

          start:() =>
            `top+=${120 + (i % 7) * 28} bottom`,

          end:'bottom bottom',

          scrub:.8
        }
      }
    );


    gsap.to(
      img,
      {
        rotation:
          (i % 2 ? 1 : -1) *
          (1.2 + Math.random() * 1.4),

        duration:
          2.4 + Math.random() * 1.6,

        ease:'sine.inOut',

        yoyo:true,

        repeat:-1,

        delay:
          Math.random() * 2
      }
    );

  });

}
/* ─────────────────────────────────────────────
   CUSTOM CURSOR — SAME AS ABOUT PAGE
   ───────────────────────────────────────────── */

function customCursor(){

  if(!matchMedia('(pointer:fine)').matches) return;

  const c = document.querySelector('.cursor');

  if(!c) return;

  document.documentElement.classList.add('has-cursor');

  let x = innerWidth / 2;
  let y = innerHeight / 2;

  let cx = x;
  let cy = y;

  addEventListener('mousemove', e => {

    x = e.clientX;
    y = e.clientY;

    c.style.opacity = 1;

  });

  document.addEventListener('mouseleave', () => {
    c.style.opacity = 0;
  });

  function loop(){

    cx += (x - cx) * .2;
    cy += (y - cy) * .2;

    c.style.transform =
      `translate3d(${cx}px,${cy}px,0)`;

    requestAnimationFrame(loop);

  }

  loop();

  document.querySelectorAll(
    'a, button, .cell, .fcard, .peek__item, .player'
  ).forEach(el => {

    el.addEventListener('mouseenter', () => {
      c.classList.add('big');
    });

    el.addEventListener('mouseleave', () => {
      c.classList.remove('big');
    });

  });

}
/* ─────────────────────────────────────────────
   MOBILE DESKTOP NOTICE
   ────────────────────────────────────────────── */

function desktopNotice(){

  const notice =
    document.getElementById('desktopNotice');

  const button =
    document.getElementById('desktopNoticeContinue');

  if(!notice || !button) return;

  button.addEventListener('click', () => {

    /* hide notice */
    notice.style.display = 'none';

    /* restore page scrolling */
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    document.documentElement.style.height = '';
    document.body.style.height = '';

    document.body.style.position = '';

    /* refresh scroll positions */
    if(window.ScrollTrigger){
      ScrollTrigger.refresh();
    }

  });

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
desktopNotice();

  bindLetterHover(line1Chars);
  bindLetterHover(swapChars);

  heroIntro();
  heroAmbient();
  heroTransition();

  headingReveals();
  workGrid();
  funSection();
  peekSection();

  /* About footer */
  aboutFooter();

  navBehaviour();

  /* custom cursor */
  customCursor();

  ScrollTrigger.refresh();
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => requestAnimationFrame(init));
} else {
  window.addEventListener('load', init);
}
window.addEventListener('resize', () => ScrollTrigger.refresh());
