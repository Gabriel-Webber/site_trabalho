/* ==========================================================
   servicos/sessao-servico.js
   Controla QUEM está usando o site: o intérprete ou a empresa/RH.

   Não há login de verdade (sem senha, sem servidor). O "tipo de
   acesso" escolhido na tela de cadastro é gravado no localStorage
   e usado para:
   - montar o menu certo (ver componentes/layout.js);
   - bloquear páginas que não pertencem àquele perfil
     (ver componentes/layout.js -> exigirTipo).

   Depende de: App.Armazenamento.
   ========================================================== */

App.SessaoServico = (function () {
  const A = App.Armazenamento;

  // Tipos de acesso aceitos. Qualquer outro valor é tratado como "sem sessão".
  const TIPOS = { INTERPRETE: "interprete", EMPRESA: "empresa" };

  /**
   * Lê o tipo de acesso atual.
   * @returns {string|null} "interprete", "empresa" ou null (ninguém escolheu ainda)
   */
  function obterTipo() {
    const tipo = A.ler(A.CHAVES.SESSAO, null);
    // Valida o valor: se o localStorage tiver algo estranho, devolve null.
    return tipo === TIPOS.INTERPRETE || tipo === TIPOS.EMPRESA ? tipo : null;
  }

  /**
   * Grava o tipo de acesso escolhido na tela de cadastro.
   * @param {string} tipo "interprete" ou "empresa"
   * @returns {boolean} true se gravou
   */
  function definirTipo(tipo) {
    if (tipo !== TIPOS.INTERPRETE && tipo !== TIPOS.EMPRESA) return false;
    return A.salvar(A.CHAVES.SESSAO, tipo);
  }

  /**
   * Encerra a sessão ("Sair"): apaga só o tipo de acesso.
   * Os dados (perfil, empresa, vagas, candidaturas) continuam salvos.
   */
  function sair() {
    A.remover(A.CHAVES.SESSAO);
  }

  /**
   * Atalho: true quando quem está usando é o intérprete.
   * @returns {boolean}
   */
  function ehInterprete() {
    return obterTipo() === TIPOS.INTERPRETE;
  }

  /**
   * Atalho: true quando quem está usando é a empresa/RH.
   * @returns {boolean}
   */
  function ehEmpresa() {
    return obterTipo() === TIPOS.EMPRESA;
  }

  // Interface pública do módulo.
  return {
    TIPOS: TIPOS,
    obterTipo: obterTipo,
    definirTipo: definirTipo,
    sair: sair,
    ehInterprete: ehInterprete,
    ehEmpresa: ehEmpresa
  };
})();
