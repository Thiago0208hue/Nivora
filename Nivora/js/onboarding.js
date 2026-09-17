// onboarding.js — Etapa 2: fluxo de personalização
(function () {
  const steps = [1, 2, 3, 4, 5, 6, 7, 8];
  let currentIndex = 0;
  const state = {
    curso: null, faculdade: null, ingresso: null, modalidade: null,
    tempoEstudo: null, tempoMin: null, nivel: null, dificuldades: [], meta: null, notaDesejada: null
  };

  const stepLabel = document.getElementById('stepLabel');
  const progressBar = document.getElementById('progressBar');
  const btnVoltar = document.getElementById('btnVoltar');
  const btnAvancar = document.getElementById('btnAvancar');
  const obActions = document.getElementById('obActions');

  function getStepEl(step) {
    return document.querySelector(`.ob-step[data-step="${step}"]`);
  }

  function renderLista(container, itens, campo, textoVazio) {
    container.innerHTML = '';
    if (!itens.length) {
      container.innerHTML = `<p class="hint">${textoVazio}</p>`;
      return;
    }
    itens.forEach(item => {
      const label = document.createElement('label');
      label.className = 'option-card';
      const selecionado = state[campo]?.id === item.id;
      if (selecionado) label.classList.add('selected');
      label.innerHTML = `<input type="radio" name="${campo}" value="${item.id}" ${selecionado ? 'checked' : ''}><span>${item.nome}</span>`;
      label.querySelector('input').addEventListener('change', () => {
        state[campo] = item;
        renderLista(container, itens, campo, textoVazio);
      });
      container.appendChild(label);
    });
  }

  async function init() {
    await NivoraData.carregar();
    renderLista(document.getElementById('listaCursos'), NivoraData.cursos, 'curso', 'Nenhum curso encontrado.');
    renderLista(document.getElementById('listaFaculdades'), NivoraData.universidades, 'faculdade', 'Nenhuma faculdade encontrada.');

    document.getElementById('buscaCurso').addEventListener('input', e => {
      const termo = e.target.value.toLowerCase();
      const filtrados = NivoraData.cursos.filter(c => c.nome.toLowerCase().includes(termo));
      renderLista(document.getElementById('listaCursos'), filtrados, 'curso', 'Nenhum curso encontrado.');
    });
    document.getElementById('buscaFaculdade').addEventListener('input', e => {
      const termo = e.target.value.toLowerCase();
      const filtrados = NivoraData.universidades.filter(u => u.nome.toLowerCase().includes(termo));
      renderLista(document.getElementById('listaFaculdades'), filtrados, 'faculdade', 'Nenhuma faculdade encontrada.');
    });

    ['ingresso', 'modalidade', 'nivel', 'meta'].forEach(campo => {
      document.querySelectorAll(`input[name="${campo}"]`).forEach(input => {
        input.addEventListener('change', () => { state[campo] = input.value; marcarSelecionado(campo); });
      });
    });
    document.querySelectorAll('input[name="tempoEstudo"]').forEach(input => {
      input.addEventListener('change', () => {
        state.tempoEstudo = input.value;
        state.tempoMin = Number(input.dataset.min);
        marcarSelecionado('tempoEstudo');
      });
    });
    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        state.dificuldades = Array.from(document.querySelectorAll('[data-field="dificuldades"] input:checked')).map(i => i.value);
        input.closest('.option-card').classList.toggle('selected', input.checked);
      });
    });
    document.getElementById('notaDesejada').addEventListener('input', e => {
      state.notaDesejada = e.target.value ? Number(e.target.value) : null;
    });

    render();
  }

  function marcarSelecionado(campo) {
    document.querySelectorAll(`[data-field="${campo}"] .option-card`).forEach(card => {
      card.classList.toggle('selected', card.querySelector('input').checked);
    });
  }

  function validarEtapaAtual() {
    const step = steps[currentIndex];
    const mapa = {
      1: () => !!state.curso,
      2: () => !!state.faculdade,
      3: () => !!state.ingresso,
      4: () => !!state.modalidade,
      5: () => !!state.tempoEstudo,
      6: () => !!state.nivel,
      7: () => true,
      8: () => !!state.meta
    };
    return mapa[step]();
  }

  function render() {
    steps.forEach(s => getStepEl(s).hidden = true);
    getStepEl(steps[currentIndex]).hidden = false;
    stepLabel.textContent = `Etapa ${currentIndex + 1} de ${steps.length}`;
    progressBar.style.width = `${((currentIndex + 1) / steps.length) * 100}%`;
    btnVoltar.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
    btnAvancar.textContent = currentIndex === steps.length - 1 ? 'Ver resultado' : 'Avançar';
  }

  btnAvancar.addEventListener('click', () => {
    if (!validarEtapaAtual()) {
      btnAvancar.classList.add('shake');
      setTimeout(() => btnAvancar.classList.remove('shake'), 300);
      return;
    }
    if (currentIndex === steps.length - 1) {
      finalizar();
    } else {
      currentIndex++;
      render();
    }
  });

  btnVoltar.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; render(); }
  });

  function finalizar() {
    const prioridades = NivoraPriorities.calcular(state.curso, state.dificuldades, state.nivel, state.tempoMin);
    state.prioridades = prioridades;
    state.criadoEm = new Date().toISOString();
    NivoraStorage.set(NivoraStorage.KEYS.PERFIL, state);

    steps.forEach(s => getStepEl(s).hidden = true);
    obActions.hidden = true;
    stepLabel.textContent = '';
    progressBar.style.width = '100%';

    document.getElementById('resultadoResumo').innerHTML = `
      <p>🎓 <strong>Curso:</strong> ${state.curso.nome}</p>
      <p>🏫 <strong>Faculdade:</strong> ${state.faculdade.nome}</p>
      <p>🎯 <strong>Forma de ingresso:</strong> ${state.ingresso}</p>
      <p>⏱️ <strong>Tempo diário:</strong> ${state.tempoEstudo}</p>
      <p>📈 <strong>Nível:</strong> ${state.nivel}</p>
    `;
    const ordem = Object.values(prioridades).sort((a, b) => b.score - a.score);
    document.getElementById('resultadoPrioridades').innerHTML = ordem.map(p => `
      <div class="prioridade-item">
        <span>${p.cor} ${p.label} — ${p.nivel}</span>
        <p class="hint">${p.motivo}</p>
      </div>
    `).join('');

    getStepEl('resultado').hidden = false;
  }

  init();
})();
