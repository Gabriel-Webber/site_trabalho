/* ==========================================================
   componentes/cartao-vaga.js
   Componentes visuais de VAGA, reaproveitados pela página inicial,
   pela página de vagas e pela página da empresa:
   - criarCartao():    o cartão resumido que aparece nas listas;
   - abrirDetalhes():  janela (modal) com todos os detalhes e o
                       botão "Candidatar-se";
   - candidatarComAviso(): regra compartilhada de candidatura.

   Depende de: App.Helpers, App.CandidaturaServico e App.CadastroServico.
   ========================================================== */

App.CartaoVaga = (function () {
  // Atalho para as funções de apoio (escaparHtml, rotuloEspecialidade...).
  const H = App.Helpers;

  /**
   * Gera o HTML da lista de selos (etiquetas) de uma vaga:
   * modalidade + tipo de contrato + especialidades.
   * @param {object} vaga
   * @returns {string} HTML de um <ul> com os selos
   */
  function htmlSelos(vaga) {
    const selos = ['<li class="selo selo--modalidade">' + H.escaparHtml(vaga.modalidade) + "</li>"];
    // O contrato é opcional: só cria o selo se o campo existir.
    if (vaga.contrato) selos.push('<li class="selo selo--modalidade">' + H.escaparHtml(vaga.contrato) + "</li>");
    // Converte cada id de especialidade no seu rótulo legível.
    vaga.especialidades.forEach(function (id) {
      selos.push('<li class="selo">' + H.escaparHtml(H.rotuloEspecialidade(id)) + "</li>");
    });
    return '<ul class="selos" aria-label="Modalidade, contrato e especialidades">' + selos.join("") + "</ul>";
  }

  /**
   * Cria o cartão resumido de uma vaga.
   * @param {object} vaga           a vaga a exibir
   * @param {Function} aoVerDetalhes função chamada com a vaga quando o
   *                                usuário clica em "Ver detalhes"
   * @param {object} [opcoes]       ajustes opcionais:
   *   { textoBotao: string }  troca o texto do botão (ex.: "Editar vaga")
   * @returns {HTMLElement} o <article> pronto para ser inserido na página
   */
  function criarCartao(vaga, aoVerDetalhes, opcoes) {
    const textoBotao = (opcoes && opcoes.textoBotao) || "Ver detalhes";
    // Selo de status: só aparece em vagas publicadas pela empresa (têm "status").
    const seloStatus = vaga.status
      ? '<li class="selo selo--' + (vaga.status === "encerrada" ? "encerrada" : "aberta") + '">' +
        (vaga.status === "encerrada" ? "Encerrada" : "Aberta") + "</li>"
      : "";

    const artigo = document.createElement("article");
    artigo.className = "cartao";
    // Todo texto vindo dos dados passa por escaparHtml antes de ir para o innerHTML.
    artigo.innerHTML =
      "<h3>" + H.escaparHtml(vaga.titulo) + "</h3>" +
      // Quando a vaga vem de uma agência de RH, mostra a empresa cliente entre parênteses.
      '<p class="cartao__empresa">' + H.escaparHtml(vaga.empresa) + (vaga.cliente ? " (para " + H.escaparHtml(vaga.cliente) + ")" : "") + "</p>" +
      '<p class="cartao__meta">Local: ' + H.escaparHtml(vaga.localizacao) + "</p>" +
      htmlSelos(vaga) +
      (seloStatus ? '<ul class="selos" aria-label="Situação da vaga">' + seloStatus + "</ul>" : "") +
      // O <span class="somente-leitor"> completa o nome do botão para quem usa
      // leitor de tela: "Ver detalhes da vaga <título>", em vez de só "Ver detalhes".
      '<button type="button" class="botao botao--secundario">' + H.escaparHtml(textoBotao) +
      '<span class="somente-leitor"> da vaga ' + H.escaparHtml(vaga.titulo) + "</span></button>";

    // Cada cartão tem seu próprio botão, então o listener fica no próprio elemento.
    artigo.querySelector("button").addEventListener("click", function () {
      aoVerDetalhes(vaga);
    });
    return artigo;
  }

  /**
   * Abre o modal de detalhes usando o elemento nativo <dialog>.
   * O <dialog> já cuida de prender o foco dentro da janela e de
   * fechar com a tecla Esc — não é preciso implementar isso à mão.
   * @param {object} vaga         a vaga a detalhar
   * @param {Function} aoCandidatar função que tenta candidatar e devolve
   *                               true se a candidatura foi enviada
   */
  function abrirDetalhes(vaga, aoCandidatar) {
    const dialogo = document.createElement("dialog");
    dialogo.className = "modal";
    // Liga o modal ao seu título para o leitor de tela anunciar o nome da janela.
    dialogo.setAttribute("aria-labelledby", "modal-titulo");

    // Se o intérprete já se candidatou, o botão nasce desabilitado.
    const jaCandidatou = App.CandidaturaServico.jaCandidatou(vaga.id);
    dialogo.innerHTML =
      '<h2 id="modal-titulo">' + H.escaparHtml(vaga.titulo) + "</h2>" +
      '<p class="cartao__empresa">' + H.escaparHtml(vaga.empresa) + " - " + H.escaparHtml(vaga.localizacao) + "</p>" +
      htmlSelos(vaga) +
      // A empresa cliente só aparece quando a vaga tem uma (caso de agências de RH).
      (vaga.cliente ? "<p><strong>Empresa cliente:</strong> " + H.escaparHtml(vaga.cliente) + "</p>" : "") +
      "<h3>Descrição</h3><p>" + H.escaparHtml(vaga.descricao) + "</p>" +
      "<h3>Especialidades de interpretação exigidas</h3><ul>" +
        vaga.especialidades.map(function (id) { return "<li>" + H.escaparHtml(H.rotuloEspecialidade(id)) + "</li>"; }).join("") +
      "</ul>" +
      '<div class="grupo-botoes">' +
        // data-acao identifica o botão sem depender da ordem ou do texto.
        '<button type="button" class="botao" data-acao="candidatar"' + (jaCandidatou ? " disabled" : "") + ">" +
          (jaCandidatou ? "Você já se candidatou" : "Candidatar-se") + "</button>" +
        '<button type="button" class="botao botao--secundario" data-acao="fechar">Fechar</button>' +
      "</div>";

    document.body.appendChild(dialogo);

    // Botão "Fechar": apenas fecha o <dialog>.
    dialogo.querySelector('[data-acao="fechar"]').addEventListener("click", function () { dialogo.close(); });

    // Botão "Candidatar-se": delega a regra para a função recebida
    // (normalmente candidatarComAviso) e atualiza o botão se deu certo.
    dialogo.querySelector('[data-acao="candidatar"]').addEventListener("click", function (evento) {
      const sucesso = aoCandidatar(vaga);
      if (sucesso) {
        evento.target.disabled = true;
        evento.target.textContent = "Candidatura enviada";
      }
    });

    // Ao fechar (botão, Esc ou close()), remove o modal do HTML
    // para não acumular elementos a cada vaga aberta.
    dialogo.addEventListener("close", function () { dialogo.remove(); });

    // showModal() exibe o diálogo em primeiro plano, com fundo escurecido.
    dialogo.showModal();
  }

  /**
   * Regra de candidatura compartilhada pelas páginas.
   * Exige perfil cadastrado e vaga aberta, avisa o resultado e devolve se enviou.
   * @param {object} vaga
   * @returns {boolean} true se a candidatura foi enviada
   */
  function candidatarComAviso(vaga) {
    // Sem perfil não há como a empresa saber quem se candidatou.
    if (!App.CadastroServico.lerPerfil()) {
      H.mostrarAviso("Cadastre seu perfil antes de se candidatar (menu: Meu perfil).", true);
      return false;
    }
    // Vaga encerrada pela empresa não recebe novas candidaturas.
    if (vaga.status === "encerrada") {
      H.mostrarAviso("Esta vaga foi encerrada pela empresa.", true);
      return false;
    }
    // candidatar() devolve false quando a candidatura já existia.
    if (App.CandidaturaServico.candidatar(vaga)) {
      H.mostrarAviso("Candidatura enviada para " + vaga.empresa + "!");
      return true;
    }
    H.mostrarAviso("Você já se candidatou a esta vaga.", true);
    return false;
  }

  // Interface pública do módulo.
  return { criarCartao: criarCartao, abrirDetalhes: abrirDetalhes, candidatarComAviso: candidatarComAviso };
})();
