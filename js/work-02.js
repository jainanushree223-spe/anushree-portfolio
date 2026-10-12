console.log('WORK JS LOADED');
(function(){
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var N = slides.length;
  console.log('slides found:', N);
  var stage = document.getElementById('stage');
  var progress = document.getElementById('progress');
  var body = document.body;

  // Dwell: give each slide ~0.9 viewport of scroll, plus a leading viewport so the
  // sticky can settle before the first swap. Stage height = (N + 0.? ) * vh.
  var DWELL = 0.95; // viewport heights per slide
  function layout(){ stage.style.height = Math.round((N * DWELL + 0.6) * window.innerHeight) + 'px'; }
  layout();

  for (var i=0;i<N;i++){
    var s=document.createElement('span'); s.className='seg';
    (function(n){ s.addEventListener('click', function(){
      var y = stage.offsetTop + Math.round((n*DWELL + 0.30) * window.innerHeight) + 4;
      smoothTo(y);
    });})(i);
    progress.appendChild(s);
  }
  var segs = Array.prototype.slice.call(progress.children);

  var cur = -1, staged = false;
  function update(){
    var vh = window.innerHeight;
    var top = stage.offsetTop;
    var rel = window.scrollY - top;              // 0 at stage top
    var h = stage.offsetHeight;

    // staged = the sticky is actually pinned (single clean threshold → no pill overlap)
    var isStaged = (window.scrollY >= top - vh*0.15) && (window.scrollY < top + h - vh*0.85);
    if (isStaged !== staged){ staged = isStaged; body.classList.toggle('staged', staged); }

    // which slide: offset the leading 0.3vh, then step by DWELL
    var idx = Math.floor((rel/vh - 0.30) / DWELL + 0.0001);
    idx = Math.max(0, Math.min(N-1, idx));
    if (idx !== cur){
      cur = idx;
      slides.forEach(function(sl,i){ sl.classList.toggle('on', i===idx); });
      segs.forEach(function(sg,i){ sg.classList.remove('done','current'); if(i<idx)sg.classList.add('done'); else if(i===idx)sg.classList.add('current'); });
    }
  }

  var ticking=false;
  window.addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(function(){ update(); ticking=false; }); ticking=true; } }, {passive:true});
  window.addEventListener('resize', function(){ layout(); cur=-1; staged=!staged; update(); });

/* =========================================
   ONE SCROLL = ONE SECTION / ONE SLIDE
========================================= */

var wheelLocked = false;
var wheelAmount = 0;
var wheelResetTimer = null;

window.addEventListener('wheel', function(e){

  var vh = window.innerHeight;
  var top = stage.offsetTop;
  var h = stage.offsetHeight;

  /* -----------------------------------------
   HERO → FIRST SLIDE
----------------------------------------- */

if(window.scrollY < top - 10){

  if(e.deltaY <= 0){
    return;
  }

  e.preventDefault();

  if(wheelLocked){
    return;
  }


  /* collect a tiny amount of scroll first */
  wheelAmount += e.deltaY;

  clearTimeout(wheelResetTimer);

  wheelResetTimer = setTimeout(function(){
    wheelAmount = 0;
  }, 150);


  /*
    Small threshold:
    user only needs a light scroll,
    but accidental 1px movement won't trigger it.
  */
  if(wheelAmount < 18){
    return;
  }


  wheelAmount = 0;

  wheelLocked = true;


  smoothHeroToStage();


  setTimeout(function(){

    wheelLocked = false;

  }, 1550);


  return;
}


  /* -----------------------------------------
     FIRST SLIDE → HERO
     One upward scroll returns to hero
  ----------------------------------------- */

  if(
    window.scrollY >= top - 10 &&
    cur === 0 &&
    e.deltaY < 0
  ){

    e.preventDefault();

    if(wheelLocked) return;

    wheelLocked = true;

    smoothTo(0);

    setTimeout(function(){
      wheelLocked = false;
    }, 850);

    return;
  }


  /* -----------------------------------------
     CHECK IF WE ARE INSIDE THE SLIDE AREA
  ----------------------------------------- */

  var insideStage =
    window.scrollY >= top - 10 &&
    window.scrollY <= top + h - vh + 10;

  if(!insideStage){

    wheelAmount = 0;

    return;
  }


  /* -----------------------------------------
     LAST SLIDE
  ----------------------------------------- */

  if(cur === N - 1 && e.deltaY > 0){

    e.preventDefault();

    return;
  }


  e.preventDefault();


  if(wheelLocked){
    return;
  }


  /* -----------------------------------------
     DETECT INTENTIONAL SCROLL
  ----------------------------------------- */

  wheelAmount += e.deltaY;

  clearTimeout(wheelResetTimer);

  wheelResetTimer = setTimeout(function(){

    wheelAmount = 0;

  }, 120);


  if(Math.abs(wheelAmount) < 30){
    return;
  }


  var direction =
    wheelAmount > 0
      ? 1
      : -1;


  var next =
    Math.max(
      0,
      Math.min(
        N - 1,
        cur + direction
      )
    );


  if(next === cur){

    wheelAmount = 0;

    return;
  }


  wheelLocked = true;

  wheelAmount = 0;


  var target =
    stage.offsetTop +
    Math.round(
      (next * DWELL + 0.30) * vh
    ) +
    4;


  smoothTo(target);


  setTimeout(function(){

    wheelLocked = false;

  }, 850);

}, {passive:false});

/* =========================================
   SMOOTH HERO → FIRST SLIDE
========================================= */

function smoothHeroToStage(){

  var start = window.scrollY;

  /* Stop exactly where the image stage begins.
     Do NOT jump 0.30 viewport inside it. */
  var target = stage.offsetTop;

  var distance = target - start;

  /* Slower = closer to the reference */
  var duration = 1450;

  var startTime = null;


  function ease(p){

    /*
      Very smooth ease-in-out.
      Starts softly, accelerates,
      then gently settles.
    */

    return p < 0.5
      ? 4 * p * p * p
      : 1 - Math.pow(-2 * p + 2, 3) / 2;

  }


  function animate(time){

    if(!startTime){
      startTime = time;
    }

    var progress =
      Math.min(
        1,
        (time - startTime) / duration
      );


    window.scrollTo(
      0,
      start + distance * ease(progress)
    );


    if(progress < 1){

      requestAnimationFrame(animate);

    }

  }


  requestAnimationFrame(animate);
}

  // custom smooth scroll (used only for jump buttons / dots) — native wheel stays untouched
  function smoothTo(target){
    target = Math.max(0, target);
    var start = window.scrollY, dist = target - start, dur = Math.min(900, 300 + Math.abs(dist)*0.25), t0=null;
    function ease(p){ return p<.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2; }
    function step(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/dur); window.scrollTo(0, start+dist*ease(p)); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }


  slides[0].classList.add('on');
  update();
})();