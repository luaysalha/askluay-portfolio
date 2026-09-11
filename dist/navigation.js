(() => {
 const header=document.getElementById('nav'),links=[...header.querySelectorAll('nav a[href^="#"]')],sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean),toggle=document.getElementById('menuToggle');
 const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;links.forEach(a=>{const active=a.hash==='#'+visible.target.id;a.classList.toggle('is-current',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-15% 0px -55% 0px',threshold:0});sections.forEach(s=>observer.observe(s));
 header.addEventListener('keydown',e=>{if(e.key==='Escape'){header.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();}});
})();
