// priorities.js — calcula prioridades de estudo (recomendação do Nivora, não pesos oficiais)
const NivoraPriorities = {
  AREAS: {
    matematica: 'Matemática',
    natureza: 'Ciências da Natureza',
    redacao: 'Redação',
    linguagens: 'Linguagens',
    humanas: 'Ciências Humanas'
  },

  MAPA_DIFICULDADE: {
    'Matemática': 'matematica',
    'Física': 'natureza',
    'Química': 'natureza',
    'Biologia': 'natureza',
    'Português': 'linguagens',
    'Literatura': 'linguagens',
    'Inglês/Espanhol': 'linguagens',
    'Redação': 'redacao',
    'História': 'humanas',
    'Geografia': 'humanas',
    'Filosofia': 'humanas',
    'Sociologia': 'humanas'
  },

  BONUS_NIVEL: { 'Iniciante': 1, 'Básico': 0.5, 'Intermediário': 0, 'Avançado': -0.5 },

  // Agrega o desempenho (por assunto) em desempenho por área, usando o mapeamento de assuntos.json
  agregarDesempenhoPorArea(desempenho = {}, assuntosData = []) {
    const porArea = {};
    assuntosData.forEach(grupo => {
      grupo.assuntos.forEach(nome => {
        const d = desempenho[nome];
        if (!d || !d.respondidas) return;
        const a = porArea[grupo.area] || { respondidas: 0, acertos: 0 };
        a.respondidas += d.respondidas;
        a.acertos += d.acertos;
        porArea[grupo.area] = a;
      });
    });
    return porArea;
  },

  calcular(curso, dificuldades = [], nivel = 'Intermediário', tempoMin = 120, desempenhoPorArea = {}) {
    const areasComDificuldade = new Set(
      dificuldades.map(d => this.MAPA_DIFICULDADE[d]).filter(Boolean)
    );
    const nivelBonus = this.BONUS_NIVEL[nivel] ?? 0;

    // Pouco tempo disponível: focar só no essencial (limiares mais altos).
    // Muito tempo disponível: dá para cobrir mais áreas (limiares mais baixos).
    const ajusteTempo = tempoMin < 60 ? 1 : tempoMin >= 240 ? -1 : 0;
    const limiarAlta = 6 + ajusteTempo;
    const limiarMedia = 3.5 + ajusteTempo;

    const resultado = {};
    for (const area of Object.keys(this.AREAS)) {
      const base = curso?.pesos?.[area] ?? 3;
      const temDificuldade = areasComDificuldade.has(area);

      const desempenhoArea = desempenhoPorArea[area];
      let desempenhoBonus = 0;
      let motivoDesempenho = null;
      if (desempenhoArea && desempenhoArea.respondidas >= 3) {
        const taxa = desempenhoArea.acertos / desempenhoArea.respondidas;
        if (taxa < 0.5) { desempenhoBonus = 2; motivoDesempenho = 'Seu aproveitamento nas questões dessa área está baixo.'; }
        else if (taxa < 0.7) { desempenhoBonus = 1; motivoDesempenho = 'Seu aproveitamento nas questões dessa área pode melhorar.'; }
        else if (taxa >= 0.9) { desempenhoBonus = -1; motivoDesempenho = 'Você está indo muito bem nas questões dessa área.'; }
      }

      const score = base + (temDificuldade ? 2 : 0) + nivelBonus + desempenhoBonus;

      let nivelPrioridade, cor;
      if (score >= limiarAlta) { nivelPrioridade = 'Alta'; cor = '🔴'; }
      else if (score >= limiarMedia) { nivelPrioridade = 'Média'; cor = '🟡'; }
      else { nivelPrioridade = 'Baixa'; cor = '🟢'; }

      let motivo;
      if (motivoDesempenho) motivo = motivoDesempenho;
      else if (temDificuldade && base >= 4) motivo = 'Área importante para o curso e onde você relatou mais dificuldade.';
      else if (temDificuldade) motivo = 'Você relatou dificuldade nessa área.';
      else if (base >= 4) motivo = 'Área de peso alto para o curso escolhido.';
      else motivo = 'Área com menor prioridade no momento.';

      resultado[area] = { label: this.AREAS[area], score, nivel: nivelPrioridade, cor, motivo };
    }
    return resultado;
  }
};
