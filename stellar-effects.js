/* A bounded, decorative meteor field: no input interception, timers or network work. */
(() => {
  const canvas=document.querySelector('#meteor-field'),ctx=canvas?.getContext('2d');
  if(!ctx)return;
  const root=document.documentElement,media=matchMedia('(prefers-reduced-motion: reduce)');
  const colors=['169,239,219','180,211,255','230,213,165'];
  let width=0,height=0,small=false,frame=0,last=0,elapsed=0,next=0,cluster=3;
  let meteors=[],rings=[],dust=[];
  const reduced=()=>root.classList.contains('reduced-motion')||media.matches;
  function resize(){
    width=innerWidth;height=innerHeight;small=width<700;
    const d=Math.min(devicePixelRatio||1,small?1.25:1.5);
    canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);
    dust=Array.from({length:small?18:38},()=>({x:Math.random()*width,y:Math.random()*height,r:.5+Math.random()*1.2,p:Math.random()*Math.PI*2,s:5+Math.random()*10}));
  }
  function spawn(offset=0){
    if(meteors.length>=(small?4:9))return;
    const speed=small?180+Math.random()*100:230+Math.random()*170;
    meteors.push({x:Math.random()*(width+220)-50+offset,y:-90+Math.random()*height*.65,
      vx:-speed*.75,vy:speed*.66,length:(small?75:150)+Math.random()*(small?70:180),age:0,life:2.1+Math.random()*1.2,color:colors[Math.floor(Math.random()*colors.length)]});
  }
  function render(t){
    frame=0;if(document.hidden||reduced())return;
    if(last&&t-last<32){frame=requestAnimationFrame(render);return}
    const dt=Math.min((t-last)/1000||.033,.065);last=t;elapsed+=dt;
    ctx.clearRect(0,0,width,height);
    if(elapsed>=next){spawn();next=elapsed+(small?1.5:.7)+Math.random()*.55}
    if(elapsed>=cluster){for(let i=0;i<(small?2:4);i++)spawn(i*70);cluster=elapsed+11+Math.random()*7}
    for(const p of dust){
      p.y-=dt*p.s;if(p.y<-10)p.y=height+10;
      const edge=p.x<width*.18||p.x>width*.78;
      const alpha=(.16+.16*Math.sin(elapsed*.65+p.p))*(edge?1:.4);
      ctx.fillStyle=`rgba(176,238,211,${alpha})`;ctx.beginPath();ctx.arc(p.x+Math.sin(elapsed*.18+p.p)*14,p.y,p.r,0,Math.PI*2);ctx.fill();
      if(edge&&p.r>1.35){ctx.fillStyle=`rgba(169,232,208,${alpha*.12})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2);ctx.fill()}
    }
    meteors=meteors.filter(m=>m.age<m.life);
    for(const m of meteors){
      m.age+=dt;m.x+=m.vx*dt;m.y+=m.vy*dt;
      const fade=Math.min(m.age/.4,1,Math.max(0,(m.life-m.age)/.7));
      // Stronger at the margins, restrained over the reading column.
      const alpha=fade*(m.x<width*.17||m.x>width*.75?.82:.3);
      const tx=m.x+m.length*.75,ty=m.y-m.length*.66;
      const gradient=ctx.createLinearGradient(tx,ty,m.x,m.y);
      gradient.addColorStop(0,`rgba(${m.color},0)`);gradient.addColorStop(.7,`rgba(${m.color},${alpha*.35})`);gradient.addColorStop(1,`rgba(${m.color},${alpha})`);
      ctx.strokeStyle=gradient;ctx.lineWidth=1.35;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(m.x,m.y);ctx.stroke();
      const halo=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,9);halo.addColorStop(0,`rgba(${m.color},${alpha*.6})`);halo.addColorStop(1,`rgba(${m.color},0)`);
      ctx.fillStyle=halo;ctx.fillRect(m.x-9,m.y-9,18,18);ctx.fillStyle=`rgba(242,255,246,${alpha})`;ctx.beginPath();ctx.arc(m.x,m.y,1.3,0,Math.PI*2);ctx.fill();
    }
    rings=rings.filter(r=>r.age<.8);
    for(const r of rings){r.age+=dt;const k=r.age/.8;ctx.strokeStyle=`rgba(203,229,186,${(1-k)*.42})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(r.x,r.y,8+k*48,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const x=r.x+Math.cos(a)*(12+k*56),y=r.y+Math.sin(a)*(12+k*56);ctx.fillStyle=`rgba(198,239,222,${(1-k)*.6})`;ctx.fillRect(x-1,y-1,2,2)}}
    frame=requestAnimationFrame(render);
  }
  function sync(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(reduced()||document.hidden){ctx.clearRect(0,0,width,height);meteors=[];rings=[];return}next=elapsed+.3;frame=requestAnimationFrame(render)}
  document.addEventListener('click',e=>{if(reduced()||!e.target.closest('a,button,summary')||e.detail===0)return;if(rings.length<3)rings.push({x:e.clientX,y:e.clientY,age:0})});
  addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
  let previous=reduced();new MutationObserver(()=>{const value=reduced();if(value!==previous){previous=value;sync()}}).observe(root,{attributes:true,attributeFilter:['class']});
  resize();sync();
})();
