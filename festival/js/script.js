/* confetes / delícias subindo (clima festival) */
const em = ['🍫','🍪','🥤','🧃','🍬','⭐','🫧','🎉','🍮','💧'];
const fl = document.getElementById('floaties');
for (let i = 0; i < 18; i++) {
  const s = document.createElement('span');
  s.textContent = em[Math.floor(Math.random() * em.length)];
  s.style.left = Math.random() * 100 + '%';
  s.style.fontSize = (1.2 + Math.random() * 1.8) + 'rem';
  s.style.animationDuration = (12 + Math.random() * 16) + 's';
  s.style.animationDelay = (-Math.random() * 22) + 's';
  fl.appendChild(s);
}

/* reveal dos cards ao rolar */
const io = new IntersectionObserver((es) => {
  es.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * 0.08) + 's';
      e.target.classList.add('reveal');
      io.unobserve(e.target);
    }
  });
}, { threshold: .15 });
document.querySelectorAll('.card').forEach(c => io.observe(c));
