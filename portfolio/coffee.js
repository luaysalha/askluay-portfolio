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
    const title = document.getElementById('heroTitle'), promptLine = document.getElementById('heroPrompt'), picked = document.getElementById('heroPicked');
    const tiles = [...heroEl.querySelectorAll('.world-tile')];
    let started = false, served = false;
    const serve = () => {
      if (served) return; served = true;
      heroEl.classList.add('is-served');
      title.innerHTML = 'Now we can<br><em>talk.</em>';
      promptLine.innerHTML = '<span lang="ar" dir="rtl">هلق صار فينا نحكي</span>';
    };
    const begin = () => {
      if (started) return; started = true;
      heroEl.classList.add('is-pouring');
      heroEl.dataset.pour = String(performance.now());
      promptLine.textContent = 'Pouring…';
      pour(heroScene);
      setTimeout(serve, reduced.matches ? 0 : 4300);
    };
    if (scrollY > innerHeight * .5) { started = true; heroScene.classList.remove('is-waiting'); serve(); }
    else {
      if (!reduced.matches) heroScene.classList.add('is-waiting');
      addEventListener('scroll', () => { if (scrollY > 24) begin(); }, { passive: true });
      setTimeout(begin, 6500);
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

  /* ---------- the cup makes the sections: spills, a ring that opens the work, a trail for the journey ---------- */
  if (!reduced.matches) {
    const spills = [...document.querySelectorAll('.spill')];
    const work = document.getElementById('work'), workWrap = work && work.querySelector('.wrap'), workSlot = work && work.querySelector('.cup-slot-work');
    const trail = document.querySelector('.coffee-trail'), timeline = document.getElementById('timeline');
    const clamp = v => Math.min(1, Math.max(0, v));
    let irisDone = !work || work.getBoundingClientRect().top < innerHeight * .25, flowFrame = 0;
    if (!irisDone) work.classList.add('iris-on');
    const flow = () => {
      flowFrame = 0;
      const H = innerHeight;
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
  function ring(card, note) {
    if (card.classList.contains('has-ring')) return;
    card.classList.add('has-ring');
    const label = document.createElement('span');
    label.className = 'ring-note';
    label.textContent = note;
    card.querySelector('.body').prepend(label);
  }
  function dressGrid(filter) {
    const saucers = filter === 'social';
    grid.classList.toggle('saucers', saucers);
    if (!saucers) return;
    const visited = seen();
    [...grid.children].forEach((card, i) => {
      if (i === 0) {
        const slot = document.createElement('span');
        slot.className = 'cup-slot cup-slot-saucer';
        slot.dataset.cup = 'saucer'; slot.dataset.cupTilt = '.62';
        card.querySelector('.thumb').append(slot);
        ring(card, 'The cup was just here');
      }
      if (visited.includes(card.dataset.page)) ring(card, 'You’ve seen this one');
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
