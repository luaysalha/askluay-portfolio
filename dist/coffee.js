// Coffee thread: rakweh pour, scroll cup, finjan cup game.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- pour scenes ---------- */
  function pour(scene) {
    dispatchEvent(new CustomEvent('coffee:pour', { detail: scene.id }));
    if (reduced.matches) { scene.classList.remove('is-waiting'); return; }
    scene.classList.remove('is-waiting', 'is-pouring');
    void scene.offsetWidth; // restart the animation
    scene.classList.add('is-pouring');
  }
  // Hero: the table waits. A picked card, a scroll or a short pause starts the pour;
  // when the cup is full the conversation opens.
  const heroScene = document.getElementById('coffeeScene');
  const heroEl = document.getElementById('top');
  if (heroScene && heroEl) {
    const promptLine = document.getElementById('tablePrompt'), picked = document.getElementById('heroPicked'), tableTop = heroEl.querySelector('.hero-tabletop');
    const tiles = [...heroEl.querySelectorAll('.world-tile')];
    let started = false, served = false;
    const serve = () => {
      if (served) return; served = true;
      heroEl.classList.add('is-served');
      promptLine.textContent = '';
    };
    const begin = () => {
      if (started) return; started = true;
      heroEl.classList.add('is-pouring');
      heroEl.dataset.pour = String(performance.now());
      promptLine.textContent = 'Pouring…';
      pour(heroScene);
      setTimeout(serve, reduced.matches ? 0 : 4300);
    };
    if (heroEl.getBoundingClientRect().bottom < innerHeight * .5) { started = true; heroScene.classList.remove('is-waiting'); serve(); }
    else {
      if (!reduced.matches) heroScene.classList.add('is-waiting');
      // the pour starts once the table has come up the screen
      const check = () => { if (tableTop.getBoundingClientRect().top < innerHeight * .45) begin(); };
      addEventListener('scroll', check, { passive: true });
      check();
    }
    tiles.forEach(tile => tile.addEventListener('click', event => {
      if (tile.classList.contains('is-picked') && served) return; // second click opens the project
      event.preventDefault();
      tiles.forEach(t => t.classList.toggle('is-picked', t === tile));
      heroEl.classList.add('has-pick');
      picked.href = tile.getAttribute('href');
      picked.textContent = 'Open ' + tile.dataset.title + ' ↗';
      begin();
    }));
    const replay = document.getElementById('coffeeReplay');
    if (replay) replay.addEventListener('click', () => pour(heroScene));
  }
  const lastScene = document.getElementById('coffeeLast');
  if (lastScene && 'IntersectionObserver' in window && !reduced.matches) {
    lastScene.classList.add('is-waiting');
    const seen = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      seen.disconnect();
      pour(lastScene);
    }, { threshold: .7 });
    seen.observe(lastScene);
  }

  /* ---------- scroll cup: empties as you read ---------- */
  const mini = document.getElementById('coffeeMini');
  const hero = document.getElementById('top');
  const contact = document.getElementById('contact');
  if (mini && hero && contact) {
    const label = mini.querySelector('span');
    let frame = 0;
    const draw = () => {
      frame = 0;
      const start = hero.offsetHeight * .7;
      const end = contact.offsetTop - innerHeight * .6;
      const p = Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, end - start)));
      const level = 1 - p;
      mini.style.setProperty('--level', level.toFixed(3));
      mini.classList.toggle('is-on', scrollY > start && scrollY < end + innerHeight * .25);
      label.textContent = level > .66 ? 'Still hot' : level > .33 ? 'Half a cup' : level > .04 ? 'Last sip' : 'Refill?';
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    draw();
  }

  /* ---------- the work table: every project as a print you can push around, some hidden under the saucer ---------- */
  const tableEl = document.getElementById('workTable');
  if (tableEl) {
    const block = document.getElementById('tableBlock'), spreadBtn = document.getElementById('tableSpread'), shuffleBtn = document.getElementById('tableShuffle');
    let items = [], saucer = null, top = 10, spread = false, turn = 0;
    const place = (el, x, y, r) => { el._x = x; el._y = y; el.style.translate = x + 'px ' + y + 'px'; if (r !== undefined) el.style.rotate = r + 'deg'; };
    function makeDraggable(el) {
      let sx = 0, sy = 0, ox = 0, oy = 0, held = false;
      el.addEventListener('pointerdown', event => {
        if (event.button) return;
        held = true; el._moved = false; sx = event.clientX; sy = event.clientY; ox = el._x; oy = el._y;
        el.setPointerCapture(event.pointerId);
        el.classList.add('dragging');
        if (el !== saucer) el.style.zIndex = String(++top);
      });
      el.addEventListener('pointermove', event => {
        if (!held) return;
        const dx = event.clientX - sx, dy = event.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 6) el._moved = true;
        if (!el._moved) return;
        const maxX = tableEl.clientWidth - el.offsetWidth, maxY = tableEl.clientHeight - el.offsetHeight;
        place(el, Math.min(maxX, Math.max(0, ox + dx)), Math.min(maxY, Math.max(0, oy + dy)));
      });
      const drop = () => { held = false; el.classList.remove('dragging'); };
      el.addEventListener('pointerup', drop);
      el.addEventListener('pointercancel', drop);
      el.addEventListener('click', event => { if (el._moved) { event.preventDefault(); el._moved = false; } });
      el.addEventListener('dragstart', event => event.preventDefault());
    }
    function layout() {
      const W = tableEl.clientWidth, small = W < 620;
      const cw = small ? 104 : 158, ch = small ? 74 : 108, sz = small ? 150 : 230;
      tableEl.style.setProperty('--cw', cw + 'px'); tableEl.style.setProperty('--ch', ch + 'px'); tableEl.style.setProperty('--sz', sz + 'px');
      if (spread) {
        const gap = small ? 10 : 16, cols = Math.max(2, Math.floor((W - gap) / (cw + gap))), rows = Math.ceil(items.length / cols);
        const left = (W - cols * (cw + gap) + gap) / 2;
        tableEl.style.height = (rows * (ch + gap) + sz + 60) + 'px';
        items.forEach((el, i) => place(el, left + (i % cols) * (cw + gap), 20 + Math.floor(i / cols) * (ch + gap), 0));
        place(saucer, (W - sz) / 2, rows * (ch + gap) + 34);
      } else {
        const H = small ? 560 : 640;
        tableEl.style.height = H + 'px';
        const cx = W / 2, cy = H / 2, rx = W / 2 - cw / 2 - 12, ry = H / 2 - ch / 2 - 12;
        items.forEach((el, i) => {
          const k = (i + turn * 5) % items.length, d = Math.sqrt((k + .35) / items.length), a = k * 2.39996 + turn;
          place(el, cx + Math.cos(a) * d * rx - cw / 2, cy + Math.sin(a) * d * ry - ch / 2, ((k * 37 + turn * 11) % 27) - 13);
          el.style.zIndex = String(items.length - k);
        });
        top = items.length + 1;
        place(saucer, cx - sz / 2, cy - sz / 2);
      }
    }
    function build() {
      if (items.length || typeof PROJECTS === 'undefined') return;
      const list = PROJECTS.filter(p => p.projectPage && !p.hidden);
      if (!list.length) return;
      list.forEach(p => {
        const el = document.createElement('a');
        el.className = 'print'; el.href = p.projectPage;
        const src = p.img || (p.yt ? 'https://img.youtube.com/vi/' + p.yt + '/hqdefault.jpg' : p.poster);
        if (src) { const img = document.createElement('img'); img.src = src; img.alt = ''; img.loading = 'lazy'; img.draggable = false; el.append(img); }
        else el.classList.add('print-text');
        const name = document.createElement('span'); name.textContent = p.title; el.append(name);
        tableEl.append(el); items.push(el); makeDraggable(el);
      });
      saucer = document.createElement('div');
      saucer.className = 'table-saucer'; saucer.dataset.plate = '';
      saucer.setAttribute('role', 'img'); saucer.setAttribute('aria-label', 'Saucer. Drag it away to see the work underneath.');
      saucer.innerHTML = '<span class="cup-slot cup-slot-saucer" data-cup="table" data-cup-tilt=".8"></span>';
      tableEl.append(saucer); makeDraggable(saucer);
      block.hidden = false;
      layout();
      document.dispatchEvent(new CustomEvent('cup:slots'));
      document.dispatchEvent(new CustomEvent('cup:plates'));
    }
    spreadBtn.addEventListener('click', () => { spread = !spread; spreadBtn.setAttribute('aria-pressed', String(spread)); spreadBtn.textContent = spread ? 'Pile them up' : 'Spread them out'; layout(); });
    shuffleBtn.addEventListener('click', () => { turn++; spread = false; spreadBtn.setAttribute('aria-pressed', 'false'); spreadBtn.textContent = 'Spread them out'; layout(); });
    let resizeTimer = 0;
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (items.length) layout(); }, 200); });
    document.addEventListener('work:rendered', build);
    build();
  }

  /* ---------- the cup makes the sections: spills, a ring that opens the work, a trail for the journey ---------- */
  if (!reduced.matches) {
    const spills = [...document.querySelectorAll('.spill')];
    const work = document.getElementById('work'), workWrap = work && work.querySelector('.wrap'), workSlot = work && work.querySelector('.cup-slot-work');
    const trail = document.querySelector('.coffee-trail'), timeline = document.getElementById('timeline');
    const clamp = v => Math.min(1, Math.max(0, v));
    let irisDone = !work || work.getBoundingClientRect().top < innerHeight * .25, flowFrame = 0;
    if (!irisDone) work.classList.add('iris-on');
    const stained = [...document.querySelectorAll('.cup-slot-studio,.cup-slot-work,.cup-slot-about')];
    stained.forEach(slot => { slot.insertAdjacentHTML('beforeend', '<i class="stain"></i><i class="cloth"></i>'); });
    const flow = () => {
      flowFrame = 0;
      const H = innerHeight;
      const lift = innerWidth < 760 ? 124 : 140; // the cup leaves its station about here
      stained.forEach(slot => { const r = slot.getBoundingClientRect(); if (r.top + r.height / 2 < H * .5 && r.bottom > 0) slot.classList.add('cup-left'); }); // wipe it once, in view
      spills.forEach(el => el.style.setProperty('--spill', clamp((H * .78 - el.getBoundingClientRect().top) / (H * .5)).toFixed(3)));
      if (!irisDone) {
        const r = workWrap.getBoundingClientRect(), s = workSlot.getBoundingClientRect();
        const p = clamp((H * .85 - work.getBoundingClientRect().top) / (H * .6));
        workWrap.style.setProperty('--ix', (s.left + s.width / 2 - r.left) + 'px');
        workWrap.style.setProperty('--iy', (s.top + s.height / 2 - r.top) + 'px');
        workWrap.style.setProperty('--ir', Math.hypot(r.width, H * 1.6) + 'px');
        workWrap.style.setProperty('--iris', (p * p).toFixed(4));
        if (p >= 1) { irisDone = true; work.classList.remove('iris-on'); }
      }
      if (trail) trail.style.setProperty('--trail', clamp(.03 + (H * .62 - timeline.getBoundingClientRect().top) / 380).toFixed(3));
    };
    const scheduleFlow = () => { if (!flowFrame) flowFrame = requestAnimationFrame(flow); };
    addEventListener('scroll', scheduleFlow, { passive: true });
    addEventListener('resize', scheduleFlow);
    flow();
  }

  /* ---------- finjan game ---------- */
  function showWork(filter) {
    const button = document.querySelector('#filters button[data-filter="' + filter + '"]');
    if (button) button.click();
    document.getElementById('work').scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  document.querySelectorAll('[data-go]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    showWork(link.dataset.go);
  }));

  /* ---------- social work as saucers; a coffee ring marks where the cup has been ---------- */
  const grid = document.getElementById('grid');
  const SEEN = 'luay-seen-projects';
  const seen = () => { try { return JSON.parse(localStorage.getItem(SEEN)) || []; } catch (e) { return []; } };
  function dressGrid(filter) {
    const saucers = filter === 'social';
    grid.classList.toggle('saucers', saucers);
    if (!saucers) return;
    const visited = seen();
    [...grid.children].forEach((card, i) => {
      if (i === 0) {
        const slot = document.createElement('span');
        slot.className = 'cup-slot cup-slot-saucer';
        slot.dataset.cup = 'saucer'; slot.dataset.cupTilt = '.8';
        card.querySelector('.thumb').append(slot);
      }
      card.classList.toggle('is-seen', visited.includes(card.dataset.page));
    });
    document.dispatchEvent(new CustomEvent('cup:slots'));
  }
  if (grid) {
    document.addEventListener('work:rendered', event => dressGrid(event.detail));
    grid.addEventListener('click', event => {
      const card = event.target.closest('.card');
      if (!card || !card.dataset.page) return;
      const list = seen();
      if (!list.includes(card.dataset.page)) { list.push(card.dataset.page); try { localStorage.setItem(SEEN, JSON.stringify(list)); } catch (e) {} }
    });
    dressGrid(document.querySelector('#filters .active')?.dataset.filter);
  }

  const table = document.getElementById('finjanTable');
  if (!table) return;
  const cups = [...table.querySelectorAll('.finjan')];
  const prompt = document.getElementById('finjanPrompt');
  const go = document.getElementById('finjanGo');
  const again = document.getElementById('finjanAgain');
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const name = cup => cup.querySelector('.finjan-word').textContent;
  let target = null;

  function setPhase(phase) { table.dataset.phase = phase; }
  function label(cup, text) { cup.setAttribute('aria-label', text); }
  function reset() {
    target = null;
    setPhase('pick');
    cups.forEach(cup => { cup.classList.add('is-up'); cup.disabled = false; label(cup, name(cup)); });
    go.hidden = again.hidden = true;
    prompt.textContent = 'Pick what you need. Then keep your eye on the cup.';
  }
  async function shuffle() {
    setPhase('shuffle');
    cups.forEach(cup => { cup.classList.remove('is-up'); cup.disabled = true; });
    prompt.textContent = 'Watch closely…';
    await wait(700);
    let last = -1;
    for (let round = 0; round < 7; round++) {
      let a, b;
      do { a = Math.floor(Math.random() * 4); b = Math.floor(Math.random() * 4); } while (a === b || a + b * 4 === last || b + a * 4 === last);
      last = a + b * 4;
      const first = cups[a], second = cups[b];
      const slot = first.style.getPropertyValue('--slot');
      first.style.setProperty('--slot', second.style.getPropertyValue('--slot'));
      second.style.setProperty('--slot', slot);
      first.classList.add('hop'); second.classList.add('dip');
      await wait(430);
      first.classList.remove('hop'); second.classList.remove('dip');
    }
    setPhase('guess');
    cups.forEach((cup, i) => { cup.disabled = false; label(cup, 'Cup ' + (Number(cup.style.getPropertyValue('--slot')) + 1)); });
    // keep keyboard order matching the visual order
    [...cups].sort((x, y) => x.style.getPropertyValue('--slot') - y.style.getPropertyValue('--slot')).forEach(cup => table.append(cup));
    prompt.textContent = 'Where’s ' + name(target) + '?';
  }
  function finish() {
    setPhase('done');
    go.dataset.go = target.dataset.filter;
    go.firstChild.textContent = 'See the ' + name(target) + ' work ';
    go.hidden = again.hidden = false;
    setTimeout(() => cups.forEach(cup => { cup.classList.add('is-up'); cup.disabled = true; label(cup, name(cup)); }), 500);
  }
  cups.forEach(cup => cup.addEventListener('click', () => {
    const phase = table.dataset.phase;
    if (phase === 'pick') {
      target = cup;
      if (reduced.matches) { showWork(cup.dataset.filter); return; }
      shuffle();
    } else if (phase === 'guess') {
      cup.classList.add('is-up');
      cup.disabled = true;
      label(cup, name(cup));
      if (cup === target) {
        prompt.textContent = 'There it is. Good eye.';
        finish();
      } else if (cups.filter(c => !c.disabled).length === 1) {
        prompt.textContent = 'That’s ' + name(cup) + '. ' + name(target) + ' was in the last cup.';
        finish();
      } else {
        prompt.textContent = 'That’s ' + name(cup) + '. Look again.';
      }
    }
  }));
  again.addEventListener('click', () => { reset(); cups[0].focus(); });
  reset();
})();
