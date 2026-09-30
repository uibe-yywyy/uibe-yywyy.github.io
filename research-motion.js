(() => {
  const reduced = () => document.documentElement.classList.contains('reduced-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.research-card').forEach(card => {
    let frame = 0, point;
    card.addEventListener('pointermove', event => {
      if (reduced() || !fine.matches) return;
      point = {x:event.clientX,y:event.clientY};
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame=0;
        if (reduced()) return;
        const r=card.getBoundingClientRect();
        card.style.setProperty('--glow-x',`${point.x-r.left}px`);
        card.style.setProperty('--glow-y',`${point.y-r.top}px`);
      });
    });
    card.addEventListener('pointerleave',()=>{
      if(frame) cancelAnimationFrame(frame);
      frame=0;card.style.removeProperty('--glow-x');card.style.removeProperty('--glow-y');
    });
  });
  document.querySelectorAll('.research-records .paper,.experience-list .experience-card,.school-list .academic-card').forEach((card,index)=>{
    card.style.setProperty('--reveal-delay',`${index%2*85}ms`);
  });
})();
