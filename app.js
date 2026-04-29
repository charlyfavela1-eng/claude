// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Contact form — simulated submit
const form = document.querySelector('.contact-form');
const status = form.querySelector('.form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    showStatus('Por favor completa todos los campos.', 'error');
    return;
  }

  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando…';

  // Simulate async request
  await new Promise(r => setTimeout(r, 1200));

  showStatus('¡Mensaje enviado con éxito! Me pondré en contacto pronto.', 'success');
  form.reset();
  submitBtn.disabled = false;
  submitBtn.textContent = 'Enviar mensaje';
});

function showStatus(msg, type) {
  status.textContent = msg;
  status.className = 'form-status ' + type;
  setTimeout(() => { status.textContent = ''; status.className = 'form-status'; }, 5000);
}

// Smooth active-link highlight on scroll
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));
