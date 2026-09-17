// plano.js — Etapa 3: Meu Plano (cronograma automático, readapta com o desempenho)
(async function () {
  const app = document.getElementById('planoApp');
  const perfil = NivoraStorage.get(NivoraStorage.KEYS.PERFIL);

  if (!perfil) {
    app.innerHTML = `
      <h1 class="section-title">Você ainda não montou seu plano</h1>
      <p class="hint">Complete o onboarding para gerar seu cronograma.</p>
      <a href="onboarding.html" class="btn btn-primary">Montar meu plano</a>
    `;
    return;
  }

  await NivoraData.carregar();
  const desempenho = NivoraStorage.get(NivoraStorage.KEYS.DESEMPENHO, {});
  const desempenhoPorArea = NivoraPriorities.agregarDesempenhoPorArea(desempenho, NivoraData.assuntos || []);
  const prioridadesAtuais = NivoraPriorities.calcular(perfil.curso, perfil.dificuldades, perfil.nivel, perfil.tempoMin, desempenhoPorArea);

  function formatMin(min) {
    if (min >= 60) {
      const h = Math.floor(min / 60), m = min % 60;
      return m ? `${h}h${m}min` : `${h}h`;
    }
    return `${min}min`;
  }

  function gerarPlano(perfil, prioridades) {
    const areas = Object.values(prioridades).sort((a, b) => b.score - a.score);
    const pool = [];
    areas.forEach(a => { const reps = Math.max(1, Math.round(a.score)); for (let i = 0; i < reps; i++) pool.push(a); });

    const tempoMin = perfil.tempoMin || 120;
    const primaryMin = Math.round((tempoMin * 0.5) / 5) * 5;
    const secondaryMin = Math.round((tempoMin * 0.3) / 5) * 5;
    const revisaoMin = Math.max(10, tempoMin - primaryMin - secondaryMin);

    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias.map((dia, i) => {
      const primary = pool[i % pool.length];
      let secondary = pool[(i + 1) % pool.length];
      if (secondary.label === primary.label) secondary = pool[(i + 2) % pool.length];
      return {
        dia,
        blocos: [
          { area: primary.label, min: primaryMin },
          { area: secondary.label, min: secondaryMin },
          { area: 'Revisão', min: revisaoMin }
        ]
      };
    });
  }

  const plano = gerarPlano(perfil, prioridadesAtuais);

  app.innerHTML = `
    <h1 class="section-title">Meu Plano</h1>
    <p class="hint">Cronograma gerado com base no seu tempo diário e nas suas prioridades. Ele se adapta conforme seu desempenho evolui.</p>
    <div class="plano-grid">
      ${plano.map(d => `
        <div class="plano-card">
          <h3>${d.dia.toUpperCase()}</h3>
          ${d.blocos.map(b => `<p><strong>${formatMin(b.min)}</strong> ${b.area}</p>`).join('')}
        </div>
      `).join('')}
    </div>
  `;
})();
