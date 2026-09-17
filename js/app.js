// app.js — Etapa 1: navegação e tema
(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  // Tema
  const saved = NivoraStorage.get(NivoraStorage.KEYS.THEME, 'light');
  applyTheme(saved);

  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    NivoraStorage.set(NivoraStorage.KEYS.THEME, next);
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.textContent = '☀️';
    } else {
      root.removeAttribute('data-theme');
      if (themeToggle) themeToggle.textContent = '🌙';
    }
  }

  // Menu mobile
  menuToggle?.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
})();
