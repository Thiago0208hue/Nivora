// storage.js — camada única de acesso ao localStorage do Nivora
const NivoraStorage = {
  KEYS: {
    THEME: 'nivora_theme',
    PERFIL: 'nivora_perfil',
    PROGRESSO: 'nivora_progresso',
    DESEMPENHO: 'nivora_desempenho',
    REDACOES: 'nivora_redacoes',
    METAS: 'nivora_metas',
    GAMIFICACAO: 'nivora_gamificacao',
    HISTORICO: 'nivora_historico'
  },
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
