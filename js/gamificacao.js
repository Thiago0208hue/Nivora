// gamificacao.js — Etapa 4: XP, níveis e conquistas (gamificação moderada)
const NivoraGamification = {
  CONQUISTAS: [
    { id: 'xp100', texto: 'Primeiros 100 XP', check: (g, p, r) => g.xp >= 100 },
    { id: 'sequencia7', texto: '7 dias estudando', check: (g, p) => (p.sequenciaDias || 0) >= 7 },
    { id: 'questoes100', texto: '100 questões resolvidas', check: (g, p) => (p.questoesRespondidas || 0) >= 100 },
    { id: 'primeiraRedacao', texto: 'Primeira redação', check: (g, p, r) => r.length >= 1 }
  ],

  obter() {
    return NivoraStorage.get(NivoraStorage.KEYS.GAMIFICACAO, { xp: 0, conquistas: [] });
  },

  nivel(xp) {
    return Math.floor(xp / 100) + 1;
  },

  adicionarXP(qtd) {
    const g = this.obter();
    g.xp += qtd;
    NivoraStorage.set(NivoraStorage.KEYS.GAMIFICACAO, g);
    this.verificarConquistas();
  },

  verificarConquistas() {
    const g = this.obter();
    const progresso = NivoraStorage.get(NivoraStorage.KEYS.PROGRESSO, {});
    const redacoes = NivoraStorage.get(NivoraStorage.KEYS.REDACOES, []);
    let mudou = false;
    this.CONQUISTAS.forEach(c => {
      if (!g.conquistas.includes(c.id) && c.check(g, progresso, redacoes)) {
        g.conquistas.push(c.id);
        mudou = true;
      }
    });
    if (mudou) NivoraStorage.set(NivoraStorage.KEYS.GAMIFICACAO, g);
    return g;
  }
};
