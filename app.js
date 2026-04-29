// ── Navbar scroll ─────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Scroll animations ─────────────────────────────────
const aosEls = document.querySelectorAll('[data-aos]');
const aosObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); aosObs.unobserve(e.target); } });
}, { threshold: 0.12 });
aosEls.forEach(el => aosObs.observe(el));

// ── WhatsApp float pulse ──────────────────────────────
const waFloat = document.querySelector('.wa-float');
setInterval(() => {
  waFloat.style.transform = 'scale(1.15)';
  setTimeout(() => waFloat.style.transform = '', 300);
}, 4000);

// ── Smooth anchor scroll ──────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
