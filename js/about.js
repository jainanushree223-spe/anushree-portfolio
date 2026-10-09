  /* About page — animations & interactions (GSAP + ScrollTrigger, loaded in index.html) */
  /* Plant sprites cut from the footer artwork — x/y/w/h in % of the garden image */
  const PLANTS=[
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
  const garden=document.querySelector('.garden');
  const plantEls=PLANTS.map(p=>{
    const d=document.createElement('div');d.className='plant';
    Object.assign(d.style,{left:p.x+'%',top:p.y+'%',width:p.w+'%',height:p.h+'%'});
    d.innerHTML=`<img src="assets/illustrations/${p.f}" alt="">`;garden.appendChild(d);return d;
  });

  const STATIC=/[?&]static/.test(location.search);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setUnit(){ if(innerWidth>760) document.documentElement.style.setProperty('--u',document.documentElement.clientWidth/1536+'px'); else document.documentElement.style.removeProperty('--u'); }
  setUnit(); addEventListener('resize',()=>{setUnit(); if(window.ScrollTrigger) ScrollTrigger.refresh();});

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.row-head').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const row = btn.parentElement;
      const body = row.querySelector('.row-body');
      const isOpen = row.classList.contains('open');

      // Close every other row
      document.querySelectorAll('.row').forEach(otherRow=>{
        if(otherRow !== row && otherRow.classList.contains('open')){
          const otherBody = otherRow.querySelector('.row-body');
          const otherBtn = otherRow.querySelector('.row-head');

          otherRow.classList.remove('open');
          otherBtn.setAttribute('aria-expanded','false');

          if(window.gsap){
            gsap.to(otherBody,{
              height:0,
              duration:.7,
              ease:'expo.inOut'
            });
          }else{
            otherBody.style.height=0;
          }
        }
      });

      // Toggle the clicked row
      const open = !isOpen;

      row.classList.toggle('open',open);
      btn.setAttribute('aria-expanded',open);

      if(window.gsap){
        gsap.to(body,{
          height:open?'auto':0,
          duration:.7,
          ease:'expo.inOut',
          onComplete:()=>{
            if(window.ScrollTrigger) ScrollTrigger.refresh();
          }
        });
      }else{
        body.style.height=open?'auto':0;
      }
    });
  });

  /* ---------- Cursor ---------- */
  (function(){
    if(!matchMedia('(pointer:fine)').matches||STATIC) return;
    document.documentElement.classList.add('has-cursor');
    const c=document.querySelector('.cursor'); let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y;
    addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;c.style.opacity=1;});
    document.addEventListener('mouseleave',()=>c.style.opacity=0);
    (function loop(){cx+=(x-cx)*.2;cy+=(y-cy)*.2;c.style.transform=`translate3d(${cx}px,${cy}px,0)`;requestAnimationFrame(loop)})();
    document.querySelectorAll('a,button,.photos').forEach(el=>{
      el.addEventListener('mouseenter',()=>c.classList.add('big'));
      el.addEventListener('mouseleave',()=>c.classList.remove('big'));
    });
  })();

  if(window.gsap && !STATIC && !reduce){
    gsap.registerPlugin(ScrollTrigger);
    function navBehaviour(){

  const pill = document.querySelector('.nav__pill');

  if(!pill) return;

  ScrollTrigger.create({

    start:'top -60',

    onToggle:self=>{

      gsap.to(pill,{
        backgroundColor:
          self.isActive
            ? 'rgba(255,255,255,.72)'
            : 'rgba(255,255,255,.34)',

        duration:.45
      });

      gsap.to('.nav__loc',{
  color:'#12100D',
  duration:.45
});

    }

  });

}

navBehaviour();
    const mobile=innerWidth<=760;

    /* ---------- Intro ---------- */
    const tl = gsap.timeline({
  defaults: {
    ease: 'expo.out'
  }
});


tl
  .from('.nav__loc',{
    y:-14,
    opacity:0,
    duration:.8
  },0)

  .from('.nav__pill',{
    y:-18,
    opacity:0,
    duration:.9
  },.05)

  .from('.copy h1 .ln > span',{
    yPercent:110,
    duration:1.2,
    stagger:.08
  },.25)

  .from('.copy .rv',{
    y:24,
    opacity:0,
    duration:1.2,
    stagger:.1
  },.5)

  .from('.photos',{
    y:60,
    rotate:-8,
    scale:.9,
    opacity:0,
    duration:1.6,
    ease:'elastic.out(1,.75)'
  },.35)

  .from('.clouds',{
    x:60,
    opacity:0,
    duration:1.8
  },.2)

  .from('.hills',{
    yPercent:18,
    duration:1.6
  },.1);

    /* idle drift on clouds + gentle sway on the polaroids */
    gsap.to('.clouds img',{x:-18,duration:6,ease:'sine.inOut',yoyo:true,repeat:-1});
    gsap.to('.photos img',{rotate:1.2,y:-4,duration:4,ease:'sine.inOut',yoyo:true,repeat:-1,transformOrigin:'50% 60%'});

    /* polaroid hover: slight lift + tilt toward pointer */
    const ph=document.querySelector('.photos');
    ph.addEventListener('mousemove',e=>{const r=ph.getBoundingClientRect();const dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5;
      gsap.to(ph,{rotate:dx*6,x:dx*14,y:dy*10,scale:1.03,duration:.6,ease:'power3.out'});});
    ph.addEventListener('mouseleave',()=>gsap.to(ph,{rotate:0,x:0,y:0,scale:1,duration:1,ease:'elastic.out(1,.5)'}));


    /* ---------- Hero: content holds while the hills roll up over it ---------- */
    gsap.to('.hero-inner',{y:()=>document.querySelector('.hero').offsetHeight*.9,ease:'none',
      scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.photos',{rotate:-3,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hills',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

    /* ---------- Experience reveal ---------- */
    gsap.from('.exp-title span',{xPercent:-104,duration:1.4,ease:'expo.out',scrollTrigger:{trigger:'.exp',start:'top 75%'}});
    gsap.utils.toArray('.row').forEach((row,i)=>{
    const d=document.createElement('span');
    d.className='ln-draw';
    row.prepend(d);

    const st={trigger:row,start:'top 90%'};

    gsap.from(d,{
      scaleX:0,
      duration:1.3,
      ease:'expo.inOut',
      scrollTrigger:st
    });

    gsap.from(row.querySelectorAll('.txt,.meta'),{
      y:30,
      opacity:0,
      duration:1.1,
      ease:'expo.out',
      delay:.15,
      stagger:.06,
      scrollTrigger:st
    });
  });

    /* ---------- CTA: heading grows into place, garden rises & blooms ---------- */
    const cta={trigger:'.cta-sec',start:'top bottom',end:'bottom bottom',scrub:.6};
    gsap.fromTo('.cta-h a',{scale:.22},{scale:1,ease:'power2.out',scrollTrigger:{trigger:'.cta-sec',start:'top 85%',end:'bottom bottom',scrub:.6}});
    gsap.from('.cta-p',{y:40,opacity:0,ease:'power2.out',scrollTrigger:{trigger:'.cta-sec',start:'top 80%',end:'top 20%',scrub:.6}});
    gsap.from('.garden .ground',{yPercent:22,ease:'power2.out',scrollTrigger:cta});
    plantEls.forEach((el,i)=>{
      const img=el.querySelector('img');
      gsap.fromTo(el,{scaleY:0,scaleX:.6,yPercent:22},{scaleY:1,scaleX:1,yPercent:0,ease:'back.out(1.6)',
        scrollTrigger:{trigger:'.cta-sec',start:()=>`top+=${120+ (i%7)*28} bottom`,end:'bottom bottom',scrub:.8}});
      gsap.to(img,{rotate:(i%2?1:-1)*(1.2+Math.random()*1.4),duration:2.4+Math.random()*1.6,ease:'sine.inOut',yoyo:true,repeat:-1,delay:Math.random()*2});
    });
  }
