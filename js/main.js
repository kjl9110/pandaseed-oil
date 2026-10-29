(function(){
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const root=document.documentElement;

/* hero badge: size the cut-out to where the painted badge lands under object-fit:cover (image 2058x976, badge box 789,231 474x364) */
const badge=$('#heroBadge'),bImg=$('.hero-img img');
const placeBadge=()=>{const r=bImg.parentNode.getBoundingClientRect(),W=r.width,H=r.height,k=Math.max(W/2058,H/976),ox=(W-2058*k)*.5,oy=(H-976*k)*.45;
  Object.assign(badge.style,{left:ox+789*k+'px',top:oy+231*k+'px',width:474*k+'px',height:364*k+'px'})};
placeBadge();addEventListener('resize',placeBadge);
/* lift only for a real mouse that has actually moved over the badge after the loader is gone,
   so a cursor resting there while the page loads leaves the painting untouched */
let bx=null,by=null;
badge.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!$('#loader').classList.contains('is-done'))return;
  if(bx===null){bx=e.clientX;by=e.clientY;return}
  if(!badge.classList.contains('is-hover')&&Math.hypot(e.clientX-bx,e.clientY-by)<6)return;
  const r=badge.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  badge.classList.add('is-hover');badge.style.setProperty('--ry',(x*10).toFixed(2)+'deg');badge.style.setProperty('--rx',(-y*10).toFixed(2)+'deg')});
badge.addEventListener('pointerleave',()=>{bx=by=null;badge.classList.remove('is-hover');badge.style.setProperty('--rx','0deg');badge.style.setProperty('--ry','0deg')});

/* basket: items live in localStorage so they survive a reload; the drawer works with or without GSAP */
const cart=$('#cart'),cartBtn=$('#cartBtn'),scrim=$('#cartScrim'),list=$('#cartList');
const KEY='pandaseed-basket',eur=n=>'€'+n.toFixed(2);
const PRODUCTS={};$$('.buy').forEach(b=>PRODUCTS[b.dataset.id]={name:b.dataset.name,size:b.dataset.size,price:+b.dataset.price,img:$(`[data-bottle="${b.dataset.id}"] img`).getAttribute('src')});
let items={};try{items=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}};
function renderCart(){
  const ids=Object.keys(items).filter(id=>PRODUCTS[id]&&items[id]>0);
  const n=ids.reduce((a,id)=>a+items[id],0),sub=ids.reduce((a,id)=>a+items[id]*PRODUCTS[id].price,0),ship=sub>=40||!n?0:4.9;
  $('#cartCount').textContent=n;$('#cartCount').dataset.n=n;
  cartBtn.setAttribute('aria-label',`Basket, ${n} item${n===1?'':'s'}`);
  cart.classList.toggle('is-empty',!n);
  list.innerHTML=ids.map(id=>{const p=PRODUCTS[id];return `<li class="cart-item" data-id="${id}"><img src="${p.img}" alt=""><div><h3>${p.name}</h3><small>${p.size} · ${eur(p.price)}</small>
    <div class="cart-qty"><button type="button" data-act="dec" aria-label="One fewer ${p.name}">−</button><span>${items[id]}</span><button type="button" data-act="inc" aria-label="One more ${p.name}">+</button></div></div>
    <div class="cart-side"><b>${eur(p.price*items[id])}</b><button class="cart-remove" type="button" data-act="del">Remove</button></div></li>`}).join('');
  $('#cartSub').textContent=eur(sub);$('#cartShip').textContent=ship?eur(ship)+' · free over €40':'Free';$('#cartTotal').textContent=eur(sub+ship);
  $$('.buy').forEach(b=>{const q=items[b.dataset.id]||0;b.classList.toggle('is-added',q>0);b.textContent=q?`In your basket · ${q}`:`Add to basket · €${b.dataset.price}`});
  save();
}
let lastFocus=null;
function openCart(){lastFocus=document.activeElement;scrim.hidden=false;cart.removeAttribute('inert');cart.setAttribute('aria-hidden','false');cartBtn.setAttribute('aria-expanded','true');
  requestAnimationFrame(()=>{scrim.classList.add('is-open');cart.classList.add('is-open')});setTimeout(()=>$('#cartClose').focus(),60)}
function closeCart(){scrim.classList.remove('is-open');cart.classList.remove('is-open');cart.setAttribute('aria-hidden','true');cart.setAttribute('inert','');cartBtn.setAttribute('aria-expanded','false');
  setTimeout(()=>{scrim.hidden=true},350);lastFocus&&lastFocus.focus&&lastFocus.focus()}
cartBtn.addEventListener('click',()=>cart.classList.contains('is-open')?closeCart():openCart());
$('#cartClose').addEventListener('click',closeCart);scrim.addEventListener('click',closeCart);$('#cartBrowse').addEventListener('click',closeCart);
addEventListener('keydown',e=>{if(e.key==='Escape'&&cart.classList.contains('is-open'))closeCart()});
list.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b)return;const id=b.closest('.cart-item').dataset.id;
  if(b.dataset.act==='inc')items[id]++;else if(b.dataset.act==='dec')items[id]--;else items[id]=0;
  if(items[id]<=0)delete items[id];renderCart()});
$('#cartCheckout').addEventListener('click',()=>{$('#cartNote').textContent='This is a portfolio demo, so nothing is charged. Thank you for visiting Bao!'});
/* adding flies a copy of the bottle up to the basket button */
$$('.buy').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.id;items[id]=(items[id]||0)+1;renderCart();
  const src=$(`[data-bottle="${id}"] img`),r=src.getBoundingClientRect(),t=cartBtn.getBoundingClientRect();
  cartBtn.classList.remove('bump');void cartBtn.offsetWidth;cartBtn.classList.add('bump');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!r.width)return;
  const f=src.cloneNode();f.className='cart-fly';Object.assign(f.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});document.body.appendChild(f);
  const dx=t.left+t.width/2-(r.left+r.width/2),dy=t.top+t.height/2-(r.top+r.height/2);
  f.animate([{transform:'none',opacity:1},{transform:`translate(${dx*.55}px,${dy*.35-80}px) scale(.45) rotate(-12deg)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(.08)`,opacity:.2}],{duration:800,easing:'cubic-bezier(.5,0,.4,1)'}).onfinish=()=>f.remove()}));
renderCart();

/* loader: always plays its fill (at least MIN ms, longer if the eager images still load), then a drop falls and the page opens */
const loader=$('#loader'),ldnum=$('#ldnum'),ldfill=$('#ldfill'),MIN=2000,MAX=6000,t0=performance.now();
const imgs=$$('img').filter(im=>im.loading!=='lazy');let done=0,shown=0,closing=false;
if('scrollRestoration' in history)history.scrollRestoration='manual';
scrollTo(0,0);root.classList.add('is-loading');
imgs.forEach(im=>{if(im.complete)done++;else{const f=()=>done++;im.addEventListener('load',f,{once:true});im.addEventListener('error',f,{once:true})}});
function setPct(p){ldnum.textContent=Math.round(p)+'%';ldfill.setAttribute('y',56-56*p/100)}
function finishLoad(){closing=true;setPct(100);
  const sv=loader.querySelector('svg'),cur=getComputedStyle(sv).transform;sv.style.animation='none';
  sv.animate([{transform:cur},{transform:'none'}],{duration:200,easing:'ease-out',fill:'forwards'});
  loader.classList.add('is-drip');
  setTimeout(()=>loader.classList.add('is-clear'),800);
  setTimeout(()=>{loader.classList.add('is-done');root.classList.remove('is-loading');if(window.ScrollTrigger)ScrollTrigger.refresh()},1080)}
(function tick(now){
  const el=now-t0,real=imgs.length?done/imgs.length:1,time=Math.min(1,el/MIN);
  const target=(el>MAX?1:Math.min(real,time))*100;
  shown+=(target-shown)*.12;if(target-shown<.4)shown=target;setPct(shown);
  if(shown>=100&&!closing)finishLoad();else if(!closing)requestAnimationFrame(tick);
})(t0);

/* scroll to top */
$('#toTop').addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'})});

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!window.gsap||!window.ScrollTrigger||reduce){
  $('#brand').classList.add('is-on');$('#rail').classList.add('is-on');
  return;
}
root.classList.add('motion');
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});


/* nav */
$$('.rail a, .brand').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href').slice(1),el=document.getElementById(id);
  if(!el)return;e.preventDefault();
  el.scrollIntoView({behavior:'smooth'});
}));

/* HERO */
/* rapeseed petals drifting on a canvas: across the hero landscape (inside .hero-img so they stay within the window once it
   closes in) and again over the footer, so the page ends where it began */
function petals(cv){
  const cx=cv.getContext('2d'),sp=new Image();sp.src='img/petals.webp';
  const CELL=128,NP=8;let W=0,H=0,dpr=1,ps=[],on=true,raf=0,last=0;
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const make=fresh=>{const z=rnd(.3,1);return{z,cell:Math.random()*NP|0,
    x:fresh?rnd(-.05,1.05)*W:-60-rnd(0,.25)*W,y:fresh?rnd(-.05,.95)*H:rnd(-.25,.75)*H,
    s:56*(.45+z*.75)*(W<720?.62:1),vx:rnd(.25,.55),vy:rnd(.08,.22),r:rnd(0,6.28),vr:rnd(-.012,.012),
    fp:rnd(0,6.28),fs:rnd(.0011,.0024),ph:rnd(0,6.28)}};
  const size=()=>{const b=cv.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);W=b.width;H=b.height;cv.width=W*dpr;cv.height=H*dpr;
    const n=Math.round(Math.min(26,Math.max(9,W*H/70000)));ps=Array.from({length:n},()=>make(true))};
  const draw=t=>{const dt=Math.min(50,t-(last||t))/16.7;last=t;
    cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W,H);
    const gust=.65+.55*Math.sin(t/5200)+.25*Math.sin(t/1900);
    for(const p of ps){
      const sway=Math.sin(t/1400+p.ph);
      p.x+=(p.vx*gust+sway*.25)*(.45+p.z*.8)*dt;p.y+=(p.vy+Math.cos(t/1700+p.ph)*.12)*(.45+p.z*.8)*dt;p.r+=(p.vr+sway*.004)*dt;
      if(p.x>W+60||p.y>H+60)Object.assign(p,make(false));
      const flip=Math.cos(t*p.fs+p.fp),tilt=Math.sin(t*p.fs*.7+p.fp);
      cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.scale(.18+.82*Math.abs(flip),.55+.45*Math.abs(tilt));
      cx.globalAlpha=(.55+.4*p.z)*(.75+.25*Math.abs(flip));
      if(p.z<.5)cx.filter=`blur(${((.5-p.z)*4).toFixed(1)}px)`;
      cx.drawImage(sp,p.cell*CELL,0,CELL,CELL,-p.s/2,-p.s/2,p.s,p.s);
      cx.restore();cx.filter='none'}
    raf=on?requestAnimationFrame(draw):0};
  size();addEventListener('resize',size);
  const start=()=>{new IntersectionObserver(([e])=>{on=e.isIntersecting;if(on&&!raf){last=0;raf=requestAnimationFrame(draw)}}).observe(cv)};
  sp.complete?start():sp.addEventListener('load',start,{once:true});
}
petals($('#petals'));petals($('#footPetals'));
const hero=$('.hero');
const ins=()=>{const cs=getComputedStyle(hero);const v=k=>cs.getPropertyValue(k).trim();return `inset(${v('--t')} ${v('--r')} ${v('--b')} ${v('--l')} round 2px)`};
gsap.timeline({scrollTrigger:{trigger:'.hero .pin',start:'top top',end:'+=140%',pin:true,scrub:1,invalidateOnRefresh:true,
  onUpdate:s=>{const on=s.progress>.55;$('#brand').classList.toggle('is-on',on)}}})
  .to('.hero-cue',{autoAlpha:0,y:24,duration:.12},0)
  .fromTo('.hero-img',{clipPath:'inset(0% 0% 0% 0% round 0px)'},{clipPath:ins,ease:'power2.inOut',duration:.7},0)
  .fromTo(['.hero-img img','#badgeLayer'],{scale:1.14},{scale:1,ease:'power2.inOut',duration:.7},0)
  .to('.hero-room',{opacity:1,duration:.5},.15)
  .to(['.hero-frame','.hero-sill'],{opacity:1,duration:.3},.42)
  .to('.hero-tag',{opacity:1,duration:.2},.62)
  .to({}, {duration:.25});

/* INTRO */
const q=$('#introQuote');
(function split(el){
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t))f.append(t);else{const s=document.createElement('span');s.className='w';s.textContent=t;f.append(s)}});c.replaceWith(f)}
    else walk(c)})};walk(el)})(q);
gsap.timeline({scrollTrigger:{trigger:'.intro .pin',start:'top top',end:'+=130%',pin:true,scrub:1}})
  .fromTo('.intro-panda',{yPercent:28,autoAlpha:0,scale:.9,rotate:-4},{yPercent:0,autoAlpha:1,scale:1,rotate:0,duration:.5,ease:'power2.out'},0)
  .fromTo('.intro-text .eyebrow',{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.15},.2)
  .fromTo('#introQuote .w',{opacity:.12},{opacity:1,stagger:.04,duration:.12},.3)
  .fromTo('.intro-sign',{autoAlpha:0},{autoAlpha:1,duration:.15})
  .to({}, {duration:.3});

/* PRODUCTION */
const figs=$$('[data-fig]'),cards=$$('[data-card]'),bars=$$('#prodBars i'),pc=$('#prodCount');
/* figures slide in from beyond the bottom-right corner of the screen and leave the same way */
const offX=()=>innerWidth,offY=()=>innerHeight*.35;
gsap.set(figs,{x:offX,y:offY});
gsap.set(cards.slice(1),{autoAlpha:0,y:26});
const ptl=gsap.timeline({scrollTrigger:{trigger:'.prod .pin',start:'top top',end:'+=380%',pin:true,scrub:1,invalidateOnRefresh:true}});
ptl.fromTo(figs[0],{x:offX,y:offY},{x:0,y:0,duration:.5,ease:'power2.out',immediateRender:false},0).fromTo(cards[0],{autoAlpha:0,y:26},{autoAlpha:1,y:0,duration:.4},.1);
for(let i=1;i<4;i++){
  ptl.to(figs[i-1],{x:offX,y:offY,duration:.4,ease:'power2.in'},i)
     .to(cards[i-1],{autoAlpha:0,y:-26,duration:.35},i)
     .fromTo(figs[i],{x:offX,y:offY},{x:0,y:0,duration:.5,ease:'power2.out',immediateRender:false},i+.45)
     .to(cards[i],{autoAlpha:1,y:0,duration:.4},i+.45);
}
ptl.to({}, {duration:.6},3.9);
let pIdx=-1;
ptl.eventCallback('onUpdate',()=>{const t=ptl.time();const i=t>3.35?3:t>2.35?2:t>1.35?1:0;if(i!==pIdx){pIdx=i;pc.textContent='0'+(i+1)+' / 04';bars.forEach((b,k)=>b.classList.toggle('is-on',k<=i))}});

/* SEEDS */
const stage=$('#seedsStage'),ring=$('#lensRing'),sw=$('#seedWrap'),svg=$('#seedSvg'),facts=$$('#facts .fact'),fc=$('#factCount');
const lensR=()=>Math.min(150,innerWidth*.28);
const setLens=()=>root.style.setProperty('--lens',lensR()*2+'px');setLens();
ScrollTrigger.addEventListener('refreshInit',setLens);
const seedC=()=>{const cx=sw.offsetLeft+sw.offsetWidth*.375,cy=sw.offsetTop+sw.offsetHeight*.5;return{x:stage.offsetWidth/2-cx,y:stage.offsetHeight/2-cy,k:(lensR()*1.6)/(sw.offsetWidth*(300/480))}};
gsap.set(['.lbl','.lbl-line'],{autoAlpha:0});
/* the pin opens on the annotated plant; its magnifier then slides to the centre and becomes the seed lens (O = length of that prologue) */
const O=3,seedsPin=$('.seeds .pin'),psBox=$('#psBox'),psLens=$('#psLens');
const lensTo=()=>{const p=seedsPin.getBoundingClientRect(),b=psBox.getBoundingClientRect(),cx=b.left-p.left+b.width*.6028,cy=b.top-p.top+b.height*.253;return{x:p.width/2-cx,y:p.height/2-cy,k:lensR()*2/(b.width*.15)}};
const stl=gsap.timeline({scrollTrigger:{trigger:'.seeds .pin',start:'top top',end:'+=760%',pin:true,scrub:1,invalidateOnRefresh:true}});
stl.fromTo('.ps-plant',{autoAlpha:0,y:24,filter:'grayscale(1) brightness(.45) contrast(1.5)'},{autoAlpha:1,y:0,duration:.5},0)
   .to('.ps-plant',{filter:'grayscale(0) brightness(1) contrast(1)',duration:.6},.35)
   .fromTo('.ps-label',{autoAlpha:0,y:40,rotate:-3},{autoAlpha:1,y:0,rotate:-1,duration:.5},.5)
   .fromTo('.ps-tag',{autoAlpha:0,scale:.9},{autoAlpha:1,scale:1,stagger:.25,duration:.3},.8)
   .fromTo('.ps-arrows path',{strokeDashoffset:1},{strokeDashoffset:0,stagger:.12,duration:.22},.9)
   .fromTo(psLens,{autoAlpha:0,scale:0},{autoAlpha:1,scale:1,duration:.4,ease:'back.out(1.6)'},1.7)
   .to(['.ps-plant','.ps-label','.ps-tag','.ps-arrows'],{autoAlpha:0,duration:.4},2.2)
   .to(psLens,{x:()=>lensTo().x,y:()=>lensTo().y,scale:()=>lensTo().k,duration:.7,ease:'power2.inOut'},2.2)
   .to('#plantScene',{autoAlpha:0,duration:.15},O-.15)
   .fromTo(stage,{clipPath:()=>`circle(${lensR()}px at 50% 50%)`},{clipPath:()=>`circle(${Math.hypot(innerWidth,innerHeight)/1.6}px at 50% 50%)`,ease:'power2.in',duration:1},O)
   .fromTo(ring,{scale:1,autoAlpha:1},{scale:()=>Math.hypot(innerWidth,innerHeight)/lensR()/1.6,autoAlpha:0,ease:'power2.in',duration:1},O)
   .fromTo(sw,{x:()=>seedC().x,y:()=>seedC().y,scale:()=>seedC().k,transformOrigin:'37.5% 50%'},{x:0,y:0,scale:1,duration:.8,ease:'power2.inOut'},O+1)
   .fromTo('#seedsTitle',{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.5},O+1.3)
   .to('#seedsTitle',{autoAlpha:0,y:-24,duration:.4},O+2.4)
   .to(['.lbl-line','.lbl'],{autoAlpha:1,stagger:.04,duration:.3},O+2.5)
   .fromTo('#factCount',{autoAlpha:0},{autoAlpha:1,duration:.3},O+2.8)
   .to({}, {duration:.1},O+8.4);
gsap.set('#factCount',{autoAlpha:0});
let fIdx=-2;
stl.eventCallback('onUpdate',()=>{const t=stl.time();const i=t<O+2.75?-1:Math.min(4,Math.floor((t-O-2.75)/1.1));if(i===fIdx)return;fIdx=i;
  facts.forEach((f,k)=>f.classList.toggle('is-active',k===i));
  if(i<0)svg.removeAttribute('data-hl');else{svg.setAttribute('data-hl',facts[i].dataset.hl);fc.textContent='Fact '+(i+1)+' / 5'}});

/* HEALTH */
gsap.set('.hf',{autoAlpha:0,y:40});
ScrollTrigger.batch('.hf',{start:'top 88%',onEnter:b=>gsap.to(b,{autoAlpha:1,y:0,stagger:.12,duration:.8,ease:'power2.out'})});
$$('.hf svg').forEach(s=>{$$('path,circle',s).forEach(p=>{const l=p.getTotalLength?p.getTotalLength():200;gsap.set(p,{strokeDasharray:l,strokeDashoffset:l});ScrollTrigger.create({trigger:s,start:'top 88%',once:true,onEnter:()=>gsap.to(p,{strokeDashoffset:0,duration:1.4,ease:'power2.inOut',delay:.2})})})});
/* numbers count up from zero as each fact comes in, keeping their own prefix, decimals and unit */
$$('.hf-num').forEach(el=>{const m=el.textContent.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);if(!m)return;
  const [,pre,num,post]=m,dec=(num.split('.')[1]||'').length,o={v:0};el.textContent=pre+(0).toFixed(dec)+post;
  ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>gsap.to(o,{v:+num,duration:1.6,ease:'power2.out',delay:.25,onUpdate:()=>{el.textContent=pre+o.v.toFixed(dec)+post}})})});
gsap.from('.health-spoon',{autoAlpha:0,x:80,rotate:6,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'.health',start:'top 70%'}});
gsap.fromTo('.health-sprig',{yPercent:10},{yPercent:-10,ease:'none',scrollTrigger:{trigger:'.health',start:'top bottom',end:'bottom top',scrub:true}});
gsap.from('.health .sec-head > *',{autoAlpha:0,y:24,stagger:.12,duration:.8,scrollTrigger:{trigger:'.health',start:'top 75%'}});

/* OILS */
const bottles=$$('[data-bottle]'),infos=$$('[data-info]'),oils=$$('[data-oil]'),oc=$('#oilCount'),oilsPin=$('.oils .pin');
const spacing=()=>innerWidth<720?innerWidth*.62:Math.min(innerWidth*.27,380);
let oIdx=-1;
function layoutOils(p){
  const sp=spacing();
  bottles.forEach((b,i)=>{const o=i-p,a=Math.abs(o);gsap.set(b,{x:o*sp,yPercent:-50,y:a*30,scale:1-Math.min(a,1.6)*.32,rotate:o*4,autoAlpha:Math.max(0,1-a*.6),zIndex:10-Math.round(a)})});
  const i=Math.max(0,Math.min(4,Math.round(p)));
  if(i!==oIdx){oIdx=i;infos.forEach((n,k)=>n.classList.toggle('is-active',k===i));oc.innerHTML='0'+(i+1)+'<small>/ 05</small>';gsap.to(oilsPin,{'--tint':oils[i].dataset.tint,duration:.8,overwrite:true})}
}
layoutOils(0);
ScrollTrigger.create({trigger:'.oils .pin',start:'top top',end:'+=450%',pin:true,scrub:true,snap:{snapTo:v=>v<.03||v>.97?v:.06+.88*Math.round(gsap.utils.clamp(0,4,(v-.06)/.88*4))/4,duration:{min:.2,max:.6},delay:.08,ease:'power2.inOut'},onUpdate:s=>{const p=gsap.utils.clamp(0,4,(s.progress-.06)/.88*4);layoutOils(p)},onRefresh:s=>layoutOils(gsap.utils.clamp(0,4,(s.progress-.06)/.88*4))});
gsap.from('.oils .sec-head',{autoAlpha:0,y:24,duration:.8,scrollTrigger:{trigger:'.oils',start:'top 70%'}});

/* DROP */
/* the thread grows to the middle while small drops run down it, holds between the two headlines,
   then carries on to the jar; a drop hangs at its tip the whole way and finally falls in */
const bead=$('#dropBead'),runs=[0,1,2].map(()=>{const r=bead.cloneNode(true);r.removeAttribute('id');r.classList.add('drop-run');bead.after(r);return r});
const dropPin=$('.drop .pin'),dH=()=>dropPin.offsetHeight;
const jarTop=()=>{const j=$('#dropJar').getBoundingClientRect(),c=dropPin.getBoundingClientRect();return j.top-c.top-gsap.getProperty('#dropJar','y')+j.height*.385};   /* open mouth of the bottle */
const tipA=()=>dH()*.5,tipB=()=>jarTop()-6;
gsap.set('#dropLine',{scaleY:0});
/* stopper waits off to the side, tipped open, and is pushed home once the bottle is full */
gsap.set('.dj-stopper',{transformOrigin:'50% 16%',xPercent:118,yPercent:66,rotate:86});   /* lying on its side beside the bottle, clear of the headline */gsap.set('#dropCopy h2',{autoAlpha:0});
const dtl=gsap.timeline({scrollTrigger:{trigger:'.drop .pin',start:'top top',end:'+=260%',pin:true,scrub:1,invalidateOnRefresh:true}})
  .to('#dropLine',{scaleY:()=>tipA()/dH(),duration:.6,ease:'none'},0)
  .fromTo(bead,{y:-30},{y:()=>tipA()-8,duration:.6,ease:'none'},0)
  .fromTo(bead,{autoAlpha:0},{autoAlpha:1,duration:.04},.02)
  .fromTo('#dropCopy .drop-l',{autoAlpha:0,x:-30},{autoAlpha:1,x:0,duration:.35},.35)
  .fromTo('#dropCopy .drop-r',{autoAlpha:0,x:30},{autoAlpha:1,x:0,duration:.35},.45)
  .to('#dropCopy h2',{autoAlpha:0,y:-30,duration:.3},1.2)
  .fromTo('#dropJar',{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.3},1.25)
  .to('#dropLine',{scaleY:()=>tipB()/dH(),duration:.65,ease:'none'},1.3)
  .to(bead,{y:()=>tipB()-8,duration:.65,ease:'none'},1.3)
  .fromTo('#wait .w1',{autoAlpha:0,y:40},{autoAlpha:1,y:0,duration:.25},1.45)
  .fromTo('#wait .w2',{autoAlpha:0,y:40,rotate:-6},{autoAlpha:1,y:0,rotate:0,duration:.25},1.6)
  .to('#wait .w1,#wait .w2',{autoAlpha:0,y:-40,duration:.2},1.82)
  .fromTo('#wait .w3',{autoAlpha:0,y:40},{autoAlpha:1,y:0,duration:.25},1.9)
  .fromTo('#wait .w4',{autoAlpha:0,y:40,rotate:6},{autoAlpha:1,y:0,rotate:0,duration:.25},2.02)
  .to(bead,{y:()=>tipB()+24,duration:.2,ease:'power2.in'},2.2)
  .to(bead,{autoAlpha:0,duration:.05},2.38)
  .fromTo('#jarOil',{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.5,ease:'power1.inOut'},2.38)
  .to('.dj-stopper',{xPercent:0,yPercent:5,rotate:0,duration:.34,ease:'power2.inOut'},2.88)
  .fromTo('.dj-stopper',{yPercent:5,clipPath:'inset(0% 0% 66.5% 0%)'},{yPercent:27.45,clipPath:'inset(0% 0% 89% 0%)',duration:.22,ease:'power2.in',immediateRender:false},3.22)
  .to('#wait',{autoAlpha:0,duration:.3},3.2);
runs.forEach((r,k)=>{
  const t=.1+k*.32;
  dtl.fromTo(r,{y:-20},{y:()=>(k<2?tipA():tipB())-26,duration:k<2?.28:.45,ease:'power1.in'},t+(k<2?0:1.2))
     .fromTo(r,{autoAlpha:0},{autoAlpha:1,duration:.03},t+(k<2?0:1.2)+.02)
     .to(r,{autoAlpha:0,duration:.07},t+(k<2?.23:1.6));
});

/* CARL */
gsap.from('.bao-portrait',{autoAlpha:0,y:60,rotate:-8,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'.carl',start:'top 70%'}});
gsap.from('.carl-copy > *',{autoAlpha:0,y:26,stagger:.12,duration:.9,ease:'power2.out',scrollTrigger:{trigger:'.carl',start:'top 65%'}});
gsap.from(['.bao-sign','.bao-title'],{autoAlpha:0,y:24,stagger:.25,duration:.9,ease:'power2.out',scrollTrigger:{trigger:'.carl',start:'top 50%'}});
gsap.fromTo('.bao-sprig',{yPercent:12},{yPercent:-8,ease:'none',scrollTrigger:{trigger:'.carl',start:'top bottom',end:'bottom top',scrub:true}});

/* rail */
const rail=$('#rail'),railFill=$('#railFill'),navs=$$('.rail a');
ScrollTrigger.create({trigger:'#production',start:'top 80%',endTrigger:'#carl',end:'bottom 30%',
  onToggle:s=>rail.classList.toggle('is-on',s.isActive),
  onUpdate:s=>gsap.set(railFill,{scaleY:s.progress})});
['production','seeds','health','oils','carl'].forEach(id=>{
  ScrollTrigger.create({trigger:'#'+id,start:'top 55%',end:'bottom 55%',onToggle:s=>{if(s.isActive)navs.forEach(a=>a.classList.toggle('is-active',a.dataset.nav===id))}});
});

addEventListener('load',()=>ScrollTrigger.refresh());
document.fonts&&document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
