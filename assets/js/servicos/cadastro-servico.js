/* ==========================================================
   servicos/cadastro-servico.js
   Cadastro DEMONSTRATIVO do intérprete (perfil) e da empresa/RH.

   Não há login nem senha: existe um único perfil e uma única
   empresa por navegador, guardados no localStorage. Por isso as
   funções de leitura devolvem null quando nada foi cadastrado —
   as páginas usam esse null para saber se devem mostrar o
   formulário vazio ou preenchê-lo com os dados salvos.

   Depende de: App.Armazenamento.
   ========================================================== */

App.CadastroServico = (function () {
  const A = App.Armazenamento;

  /* ----- Intérprete (candidato) ----- */

  /**
   * Lê o perfil do intérprete salvo neste navegador.
   * @returns {object|null} o perfil, ou null se ainda não foi cadastrado
   */
  function lerPerfil() { return A.ler(A.CHAVES.PERFIL, null); }

  /**
   * Salva (cria ou substitui) o perfil do intérprete.
   * @param {object} perfil dados vindos do formulário de perfil
   * @returns {boolean} true se gravou, false se falhou
   */
  function salvarPerfil(perfil) { return A.salvar(A.CHAVES.PERFIL, perfil); }

  /**
   * Apaga o perfil do intérprete (usado no botão "Excluir perfil").
   * As candidaturas NÃO são apagadas: elas guardam uma cópia dos dados
   * da vaga e continuam válidas.
   */
  function excluirPerfil() { A.remover(A.CHAVES.PERFIL); }

  /* ----- Empresa / agência de RH ----- */

  /**
   * Lê a empresa cadastrada neste navegador.
   * @returns {object|null} a empresa, ou null se ainda não foi cadastrada
   */
  function lerEmpresa() { return A.ler(A.CHAVES.EMPRESA, null); }

  /**
   * Salva (cria ou substitui) a empresa/RH.
   * @param {object} empresa dados vindos do formulário da empresa
   * @returns {boolean} true se gravou, false se falhou
   */
  function salvarEmpresa(empresa) { return A.salvar(A.CHAVES.EMPRESA, empresa); }

  /**
   * Apaga o cadastro da empresa (usado no botão "Excluir cadastro").
   * As vagas já publicadas continuam no localStorage, para não sumirem
   * da página de vagas vista pelos intérpretes.
   */
  function excluirEmpresa() { A.remover(A.CHAVES.EMPRESA); }

  // Interface pública do módulo.
  return {
    lerPerfil: lerPerfil,
    salvarPerfil: salvarPerfil,
    excluirPerfil: excluirPerfil,
    lerEmpresa: lerEmpresa,
    salvarEmpresa: salvarEmpresa,
    excluirEmpresa: excluirEmpresa
  };
})();
