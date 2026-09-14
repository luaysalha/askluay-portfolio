(() => {
 const desk=document.getElementById('studio'),light=document.getElementById('deskLight'),strip=document.getElementById('deskStrip'),paper=document.getElementById('deskPaper');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 light.addEventListener('click',()=>{const on=light.getAttribute('aria-pressed')!=='true';light.setAttribute('aria-pressed',String(on));desk.classList.toggle('ruby-lit',on);});
 function scrollFilm(direction){stopHint(strip);strip.scrollBy({left:direction*strip.clientWidth*.8,behavior:reduced.matches?'instant':'smooth'});}
 document.getElementById('filmPrevious').onclick=()=>scrollFilm(-1);document.getElementById('filmNext').onclick=()=>scrollFilm(1);
 let drag=null,moved=false;
 strip.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:strip.scrollLeft};moved=false;});
 strip.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>5){moved=true;strip.scrollLeft=drag.left-dx;e.preventDefault();}});
 ['pointerup','pointercancel','pointerleave'].forEach(t=>strip.addEventListener(t,()=>drag=null));
 strip.addEventListener('dragstart',e=>e.preventDefault());strip.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false;}},true);
 const cards=[{title:'HR&MORE',role:'Brand identity & visual system',image:'assets/HR%20and%20More.jpeg',href:'projects/hr-more-brand-identity.html'},{title:'The Best Social Media',role:'Logo, feed & Stories design',image:'assets/tbsm-feed-1.jpg',href:'projects/the-best-social-media-nl.html'},{title:'URDA',role:'A bird brought to life through motion',image:'assets/urda-bird-poster.jpg',href:'projects/urda-logo-animation.html'},{"title": "180 Agency", "role": "Logo design & animation", "image": "assets/04.gif", "href": "projects/180-agency-logos.html"},{"title": "HR&MORE \u2014 type", "role": "Typography & brand patterns", "image": "assets/HR%20and%20More%2001.jpg", "href": "projects/hr-more-type-system.html"},{"title": "CVC Charity", "role": "Website design & development", "image": "assets/cvc-logo-02.png.jpg", "href": "projects/wordpress-site-build.html"}];let index=0,start=null;
 function next(){stopHint(paper);index=(index+1)%cards.length;const c=cards[index];document.getElementById('deskCardImage').src=c.image;document.getElementById('deskCardImage').alt=c.title;document.getElementById('deskCardTitle').textContent=c.title;document.getElementById('deskCardRole').textContent=c.role;document.getElementById('deskCardLink').href=c.href;document.getElementById('deskCardNumber').textContent='0'+(index+1)+' / '+String(cards.length).padStart(2,'0');document.getElementById('deskCardStatus').textContent=c.title+' — '+c.role;paper.style.transform='';if(!reduced.matches){paper.getAnimations().forEach(a=>a.cancel());paper.animate([{opacity:.35,transform:'translateX(28px) rotate(3deg)'},{opacity:1,transform:'translateX(0) rotate(0deg)'}],{duration:360,easing:'cubic-bezier(.2,.8,.2,1)'});}}
 document.getElementById('deskNext').onclick=next;
 paper.addEventListener('pointerdown',e=>{if(e.target.closest('a'))return;start=e.clientX;paper.setPointerCapture(e.pointerId);});
 paper.addEventListener('pointermove',e=>{if(start===null)return;const dx=Math.max(-100,Math.min(100,e.clientX-start));paper.style.transform='translateX('+dx+'px) rotate('+dx/15+'deg)';});
 paper.addEventListener('pointerup',e=>{if(start!==null&&Math.abs(e.clientX-start)>45)next();start=null;paper.style.transform='';});paper.addEventListener('pointercancel',()=>{start=null;paper.style.transform='';});
 // Hint once, when each control is visible; never compete with a gesture.
 const hinted=new WeakSet();
 function stopHint(el){hinted.add(el);el.classList.remove('swipe-intro');if(el===paper)el.getAnimations().forEach(a=>a.cancel());}
 const hints=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting&&!hinted.has(entry.target)){hinted.add(entry.target);if(!reduced.matches)entry.target.classList.add('swipe-intro');hints.unobserve(entry.target);}}),{threshold:.6});
 [paper,strip].forEach(el=>{hints.observe(el);el.addEventListener('pointerdown',()=>stopHint(el),{capture:true});el.addEventListener('focusin',()=>stopHint(el));el.addEventListener('animationend',()=>el.classList.remove('swipe-intro'));});
 reduced.addEventListener('change',()=>{if(reduced.matches){stopHint(paper);stopHint(strip);}});
 const position=document.getElementById('filmPosition'),previous=document.getElementById('filmPrevious'),following=document.getElementById('filmNext');
 function filmPosition(){const items=[...strip.children];let closest=0,distance=Infinity;items.forEach((item,i)=>{const d=Math.abs(item.getBoundingClientRect().left-strip.getBoundingClientRect().left-18);if(d<distance){distance=d;closest=i;}});position.textContent=String(closest+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');previous.disabled=strip.scrollLeft<3;following.disabled=strip.scrollLeft>=strip.scrollWidth-strip.clientWidth-3;}
 strip.addEventListener('scroll',filmPosition,{passive:true});new ResizeObserver(filmPosition).observe(strip);filmPosition();
})();
