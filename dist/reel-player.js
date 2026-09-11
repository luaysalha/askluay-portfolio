(() => {
 const video=document.getElementById('showreelVideo'),play=document.getElementById('showreelPlay');
 if(!video||!play)return;
 video.controls=false;play.hidden=false;
 play.addEventListener('click',()=>{play.hidden=true;video.controls=true;video.play().catch(()=>{play.hidden=false;});});
 video.addEventListener('ended',()=>{play.hidden=false;});
 video.addEventListener('play',()=>{play.hidden=true;document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});});
})();
