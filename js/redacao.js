// redacao.js — Etapa 4: Redação
(function () {
  const TEMAS = [
    'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
    'O estigma associado às doenças mentais na sociedade brasileira',
    'Desafios para a formação educacional de surdos no Brasil',
    'Caminhos para combater a desinformação no ambiente digital',
    'O desafio de reduzir as desigualdades regionais no Brasil'
  ];

  const temaAtual = document.getElementById('temaAtual');
  const editor = document.getElementById('editorRedacao');
  const contador = document.getElementById('contadorPalavras');

  function sortearTema() {
    temaAtual.textContent = TEMAS[Math.floor(Math.random() * TEMAS.length)];
  }
  sortearTema();
  document.getElementById('btnNovoTema').addEventListener('click', sortearTema);

  editor.addEventListener('input', () => {
    const palavras = editor.value.trim().split(/\s+/).filter(Boolean).length;
    contador.textContent = `${palavras} palavras`;
  });

  document.getElementById('btnAvaliar').addEventListener('click', () => {
    const texto = editor.value.trim();
    const palavras = texto.split(/\s+/).filter(Boolean).length;
    const paragrafos = texto.split(/\n+/).filter(p => p.trim().length > 0).length;
    const competenciasMarcadas = document.querySelectorAll('#checklistCompetencias input:checked').length;

    let pontos = 0;
    const obs = [];

    if (palavras >= 200 && palavras <= 400) { pontos += 40; }
    else if (palavras > 0) { obs.push('O ideal é uma redação entre 200 e 400 palavras.'); pontos += 15; }

    if (paragrafos >= 4) { pontos += 30; }
    else { obs.push('Tente organizar o texto em pelo menos 4 parágrafos (introdução, 2 de desenvolvimento, conclusão).'); pontos += 10; }

    pontos += competenciasMarcadas * 6; // até 30 pontos com as 5 competências

    pontos = Math.min(100, pontos);

    const redacoes = NivoraStorage.get(NivoraStorage.KEYS.REDACOES, []);
    redacoes.push({ tema: temaAtual.textContent, palavras, pontos, data: new Date().toISOString() });
    NivoraStorage.set(NivoraStorage.KEYS.REDACOES, redacoes);
    NivoraGamification.adicionarXP(10);

    document.getElementById('avaliacaoResultado').innerHTML = `
      <div class="resultado-card" style="margin-top:16px;">
        <p><strong>Pontuação estimada:</strong> ${pontos}/100</p>
        ${obs.map(o => `<p class="hint">${o}</p>`).join('')}
        <p class="hint" style="margin-top:8px;">Esta é uma avaliação educacional automática do Nivora, não uma correção oficial do ENEM.</p>
      </div>
    `;
  });
})();
