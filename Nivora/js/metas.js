// metas.js — Etapa 4: Metas
(function () {
  const SUGESTOES = [
    { id: 'sug-questoes', texto: 'Resolver 30 questões', tipo: 'questoes', alvo: 30 },
    { id: 'sug-horas', texto: 'Estudar 5 horas', tipo: 'horas', alvo: 5 },
    { id: 'sug-redacao', texto: 'Fazer uma redação', tipo: 'redacao', alvo: 1 },
    { id: 'sug-sequencia', texto: 'Estudar durante 7 dias seguidos', tipo: 'sequencia', alvo: 7 }
  ];

  function valorAtual(tipo) {
    if (tipo === 'questoes') return NivoraStorage.get(NivoraStorage.KEYS.PROGRESSO, {}).questoesRespondidas || 0;
    if (tipo === 'horas') return NivoraStorage.get(NivoraStorage.KEYS.PROGRESSO, {}).horasEstudadas || 0;
    if (tipo === 'redacao') return NivoraStorage.get(NivoraStorage.KEYS.REDACOES, []).length;
    if (tipo === 'sequencia') return NivoraStorage.get(NivoraStorage.KEYS.PROGRESSO, {}).sequenciaDias || 0;
    return null; // manual
  }

  function barra(texto, atual, alvo, extra = '') {
    const perc = Math.min(100, Math.round((atual / alvo) * 100));
    return `
      <div class="assunto-item">
        <div class="assunto-item-topo"><span>${texto}</span><span class="hint">${atual}/${alvo}${perc >= 100 ? ' ✅' : ''}</span></div>
        <div class="mini-bar"><div class="mini-bar-fill" style="width:${perc}%"></div></div>
        ${extra}
      </div>`;
  }

  function renderSugestoes() {
    document.getElementById('metasSugestoes').innerHTML = SUGESTOES.map(s =>
      barra(s.texto, valorAtual(s.tipo), s.alvo)
    ).join('');
  }

  function renderManuais() {
    const metas = NivoraStorage.get(NivoraStorage.KEYS.METAS, []);
    document.getElementById('metasLista').innerHTML = metas.map(m => barra(
      m.texto, m.atual, m.alvo,
      `<div style="margin-top:8px;display:flex;gap:8px;">
         <button class="btn btn-outline btn-sm" data-add="${m.id}">+1</button>
         <button class="btn btn-outline btn-sm" data-del="${m.id}">Remover</button>
       </div>`
    )).join('') || `<p class="hint">Nenhuma meta personalizada ainda.</p>`;

    document.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => {
      const metas = NivoraStorage.get(NivoraStorage.KEYS.METAS, []);
      const m = metas.find(x => x.id === btn.dataset.add);
      if (m && m.atual < m.alvo) {
        m.atual = Math.min(m.alvo, m.atual + 1);
        if (m.atual >= m.alvo) NivoraGamification.adicionarXP(15);
      }
      NivoraStorage.set(NivoraStorage.KEYS.METAS, metas);
      renderManuais();
    }));
    document.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', () => {
      const metas = NivoraStorage.get(NivoraStorage.KEYS.METAS, []).filter(x => x.id !== btn.dataset.del);
      NivoraStorage.set(NivoraStorage.KEYS.METAS, metas);
      renderManuais();
    }));
  }

  document.getElementById('btnAddMeta').addEventListener('click', () => {
    const texto = document.getElementById('novaMetaTexto').value.trim();
    const alvo = Number(document.getElementById('novaMetaAlvo').value);
    if (!texto || !alvo || alvo < 1) return;
    const metas = NivoraStorage.get(NivoraStorage.KEYS.METAS, []);
    metas.push({ id: 'meta-' + Date.now(), texto, alvo, atual: 0 });
    NivoraStorage.set(NivoraStorage.KEYS.METAS, metas);
    document.getElementById('novaMetaTexto').value = '';
    document.getElementById('novaMetaAlvo').value = '';
    renderManuais();
  });

  renderSugestoes();
  renderManuais();
})();
