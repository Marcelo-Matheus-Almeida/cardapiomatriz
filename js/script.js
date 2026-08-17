/* ==================================================================
   ⚙️ CONFIG — ATUALIZAR TODA SEGUNDA AO TROCAR O CARDÁPIO
   ------------------------------------------------------------------
   MENU_VALIDADE = sexta-feira 23:59:59 da semana vigente.
   Depois dessa data (sábado em diante) o site mostra
   "cardápio da semana não atualizado ainda" até o novo cardápio.
   ================================================================== */
const MENU_VALIDADE = new Date('2026-08-21T23:59:59'); // sexta da "Semana de 10/08"
const HORA_VIRA_AMANHA = 15; // a partir das 15h, o hero mostra o dia seguinte
/* ================================================================== */

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

/* ===== base de dias ===== */
const KEY_BY_DOW = { 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex' };
const ORDER = ['seg', 'ter', 'qua', 'qui', 'sex'];
const NOME = { seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta' };

const now = new Date();
const dow = now.getDay();
const hour = now.getHours();
const todayKey = KEY_BY_DOW[dow] || null;   // null = fim de semana

const grid = document.querySelector('.grid');
const cards = Array.from(document.querySelectorAll('.day-card'));
const cardByKey = (k) => cards.find(c => c.dataset.day === k);

/* ==================================================================
   🚫 VALIDADE — cardápio da semana não atualizado?
   ================================================================== */
const menuExpirado = now > MENU_VALIDADE;
if (menuExpirado) {
  document.body.classList.add('not-ready');
  const p = document.getElementById('hojeTxt');
  if (p) p.textContent = 'Aguarde a atualização da nova semana. 🙌';
}

/* ==================================================================
   ⭐ Define qual dia o HERO mostra
   - padrão: hoje
   - a partir das 15h (seg→qui): mostra o dia SEGUINTE ("espie amanhã")
   - sexta não vira (é o último dia)
   ================================================================== */
let heroKey = todayKey || 'seg';
let heroModo = 'hoje'; // 'hoje' | 'amanha'
if (todayKey && hour >= HORA_VIRA_AMANHA && dow >= 1 && dow <= 4) {
  heroKey = ORDER[ORDER.indexOf(todayKey) + 1];
  heroModo = 'amanha';
}

/* marca o card do dia REAL de hoje (bandeirinha) */
cards.forEach(c => { if (c.dataset.day === todayKey) c.classList.add('today'); });

/* ===== HERO (desktop) ===== */
const hero = document.getElementById('hero');
function renderHero(key, modo) {
  const card = cardByKey(key);
  if (!card || !hero) return;
  const emoji = card.querySelector('.emoji-day').textContent;
  const name = card.querySelector('.day-head h2').textContent;
  const body = card.querySelector('.day-body').innerHTML;
  const isAmanha = modo === 'amanha';
  const isHoje = modo === 'hoje' && key === todayKey;

  let label, chip, sub, headClass;
  if (isAmanha) {
    label = '👀 Espie o cardápio de amanhã';
    chip = '<span class="hero-hoje amanha">🔮 AMANHÃ</span>';
    sub = 'Já passou das 15h — dá uma espiada no que vem por aí! 😋';
    headClass = ' tomorrow';
  } else if (isHoje) {
    label = '🍽️ Cardápio de Hoje';
    chip = '<span class="hero-hoje">● HOJE</span>';
    sub = 'Bom apetite! 😋';
    headClass = '';
  } else {
    label = '📖 Cardápio de ' + name;
    chip = '';
    sub = 'Confira o que vai ser servido';
    headClass = ' tomorrow';
  }

  hero.innerHTML =
    '<div class="hero-label">' + label + '</div>' +
    '<div class="hero-card">' +
      '<div class="hero-head' + headClass + '">' +
        '<span class="hero-emoji">' + emoji + '</span>' + chip +
        '<h2>' + name + '</h2>' +
        '<span class="hero-sub">' + sub + '</span>' +
      '</div>' +
      '<div class="hero-sections">' + body + '</div>' +
    '</div>';
}
renderHero(heroKey, heroModo);

/* ===== reveal ao rolar ===== */
const io = new IntersectionObserver((es) => {
  es.forEach((e, i) => {
    if (e.isIntersecting) { e.target.style.transitionDelay = (i * 0.05) + 's'; e.target.classList.add('reveal'); io.unobserve(e.target); }
  });
}, { threshold: .12 });
cards.forEach(c => io.observe(c));

/* subtítulo do header (quando cardápio válido) */
const hojeTxt = document.getElementById('hojeTxt');
if (hojeTxt && !menuExpirado) {
  if (heroModo === 'amanha') hojeTxt.textContent = 'Já passou das 15h — espie o cardápio de amanhã! 👀';
  else if (todayKey) hojeTxt.textContent = 'Hoje é ' + NOME[todayKey] + ' — veja o cardápio de hoje em destaque! 😋';
  else hojeTxt.textContent = 'Confira o cardápio da semana. 😋';
}

/* ===== CARROSSEL ===== */
const isCarousel = () => window.matchMedia('(max-width:999px)').matches;
function scrollToCard(key, smooth = true) {
  const card = cardByKey(key);
  if (!card || !grid) return;
  const left = card.offsetLeft - (grid.clientWidth - card.clientWidth) / 2;
  grid.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
}
const dotsWrap = document.getElementById('dots');
function buildDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  cards.forEach((c) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', c.dataset.day);
    b.addEventListener('click', () => { scrollToCard(c.dataset.day); setActiveTab(c.dataset.day); });
    dotsWrap.appendChild(b);
  });
}
buildDots();
function updateDots() {
  if (!dotsWrap || !grid) return;
  const center = grid.scrollLeft + grid.clientWidth / 2;
  let idx = 0, best = Infinity;
  cards.forEach((c, i) => { const cc = c.offsetLeft + c.clientWidth / 2; const d = Math.abs(cc - center); if (d < best) { best = d; idx = i; } });
  Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === idx));
  const key = cards[idx] && cards[idx].dataset.day;
  if (key) setActiveTab(key);
}
if (grid) {
  let raf = null;
  grid.addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { updateDots(); raf = null; }); });
}

/* ===== TABS ===== */
const tabs = Array.from(document.querySelectorAll('.tab'));
function setActiveTab(key) { tabs.forEach(t => t.classList.toggle('active', t.dataset.day === key)); }
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const d = tab.dataset.day;
    if (d === 'all') {
      /* botão "Hoje/Destaque" → volta pro dia em destaque (hero padrão) */
      setActiveTab(heroKey);
      renderHero(heroKey, heroModo);
      if (isCarousel()) scrollToCard(heroKey); else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab(d);
      renderHero(d, (d === todayKey && heroModo !== 'amanha') ? 'hoje' : 'outro');
      if (isCarousel()) scrollToCard(d); else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});

/* posição inicial: dia em destaque */
function initPosition() {
  setActiveTab(heroKey);
  if (isCarousel()) { scrollToCard(heroKey, false); setTimeout(updateDots, 60); }
}
window.addEventListener('load', initPosition);
let rsz = null;
window.addEventListener('resize', () => { clearTimeout(rsz); rsz = setTimeout(() => { if (isCarousel()) { scrollToCard(heroKey, false); updateDots(); } }, 200); });

/* ==================================================================
   📱 PWA — registro do service worker + ATUALIZAÇÃO AUTOMÁTICA
   Substitua o bloco atual de registro do SW no seu js/script.js por este.
   ================================================================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      // procura por uma versão nova sempre que a página abre
      reg.update();

      reg.addEventListener('updatefound', () => {
        const novo = reg.installing;
        if (!novo) return;
        novo.addEventListener('statechange', () => {
          // já existe um SW controlando E o novo terminou de instalar → ativa na hora
          if (novo.state === 'installed' && navigator.serviceWorker.controller) {
            novo.postMessage('SKIP_WAITING');
          }
        });
      });
    }).catch(() => {});
  });

  // quando o novo SW assume o controle, recarrega a página UMA vez
  let recarregando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recarregando) return;
    recarregando = true;
    window.location.reload();
  });
}

/* ----- resto do seu bloco PWA (botão instalar) continua igual ----- */
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
window.addEventListener('appinstalled', () => { if (installBtn) installBtn.classList.remove('show'); });
if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
  if (installBtn) installBtn.classList.remove('show');
}


/* ==================================================================
   🫧✨ MODO SECRETO FRUTIGER AERO / Y2K SHITPOST
   ================================================================== */
let aeroBuilt = false;
function buildAeroLayers() {
  if (aeroBuilt) return; aeroBuilt = true;
  const clouds = document.createElement('div'); clouds.id = 'aero-clouds';
  for (let i = 0; i < 5; i++) { const c = document.createElement('i'); c.textContent = '☁️'; c.style.top = (5 + Math.random() * 45) + '%'; c.style.fontSize = (3 + Math.random() * 4) + 'rem'; c.style.opacity = 0.6 + Math.random() * 0.35; c.style.animationDuration = (40 + Math.random() * 40) + 's'; c.style.animationDelay = (-Math.random() * 60) + 's'; clouds.appendChild(c); }
  document.body.appendChild(clouds);
  const bub = document.createElement('div'); bub.id = 'bubbles';
  for (let i = 0; i < 26; i++) { const b = document.createElement('b'); const size = 16 + Math.random() * 80; b.style.width = size + 'px'; b.style.height = size + 'px'; b.style.left = Math.random() * 100 + '%'; b.style.animationDuration = (9 + Math.random() * 14) + 's'; b.style.animationDelay = (-Math.random() * 18) + 's'; bub.appendChild(b); }
  document.body.appendChild(bub);
  const g = document.createElement('div'); g.id = 'glitter'; document.body.appendChild(g);
  const mq = document.createElement('div'); mq.id = 'aero-marquee';
  mq.innerHTML = '<p>★彡 BEM-VINDO(A) AO REFEITÓRIO DA MATRIZ ~ o rango tá on 🔥🍚 ~ arroz branco delicia 😋 ~ best viewed in Internet Explorer 6 ~ feijão carioca supremacy 🫘 ~ não esquece a sobremesa 🍮 ~ tmj 🤙 彡★</p>';
  document.body.appendChild(mq);
  const memes = ['💀','🗿','😹','🔥','✨','🌈','🐬','😎','👽','🤙','💯','🥶','🫧','⭐','🎉'];
  const mm = document.createElement('div'); mm.id = 'aero-memes';
  for (let i = 0; i < 14; i++) { const s = document.createElement('span'); s.textContent = memes[Math.floor(Math.random() * memes.length)]; s.style.left = Math.random() * 100 + '%'; s.style.fontSize = (1.8 + Math.random() * 2.4) + 'rem'; s.style.animationDuration = (10 + Math.random() * 14) + 's'; s.style.animationDelay = (-Math.random() * 20) + 's'; mm.appendChild(s); }
  document.body.appendChild(mm);
  const badge = document.createElement('div'); badge.id = 'aero-badge'; badge.innerHTML = '<span>UNDER<br>CONSTRUCTION</span>'; document.body.appendChild(badge);
  const n = 41000 + Math.floor(Math.random() * 900) + 20;
  const counter = document.createElement('div'); counter.id = 'aero-counter'; counter.innerHTML = 'VISITANTE Nº<br>' + String(n).padStart(6, '0') + '<small>you are visitor</small>'; document.body.appendChild(counter);
  const pop = document.createElement('div'); pop.id = 'aero-popup';
  pop.innerHTML = '<div class="bar"><span>refeitorio.exe</span><button title="fechar">×</button></div><div class="body"><div class="ico">⚠️</div><div>Fome crítica detectada!<br><b>Deseja almoçar agora?</b></div></div><div class="foot"><button data-a="sim">Sim</button><button data-a="claro">Com certeza</button></div>';
  document.body.appendChild(pop);
  makeDraggable(pop, pop.querySelector('.bar'));
  pop.querySelector('.bar button').addEventListener('click', () => pop.style.display = 'none');
  pop.querySelectorAll('.foot button').forEach(btn => btn.addEventListener('click', () => { toast(btn.dataset.a === 'sim' ? '🍽️ Bom apetite!' : '😎 Escolha certa, campeão'); pop.style.display = 'none'; }));
}
function makeDraggable(el, handle) {
  let ox = 0, oy = 0, drag = false;
  handle.addEventListener('mousedown', e => { drag = true; ox = e.clientX; oy = e.clientY; const r = el.getBoundingClientRect(); el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.right = 'auto'; e.preventDefault(); });
  document.addEventListener('mousemove', e => { if (!drag) return; const dx = e.clientX - ox, dy = e.clientY - oy; ox = e.clientX; oy = e.clientY; el.style.left = (el.offsetLeft + dx) + 'px'; el.style.top = (el.offsetTop + dy) + 'px'; });
  document.addEventListener('mouseup', () => drag = false);
}
let sparkOn = false;
function sparkHandler(e) {
  if (Math.random() > 0.35) return;
  const s = document.createElement('div'); s.className = 'spark';
  s.textContent = ['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)];
  s.style.left = (e.clientX - 6) + 'px'; s.style.top = (e.clientY - 6) + 'px';
  document.body.appendChild(s); setTimeout(() => s.remove(), 800);
}
function toast(msg) {
  let t = document.querySelector('.aero-toast');
  if (!t) { t = document.createElement('div'); t.className = 'aero-toast'; document.body.appendChild(t); }
  t.textContent = msg; requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2800);
}
function toggleAero(force) {
  const on = force !== undefined ? force : !document.body.classList.contains('aero');
  document.body.classList.toggle('aero', on);
  if (on) {
    buildAeroLayers();
    if (!sparkOn) { document.addEventListener('mousemove', sparkHandler); sparkOn = true; }
    const p = document.getElementById('aero-popup'); if (p) p.style.display = 'block';
    toast('🫧 Modo Frutiger Aero ativado ✨'); localStorage.setItem('aero', '1');
  } else {
    if (sparkOn) { document.removeEventListener('mousemove', sparkHandler); sparkOn = false; }
    toast('🔥 De volta ao modo Assaí'); localStorage.removeItem('aero');
  }
}
if (localStorage.getItem('aero') === '1') toggleAero(true);
(() => { const logo = document.querySelector('.logo-assai img'); let count = 0, timer = null; if (!logo) return;
  logo.addEventListener('click', () => { count++; clearTimeout(timer); timer = setTimeout(() => count = 0, 700); if (count >= 3) { count = 0; toggleAero(); } }); })();
(() => { const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']; let idx = 0;
  document.addEventListener('keydown', (e) => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (k === seq[idx]) { idx++; if (idx === seq.length) { idx = 0; toggleAero(); } } else { idx = (k === seq[0]) ? 1 : 0; } }); })();
(() => { const spot = document.querySelector('.secret-spot'); let count = 0, timer = null; if (!spot) return;
  spot.addEventListener('click', () => { count++; clearTimeout(timer); timer = setTimeout(() => count = 0, 800); if (count >= 3) { count = 0; toggleAero(); } }); })();
