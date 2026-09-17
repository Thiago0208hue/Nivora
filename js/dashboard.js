// dashboard.js — Etapa 3: dashboard personalizado
(async function () {
  const app = document.getElementById('dashboardApp');
  const perfil = NivoraStorage.get(NivoraStorage.KEYS.PERFIL);

  if (!perfil) {
    app.innerHTML = `
      <h1 class="section-title">Você ainda não montou seu plano</h1>
      <p class="hint">Complete o onboarding para ver seu dashboard personalizado.</p>
      <a href="onboarding.html" class="btn btn-primary">Montar meu plano</a>
    `;
    return;
  }

  await NivoraData.carregar();

  const progresso = NivoraStorage.get(NivoraStorage.KEYS.PROGRESSO, {
    horasEstudadas: 0, questoesRespondidas: 0, acertos: 0, sequenciaDias: 0
  });
  const desempenho = NivoraStorage.get(NivoraStorage.KEYS.DESEMPENHO, {});
  const percAcerto = progresso.questoesRespondidas
    ? Math.round((progresso.acertos / progresso.questoesRespondidas) * 100)
    : 0;
  const progressoGeral = Math.round((
    percAcerto +
    Math.min(100, progresso.sequenciaDias * 10) +
    Math.min(100, progresso.questoesRespondidas)
  ) / 3);

  const desempenhoPorArea = NivoraPriorities.agregarDesempenhoPorArea(desempenho, NivoraData.assuntos || []);
  const prioridadesAtuais = NivoraPriorities.calcular(perfil.curso, perfil.dificuldades, perfil.nivel, perfil.tempoMin, desempenhoPorArea);
  const ordem = Object.values(prioridadesAtuais).sort((a, b) => b.score - a.score);
  const gam = NivoraGamification.verificarConquistas();
  const nivel = NivoraGamification.nivel(gam.xp);
  const xpNivelAtual = gam.xp % 100;
  const nomesConquistas = { xp100: 'Primeiros 100 XP', sequencia7: '7 dias estudando', questoes100: '100 questões resolvidas', primeiraRedacao: 'Primeira redação' };

  app.innerHTML = `
    <h1 class="section-title">Olá! Este é o seu caminho até a faculdade.</h1>

    <div class="dash-grid">
      <div class="dash-card"><span class="dash-label">Curso</span><strong>${perfil.curso.nome}</strong></div>
      <div class="dash-card"><span class="dash-label">Faculdade</span><strong>${perfil.faculdade.nome}</strong></div>
      <div class="dash-card"><span class="dash-label">Forma de ingresso</span><strong>${perfil.ingresso}</strong></div>
      <div class="dash-card"><span class="dash-label"> </span><a href="objetivo.html" class="btn btn-outline btn-sm">Conheça seu objetivo</a></div>
      <div class="dash-card"><span class="dash-label">Meta</span><strong>${perfil.meta}</strong></div>
      <div class="dash-card dash-card-wide">
        <span class="dash-label">Progresso geral</span>
        <div class="mini-bar" style="margin-top:6px;"><div class="mini-bar-fill" style="width:${progressoGeral}%"></div></div>
        <strong style="font-size:.9rem;">${progressoGeral}%</strong>
      </div>
      <div class="dash-card"><span class="dash-label">Horas estudadas</span><strong>${progresso.horasEstudadas}h</strong></div>
      <div class="dash-card"><span class="dash-label">Questões respondidas</span><strong>${progresso.questoesRespondidas}</strong></div>
      <div class="dash-card"><span class="dash-label">Acertos</span><strong>${percAcerto}%</strong></div>
      <div class="dash-card"><span class="dash-label">Sequência de estudos</span><strong>${progresso.sequenciaDias} dias</strong></div>
      <div class="dash-card"><span class="dash-label">Nível</span><strong>Nível ${nivel} — ${xpNivelAtual}/100 XP</strong></div>
    </div>

    <h2 class="section-title" style="margin-top:40px;">Sua estratégia</h2>
    <div class="resultado-prioridades">
      ${ordem.map(p => `
        <div class="prioridade-item">
          <span>${p.cor} ${p.label} — ${p.nivel}</span>
          <p class="hint">${p.motivo}</p>
        </div>
      `).join('')}
    </div>

    <h2 class="section-title" style="margin-top:40px;">Conquistas</h2>
    <div class="metas-lista">
      ${gam.conquistas.length
        ? gam.conquistas.map(id => `<div class="assunto-item">🏆 ${nomesConquistas[id] || id}</div>`).join('')
        : `<p class="hint">Nenhuma conquista ainda. Continue estudando!</p>`}
    </div>
  `;
})();
