const D = birthdayData, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const safe = (k, v) => { try { return v === undefined ? JSON.parse(localStorage.getItem(k)) : localStorage.setItem(k, JSON.stringify(v)); } catch { return null; } };

/* Isi data */
document.title = `Birthday Celebration — ${D.name}`;
$$('[data-name]').forEach(e => e.textContent = D.name);
$$('[data-age]').forEach(e => e.textContent = D.age);
$('#heroImg').src = D.heroImage;
const E = D.event;
$('#evDate').textContent = E.dateLabel; $('#evTime').textContent = `${E.startTime} — ${E.endTime} WIB`;
$('#evVenue').textContent = E.venue; $('#evAddr').textContent = E.address; $('#evMap').href = E.mapsUrl;
$('#gBank').textContent = D.gift.bank; $('#gNum').textContent = D.gift.number; $('#gHold').textContent = D.gift.holder;

/* Countdown */
const target = new Date(`${E.date}T${E.startTime}:00`);
function tick() {
  const d = target - Date.now();
  if (d <= 0) { $('#cd').hidden = true; $('#cdDone').hidden = false; return; }
  const v = [['Hari', d / 864e5], ['Jam', d / 36e5 % 24], ['Menit', d / 6e4 % 60], ['Detik', d / 1e3 % 60]];
  $('#cd').innerHTML = v.map(([l, n]) => `<div><b>${String(Math.floor(n)).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  setTimeout(tick, 1000);
}
tick();

/* Partikel + confetti */
const cv = $('#fx'), cx = cv.getContext('2d'); let P = [];
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; }; fit(); addEventListener('resize', fit);
const cols = ['#c9a35b', '#f3c4d8', '#b9a3e3', '#fff'];
for (let i = 0; i < (innerWidth < 700 ? 22 : 40); i++) P.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.8 + .4, s: Math.random() * .3 + .1, a: Math.random(), t: 0 });
function burst() { for (let i = 0; i < 90; i++) P.push({ x: innerWidth / 2, y: innerHeight / 2, vx: (Math.random() - .5) * 14, vy: Math.random() * -12 - 2, r: Math.random() * 3 + 2, c: cols[i % 4], life: 140, t: 1 }); }
(function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  P = P.filter(p => {
    if (p.t) { p.x += p.vx; p.y += p.vy; p.vy += .25; p.life--; cx.fillStyle = p.c; cx.globalAlpha = Math.max(p.life / 140, 0); cx.fillRect(p.x, p.y, p.r * 1.6, p.r); return p.life > 0; }
    p.y -= p.s; p.a += .015; if (p.y < -5) p.y = cv.height + 5; cx.globalAlpha = (Math.sin(p.a) + 1) / 3; cx.fillStyle = '#c9a35b'; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill(); return true;
  });
  requestAnimationFrame(loop);
})();

/* Melodi ulang tahun */
const mb = $('#music'); mb.hidden = false;
const setM = on => mb.classList.toggle('on', on);
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let musicContext, musicTimer, musicPlaying = false;
const musicNodes = new Set();
const melody = [
  [392, .5], [392, .5], [440, 1], [392, 1], [523.25, 1], [493.88, 2],
  [392, .5], [392, .5], [440, 1], [392, 1], [587.33, 1], [523.25, 2],
  [392, .5], [392, .5], [783.99, 1], [659.25, 1], [523.25, 1], [493.88, 1], [440, 2],
  [698.46, .5], [698.46, .5], [659.25, 1], [523.25, 1], [587.33, 1], [523.25, 2]
];
function playMelody() {
  if (!musicPlaying || !musicContext) return;
  let at = musicContext.currentTime + .08;
  const beat = .42;
  for (const [frequency, beats] of melody) {
    const duration = beats * beat;
    const osc = musicContext.createOscillator();
    const gain = musicContext.createGain();
    osc.type = 'triangle'; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(.12, at + .025);
    gain.gain.setValueAtTime(.12, at + duration * .72);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    osc.connect(gain); gain.connect(musicContext.destination);
    musicNodes.add(osc); osc.onended = () => musicNodes.delete(osc);
    osc.start(at); osc.stop(at + duration);
    at += duration;
  }
  musicTimer = setTimeout(playMelody, (at - musicContext.currentTime) * 1000);
}
async function play() {
  if (!AudioContextClass) return;
  musicContext ||= new AudioContextClass();
  await musicContext.resume();
  musicPlaying = true; setM(true); playMelody();
}
function pause() {
  musicPlaying = false; clearTimeout(musicTimer); setM(false);
  for (const osc of musicNodes) osc.stop();
  musicNodes.clear();
  if (musicContext?.state === 'running') musicContext.suspend();
}
mb.onclick = () => musicPlaying ? pause() : play().catch(() => setM(false));

/* Buka undangan */
const guestName = $('#guestName'), recipientGreeting = $('#recipientGreeting');
const linkedGuestName = new URLSearchParams(location.search).get('to')?.trim() || '';
if (linkedGuestName) guestName.value = linkedGuestName.slice(0, guestName.maxLength);
function updateRecipientGreeting() {
  const name = guestName.value.trim();
  recipientGreeting.textContent = name ? `Undangan istimewa untuk ${name}` : 'Undangan istimewa untuk';
}
guestName.addEventListener('input', updateRecipientGreeting);
updateRecipientGreeting();
let autoScrollFrame = 0, autoScrolling = false, previousScrollBehavior = '';
function stopAutoScroll() {
  if (!autoScrolling) return;
  autoScrolling = false;
  cancelAnimationFrame(autoScrollFrame);
  document.documentElement.style.scrollBehavior = previousScrollBehavior;
  removeEventListener('wheel', stopAutoScroll);
  removeEventListener('touchstart', stopAutoScroll);
  removeEventListener('pointerdown', stopAutoScroll);
  removeEventListener('keydown', stopAutoScroll);
}
function startAutoScroll() {
  if (reduce) return;
  autoScrolling = true;
  previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  let lastTime = 0;
  const step = time => {
    if (!autoScrolling) return;
    if (lastTime) {
      const next = Math.min(scrollY + (time - lastTime) * .028, document.documentElement.scrollHeight - innerHeight);
      scrollTo(0, next);
      if (next >= document.documentElement.scrollHeight - innerHeight) {
        stopAutoScroll();
        return;
      }
    }
    lastTime = time;
    autoScrollFrame = requestAnimationFrame(step);
  };
  addEventListener('wheel', stopAutoScroll, { passive: true });
  addEventListener('touchstart', stopAutoScroll, { passive: true });
  addEventListener('pointerdown', stopAutoScroll);
  addEventListener('keydown', stopAutoScroll);
  autoScrollFrame = requestAnimationFrame(step);
}
$('#openBtn').onclick = () => {
  const name = guestName.value.trim();
  if (name) recipientGreeting.textContent = `Undangan istimewa untuk ${name}`;
  $('#open').classList.add('go'); document.body.classList.remove('locked');
  if (!reduce) burst(); play(); scrollTo(0, 0);
  setTimeout(() => $('#open').remove(), 1500);
  setTimeout(() => $$('.hero .rv').forEach((e, i) => setTimeout(() => e.classList.add('in'), i * 450)), 500);
  setTimeout(startAutoScroll, 1500);
};

/* Reveal saat scroll + nav aktif + parallax */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .2 });
$$('.rv').forEach(e => { if (!e.closest('.hero')) io.observe(e); });
const nav = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && $$('.top a').forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id))), { threshold: .4 });
$$('main > section[id], #home').forEach(s => nav.observe(s));
addEventListener('scroll', () => { $('.hero').style.setProperty('--p', Math.min(scrollY / innerHeight, 1)); }, { passive: true });

/* Galeri + lightbox */
const fig = (g, full) => `<img src="${g.src}" alt="${g.cap}" ${full ? '' : 'loading="lazy"'} style="${g.z ? `--z:${g.z};transform-origin:${g.o};` : ''}${g.f ? `filter:${g.f}` : ''}">`;
$('#grid').innerHTML = D.gallery.map((g, i) => `<figure class="${g.c} rv" tabindex="0" data-i="${i}">${fig(g)}<figcaption>${g.cap}</figcaption></figure>`).join('');
$$('#grid .rv').forEach((e, i) => { e.style.transitionDelay = i * 90 + 'ms'; io.observe(e); });
let cur = 0; const lb = $('#lb');
function show(i) { cur = (i + D.gallery.length) % D.gallery.length; const g = D.gallery[cur]; $('.lbi').innerHTML = fig(g, true); $('#lbCap').textContent = g.cap; }
function openLb(i) { show(i); lb.hidden = false; $('.x').focus(); }
const closeLb = () => lb.hidden = true;
$$('#grid figure').forEach(f => { f.onclick = () => openLb(+f.dataset.i); f.onkeydown = e => e.key === 'Enter' && openLb(+f.dataset.i); });
$('.x').onclick = closeLb; $('.pv').onclick = () => show(cur - 1); $('.nx').onclick = () => show(cur + 1);
lb.onclick = e => e.target === lb && closeLb();
addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });

/* RSVP */
let pick = safe('rsvp');
const done = () => { $('#opts').hidden = $('#rsvpForm').hidden = true; $('#rsvpDone').hidden = false; };
if (pick && pick.saved) done();
$$('#opts button').forEach(b => b.onclick = () => { $$('#opts button').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); pick = { v: b.dataset.v }; $('#rsvpForm').hidden = false; $('#rName').focus(); });
$('#rsvpForm').onsubmit = e => { e.preventDefault(); safe('rsvp', { ...pick, name: $('#rName').value.trim(), saved: 1 }); done(); };

/* Ucapan */
const wl = $('#wList');
function addWish(w) { const a = document.createElement('article'); const b = document.createElement('b'); const p = document.createElement('p'); b.textContent = w.n; p.textContent = w.m; a.append(b, p); wl.prepend(a); }
(safe('wishes') || []).forEach(addWish);
$('#wForm').onsubmit = e => { e.preventDefault(); const w = { n: $('#wName').value.trim(), m: $('#wMsg').value.trim() }; safe('wishes', [...(safe('wishes') || []), w]); addWish(w); e.target.reset(); };

/* Salin rekening */
$('#copy').onclick = async function () {
  const n = D.gift.number;
  try { await navigator.clipboard.writeText(n); } catch { const t = document.createElement('textarea'); t.value = n; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
  this.textContent = 'Tersalin ✓'; setTimeout(() => this.textContent = 'Salin nomor rekening', 2000);
};

/* Desktop: cursor glow + tombol magnetik */
if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
  const g = $('#glow'); g.style.opacity = 1;
  addEventListener('mousemove', e => g.style.transform = `translate(${e.clientX}px,${e.clientY}px)`);
  $$('.btn').forEach(b => { b.onmousemove = e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) / 8}px,${(e.clientY - r.top - r.height / 2) / 8}px) scale(1.04)`; }; b.onmouseleave = () => b.style.transform = ''; });
}
