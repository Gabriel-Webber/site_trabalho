/* ==========================================================
   utils/armazenamento.js
   Camada fina sobre o localStorage do navegador.

   Por que existe?
   - O localStorage guarda apenas TEXTO. Objetos e listas precisam
     ser convertidos para JSON ao salvar (JSON.stringify) e de volta
     para objeto ao ler (JSON.parse). Esta camada faz isso em um só
     lugar, para que o resto do código não repita o mesmo try/catch.
   - Todas as chaves recebem um PREFIXO, evitando conflito com outros
     sites que usem o mesmo navegador (o localStorage é compartilhado
     por origem, não por pasta do projeto).
   - Se o navegador bloquear o armazenamento ou o JSON estiver
     corrompido, as funções devolvem um valor padrão em vez de
     quebrar a página.

   Depende de: nada (é carregado logo após os dados).
   ========================================================== */

App.Armazenamento = (function () {
  // Prefixo aplicado a toda chave gravada no navegador.
  // Trocar este texto "isola" os dados deste projeto dos demais.
  const PREFIXO = "marketplace-inclusivo:";

  // Chaves usadas pelo projeto, centralizadas aqui.
  // Vantagem: se um nome precisar mudar, muda em um único lugar,
  // e um erro de digitação vira "undefined" (fácil de notar) em vez
  // de criar uma chave nova silenciosamente.
  const CHAVES = {
    SESSAO: "sessao",                       // quem está usando o site: "interprete" ou "empresa"
    PERFIL: "perfil",                       // dados do intérprete (um por navegador)
    EMPRESA: "empresa",                     // dados da empresa/RH (uma por navegador)
    VAGAS_PUBLICADAS: "vagas-publicadas",   // vagas criadas pelo formulário da empresa
    CANDIDATURAS: "candidaturas"            // candidaturas do intérprete
  };

  /**
   * Lê um valor salvo no localStorage e devolve o objeto já convertido.
   * @param {string} chave  nome da chave (sem o prefixo), ex.: CHAVES.PERFIL
   * @param {*} padrao      valor devolvido quando não há nada salvo
   *                        (normalmente null para um objeto ou [] para uma lista)
   * @returns {*} o valor salvo ou o "padrao"
   */
  function ler(chave, padrao) {
    try {
      const texto = localStorage.getItem(PREFIXO + chave);
      // getItem devolve null quando a chave não existe.
      // Comparar com null (e não com "falsy") é importante: "0" e "false"
      // são textos válidos e não devem ser tratados como "vazio".
      return texto === null ? padrao : JSON.parse(texto);
    } catch (erro) {
      // Dois casos caem aqui:
      // 1) JSON inválido (dado corrompido ou gravado por outra versão);
      // 2) localStorage bloqueado (modo privado, política do navegador).
      // Em ambos, devolvemos o padrão para a página continuar funcionando.
      return padrao;
    }
  }

  /**
   * Salva qualquer valor (objeto, lista, texto, número) convertendo para JSON.
   * @param {string} chave  nome da chave (sem o prefixo)
   * @param {*} valor       o que será gravado
   * @returns {boolean} true se gravou, false se falhou
   *                    (ex.: cota de armazenamento cheia ou bloqueio)
   */
  function salvar(chave, valor) {
    try {
      localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
      return true;
    } catch (erro) {
      // Quem chama pode usar o retorno para mostrar uma mensagem de erro.
      return false;
    }
  }

  /**
   * Apaga um valor do localStorage (usado no "Sair").
   * @param {string} chave nome da chave (sem o prefixo)
   */
  function remover(chave) {
    try {
      localStorage.removeItem(PREFIXO + chave);
    } catch (erro) {
      // Armazenamento bloqueado: não há nada a apagar, então seguimos em frente.
    }
  }

  // Interface pública do módulo (o que os outros arquivos podem usar).
  // As funções internas acima ficam "privadas" graças à IIFE.
  return { CHAVES: CHAVES, ler: ler, salvar: salvar, remover: remover };
})();
