// assuntos.js — Etapa 3: Assuntos do ENEM
(async function () {
  const app = document.getElementById('assuntosApp');
  const perfil = NivoraStorage.get(NivoraStorage.KEYS.PERFIL);
  const desempenho = NivoraStorage.get(NivoraStorage.KEYS.DESEMPENHO, {});
  let prioridades = perfil?.prioridades ?? null;

  function statusDe(nome) {
    const d = desempenho[nome];
    if (!d || !d.respondidas) return { status: 'Não iniciado', progresso: 0, taxa: null, questoes: 0 };
    const taxa = Math.round((d.acertos / d.respondidas) * 100);
    return { status: taxa >= 70 ? 'Dominado' : 'Em progresso', progresso: Math.min(100, d.respondidas * 5), taxa, questoes: d.respondidas };
  }

  function prioridadeDe(area) {
    return prioridades?.[area] ?? null;
  }

  async function render() {
    await NivoraData.carregar();
    if (perfil) {
      const desempenhoPorArea = NivoraPriorities.agregarDesempenhoPorArea(desempenho, NivoraData.assuntos || []);
      prioridades = NivoraPriorities.calcular(perfil.curso, perfil.dificuldades, perfil.nivel, perfil.tempoMin, desempenhoPorArea);
    }
    app.innerHTML = `
      <h1 class="section-title">Assuntos do ENEM</h1>
      ${NivoraData.assuntos.map(grupo => {
        const p = prioridadeDe(grupo.area);
        return `
        <section class="assunto-grupo">
          <h2>${p ? p.cor + ' ' : ''}${grupo.nome}</h2>
          <div class="assunto-lista">
            ${grupo.assuntos.map(nome => {
              const st = statusDe(nome);
              return `
                <div class="assunto-item">
                  <div class="assunto-item-topo">
                    <span>${p ? p.cor + ' ' : ''}${nome}</span>
                    <span class="hint">${st.status}${st.taxa !== null ? ` — ${st.taxa}%` : ''}</span>
                  </div>
                  <div class="mini-bar"><div class="mini-bar-fill" style="width:${st.progresso}%"></div></div>
                </div>`;
            }).join('')}
          </div>
        </section>`;
      }).join('')}
    `;
  }

  render();
})();
