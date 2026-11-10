/* ==========================================================
   servicos/candidatura-servico.js
   Regras de negócio das CANDIDATURAS do intérprete.

   Por que guardar uma "cópia" dos dados da vaga?
   Cada candidatura grava o título, a empresa e a localização da vaga
   no momento em que foi enviada. Assim, a lista de candidaturas
   continua correta mesmo que a vaga seja alterada ou removida depois
   (no sistema real, isso evita depender de um registro que pode sumir).

   Depende de: App.Armazenamento e App.ETAPAS_CANDIDATURA.
   ========================================================== */

App.CandidaturaServico = (function () {
  const A = App.Armazenamento;

  /**
   * Lista todas as candidaturas salvas neste navegador,
   * da mais recente para a mais antiga.
   * @returns {object[]}
   */
  function listar() {
    return A.ler(A.CHAVES.CANDIDATURAS, []);
  }

  /**
   * Lista as candidaturas de UMA vaga (usado pela empresa para ver
   * quantos intérpretes se candidataram a cada vaga publicada).
   * @param {string} vagaId
   * @returns {object[]}
   */
  function listarPorVaga(vagaId) {
    return listar().filter(function (c) { return c.vagaId === vagaId; });
  }

  /**
   * Verifica se o intérprete já se candidatou a uma vaga.
   * Usado para desabilitar o botão "Candidatar-se" e evitar duplicidade.
   * @param {string} vagaId
   * @returns {boolean}
   */
  function jaCandidatou(vagaId) {
    // some() devolve true assim que encontra a primeira candidatura com o id.
    return listar().some(function (c) { return c.vagaId === vagaId; });
  }

  /**
   * Cria uma candidatura com o status inicial "enviada".
   * @param {object} vaga a vaga escolhida (objeto completo)
   * @returns {boolean} true se criou; false se já existia (evita duplicidade)
   */
  function candidatar(vaga) {
    if (jaCandidatou(vaga.id)) return false;
    const candidaturas = listar();
    candidaturas.unshift({          // unshift = a nova candidatura vai para o topo
      vagaId: vaga.id,
      titulo: vaga.titulo,          // cópia dos dados da vaga (ver comentário no topo)
      empresa: vaga.empresa,
      localizacao: vaga.localizacao,
      status: "enviada",            // primeiro id de App.ETAPAS_CANDIDATURA
      data: new Date().toISOString()
    });
    A.salvar(A.CHAVES.CANDIDATURAS, candidaturas);
    return true;
  }

  /**
   * Avança o status de uma candidatura para a próxima etapa.
   * Recurso apenas DEMONSTRATIVO: no sistema real quem muda o status
   * é a empresa, não o candidato.
   * @param {string} vagaId id da vaga cuja candidatura será avançada
   */
  function avancarStatus(vagaId) {
    // Lista de ids na ordem do fluxo: ["enviada", "analise", "entrevista", "finalizada"]
    const ids = App.ETAPAS_CANDIDATURA.map(function (e) { return e.id; });
    const candidaturas = listar();
    candidaturas.forEach(function (c) {
      if (c.vagaId === vagaId) {
        const posicao = ids.indexOf(c.status);   // -1 se o status for desconhecido
        // Math.min impede de passar da última etapa: ao chegar em
        // "finalizada", a posição continua a mesma.
        c.status = ids[Math.min(posicao + 1, ids.length - 1)];
      }
    });
    A.salvar(A.CHAVES.CANDIDATURAS, candidaturas);
  }

  /**
   * Remove a candidatura de uma vaga ("retirar inscrição").
   * Mantém todas as outras candidaturas.
   * @param {string} vagaId
   */
  function remover(vagaId) {
    const restantes = listar().filter(function (c) { return c.vagaId !== vagaId; });
    A.salvar(A.CHAVES.CANDIDATURAS, restantes);
  }

  // Interface pública do módulo.
  return {
    listar: listar,
    listarPorVaga: listarPorVaga,
    jaCandidatou: jaCandidatou,
    candidatar: candidatar,
    avancarStatus: avancarStatus,
    remover: remover
  };
})();
