// treinar.js — Etapa 3: sistema de questões
(function () {
  const quizArea = document.getElementById('quizArea');
  let questoesAtuais = [];
  let inicio = null;
  let corrigido = false;

  document.getElementById('btnComecar').addEventListener('click', iniciar);
  document.getElementById('filtroArea').addEventListener('change', popularMateriaAssunto);
  document.getElementById('filtroMateria').addEventListener('change', popularAssunto);
  NivoraData.carregar().then(popularFiltros);

  function popularFiltros() {
    popularMateriaAssunto();
    const anos = [...new Set(NivoraData.questoes.map(q => q.ano).filter(Boolean))].sort();
    if (anos.length) {
      const sel = document.getElementById('filtroAno');
      sel.style.display = '';
      anos.forEach(a => sel.insertAdjacentHTML('beforeend', `<option value="${a}">${a}</option>`));
    }
  }

  function popularMateriaAssunto() {
    const area = document.getElementById('filtroArea').value;
    const materias = [...new Set(NivoraData.questoes.filter(q => !area || q.area === area).map(q => q.materia))].sort();
    const sel = document.getElementById('filtroMateria');
    sel.innerHTML = `<option value="">Todas as matérias</option>` + materias.map(m => `<option value="${m}">${m}</option>`).join('');
    popularAssunto();
  }

  function popularAssunto() {
    const area = document.getElementById('filtroArea').value;
    const materia = document.getElementById('filtroMateria').value;
    const assuntos = [...new Set(NivoraData.questoes
      .filter(q => !area || q.area === area)
      .filter(q => !materia || q.materia === materia)
      .map(q => q.assunto))].sort();
    const sel = document.getElementById('filtroAssunto');
    sel.innerHTML = `<option value="">Todos os assuntos</option>` + assuntos.map(a => `<option value="${a}">${a}</option>`).join('');
  }

  async function iniciar() {
    await NivoraData.carregar();
    const area = document.getElementById('filtroArea').value;
    const materia = document.getElementById('filtroMateria').value;
    const assunto = document.getElementById('filtroAssunto').value;
    const dificuldade = document.getElementById('filtroDificuldade').value;
    const ano = document.getElementById('filtroAno').value;
    const qtd = Number(document.getElementById('filtroQuantidade').value);

    questoesAtuais = NivoraData.questoes
      .filter(q => !area || q.area === area)
      .filter(q => !materia || q.materia === materia)
      .filter(q => !assunto || q.assunto === assunto)
      .filter(q => !dificuldade || q.dificuldade === dificuldade)
      .filter(q => !ano || String(q.ano) === ano)
      .slice(0, qtd);

    corrigido = false;
    inicio = Date.now();
    renderQuiz();
  }

  function renderQuiz() {
    if (!questoesAtuais.length) {
      quizArea.innerHTML = `<p class="hint">Nenhuma questão encontrada para esse filtro.</p>`;
      return;
    }
    quizArea.innerHTML = questoesAtuais.map((q, i) => `
      <div class="questao-card" data-id="${q.id}">
        <p class="questao-meta">${q.materia} • ${q.assunto} • ${q.dificuldade}</p>
        <p class="questao-enunciado"><strong>${i + 1}.</strong> ${q.enunciado}</p>
        <div class="alternativas">
          ${q.alternativas.map(alt => `
            <label class="option-card">
              <input type="radio" name="q${q.id}" value="${alt.id}">
              <span>${alt.texto}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('') + `<button class="btn btn-primary" id="btnCorrigir">Corrigir</button><div id="resultado"></div>`;

    document.getElementById('btnCorrigir').addEventListener('click', corrigir);
  }

  function corrigir() {
    if (corrigido) return;
    corrigido = true;
    let acertos = 0;
    const erradasPorAssunto = {};
    const desempenho = NivoraStorage.get(NivoraStorage.KEYS.DESEMPENHO, {});

    questoesAtuais.forEach(q => {
      const marcada = document.querySelector(`input[name="q${q.id}"]:checked`)?.value;
      const card = document.querySelector(`.questao-card[data-id="${q.id}"]`);
      const acertou = marcada === q.correta;
      if (acertou) acertos++;
      else erradasPorAssunto[q.assunto] = (erradasPorAssunto[q.assunto] || 0) + 1;

      card.querySelectorAll('.option-card').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true;
        if (input.value === q.correta) label.classList.add('correta');
        else if (input.value === marcada) label.classList.add('errada');
      });

      const d = desempenho[q.assunto] || { respondidas: 0, acertos: 0 };
      d.respondidas++;
      if (acertou) d.acertos++;
      desempenho[q.assunto] = d;
    });

    NivoraStorage.set(NivoraStorage.KEYS.DESEMPENHO, desempenho);
    NivoraGamification.adicionarXP(acertos * 5);

    const total = questoesAtuais.length;
    const percentual = Math.round((acertos / total) * 100);
    const tempoSeg = Math.round((Date.now() - inicio) / 1000);

    const progresso = NivoraStorage.get(NivoraStorage.KEYS.PROGRESSO, { horasEstudadas: 0, questoesRespondidas: 0, acertos: 0, sequenciaDias: 0 });
    progresso.questoesRespondidas += total;
    progresso.acertos += acertos;
    progresso.horasEstudadas = Math.round((progresso.horasEstudadas + tempoSeg / 3600) * 10) / 10;
    const hoje = new Date().toDateString();
    if (progresso.ultimoDia !== hoje) { progresso.sequenciaDias = (progresso.sequenciaDias || 0) + 1; progresso.ultimoDia = hoje; }
    NivoraStorage.set(NivoraStorage.KEYS.PROGRESSO, progresso);

    const historico = NivoraStorage.get(NivoraStorage.KEYS.HISTORICO, []);
    historico.push({ data: new Date().toISOString(), percentual, total, acertos });
    NivoraStorage.set(NivoraStorage.KEYS.HISTORICO, historico.slice(-30));

    const assuntosDificeis = Object.entries(erradasPorAssunto).sort((a, b) => b[1] - a[1]).map(([a]) => a);

    document.getElementById('resultado').innerHTML = `
      <div class="resultado-card">
        <p><strong>Acertos:</strong> ${acertos}/${total} (${percentual}%)</p>
        <p><strong>Tempo:</strong> ${tempoSeg}s</p>
        ${assuntosDificeis.length ? `<p><strong>Assuntos com mais erros:</strong> ${assuntosDificeis.join(', ')}</p>` : ''}
      </div>
    `;
  }
})();
