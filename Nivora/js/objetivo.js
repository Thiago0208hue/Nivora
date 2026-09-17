// objetivo.js — Etapa extra: Conheça seu objetivo
(async function () {
  const app = document.getElementById('objetivoApp');
  const perfil = NivoraStorage.get(NivoraStorage.KEYS.PERFIL);

  if (!perfil) {
    app.innerHTML = `<p class="hint">Monte seu plano primeiro para ver essa página.</p><a href="onboarding.html" class="btn btn-primary">Montar meu plano</a>`;
    return;
  }

  await NivoraData.carregar();
  const fontesFaculdade = NivoraData.fontes.filter(f => f.faculdadeId === perfil.faculdade.id);

  const LINKS_OFICIAIS = {
    'SISU': 'https://sisu.mec.gov.br',
    'ProUni': 'https://prouniportal.mec.gov.br',
    'FIES': 'https://sisfies.mec.gov.br'
  };
  const linkOficial = LINKS_OFICIAIS[perfil.ingresso]
    || `https://www.google.com/search?q=${encodeURIComponent(perfil.faculdade.nome + ' vestibular edital ' + perfil.curso.nome)}`;

  const CAMPOS = ['Processo seletivo', 'Pesos das provas', 'Notas de referência', 'Número de vagas', 'Modalidades de concorrência'];

  app.innerHTML = `
    <h1 class="section-title">Conheça seu objetivo</h1>
    <div class="resultado-card">
      <p>🎓 <strong>Curso:</strong> ${perfil.curso.nome}</p>
      <p>🏫 <strong>Faculdade:</strong> ${perfil.faculdade.nome}</p>
      <p>🎯 <strong>Forma de ingresso:</strong> ${perfil.ingresso}</p>
    </div>

    <div class="assunto-lista" style="margin-top:20px;">
      ${CAMPOS.map(c => {
        const fonte = fontesFaculdade.find(f => f.campo === c);
        if (fonte) {
          return `<div class="assunto-item">
            <div class="assunto-item-topo"><span>${c}</span> <span class="hint">✅ Informação oficial</span></div>
            <p style="margin:6px 0 0;">${fonte.informacao}</p>
            <p class="hint" style="margin:4px 0 0;">Fonte: ${fonte.fonte} • Atualizado em: ${fonte.dataAtualizacao} • <a href="${fonte.link}" target="_blank" rel="noopener">link oficial</a></p>
          </div>`;
        }
        return `<div class="assunto-item">
          <div class="assunto-item-topo"><span>${c}</span> <span class="hint">Recomendação Nivora</span></div>
          <p class="hint" style="margin:6px 0 0;">Consulte o edital mais recente da instituição — o Nivora não informa dados oficiais que podem mudar a cada processo seletivo.</p>
        </div>`;
      }).join('')}
    </div>

    <a href="${linkOficial}" target="_blank" rel="noopener" class="btn btn-primary" style="margin-top:24px;">Ver informações oficiais</a>
    <p class="hint" style="margin-top:12px;">As prioridades e o cronograma mostrados no Nivora são recomendações próprias, não pesos ou regras oficiais do processo seletivo.</p>
  `;
})();
