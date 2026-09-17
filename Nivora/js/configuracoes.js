// configuracoes.js — Etapa 5: Configurações
(function () {
  document.getElementById('btnTemaConfig').addEventListener('click', () => {
    document.getElementById('themeToggle').click();
  });

  const perfil = NivoraStorage.get(NivoraStorage.KEYS.PERFIL);
  document.getElementById('perfilResumo').innerHTML = perfil ? `
    <p>🎓 <strong>Curso:</strong> ${perfil.curso.nome}</p>
    <p>🏫 <strong>Faculdade:</strong> ${perfil.faculdade.nome}</p>
    <p>🎯 <strong>Meta:</strong> ${perfil.meta}</p>
  ` : `<p class="hint">Nenhum perfil salvo ainda.</p>`;

  document.getElementById('btnResetar').addEventListener('click', () => {
    if (!confirm('Isso vai apagar todo o seu progresso salvo neste navegador. Deseja continuar?')) return;
    Object.values(NivoraStorage.KEYS).forEach(key => {
      if (key !== NivoraStorage.KEYS.THEME) localStorage.removeItem(key);
    });
    window.location.href = 'index.html';
  });
})();
