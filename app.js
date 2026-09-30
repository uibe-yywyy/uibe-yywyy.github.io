const motionButton=document.querySelector('.motion');let motionOff=window.matchMedia('(prefers-reduced-motion: reduce)').matches;function updateMotion(){document.documentElement.classList.toggle('reduced-motion',motionOff);motionButton.textContent=motionOff?'Motion off':'Motion on';motionButton.setAttribute('aria-pressed',String(motionOff));motionButton.title=motionOff?'Resume animation':'Pause animation'}updateMotion();motionButton.addEventListener('click',()=>{motionOff=!motionOff;updateMotion()});document.querySelector('.copy').addEventListener('click',async()=>{const status=document.querySelector('#copy-status');try{await navigator.clipboard.writeText('youyiwei0622@gmail.com');status.textContent='Email copied.'}catch{status.textContent='Select the email address above to copy it.'}});

const focusTabs=Array.from(document.querySelectorAll('.focus-tab'));
function activateFocusTab(tab,moveFocus=false){
  for(const item of focusTabs){
    const selected=item===tab;
    item.setAttribute('aria-selected',String(selected));
    item.tabIndex=selected?0:-1;
    document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;
  }
  if(moveFocus)tab.focus();
}
focusTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activateFocusTab(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%focusTabs.length;
    else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+focusTabs.length-1)%focusTabs.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=focusTabs.length-1;
    else return;
    event.preventDefault();activateFocusTab(focusTabs[next],true);
  });
});
