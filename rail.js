(() => {
  const root=document.documentElement;
  const reduced=()=>root.classList.contains('reduced-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(pointer:fine)');
  const canvas=document.querySelector('#starfield'),ctx=canvas.getContext('2d');
  let w=0,h=0,frame=0,last=0,jumpUntil=0,px=0,py=0;
  const stars=Array.from({length:85},()=>({x:Math.random(),y:Math.random(),size:.35+Math.random()*1.1,depth:.25+Math.random()*.75}));
  function size(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx?.setTransform(d,0,0,d,0,0);draw(0)}
  function draw(t){if(!ctx)return;ctx.clearRect(0,0,w,h);const warp=!reduced()&&t>0&&t<jumpUntil;for(const s of stars){let x=s.x*w+px*s.depth*10,y=s.y*h+py*s.depth*8;ctx.fillStyle=`rgba(190,218,248,${.25+s.depth*.55})`;ctx.beginPath();ctx.arc(x,y,s.size,0,Math.PI*2);ctx.fill();if(warp){ctx.strokeStyle=`rgba(165,211,250,${s.depth*.25})`;ctx.lineWidth=s.size*.7;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(x-w/2)*.09,y+(y-h/2)*.09);ctx.stroke()}}}
  function loop(t){frame=0;if(reduced()||document.hidden)return;const dt=Math.min(t-last||16,40);last=t;for(const s of stars)s.y=(s.y+dt*.000007*s.depth)%1;draw(t);frame=requestAnimationFrame(loop)}
  function sync(){root.classList.toggle('js-motion',!reduced());if(frame)cancelAnimationFrame(frame);frame=0;if(reduced()){px=py=0;root.style.removeProperty('--scene-x');root.style.removeProperty('--scene-y');document.querySelectorAll('[style*="--tilt"]').forEach(e=>{e.style.removeProperty('--tilt-x');e.style.removeProperty('--tilt-y')});draw(0)}else if(!document.hidden){last=0;frame=requestAnimationFrame(loop)}}
  size();addEventListener('resize',size,{passive:true});document.addEventListener('visibilitychange',sync);let previousMotion=reduced();new MutationObserver(()=>{const current=reduced();if(current!==previousMotion){previousMotion=current;sync()}}).observe(root,{attributes:true,attributeFilter:['class']});matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',sync);
  // Reveal content once; disabling motion always reveals the complete page.
  const reveals=document.querySelectorAll('.section-heading,.paper,.timeline article,.school-card,.interest');
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');revealObserver.unobserve(e.target)}}),{threshold:.06});
  reveals.forEach(e=>{e.classList.add('reveal');revealObserver.observe(e)});sync();
  document.querySelectorAll('.research-focus,.school-card,.interest.hsr').forEach(card=>{card.addEventListener('pointermove',event=>{if(reduced()||!fine.matches)return;const box=card.getBoundingClientRect();card.style.setProperty('--glow-x',`${event.clientX-box.left}px`);card.style.setProperty('--glow-y',`${event.clientY-box.top}px`)});});
  const hero=document.querySelector('.hero');
  hero.addEventListener('pointermove',e=>{if(reduced()||!fine.matches)return;const r=hero.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;root.style.setProperty('--scene-x',`${px*15}px`);root.style.setProperty('--scene-y',`${py*10}px`)});
  hero.addEventListener('pointerleave',()=>{px=py=0;root.style.setProperty('--scene-x','0px');root.style.setProperty('--scene-y','0px')});
  document.querySelectorAll('.school-card,.interest:not(.hsr) .interest-visual').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduced()||!fine.matches)return;const r=card.getBoundingClientRect();card.style.setProperty('--tilt-x',`${-(e.clientY-r.top-r.height/2)/r.height*5}deg`);card.style.setProperty('--tilt-y',`${(e.clientX-r.left-r.width/2)/r.width*5}deg`)});card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg')})});
  let jumpTimer;
  document.querySelectorAll('.warp-link,.route-dock a,.hero-paths a').forEach(link=>link.addEventListener('click',()=>{if(reduced())return;clearTimeout(jumpTimer);jumpUntil=performance.now()+650;root.classList.add('jumping');jumpTimer=setTimeout(()=>root.classList.remove('jumping'),650)}));
  document.querySelectorAll('[data-research-tab]').forEach(link=>link.addEventListener('click',()=>activateFocusTab(document.getElementById(link.dataset.researchTab))));
  const routes=[...document.querySelectorAll('.route-dock a')];
  let scrollQueued=false;
  function scrollState(){scrollQueued=false;const max=document.documentElement.scrollHeight-innerHeight;root.style.setProperty('--progress',max>0?String(scrollY/max):'0');let current=routes[0];for(const a of routes){const section=document.querySelector(a.getAttribute('href'));if(section.getBoundingClientRect().top<=innerHeight*.38)current=a}routes.forEach(a=>{a.classList.toggle('active',a===current);if(a===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
  addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(scrollState)}},{passive:true});addEventListener('resize',scrollState,{passive:true});scrollState();
  const dialog=document.querySelector('#paper-dialog'),content=dialog.querySelector('.dossier-content');
  if(typeof dialog.showModal==='function'){
    document.querySelectorAll('.paper').forEach((paper,index)=>{const source=paper.querySelector(':scope > a');const button=document.createElement('button');button.type='button';button.className='dossier-button';button.textContent='Open dossier';button.setAttribute('aria-label',`Open paper details: ${paper.querySelector('h3').textContent}`);button.setAttribute('aria-haspopup','dialog');paper.append(button);button.addEventListener('click',()=>{content.replaceChildren();const meta=paper.querySelector('.paper-meta').cloneNode(true);content.append(meta);const title=document.createElement('h2');title.id='dialog-title';title.textContent=paper.querySelector('h3').textContent;content.append(title);paper.querySelectorAll(':scope > p').forEach(p=>content.append(p.cloneNode(true)));const link=source.cloneNode(true);link.querySelectorAll('span').forEach(s=>s.remove());link.textContent=source.textContent.includes('Scholar')?'View on Google Scholar':'Read full paper';content.append(link);dialog.showModal();document.body.classList.add('dialog-open')})});
    root.classList.add('dossiers-ready');
    dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()});
    dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
  }
})();
// Decorative character cycle pauses offscreen, in background, and with reduced motion.
(() => {
  const hero=document.querySelector('.hero');
  const buttons=[...document.querySelectorAll('button[data-form]')];
  const toggle=document.querySelector('.form-auto');
  const controls=document.querySelector('.form-controls');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let automatic=true,visible=false,timer=0,focused=false,hovered=false;
  const reduced=()=>document.documentElement.classList.contains('reduced-motion')||media.matches;
  function select(form){
    hero.dataset.form=form;
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.form===form)));
  }
  function sync(){
    clearTimeout(timer);
    const enabled=automatic&&!reduced();
    toggle.textContent=reduced()?'Auto · off':automatic?'Auto · on':'Auto · off';
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.setAttribute('aria-label',enabled?'Pause automatic character switching':'Resume automatic character switching');
    toggle.disabled=reduced();
    if(!enabled||!visible||document.hidden||focused||hovered)return;
    timer=setTimeout(()=>{select(hero.dataset.form==='sam'?'firefly':'sam');sync()},7000);
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{select(button.dataset.form);sync()}));
  toggle.addEventListener('click',()=>{automatic=!automatic;sync()});
  controls.addEventListener('focusin',()=>{focused=true;sync()});
  controls.addEventListener('focusout',event=>{if(!controls.contains(event.relatedTarget)){focused=false;sync()}});
  controls.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;sync()}});
  controls.addEventListener('pointerleave',()=>{hovered=false;sync()});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}).observe(hero);
  let wasReduced=reduced();
  new MutationObserver(()=>{if(wasReduced!==reduced()){wasReduced=reduced();sync()}}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
  select('firefly');sync();
})();
