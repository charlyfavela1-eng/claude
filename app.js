// ── Navbar scroll + burger ────────────────────────────────
const navbar = document.getElementById('navbar');
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ── Scroll animations (AOS) ───────────────────────────────
const aosEls = document.querySelectorAll('[data-aos]');
const aosObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      aosObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
aosEls.forEach(el => aosObs.observe(el));

// ── Smooth anchor scroll ──────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 70;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── FAQ accordion ─────────────────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // Close all
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
    });

    // Toggle current
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  });
});

// ── Calculadora de retroactivo ────────────────────────────
function fmt(n) {
  return '$' + Math.round(n).toLocaleString('es-MX');
}

function calcular() {
  const actual   = parseFloat(document.getElementById('pension-actual').value) || 0;
  const minima   = parseFloat(document.getElementById('pension-minima').value) || 10600;
  const meses    = parseInt(document.getElementById('meses-pension').value) || 24;

  const diferencia  = Math.max(0, minima - actual);
  const retroactivo = diferencia * meses;
  const honorarios  = retroactivo * 0.30;
  const neto        = retroactivo * 0.70;

  document.getElementById('r-diferencia').textContent  = fmt(diferencia) + '/mes';
  document.getElementById('r-meses').textContent        = meses + ' meses';
  document.getElementById('r-total').textContent        = fmt(retroactivo);
  document.getElementById('r-honorarios').textContent   = fmt(honorarios);
  document.getElementById('r-neto').textContent         = fmt(neto);
  document.getElementById('r-nueva').innerHTML          = fmt(minima) + ' <span>/mes</span>';

  // Animate total
  const totalEl = document.getElementById('r-total');
  totalEl.style.transform = 'scale(1.1)';
  setTimeout(() => { totalEl.style.transform = ''; }, 300);
}

document.getElementById('btn-calcular').addEventListener('click', calcular);

// Recalculate on input change
['pension-actual', 'pension-minima', 'meses-pension'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});

// Initial calculation
calcular();

// ── WhatsApp float pulse animation ───────────────────────
const waFloat = document.querySelector('.wa-float');
if (waFloat) {
  setInterval(() => {
    waFloat.style.transform = 'scale(1.12)';
    setTimeout(() => { waFloat.style.transform = ''; }, 250);
  }, 4500);
}
