(() => {
 const hero=document.querySelector('.hero'), tiles=[...hero.querySelectorAll('[data-depth]')], video=hero.querySelector('video'), button=hero.querySelector('.world-pause');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'), mobile=matchMedia('(max-width: 760px)');
 let paused=reduced.matches, visible=true, frame=0, x=0,y=0;
 function draw(){frame=0; const progress=Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/hero.offsetHeight));
 tiles.forEach(tile=>{const depth=Number(tile.dataset.depth);tile.style.translate=paused?'0px 0px':`${x*depth*22}px ${y*depth*16-progress*depth*100}px`;tile.style.scale=paused?'1':String(1+progress*depth*.28);});}
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 function sync(){hero.classList.toggle('world-still',paused);button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Play motion':'Pause motion';
 if(paused||!visible||document.hidden||mobile.matches)video.pause();else video.play().catch(()=>{});schedule();}
 hero.addEventListener('pointermove',e=>{if(paused||e.pointerType!=='mouse')return;const r=hero.getBoundingClientRect();x=(e.clientX-r.left)/r.width-.5;y=(e.clientY-r.top)/r.height-.5;schedule();});
 hero.addEventListener('pointerleave',()=>{x=y=0;schedule();});
 addEventListener('scroll',()=>{if(visible&&!paused)schedule();},{passive:true});
 addEventListener('resize',schedule);
 button.addEventListener('click',()=>{paused=!paused;sync();});
 reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});mobile.addEventListener('change',sync);
 document.addEventListener('visibilitychange',sync);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);sync();
})();
