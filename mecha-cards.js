/* Decorative armor stays outside the content and accessibility trees. */
(() => {
  document.querySelectorAll('.research-card,.more-papers article,.experience-card').forEach(card=>{
    card.classList.add('mecha-card');
    const shell=document.createElement('div');
    shell.className='mecha-shell';shell.setAttribute('aria-hidden','true');
    for(const position of ['tl','tr','bl','br']){
      const plate=document.createElement('span');plate.className=`armor-plate armor-${position}`;shell.append(plate);
    }
    for(const part of ['armor-frame','armor-scan','armor-circuit','armor-core']){
      const item=document.createElement('span');item.className=part;shell.append(item);
    }
    card.append(shell);
  });
})();
