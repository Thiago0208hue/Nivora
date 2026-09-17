// desempenho.js — Etapa 3: Meu Desempenho + sistema adaptativo
(function () {
  const app = document.getElementById('desempenhoApp');
  const desempenho = NivoraStorage.get(NivoraStorage.KEYS.DESEMPENHO, {});
  const progresso = NivoraStorage.get(NivoraStorage.KEYS.PROGRESSO, { horasEstudadas: 0, questoesRespondidas: 0, acertos: 0, sequenciaDias: 0 });

  const AREA_LABEL = { matematica: 'Matemática', natureza: 'Natureza', linguagens: 'Linguagens', humanas: 'Humanas', redacao: 'Redação' };

  async function render() {
    await NivoraData.carregar();

    if (!Object.keys(desempenho).length) {
      app.innerHTML = `
        <h1 class="section-title">Meu Desempenho</h1>
        <p class="hint">Você ainda não respondeu questões. Responda algumas em "Treinar" para ver seu desempenho aqui.</p>
        <a href="treinar.html" class="btn btn-primary">Ir para Treinar</a>
      `;
      return;
    }

    // Agrega por área a partir dos assuntos respondidos
    const porArea = {};
    NivoraData.assuntos.forEach(grupo => {
      grupo.assuntos.forEach(nome => {
        if (!desempenho[nome]) return;
        const a = porArea[grupo.area] || { respondidas: 0, acertos: 0 };
        a.respondidas += desempenho[nome].respondidas;
        a.acertos += desempenho[nome].acertos;
        porArea[grupo.area] = a;
      });
    });

    const erros = questoesErradas();
    const total = progresso.questoesRespondidas;
    const acertosTotal = progresso.acertos;
    const percTotal = total ? Math.round((acertosTotal / total) * 100) : 0;

    app.innerHTML = `
      <h1 class="section-title">Meu Desempenho</h1>

      <div class="dash-grid">
        <div class="dash-card"><span class="dash-label">Questões respondidas</span><strong>${total}</strong></div>
        <div class="dash-card"><span class="dash-label">Acertos</span><strong>${acertosTotal} (${percTotal}%)</strong></div>
        <div class="dash-card"><span class="dash-label">Horas estudadas</span><strong>${progresso.horasEstudadas}h</strong></div>
        <div class="dash-card"><span class="dash-label">Sequência de estudos</span><strong>${progresso.sequenciaDias} dias</strong></div>
      </div>

      <h2 class="section-title" style="margin-top:40px;">Evolução dos acertos</h2>
      ${renderGraficoHistorico()}

      <h2 class="section-title" style="margin-top:40px;">Desempenho por área</h2>
      <div class="assunto-lista">
        ${Object.entries(porArea).map(([area, d]) => {
          const perc = Math.round((d.acertos / d.respondidas) * 100);
          return `
            <div class="assunto-item">
              <div class="assunto-item-topo"><span>${AREA_LABEL[area] || area}</span><span class="hint">${perc}%</span></div>
              <div class="mini-bar"><div class="mini-bar-fill" style="width:${perc}%"></div></div>
            </div>`;
        }).join('')}
      </div>

      <h2 class="section-title" style="margin-top:40px;">O que estudar agora?</h2>
      ${renderRecomendacao(erros)}
    `;
  }

  function renderGraficoHistorico() {
    const historico = NivoraStorage.get(NivoraStorage.KEYS.HISTORICO, []);
    if (historico.length < 2) {
      return `<p class="hint">Responda questões em mais de uma sessão para ver seu gráfico de evolução.</p>`;
    }
    const w = 600, h = 180, pad = 24;
    const pontos = historico.map((s, i) => {
      const x = pad + (i * (w - pad * 2)) / (historico.length - 1);
      const y = pad + (h - pad * 2) * (1 - s.percentual / 100);
      return { x, y, s };
    });
    const linha = pontos.map(p => `${p.x},${p.y}`).join(' ');
    return `
      <svg viewBox="0 0 ${w} ${h}" class="grafico-evolucao" style="width:100%;height:auto;">
        <line x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" stroke="var(--border)" />
        <polyline points="${linha}" fill="none" stroke="var(--accent)" stroke-width="2" />
        ${pontos.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="var(--accent)"><title>${new Date(p.s.data).toLocaleDateString('pt-BR')} — ${p.s.percentual}%</title></circle>`).join('')}
      </svg>
      <p class="hint">Últimas ${historico.length} sessões de treino (${historico[0].percentual}% → ${historico[historico.length - 1].percentual}%)</p>
    `;
  }

  function questoesErradas() {
    // Assunto com pior taxa de acerto (mínimo 1 questão respondida)
    let pior = null;
    Object.entries(desempenho).forEach(([assunto, d]) => {
      if (!d.respondidas) return;
      const taxa = d.acertos / d.respondidas;
      if (!pior || taxa < pior.taxa) pior = { assunto, taxa, ...d };
    });
    return pior;
  }

  function renderRecomendacao(pior) {
    if (!pior || pior.taxa >= 0.7) {
      return `<p class="hint">Seu desempenho está equilibrado. Continue treinando para manter o ritmo.</p>`;
    }
    return `
      <div class="resultado-card">
        <p>Você está errando questões de <strong>${pior.assunto}</strong>.</p>
        <ol class="hint" style="padding-left:18px;">
          <li>Revisar a teoria de ${pior.assunto}.</li>
          <li>Resolver questões básicas do assunto.</li>
          <li>Resolver questões intermediárias.</li>
          <li>Fazer uma revisão.</li>
          <li>Refazer as questões que você errou.</li>
        </ol>
      </div>
    `;
  }

  render();
})();
