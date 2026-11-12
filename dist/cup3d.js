// 3D coffee cup that travels through the page with the scroll.
// Progressive enhancement: if WebGL or motion is unavailable the 2D SVG version stays.
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const slotEls = [...document.querySelectorAll('[data-cup]')];
if (!reduced && slotEls.length) {
  try { start(); } catch (error) { console.warn('3D cup disabled:', error); }
}

function start() {
  const canvas = document.createElement('canvas');
  canvas.className = 'cup3d-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.append(canvas);
  document.documentElement.classList.add('cup3d');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const key = new THREE.DirectionalLight(0xfff1dd, 2.2);
  key.position.set(-2, 3, 4);
  scene.add(key);
  const camera = new THREE.PerspectiveCamera(22, 1, 10, 20000);
  let W = 0, H = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.position.set(0, 0, (H / 2) / Math.tan(THREE.MathUtils.degToRad(11)));
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  /* ---------- textures ---------- */
  function canvasTexture(w, h, draw, srgb = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
  const bandMap = canvasTexture(2048, 1024, (g, w, h) => {
    g.fillStyle = '#f7f4ee'; g.fillRect(0, 0, w, h);
    const y = v => (1 - v) * h;
    g.fillStyle = '#8e2444'; g.fillRect(0, y(.535), w, y(.47) - y(.535));
    g.fillStyle = '#c9a24b';
    g.fillRect(0, y(.541), w, 7); g.fillRect(0, y(.47), w, 7);
    g.fillRect(0, y(.628), w, y(.606) - y(.628)); // gilded rim
    const n = 28, step = w / n, mid = (y(.535) + y(.47)) / 2 + 3, half = (y(.47) - y(.535)) / 2 - 9;
    g.fillStyle = '#f3e3b0';
    for (let i = 0; i < n; i++) {
      const x = (i + .5) * step;
      g.beginPath(); g.moveTo(x, mid - half); g.lineTo(x + step * .3, mid); g.lineTo(x, mid + half); g.lineTo(x - step * .3, mid); g.closePath(); g.fill();
    }
  });
  bandMap.wrapS = THREE.RepeatWrapping;
  const cremaMap = canvasTexture(512, 512, (g, w) => {
    const r = g.createRadialGradient(w * .45, w * .42, 10, w / 2, w / 2, w / 2);
    r.addColorStop(0, '#3a1e0e'); r.addColorStop(.72, '#22100a'); r.addColorStop(.9, '#6d4423'); r.addColorStop(.97, '#b98a55'); r.addColorStop(1, '#5a3518');
    g.fillStyle = r; g.fillRect(0, 0, w, w);
    g.fillStyle = '#c9a06a';
    for (let i = 0; i < 60; i++) { const a = Math.random() * 6.28, d = w * (.4 + Math.random() * .08); g.globalAlpha = .25 + Math.random() * .4; g.beginPath(); g.arc(w / 2 + Math.cos(a) * d, w / 2 + Math.sin(a) * d, 2 + Math.random() * 5, 0, 6.28); g.fill(); }
  });
  const hammerMap = canvasTexture(512, 512, (g, w) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 420; i++) {
      const x = Math.random() * w, y = Math.random() * w, r = 9 + Math.random() * 15;
      const d = g.createRadialGradient(x, y, 0, x, y, r);
      d.addColorStop(0, 'rgba(40,40,40,.55)'); d.addColorStop(.8, 'rgba(150,150,150,.25)'); d.addColorStop(1, 'rgba(128,128,128,0)');
      g.fillStyle = d; g.beginPath(); g.arc(x, y, r, 0, 6.28); g.fill();
    }
  }, false);
  hammerMap.wrapS = hammerMap.wrapT = THREE.RepeatWrapping; hammerMap.repeat.set(3, 2);
  const shadowMap = canvasTexture(256, 256, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, 'rgba(0,0,0,.75)'); r.addColorStop(.55, 'rgba(0,0,0,.3)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  });
  const steamMap = canvasTexture(128, 256, (g, w, h) => {
    g.filter = 'blur(9px)'; g.strokeStyle = '#fff'; g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(w / 2, h - 30); g.bezierCurveTo(w * .1, h * .7, w * .9, h * .45, w / 2, 34); g.stroke();
  });

  /* ---------- materials ---------- */
  const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: bandMap, roughness: .2, clearcoat: 1, clearcoatRoughness: .06, side: THREE.DoubleSide });
  const coffeeMat = new THREE.MeshPhysicalMaterial({ map: cremaMap, roughness: .22, clearcoat: .5, clearcoatRoughness: .1, envMapIntensity: .3 });
  const groundsMat = new THREE.MeshStandardMaterial({ color: 0x1a0c05, roughness: .95 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xc8733f, metalness: 1, roughness: .27, bumpMap: hammerMap, bumpScale: 1.4, side: THREE.DoubleSide });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd6aa4e, metalness: 1, roughness: .32 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: .55 });
  const liquid = new THREE.MeshPhysicalMaterial({ color: 0x241006, roughness: .25, clearcoat: .5, envMapIntensity: .3 });
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity: .55 });

  /* ---------- geometry ---------- */
  const lathe = (pts, seg = 72) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
  const cupGeo = lathe([[0, 0], [.22, 0], [.26, .03], [.25, .08], [.30, .12], [.40, .32], [.47, .58], [.505, .82], [.52, 1], [.495, .995], [.465, .80], [.42, .56], [.33, .30], [0, .14]]);
  const discGeo = new THREE.CircleGeometry(1, 56).rotateX(-Math.PI / 2);
  const shadowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const innerRadius = y => { const hs = [.14, .30, .56, .80, .995], rs = [.1, .33, .42, .465, .495]; for (let i = 1; i < hs.length; i++) if (y <= hs[i]) return rs[i - 1] + (rs[i] - rs[i - 1]) * (y - hs[i - 1]) / (hs[i] - hs[i - 1]); return .495; };

  function makeCup(withCoffee) {
    const root = new THREE.Group();   // position / size / camera tilt
    const body = new THREE.Group();   // spin / flip
    const shadow = new THREE.Mesh(shadowGeo, shadowMat); shadow.scale.set(1.9, 1, 1.9); shadow.position.y = .002; shadow.renderOrder = -1;
    body.add(new THREE.Mesh(cupGeo, porcelain));
    root.add(shadow, body);
    const cup = { root, body, shadow };
    if (withCoffee) {
      cup.coffee = new THREE.Mesh(discGeo, coffeeMat);
      const grounds = new THREE.Mesh(discGeo, groundsMat); grounds.scale.setScalar(.2); grounds.position.y = .15;
      body.add(cup.coffee, grounds);
    }
    scene.add(root);
    return cup;
  }
  function setLevel(cup, level) {
    const y = .16 + level * .78;
    cup.coffee.visible = level > .015;
    cup.coffee.position.y = y;
    cup.coffee.scale.setScalar(innerRadius(y) - .004);
  }

  const main = makeCup(true);

  /* ---------- rakweh ---------- */
  const RK = 1; // rakweh size relative to the cup
  const rakweh = new THREE.Group();          // pivot = spout tip
  const pot = new THREE.Group(); pot.position.set(.47, -1.24, 0); rakweh.add(pot);
  pot.add(new THREE.Mesh(lathe([[0, 0], [.42, 0], [.46, .04], [.47, .15], [.44, .45], [.36, .78], [.30, .98], [.31, 1.06], [.40, 1.2], [.43, 1.24], [.40, 1.225], [.29, 1.05], [.28, .98], [.34, .78], [.42, .45], [.44, .1], [0, .08]]), copper));
  const potCoffee = new THREE.Mesh(discGeo, liquid); potCoffee.scale.setScalar(.285); potCoffee.position.y = 1.02; pot.add(potCoffee);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(.305, .014, 10, 60).rotateX(Math.PI / 2), brass); collar.position.y = .99; pot.add(collar);
  const spout = new THREE.Mesh(new THREE.ConeGeometry(.1, .24, 20, 1, true), copper); spout.rotation.z = Math.PI / 2 - .25; spout.scale.z = .75; spout.position.set(-.39, 1.2, 0); pot.add(spout);
  const dir = new THREE.Vector2(Math.cos(.42), Math.sin(.42));
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(.03, .036, .46, 16), brass); rod.rotation.z = -(Math.PI / 2 - .42); rod.position.set(.30 + dir.x * .23, 1 + dir.y * .23, 0); pot.add(rod);
  const grip = new THREE.Mesh(new THREE.CapsuleGeometry(.055, .62, 6, 16), wood); grip.rotation.z = rod.rotation.z; grip.position.set(.30 + dir.x * .8, 1 + dir.y * .8, 0); pot.add(grip);
  const potShadow = new THREE.Mesh(shadowGeo, shadowMat); potShadow.scale.set(1.7, 1, 1.7); potShadow.renderOrder = -1;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(.03, .022, 1, 14).translate(0, -.5, 0), liquid);
  main.root.add(rakweh, potShadow, stream);
  const REST = new THREE.Vector2(1.32 - .47 * RK, 1.24 * RK), POUR = new THREE.Vector2(.14, 1.95);
  potShadow.position.set(1.32, .002, 0);

  /* ---------- steam ---------- */
  const steam = [0, 1, 2].map(i => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .75), new THREE.MeshBasicMaterial({ map: steamMap, transparent: true, depthWrite: false, opacity: 0 }));
    m.position.x = (i - 1) * .2; main.root.add(m); return m;
  });

  /* ---------- game cups ---------- */
  const gameEls = [...document.querySelectorAll('.finjan svg')];
  const gameCups = gameEls.map(() => { const c = makeCup(false); c.body.rotation.x = Math.PI; c.body.position.y = 1; c.root.visible = false; return c; });

  /* ---------- saucers: social projects served on real plates ---------- */
  const plateMap = canvasTexture(1024, 512, (g, w, h) => {
    g.fillStyle = '#f7f4ee'; g.fillRect(0, 0, w, h);
    const y = v => (1 - v) * h;
    g.fillStyle = '#8e2444'; g.fillRect(0, y(.47), w, y(.43) - y(.47));
    g.fillStyle = '#c9a24b'; g.fillRect(0, y(.475), w, 4); g.fillRect(0, y(.43), w, 4); g.fillRect(0, y(.64), w, y(.6) - y(.64));
  });
  const plateMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: plateMap, roughness: .2, clearcoat: 1, clearcoatRoughness: .06, side: THREE.DoubleSide });
  const plateGeo = lathe([[0, .03], [.2, .03], [.23, .037], [.36, .06], [.47, .09], [.5, .1], [.485, .082], [.3, .02], [.22, 0], [0, 0]], 96);
  const loader = new THREE.TextureLoader();
  let saucers = [];
  function buildSaucers(on) {
    saucers.forEach(s => { scene.remove(s.root); s.decal.material.map?.dispose(); s.decal.material.dispose(); });
    saucers = [];
    if (!on) return;
    document.querySelectorAll('#grid .thumb').forEach(el => {
      const img = el.querySelector('img');
      const root = new THREE.Group();
      const shadow = new THREE.Mesh(shadowGeo, shadowMat); shadow.scale.set(1.25, 1, 1.25); shadow.position.y = -.01; shadow.renderOrder = -1;
      const decal = new THREE.Mesh(discGeo, new THREE.MeshPhysicalMaterial({ color: 0xe9e5dc, roughness: .3, clearcoat: .8, clearcoatRoughness: .1, envMapIntensity: .5 }));
      decal.scale.setScalar(.205); decal.position.y = .037;
      if (img) loader.load(img.currentSrc || img.src, tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const a = tex.image.width / tex.image.height, rx = a > 1 ? 1 / a : 1, ry = a > 1 ? 1 : a;
        tex.repeat.set(rx, ry); tex.offset.set((1 - rx) / 2, (1 - ry) / 2);
        decal.material.map = tex; decal.material.color.set(0xffffff); decal.material.needsUpdate = true;
      });
      root.add(shadow, new THREE.Mesh(plateGeo, plateMat), decal);
      root.visible = false;
      scene.add(root);
      saucers.push({ root, el, decal });
    });
  }
  document.addEventListener('work:rendered', event => buildSaucers(event.detail === 'social'));
  buildSaucers(document.getElementById('grid')?.classList.contains('saucers'));

  // plain plates that follow a DOM element (the saucer on the work table)
  let plates = [];
  function buildPlates() {
    plates.forEach(p => scene.remove(p.root));
    plates = [...document.querySelectorAll('[data-plate]')].map(el => {
      const root = new THREE.Group();
      const shadow = new THREE.Mesh(shadowGeo, shadowMat); shadow.scale.set(1.3, 1, 1.3); shadow.position.y = -.01; shadow.renderOrder = -1;
      root.add(shadow, new THREE.Mesh(plateGeo, plateMat));
      scene.add(root);
      return { root, el };
    });
  }
  document.addEventListener('cup:plates', buildPlates);
  buildPlates();

  /* ---------- pour timeline ---------- */
  const ease = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const POUR_MS = 4600;
  const pours = new Map(); // one pour per station that has a rakweh
  const pourOf = el => { if (!pours.has(el)) pours.set(el, { start: -1, done: false, from: 0 }); return pours.get(el); };
  let fillY = null; // scroll position of the last finished pour; the cup drains from there
  function pourPose(p) { // p < 0: waiting beside an empty cup, 0..1: pouring, >= 1: resting beside a full cup
    if (p < 0) return { x: REST.x, y: REST.y, rot: 0, show: 1, s0: 0, s1: 0, level: 0, ground: 1 };
    if (p >= 1) return { x: REST.x, y: REST.y, rot: 0, show: 1, s0: 0, s1: 0, level: 1, ground: 1 };
    const over = ease(0, .18, p) * (1 - ease(.84, 1, p)); // 0 = on the table, 1 = above the cup
    return {
      x: REST.x + (POUR.x - REST.x) * over,
      y: REST.y + (POUR.y - REST.y) * over + Math.sin(over * Math.PI) * .75, // lift well clear of the cup on the way over and back
      rot: .58 * (ease(.18, .32, p) - ease(.70, .84, p)),
      show: 1,
      s0: ease(.68, .74, p), s1: ease(.31, .37, p),   // stream: retract from top, grow to bottom
      level: ease(.35, .72, p), ground: 1 - over
    };
  }
  const heroEl = document.getElementById('top');
  const heroPour = pourOf(slotEls[0]);
  addEventListener('coffee:pour', event => { if (event.detail === 'coffeeScene') { heroPour.start = performance.now(); heroPour.done = false; heroPour.from = 0; } });
  { // the hero decides when to pour (card picked, or the table scrolling into view)
    const at = Number(heroEl.dataset.pour || 0);
    if (at) heroPour.start = at;
    else if (heroEl.getBoundingClientRect().bottom < innerHeight * .5) { heroPour.done = true; fillY = scrollY; }
  }

  /* ---------- slots ---------- */
  const readSlots = () => [...document.querySelectorAll('[data-cup]')].map(el => ({
    el, name: el.dataset.cup,
    k: Number(el.dataset.cupScale || 1), tilt: Number(el.dataset.cupTilt || .36),
    shift: Number(el.dataset.cupShift || 0), dim: Number(el.dataset.cupDim || 1), rakweh: el.dataset.cupRakweh ? 1 : 0, lean: Number(el.dataset.cupLean || 0)
  }));
  let slots = readSlots();
  document.addEventListener('cup:slots', () => { slots = readSlots(); });
  document.addEventListener('work:rendered', () => { slots = readSlots(); });
  const game = document.getElementById('game'), heroSlot = slotEls[0];
  const veil = document.createElement('div'); veil.className = 'cup3d-veil'; veil.setAttribute('aria-hidden', 'true'); document.body.append(veil);
  let wasDiving = false, diveSpin = 0;
  const hero = document.getElementById('top'), contact = document.getElementById('contact');
  const cur = { x: 0, y: 0, size: 0, tilt: .36, dim: 1, rk: 0, lean: 0, ready: false };
  let last = performance.now(), running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(frame); } });

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;

    // where should the cup be? It rests in the last station that has come up the page,
    // sticks under the nav once that station scrolls away, and glides to the next one as it arrives.
    const settle = H * .72, arrive = H * .98, stick = W < 760 ? 118 : 132;
    const pts = slots.map(s => { const r = s.el.getBoundingClientRect(); const y = r.top + r.height / 2; return { s, x: r.left + r.width / 2, y, oy: y + s.shift, size: r.height * s.k }; });
    let i = 0; for (let n = 0; n < pts.length; n++) if (pts[n].oy <= settle) i = n;
    // while a pour is running the cup stays where it is being filled (as long as that station is on screen)
    let holding = false;
    for (let n = 0; n < pts.length; n++) { const st = pts[n].s.rakweh ? pours.get(pts[n].s.el) : null; if (st && st.start >= 0 && !st.done && pts[n].y > 70 && pts[n].y < H + 60) { i = n; holding = true; } }
    const a = pts[i], b = pts[Math.min(pts.length - 1, i + 1)];
    const raw = b === a ? 0 : (arrive - b.oy) / (arrive - settle);
    const t = holding ? 0 : ease(0, 1, raw), mix = (u, v) => u + (v - u) * t;
    const stuck = Math.min(1, Math.max(0, (stick - a.y) / 140));
    const ay = Math.max(a.y, stick), asize = a.size * (1 - stuck) + (W < 760 ? 42 : 58) * stuck;
    const ax = a.x + ((W < 760 ? W - 36 : W - 58) - a.x) * stuck;
    const goal = { x: mix(ax, b.x), y: mix(ay, b.y), size: mix(asize, b.size), tilt: mix(a.s.tilt, b.s.tilt), dim: mix(a.s.dim, b.s.dim), rk: mix(a.s.rakweh * (1 - stuck), b.s.rakweh), lean: mix(a.s.lean, b.s.lean) };
    const k = cur.ready ? 1 - Math.exp(-dt * 7) : 1; cur.ready = true;
    for (const key in goal) cur[key] += (goal[key] - cur[key]) * k;

    // Phones: no travelling cup. The cup and rakweh simply stand at fixed stations in the page
    // (hero, story beats, the work-table saucer, contact) and pour when you reach them.
    const anchored = W < 760;
    let station = null;
    if (anchored) {
      let best = Infinity;
      pts.forEach(p => {
        if (!(p.s.rakweh || p.s.name === 'table' || p.s.name === 'saucer')) return;
        if (p.y < -p.size || p.y > H + p.size) return;
        const d = Math.abs(p.y - H * .5); if (d < best) { best = d; station = p; }
      });
      if (station) Object.assign(cur, { x: station.x, y: station.y, size: station.size, tilt: station.s.tilt, dim: 1, rk: station.s.rakweh, lean: 0 });
    }

    // pours: the station in play is the one the cup rests in or is arriving at
    const ps = anchored ? (station && station.s.rakweh ? station : null) : (a.s.rakweh ? a : b.s.rakweh ? b : null);
    const drained = fillY === null ? 0 : 1 - Math.min(1, Math.max(0, scrollY - fillY) / (H * 3.6));
    let pose = pourPose(2), level = drained;
    if (ps) {
      const st = pourOf(ps.s.el);
      if (st.start < 0 && !st.done && (anchored ? ps.y < H * .68 : ps === a) && ps.s.el !== slotEls[0]) { st.start = now; st.from = anchored ? 0 : drained; }
      const p = st.done ? 2 : st.start < 0 ? -1 : (now - st.start) / POUR_MS;
      if (p >= 1 && !st.done) { st.done = true; fillY = scrollY; }
      pose = pourPose(p);
      if (p >= 0 && p < 1) level = st.from + (1 - st.from) * pose.level;
      else if (p >= 1) level = Math.max(drained, fillY === scrollY ? 1 : drained);
    }
    if (anchored) { const st = ps ? pourOf(ps.s.el) : null; level = !station ? 0 : !ps ? .7 : st.done ? 1 : st.start >= 0 ? pose.level : 0; }
    setLevel(main, level);

    // main cup
    let size = Math.max(1, cur.size) / 1.2; // the tilted cup looks ~1.2x its height on screen
    main.root.position.set(cur.x - W / 2, H / 2 - cur.y - size * .5, 0);
    // the camera sees things above the middle of the screen from below; lean them back so the view stays the same
    const camD = camera.position.z, lookDown = y => Math.atan2(y, camD);
    main.root.rotation.set(cur.tilt + lookDown(main.root.position.y), 0, cur.lean);

    // dive shot: between the hero and the game the camera pushes into the coffee,
    // the screen goes dark, and the next section comes up out of it
    let dive = 0;
    if (game && heroPour.done && !anchored) {
      const gTop = game.getBoundingClientRect().top;
      dive = Math.min(1, Math.max(0, (H * .98 - gTop) / (H * 1.1))); // from the game entering the screen to it reaching the top
      if (dive > 0 && dive < 1) {
        const push = ease(0, .62, dive), e = Math.pow(push, 2.4), big = Math.max(W, H) * 2.6;
        const hs = size, hx = main.root.position.x, hy = main.root.position.y;
        size = hs + (big - hs) * e;
        const t0 = cur.tilt + lookDown(hy), tilt = t0 + (1.42 - t0) * push;
        main.root.position.set(hx * (1 - push), hy * (1 - push) + (-.94 * size * Math.cos(tilt)) * push, -.94 * size * Math.sin(tilt) * push); // keep the coffee surface on the screen plane
        main.root.rotation.set(tilt, 0, Math.sin(push * Math.PI) * .38); // roll the camera on the way in
        diveSpin = push * push * 5.5; cremaMap.center.set(.5, .5); cremaMap.rotation = push * 2.6;
        main.root.visible = dive < .7;
        cur.rk = Math.max(0, cur.rk - dive * 4);
        const dark = ease(.3, .5, dive), out = ease(.8, 1, dive), toBg = ease(.62, .8, dive);
        veil.style.opacity = String(dark * (1 - out));
        veil.style.backgroundColor = `rgb(${Math.round(29 + (34 - 29) * toBg)},${Math.round(14 + (20 - 14) * toBg)},${Math.round(7 + (11 - 7) * toBg)})`;
        game.style.setProperty('--emerge', ease(.66, 1, dive).toFixed(3));
        wasDiving = true;
      } else if (wasDiving) {
        wasDiving = false; cur.ready = false; main.root.visible = true; veil.style.opacity = '0'; diveSpin = 0; cremaMap.rotation = 0; game.style.setProperty('--emerge', '1');
      }
    }
    const diving = dive > 0 && dive < 1;
    main.root.scale.setScalar(size);
    if (anchored) main.root.visible = !!station; else if (!diving) main.root.visible = true;
    main.body.rotation.y = scrollY * .0016 + diveSpin;

    // rakweh
    const show = cur.rk * pose.show;
    rakweh.visible = potShadow.visible = show > .02;
    rakweh.position.set(pose.x + (1 - cur.rk) * 1.4, pose.y, 0);
    rakweh.rotation.z = pose.rot;
    rakweh.scale.setScalar(RK * show);
    potShadow.scale.setScalar(Math.max(.001, 1.7 * show * pose.ground));
    const top = POUR.y - .04, bottom = .16 + level * .78, len = top - bottom;
    stream.visible = pose.s1 > .01 && pose.s0 < .99;
    stream.position.set(POUR.x - .03, top - len * pose.s0, 0);
    stream.scale.y = Math.max(.001, len * (pose.s1 - pose.s0));

    // steam
    steam.forEach((m, n) => {
      const ph = ((now / 3400) + n / 3) % 1;
      m.position.y = 1.1 + ph * .7;
      m.material.opacity = diving ? 0 : Math.sin(ph * Math.PI) * .32 * Math.min(1, level * 1.6) * (level > .5 ? 1 : level * 2);
    });

    // game cups follow their (hidden) SVG twins
    gameEls.forEach((el, n) => {
      const r = el.getBoundingClientRect(), cup = gameCups[n];
      cup.root.visible = r.bottom > -80 && r.top < H + 80 && r.width > 0;
      if (!cup.root.visible) return;
      const s = r.height / 1.24, up = el.parentElement.classList.contains('is-up');
      cup.lean = (cup.lean || 0) + ((up ? -.14 : 0) - (cup.lean || 0)) * (1 - Math.exp(-dt * 10));
      cup.root.position.set(r.left + r.width / 2 - W / 2, H / 2 - r.bottom + s * .16, 0);
      cup.root.scale.setScalar(s);
      cup.root.rotation.set(.3 + lookDown(cup.root.position.y), 0, cup.lean);
      cup.body.rotation.y = n * 1.7;
    });

    [...saucers, ...plates].forEach(s => {
      const r = s.el.getBoundingClientRect();
      s.root.visible = r.bottom > -60 && r.top < H + 60 && r.width > 0;
      if (!s.root.visible) return;
      const y = H / 2 - (r.top + r.height * .56);
      s.root.position.set(r.left + r.width / 2 - W / 2, y, -r.width * .6);
      s.root.scale.setScalar(r.width * 1.06);
      s.root.rotation.set(.92 + lookDown(y), 0, 0);
    });

    renderer.toneMappingExposure = cur.dim;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
