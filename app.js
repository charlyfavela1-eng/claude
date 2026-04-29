// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

// ── Retroactive calculator ──────────────────────────────
const PENSION_MINIMA_2026 = 10600;
const HONORARIO_PCT = 0.30;

const pensionInput  = document.getElementById('pension-actual');
const duracionInput = document.getElementById('duracion');
const calcBtn       = document.getElementById('calc-btn');
const calcResult    = document.getElementById('calc-result');

function calcular() {
  const pensionActual = parseFloat(pensionInput.value);
  const meses         = parseInt(duracionInput.value) || 24;

  if (!pensionActual || pensionActual <= 0) {
    calcResult.innerHTML = `
      <div class="result-placeholder">
        <span class="result-icon">⚠️</span>
        <p>Ingresa un monto de pensión válido</p>
      </div>`;
    return;
  }

  if (pensionActual >= PENSION_MINIMA_2026) {
    calcResult.innerHTML = `
      <div class="result-placeholder">
        <span class="result-icon">✅</span>
        <p>Tu pensión ya supera la pensión mínima garantizada de $${PENSION_MINIMA_2026.toLocaleString('es-MX')}. Contáctanos para revisar tu caso.</p>
      </div>`;
    return;
  }

  const diferencia  = PENSION_MINIMA_2026 - pensionActual;
  const retroactivo = diferencia * meses;
  const honorario   = retroactivo * HONORARIO_PCT;
  const neto        = retroactivo - honorario;

  calcResult.innerHTML = `
    <div class="result-content">
      <h3>📊 Estimado de tu retroactivo</h3>
      <div class="result-row">
        <span>Pensión mínima garantizada 2026</span>
        <span>$${PENSION_MINIMA_2026.toLocaleString('es-MX')}/mes</span>
      </div>
      <div class="result-row">
        <span>Tu pensión actual</span>
        <span>$${pensionActual.toLocaleString('es-MX')}/mes</span>
      </div>
      <div class="result-row">
        <span>Diferencia mensual</span>
        <span>$${diferencia.toLocaleString('es-MX')}</span>
      </div>
      <div class="result-row">
        <span>Duración de la demanda</span>
        <span>${meses} meses</span>
      </div>
      <div class="result-row highlight-row">
        <span>Retroactivo total (IMSS te paga)</span>
        <span class="result-big">$${retroactivo.toLocaleString('es-MX')}</span>
      </div>
      <div class="result-row" style="border-bottom:none; padding-top:0.5rem;">
        <span>Nuestro honorario (30%)</span>
        <span style="color:rgba(255,255,255,0.6);">−$${honorario.toLocaleString('es-MX')}</span>
      </div>
      <div class="result-row highlight-row" style="border-top:1px solid rgba(255,255,255,0.1); margin-top:0.25rem;">
        <span>Lo que tú recibes neto</span>
        <span class="result-big" style="color:#5cdd8b;">$${neto.toLocaleString('es-MX')}</span>
      </div>
      <p class="result-note">Estimación basada en la pensión mínima garantizada 2026. Los resultados reales dependen de cada caso.</p>
    </div>`;
}

calcBtn.addEventListener('click', calcular);
pensionInput.addEventListener('keydown', e => e.key === 'Enter' && calcular());
duracionInput.addEventListener('keydown', e => e.key === 'Enter' && calcular());

// ── Contact form ─────────────────────────────────────────
const form   = document.querySelector('.contact-form');
const status = form.querySelector('.form-status');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const name  = form.name.value.trim();
  const phone = form.phone.value.trim();

  if (!name || !phone) {
    showStatus('Por favor ingresa tu nombre y teléfono.', 'error');
    return;
  }

  const btn = form.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  await new Promise(r => setTimeout(r, 1200));

  showStatus('¡Consulta enviada! Te contactaremos en menos de 24 horas.', 'success');
  form.reset();
  btn.disabled = false;
  btn.textContent = 'Enviar consulta gratuita';
});

function showStatus(msg, type) {
  status.textContent = msg;
  status.className = 'form-status ' + type;
  setTimeout(() => { status.textContent = ''; status.className = 'form-status'; }, 6000);
}

// ── Active nav on scroll ──────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav-links a[href^="#"]');

const obs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => obs.observe(s));
