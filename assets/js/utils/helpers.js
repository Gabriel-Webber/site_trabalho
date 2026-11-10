/* ==========================================================
   utils/helpers.js
   Funções de apoio usadas em várias páginas.

   Regra geral: se uma mesma tarefa pequena aparece em mais de
   uma página (escapar texto, formatar data, mostrar aviso...),
   ela mora aqui, para não ser copiada e colada.
   ========================================================== */

App.Helpers = (function () {

  /**
   * Protege contra XSS (injeção de HTML/JavaScript).
   * Troca os caracteres especiais de HTML pelas suas entidades:
   *   & -> &amp;   < -> &lt;   > -> &gt;   " -> &quot;   ' -> &#39;
   * Assim, um texto como "<script>..." aparece como texto na tela
   * em vez de ser executado pelo navegador.
   *
   * SEMPRE use esta função ao inserir texto digitado pelo usuário
   * via innerHTML (títulos de vaga, nome da empresa, descrição...).
   * @param {*} texto qualquer valor; é convertido para string
   * @returns {string} o texto seguro para ir dentro de HTML
   */
  function escaparHtml(texto) {
    const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    // O replace percorre a string e troca cada caractere encontrado no mapa.
    return String(texto).replace(/[&<>"']/g, function (c) { return mapa[c]; });
  }

  /**
   * Gera um identificador único simples: prefixo + milissegundos atuais
   * + um número aleatório de 0 a 999.
   * Ex.: gerarId("p") -> "p1762370400123456"
   * Não é um UUID "oficial", mas é suficiente para um protótipo sem banco.
   * @param {string} prefixo letra que indica o tipo ("p" = vaga publicada)
   * @returns {string}
   */
  function gerarId(prefixo) {
    return prefixo + Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Transforma uma data ISO (ex.: "2026-11-05T10:00:00Z") no formato
   * brasileiro "05/11/2026", usando o idioma do navegador (pt-BR).
   * @param {string} dataIso data no padrão ISO 8601
   * @returns {string}
   */
  function formatarData(dataIso) {
    return new Date(dataIso).toLocaleDateString("pt-BR");
  }

  /**
   * Prepara um texto para comparação em buscas:
   * - separa as letras dos acentos (normalize "NFD");
   * - remove as marcas de acento (faixa Unicode \u0300-\u036f);
   * - passa tudo para minúsculas.
   * Resultado: "Análise" vira "analise", então quem digita "analise"
   * encontra "Análise", e "SAÚDE" encontra "Saúde".
   * @param {*} texto
   * @returns {string}
   */
  function normalizar(texto) {
    return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  /**
   * Mostra uma mensagem temporária ("toast") na tela por 3,5 segundos.
   * Acessibilidade: role="status" faz o leitor de tela anunciar o texto
   * sem interromper o usuário; role="alert" (usado em erros) interrompe.
   * @param {string} mensagem texto exibido
   * @param {boolean} [ehErro] true = estilo e anúncio de erro
   */
  function mostrarAviso(mensagem, ehErro) {
    const aviso = document.createElement("div");
    aviso.className = "aviso" + (ehErro ? " aviso--erro" : "");
    aviso.setAttribute("role", ehErro ? "alert" : "status");
    // textContent (e não innerHTML): a mensagem é sempre texto puro, nunca HTML.
    aviso.textContent = mensagem;
    document.body.appendChild(aviso);
    // Remove o elemento depois de 3,5 s para não acumular avisos na página.
    setTimeout(function () { aviso.remove(); }, 3500);
  }

  /**
   * Converte o id de uma especialidade no rótulo legível.
   * Ex.: rotuloEspecialidade("saude") -> "Saúde".
   * Se o id não existir na lista, devolve o próprio id (nunca quebra).
   * @param {string} id
   * @returns {string}
   */
  function rotuloEspecialidade(id) {
    const especialidade = App.ESPECIALIDADES.find(function (r) { return r.id === id; });
    return especialidade ? especialidade.rotulo : id;
  }

  /**
   * Monta os checkboxes de especialidades dentro de um container.
   * Usado nos filtros de vagas, no perfil do intérprete e nos dois
   * formulários da empresa — sempre a partir de App.ESPECIALIDADES,
   * então uma especialidade nova aparece em todos os lugares de uma vez.
   * @param {HTMLElement} container elemento onde os checkboxes serão inseridos
   * @param {string} nome           valor do atributo name dos inputs
   * @param {string[]} [marcados]   ids que já devem vir marcados
   */
  function renderizarCheckboxesEspecialidades(container, nome, marcados) {
    container.innerHTML = App.ESPECIALIDADES.map(function (especialidade) {
      // "checked" só é adicionado quando o id está na lista de marcados.
      const checked = (marcados || []).includes(especialidade.id) ? "checked" : "";
      // Os valores vêm de dados fixos do projeto (sem acento), por isso não
      // precisam de escaparHtml aqui.
      return '<label class="opcao"><input type="checkbox" name="' + nome + '" value="' + especialidade.id + '" ' + checked + '> ' +
             especialidade.rotulo + '</label>';
    }).join("");
  }

  /**
   * Lê quais checkboxes de um determinado "name" estão marcados.
   * @param {HTMLFormElement} formulario formulário que contém os checkboxes
   * @param {string} nome                atributo name do grupo
   * @returns {string[]} lista de valores marcados (vazia se nenhum)
   */
  function lerCheckboxes(formulario, nome) {
    return Array.from(formulario.querySelectorAll('input[name="' + nome + '"]:checked'))
      .map(function (input) { return input.value; });
  }

  // Interface pública do módulo.
  return {
    escaparHtml: escaparHtml,
    gerarId: gerarId,
    formatarData: formatarData,
    normalizar: normalizar,
    mostrarAviso: mostrarAviso,
    rotuloEspecialidade: rotuloEspecialidade,
    renderizarCheckboxesEspecialidades: renderizarCheckboxesEspecialidades,
    lerCheckboxes: lerCheckboxes
  };
})();
