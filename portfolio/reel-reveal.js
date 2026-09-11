(() => {
 const stage=document.querySelector('.reel-screen'),button=document.getElementById('revealReel'),status=document.getElementById('revealStatus');
 if(!stage||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
 canvas.className='reel-mist';canvas.setAttribute('aria-hidden','true');
 let done=false,down=false,last=null,marked=new Set(),w=0,h=0;
 const poster=new Image();poster.src='assets/reel-2026-poster.jpg';
 function paint(){if(done)return;const r=stage.getBoundingClientRect();w=r.width;h=r.height;if(!w||!h)return;
 const ratio=Math.min(devicePixelRatio||1,2);canvas.width=w*ratio;canvas.height=h*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);
 ctx.globalCompositeOperation='source-over';ctx.fillStyle='#33232e';ctx.fillRect(0,0,w,h);
 if(poster.complete&&poster.naturalWidth){ctx.filter='blur(28px)';const scale=Math.max(w/poster.naturalWidth,h/poster.naturalHeight);ctx.drawImage(poster,(w-poster.naturalWidth*scale)/2,(h-poster.naturalHeight*scale)/2,poster.naturalWidth*scale,poster.naturalHeight*scale);ctx.filter='none';}
 ctx.fillStyle='#171b20a8';ctx.fillRect(0,0,w,h);
 const glow=ctx.createRadialGradient(w*.3,h*.4,0,w*.3,h*.4,w*.65);glow.addColorStop(0,'#8e244466');glow.addColorStop(1,'#8e244400');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#f3f4ef';ctx.textAlign='center';ctx.font='400 24px Nohemi, sans-serif';ctx.fillText('Behind the blur.',w/2,h/2,Math.max(100,w-40));ctx.font='16px "Source Sans 3", sans-serif';ctx.fillText('Move your mouse or swipe sideways',w/2,h/2+36,Math.max(100,w-40));marked.clear();last=null;}
 function reveal(){if(done)return;done=true;canvas.remove();stage.inert=false;button.hidden=true;status.textContent='Ready when you are. Press play.';}
 function scratch(e){if(done||e.pointerType!=='mouse'&&!down)return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 ctx.globalCompositeOperation='destination-out';ctx.lineWidth=100;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last?.x??x,last?.y??y);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.arc(x,y,50,0,Math.PI*2);ctx.fill();last={x,y};
 marked.add(Math.floor(x/w*12)+','+Math.floor(y/h*12));if(marked.size>26)reveal();}
 button.hidden=false;button.addEventListener('click',reveal);
 // The cover sits outside the inert project controls so it remains interactive.
 const shell=document.createElement('div');shell.className='reel-reveal-shell';stage.before(shell);shell.append(stage,canvas);stage.inert=true;
 canvas.addEventListener('pointerdown',e=>{down=true;last=null;canvas.setPointerCapture(e.pointerId);scratch(e);});canvas.addEventListener('pointermove',scratch);
 ['pointerup','pointercancel','pointerleave'].forEach(type=>canvas.addEventListener(type,()=>{down=false;last=null;}));
 poster.addEventListener('load',paint);new ResizeObserver(paint).observe(stage);paint();
})();
