(() => {
 const desk=document.getElementById('studio'),light=document.getElementById('deskLight'),strip=document.getElementById('deskStrip'),paper=document.getElementById('deskPaper');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 light.addEventListener('click',()=>{const on=light.getAttribute('aria-pressed')!=='true';light.setAttribute('aria-pressed',String(on));desk.classList.toggle('ruby-lit',on);});
 function scrollFilm(direction){strip.scrollBy({left:direction*strip.clientWidth*.8,behavior:reduced.matches?'instant':'smooth'});}
 document.getElementById('filmPrevious').onclick=()=>scrollFilm(-1);document.getElementById('filmNext').onclick=()=>scrollFilm(1);
 let drag=null,moved=false;
 strip.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:strip.scrollLeft};moved=false;});
 strip.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>5){moved=true;strip.scrollLeft=drag.left-dx;e.preventDefault();}});
 ['pointerup','pointercancel','pointerleave'].forEach(t=>strip.addEventListener(t,()=>drag=null));
 strip.addEventListener('dragstart',e=>e.preventDefault());strip.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false;}},true);
 const cards=[{title:'HR&MORE',role:'Brand identity & visual system',image:'assets/HR%20and%20More.jpeg',href:'projects/hr-more-brand-identity.html'},{title:'The Best Social Media',role:'Logo, feed & Stories design',image:'assets/tbsm-feed-1.jpg',href:'projects/the-best-social-media-nl.html'},{title:'URDA',role:'A bird brought to life through motion',image:'assets/urda-bird-poster.jpg',href:'projects/urda-logo-animation.html'},{"title": "180 Agency", "role": "Logo design & animation", "image": "assets/04.gif", "href": "projects/180-agency-logos.html"},{"title": "HR&MORE \u2014 type", "role": "Typography & brand patterns", "image": "assets/HR%20and%20More%2001.jpg", "href": "projects/hr-more-type-system.html"},{"title": "CVC Charity", "role": "Website design & development", "image": "assets/cvc-logo-02.png.jpg", "href": "projects/wordpress-site-build.html"}];let index=0,start=null;
 function next(){index=(index+1)%cards.length;const c=cards[index];document.getElementById('deskCardImage').src=c.image;document.getElementById('deskCardImage').alt=c.title;document.getElementById('deskCardTitle').textContent=c.title;document.getElementById('deskCardRole').textContent=c.role;document.getElementById('deskCardLink').href=c.href;document.getElementById('deskCardNumber').textContent='0'+(index+1)+' / '+String(cards.length).padStart(2,'0');document.getElementById('deskCardStatus').textContent=c.title+' — '+c.role;paper.style.transform='';}
 document.getElementById('deskNext').onclick=next;
 paper.addEventListener('pointerdown',e=>{if(e.target.closest('a'))return;start=e.clientX;paper.setPointerCapture(e.pointerId);});
 paper.addEventListener('pointermove',e=>{if(start===null)return;const dx=Math.max(-100,Math.min(100,e.clientX-start));paper.style.transform='translateX('+dx+'px) rotate('+dx/15+'deg)';});
 paper.addEventListener('pointerup',e=>{if(start!==null&&Math.abs(e.clientX-start)>45)next();start=null;paper.style.transform='';});paper.addEventListener('pointercancel',()=>{start=null;paper.style.transform='';});
})();
