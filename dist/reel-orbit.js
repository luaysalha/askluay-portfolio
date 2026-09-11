document.querySelectorAll('[data-reel-project]').forEach(button=>{
 button.addEventListener('click',()=>{
 const name=button.dataset.reelProject;
 const project=name==='main'?{title:'Showreel',blurb:'Documentary, campaign and social work by Luay Salha.',file:'assets/reel-2026-16x9.mp4'}:PROJECTS.find(p=>p.title===name);
 if(!project)return;
 openLightbox(project);
 if(project.socialVideos){
 const media=document.getElementById('lbMedia');media.hidden=true;media.replaceChildren();
 const links=document.createElement('div');links.className='orbit-social-links';
 project.socialVideos.forEach(v=>{const a=document.createElement('a');a.href=v.url;a.target='_blank';a.rel='noopener';const img=document.createElement('img');img.src=v.image;img.alt=v.title;const label=document.createElement('span');label.textContent='Watch on TikTok ↗';a.append(img,label);links.append(a);});
 document.getElementById('lbDesc').append(links);
 }
 });
});
