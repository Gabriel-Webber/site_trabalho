/* ==========================================================
   servicos/vagas-servico.js
   Regras de negócio das VAGAS: listar, buscar, filtrar e publicar.

   Este arquivo é a única porta de entrada para os dados de vagas.
   As páginas nunca leem o localStorage diretamente: elas chamam
   estas funções. Assim, se um dia houver um back-end, só este
   arquivo precisa mudar.

   Fontes de vagas:
   - App.VAGAS_EXEMPLO: dados fixos do protótipo;
   - localStorage (CHAVES.VAGAS_PUBLICADAS): vagas criadas pela
     empresa na página de candidaturas (pages/candidaturas.html).
   ========================================================== */

App.VagasServico = (function () {
  // Atalho para o módulo de armazenamento (evita repetir App.Armazenamento).
  const A = App.Armazenamento;

  /**
   * Devolve TODAS as vagas: as publicadas pela empresa + as de exemplo.
   * As publicadas vêm primeiro porque são as mais novas
   * (publicar() usa unshift, então a última criada fica no início).
   * @returns {object[]}
   */
  function listar() {
    const publicadas = A.ler(A.CHAVES.VAGAS_PUBLICADAS, []);
    // concat cria uma lista nova; a original não é alterada.
    return publicadas.concat(App.VAGAS_EXEMPLO);
  }

  /**
   * Procura uma vaga pelo id em todas as vagas.
   * @param {string} id
   * @returns {object|undefined} a vaga, ou undefined se não existir
   */
  function buscarPorId(id) {
    return listar().find(function (vaga) { return vaga.id === id; });
  }

  /**
   * Devolve só as vagas publicadas por uma empresa, comparando o nome.
   * Usado na página de candidaturas da empresa para montar
   * "Minhas vagas publicadas".
   * Observação: a comparação é pelo nome exato, o que basta no
   * protótipo (existe uma única empresa por navegador).
   * @param {string} nomeEmpresa
   * @returns {object[]}
   */
  function listarPorEmpresa(nomeEmpresa) {
    return A.ler(A.CHAVES.VAGAS_PUBLICADAS, []).filter(function (vaga) {
      return vaga.empresa === nomeEmpresa;
    });
  }

  /**
   * Devolve só as vagas publicadas pela empresa que ainda estão abertas
   * (status diferente de "encerrada"). É o que o intérprete vê.
   * @param {string} nomeEmpresa
   * @returns {object[]}
   */
  function listarAbertasPorEmpresa(nomeEmpresa) {
    return listarPorEmpresa(nomeEmpresa).filter(function (vaga) {
      return vaga.status !== "encerrada";
    });
  }

  /**
   * Salva uma nova vaga publicada pela empresa.
   * @param {object} dados valores vindos do formulário da empresa
   *   { titulo, empresa, cliente, localizacao, modalidade, contrato,
   *     descricao, especialidades }
   * @returns {object} a vaga criada, já com id e data de publicação
   */
  function publicar(dados) {
    const publicadas = A.ler(A.CHAVES.VAGAS_PUBLICADAS, []);
    const novaVaga = {
      // Prefixo "p" (publicada) para diferenciar dos ids fixos "v1", "v2"...
      id: App.Helpers.gerarId("p"),
      titulo: dados.titulo,
      empresa: dados.empresa,
      cliente: dados.cliente,
      localizacao: dados.localizacao,
      modalidade: dados.modalidade,
      contrato: dados.contrato,
      descricao: dados.descricao,
      especialidades: dados.especialidades,
      // "aberta" = aparece para os intérpretes; "encerrada" = não recebe mais candidaturas.
      status: "aberta",
      // Data em ISO (ex.: "2026-11-05T10:00:00.000Z"): formato padrão,
      // convertido para "05/11/2026" na hora de exibir.
      publicadaEm: new Date().toISOString()
    };
    publicadas.unshift(novaVaga);   // unshift = coloca no início da lista
    A.salvar(A.CHAVES.VAGAS_PUBLICADAS, publicadas);
    return novaVaga;
  }

  /**
   * Altera uma vaga já publicada (usado no formulário de edição).
   * Só os campos enviados em "dados" são trocados; os demais
   * (id, empresa, data de publicação) continuam iguais.
   * @param {string} id    id da vaga a alterar
   * @param {object} dados campos novos
   * @returns {boolean} true se encontrou e alterou a vaga
   */
  function atualizar(id, dados) {
    const publicadas = A.ler(A.CHAVES.VAGAS_PUBLICADAS, []);
    const vaga = publicadas.find(function (v) { return v.id === id; });
    if (!vaga) return false;
    // Object.assign copia os campos de "dados" por cima dos da vaga.
    Object.assign(vaga, dados);
    A.salvar(A.CHAVES.VAGAS_PUBLICADAS, publicadas);
    return true;
  }

  /**
   * Exclui definitivamente uma vaga publicada.
   * As candidaturas já feitas continuam na lista do intérprete, porque
   * guardam uma cópia dos dados da vaga.
   * @param {string} id
   */
  function excluir(id) {
    const restantes = A.ler(A.CHAVES.VAGAS_PUBLICADAS, []).filter(function (v) { return v.id !== id; });
    A.salvar(A.CHAVES.VAGAS_PUBLICADAS, restantes);
  }

  /**
   * Muda o status de uma vaga publicada entre "aberta" e "encerrada".
   * @param {string} id
   * @param {string} status "aberta" ou "encerrada"
   * @returns {boolean} true se encontrou e alterou a vaga
   */
  function definirStatus(id, status) {
    return atualizar(id, { status: status });
  }

  /**
   * Aplica os filtros em uma lista de vagas e devolve só as que passam.
   * Todos os critérios são combinados com "E" (a vaga precisa atender
   * a todos). Campo vazio significa "não filtrar por este critério".
   * @param {object[]} vagas   lista de origem (normalmente listar())
   * @param {object} filtros   { texto, localizacao, modalidade, especialidades: [ids] }
   * @returns {object[]} lista filtrada
   */
  function filtrar(vagas, filtros) {
    const norm = App.Helpers.normalizar;   // atalho para comparar sem acento/maiúsculas
    const texto = norm(filtros.texto || "");
    const local = norm(filtros.localizacao || "");

    return vagas.filter(function (vaga) {
      // 1) Busca por cargo OU empresa.
      //    "!texto" = campo vazio, então este critério é ignorado.
      const bateTexto = !texto ||
        norm(vaga.titulo).includes(texto) || norm(vaga.empresa).includes(texto);

      // 2) Localização: basta o texto digitado aparecer dentro da
      //    localização da vaga ("caxias" encontra "Caxias do Sul - RS").
      const bateLocal = !local || norm(vaga.localizacao).includes(local);

      // 3) Modalidade: comparação exata com o valor escolhido no select.
      const bateModalidade = !filtros.modalidade || vaga.modalidade === filtros.modalidade;

      // 4) Especialidades: a vaga precisa oferecer TODAS as marcadas.
      //    every() em uma lista vazia devolve true, então nenhum
      //    checkbox marcado = nenhum filtro de especialidade.
      const bateEspecialidades = (filtros.especialidades || []).every(function (id) {
        return vaga.especialidades.includes(id);
      });

      return bateTexto && bateLocal && bateModalidade && bateEspecialidades;
    });
  }

  // Interface pública do módulo.
  return {
    listar: listar,
    buscarPorId: buscarPorId,
    listarPorEmpresa: listarPorEmpresa,
    listarAbertasPorEmpresa: listarAbertasPorEmpresa,
    publicar: publicar,
    atualizar: atualizar,
    excluir: excluir,
    definirStatus: definirStatus,
    filtrar: filtrar
  };
})();
