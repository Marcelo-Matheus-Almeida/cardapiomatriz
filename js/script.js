/* ===== emojis flutuantes (modo normal) ===== */
const em = ['🍎','🍊','🍋','🍚','🥗','🍗','🥩','🍮','🧃','🍅','🥕','🍲'];
const fl = document.getElementById('floaties');
for (let i = 0; i < 16; i++) {
  const s = document.createElement('span');
  s.textContent = em[Math.floor(Math.random() * em.length)];
  s.style.left = Math.random() * 100 + '%';
  s.style.fontSize = (1.4 + Math.random() * 2) + 'rem';
  s.style.animationDuration = (14 + Math.random() * 16) + 's';
  s.style.animationDelay = (-Math.random() * 20) + 's';
  fl.appendChild(s);
}

/* ===== reveal ao rolar ===== */
const io = new IntersectionObserver((es) => {
  es.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * 0.06) + 's';
      e.target.classList.add('reveal');
      io.unobserve(e.target);
    }
  });
}, { threshold: .15 });
document.querySelectorAll('.day-card').forEach(c => io.observe(c));

/* ===== destaque do dia de hoje ===== */
const dow = new Date().getDay();
document.querySelectorAll('.day-card').forEach(c => {
  if (+c.dataset.dow === dow) c.classList.add('today');
});
const nomes = { 1: 'Segunda', 2: 'Terça', 3: 'Quarta', 4: 'Quinta', 5: 'Sexta' };
if (nomes[dow]) {
  document.getElementById('hojeTxt').textContent =
    'Hoje é ' + nomes[dow] + ' — aproveite o cardápio de hoje! 😋';
}

/* ===== filtro por dia ===== */
const tabs = document.querySelectorAll('.tab');
const cards = document.querySelectorAll('.day-card');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const d = tab.dataset.day;
    if (d === 'all') { document.body.classList.remove('filtered'); }
    else {
      document.body.classList.add('filtered');
      cards.forEach(c => c.classList.toggle('show', c.dataset.day === d));
    }
  });
});

/* ===== tilt 3D no hover (desktop) ===== */
if (window.matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform =
        `translateY(-10px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) scale(1.015)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ==================================================================
   📱 PWA — registra service worker + botão "Instalar"
   ================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.classList.add('show');
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.remove('show');
  });
}

/* some com o botão se já estiver instalado / rodando como app */
window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.classList.remove('show');
});
if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
  if (installBtn) installBtn.classList.remove('show');
}

/* ==================================================================
   🫧✨ MODO SECRETO FRUTIGER AERO / Y2K SHITPOST
   Gatilhos: (1) logo 3x  (2) Konami  (3) cantinho invisível
   ================================================================== */
let aeroBuilt = false;

function buildAeroLayers() {
  if (aeroBuilt) return;
  aeroBuilt = true;

  const clouds = document.createElement('div');
  clouds.id = 'aero-clouds';
  for (let i = 0; i < 5; i++) {
    const c = document.createElement('i');
    c.textContent = '☁️';
    c.style.top = (5 + Math.random() * 45) + '%';
    c.style.fontSize = (3 + Math.random() * 4) + 'rem';
    c.style.opacity = 0.6 + Math.random() * 0.35;
    c.style.animationDuration = (40 + Math.random() * 40) + 's';
    c.style.animationDelay = (-Math.random() * 60) + 's';
    clouds.appendChild(c);
  }
  document.body.appendChild(clouds);

  const bub = document.createElement('div');
  bub.id = 'bubbles';
  for (let i = 0; i < 26; i++) {
    const b = document.createElement('b');
    const size = 16 + Math.random() * 80;
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = Math.random() * 100 + '%';
    b.style.animationDuration = (9 + Math.random() * 14) + 's';
    b.style.animationDelay = (-Math.random() * 18) + 's';
    bub.appendChild(b);
  }
  document.body.appendChild(bub);

  const g = document.createElement('div');
  g.id = 'glitter';
  document.body.appendChild(g);

  const mq = document.createElement('div');
  mq.id = 'aero-marquee';
  mq.innerHTML = '<p>★彡 BEM-VINDO(A) AO REFEITÓRIO DA MATRIZ ~ o rango tá on 🔥🍚 ~ arroz branco delicia 😋 ~ best viewed in Internet Explorer 6 ~ feijão carioca supremacy 🫘 ~ não esquece a sobremesa 🍮 ~ tmj 🤙 彡★</p>';
  document.body.appendChild(mq);

  const memes = ['💀','🗿','😹','🔥','✨','🌈','🐬','😎','👽','🤙','💯','🥶','🫧','⭐','🎉'];
  const mm = document.createElement('div');
  mm.id = 'aero-memes';
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.textContent = memes[Math.floor(Math.random() * memes.length)];
    s.style.left = Math.random() * 100 + '%';
    s.style.fontSize = (1.8 + Math.random() * 2.4) + 'rem';
    s.style.animationDuration = (10 + Math.random() * 14) + 's';
    s.style.animationDelay = (-Math.random() * 20) + 's';
    mm.appendChild(s);
  }
  document.body.appendChild(mm);

  const badge = document.createElement('div');
  badge.id = 'aero-badge';
  badge.innerHTML = '<span>UNDER<br>CONSTRUCTION</span>';
  document.body.appendChild(badge);

  const n = 41000 + Math.floor(Math.random() * 900) + 20;
  const counter = document.createElement('div');
  counter.id = 'aero-counter';
  counter.innerHTML = 'VISITANTE Nº<br>' + String(n).padStart(6, '0') + '<small>you are visitor</small>';
  document.body.appendChild(counter);

  const pop = document.createElement('div');
  pop.id = 'aero-popup';
  pop.innerHTML =
    '<div class="bar"><span>refeitorio.exe</span><button title="fechar">×</button></div>' +
    '<div class="body"><div class="ico">⚠️</div><div>Fome crítica detectada!<br><b>Deseja almoçar agora?</b></div></div>' +
    '<div class="foot"><button data-a="sim">Sim</button><button data-a="claro">Com certeza</button></div>';
  document.body.appendChild(pop);
  makeDraggable(pop, pop.querySelector('.bar'));
  pop.querySelector('.bar button').addEventListener('click', () => pop.style.display = 'none');
  pop.querySelectorAll('.foot button').forEach(btn => btn.addEventListener('click', () => {
    toast(btn.dataset.a === 'sim' ? '🍽️ Bom apetite!' : '😎 Escolha certa, campeão');
    pop.style.display = 'none';
  }));
}

function makeDraggable(el, handle) {
  let ox = 0, oy = 0, drag = false;
  handle.addEventListener('mousedown', e => {
    drag = true; ox = e.clientX; oy = e.clientY;
    const r = el.getBoundingClientRect();
    el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.right = 'auto';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    const dx = e.clientX - ox, dy = e.clientY - oy; ox = e.clientX; oy = e.clientY;
    el.style.left = (el.offsetLeft + dx) + 'px';
    el.style.top = (el.offsetTop + dy) + 'px';
  });
  document.addEventListener('mouseup', () => drag = false);
}

let sparkOn = false;
function sparkHandler(e) {
  if (Math.random() > 0.35) return;
  const s = document.createElement('div');
  s.className = 'spark';
  s.textContent = ['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)];
  s.style.left = (e.clientX - 6) + 'px';
  s.style.top = (e.clientY - 6) + 'px';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 800);
}

function toast(msg) {
  let t = document.querySelector('.aero-toast');
  if (!t) { t = document.createElement('div'); t.className = 'aero-toast'; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2800);
}

function toggleAero(force) {
  const on = force !== undefined ? force : !document.body.classList.contains('aero');
  document.body.classList.toggle('aero', on);
  if (on) {
    buildAeroLayers();
    if (!sparkOn) { document.addEventListener('mousemove', sparkHandler); sparkOn = true; }
    const p = document.getElementById('aero-popup'); if (p) p.style.display = 'block';
    toast('🫧 Modo Frutiger Aero ativado ✨');
    localStorage.setItem('aero', '1');
  } else {
    if (sparkOn) { document.removeEventListener('mousemove', sparkHandler); sparkOn = false; }
    toast('🔥 De volta ao modo Assaí');
    localStorage.removeItem('aero');
  }
}

if (localStorage.getItem('aero') === '1') toggleAero(true);

/* Gatilho 1: logo 3x */
(() => {
  const logo = document.querySelector('.logo-assai img');
  let count = 0, timer = null;
  if (!logo) return;
  logo.addEventListener('click', () => {
    count++; clearTimeout(timer);
    timer = setTimeout(() => count = 0, 700);
    if (count >= 3) { count = 0; toggleAero(); }
  });
})();

/* Gatilho 2: Konami */
(() => {
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  document.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === seq[idx]) { idx++; if (idx === seq.length) { idx = 0; toggleAero(); } }
    else { idx = (k === seq[0]) ? 1 : 0; }
  });
})();

/* Gatilho 3: cantinho invisível */
(() => {
  const spot = document.querySelector('.secret-spot');
  let count = 0, timer = null;
  if (!spot) return;
  spot.addEventListener('click', () => {
    count++; clearTimeout(timer);
    timer = setTimeout(() => count = 0, 800);
    if (count >= 3) { count = 0; toggleAero(); }
  });
})();
