// data.js — ponto único de acesso aos dados JSON do Nivora
const NivoraData = {
  cursos: [],
  universidades: [],
  assuntos: [],
  questoes: [],
  fontes: [],
  carregado: false,

  async carregar() {
    if (this.carregado) return;
    const [cursosRes, univRes, assuntosRes, questoesRes, fontesRes] = await Promise.all([
      fetch('data/cursos.json'),
      fetch('data/universidades.json'),
      fetch('data/assuntos.json'),
      fetch('data/questoes.json'),
      fetch('data/fontes.json')
    ]);
    this.cursos = await cursosRes.json();
    this.universidades = await univRes.json();
    this.assuntos = await assuntosRes.json();
    this.questoes = await questoesRes.json();
    this.fontes = await fontesRes.json();
    this.carregado = true;
  }
};
