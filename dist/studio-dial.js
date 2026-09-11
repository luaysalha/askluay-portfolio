(() => {
 const dialog=document.getElementById('studioDial'),open=document.getElementById('openDial');
 if(!dialog||typeof dialog.showModal!=='function')return;
 open.hidden=false;open.addEventListener('click',()=>dialog.showModal());
 document.getElementById('skipDial').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>open.focus());
 dialog.querySelectorAll('[data-dial]').forEach(choice=>choice.addEventListener('click',()=>{
 const filter=document.querySelector('#filters button[data-filter="'+choice.dataset.dial+'"]');
 if(!filter)return;
 dialog.close();filter.click();
 requestAnimationFrame(()=>{filter.focus({preventScroll:true});document.getElementById('work').scrollIntoView({behavior:'instant',block:'start'});});
 }));
})();
