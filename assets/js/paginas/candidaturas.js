/* ==========================================================
   paginas/candidaturas.js
   Lógica da página de candidaturas (candidaturas.html), que tem
   DUAS visões escolhidas pelo tipo de acesso:

   - Intérprete: lista as candidaturas feitas, com o andamento
     (status), o botão de simular a próxima etapa e o de retirar;
   - Empresa/RH: cria, edita, encerra e exclui as vagas publicadas.

   As duas visões ficam no HTML e só uma é exibida (hidden).

   Depende de: App.SessaoServico, App.CandidaturaServico, App.VagasServico,
   App.CadastroServico, App.CartaoVaga e App.Helpers.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const H = App.Helpers;

  /* ==========================================================
     PARTE 1: VISÃO DO INTÉRPRETE
     ========================================================== */
  const lista = document.getElementById("lista-candidaturas");

  /**
   * Monta a "linha do tempo" das etapas, destacando a etapa atual.
   * @param {string} statusAtual id da etapa em que a candidatura está
   * @returns {string} HTML de um <ol> com todas as etapas
   */
  function htmlEtapas(statusAtual) {
    return '<ol class="etapas" aria-label="Etapas da candidatura">' + App.ETAPAS_CANDIDATURA.map(function (etapa) {
      const ativa = etapa.id === statusAtual;
      // aria-current="step" diz ao leitor de tela qual é a etapa atual.
      return "<li" + (ativa ? ' class="ativa" aria-current="step"' : "") + ">" + etapa.rotulo + "</li>";
    }).join("") + "</ol>";
  }

  /**
   * Redesenha toda a lista de candidaturas a partir do localStorage.
   * É chamada ao carregar a página e depois de cada ação
   * (avançar etapa ou retirar candidatura).
   */
  function desenharCandidaturas() {
    const candidaturas = App.CandidaturaServico.listar();

    // Estado vazio: convida o usuário a procurar vagas.
    if (candidaturas.length === 0) {
      lista.innerHTML = '<p class="vazio">Você ainda não se candidatou a nenhuma vaga.<br><a class="botao" href="vagas.html">Procurar vagas</a></p>';
      return;
    }

    lista.innerHTML = candidaturas.map(function (c) {
      // Converte o id do status no objeto da etapa (para pegar o rótulo legível).
      const etapa = App.ETAPAS_CANDIDATURA.find(function (e) { return e.id === c.status; });
      // Na última etapa não há para onde avançar: o botão fica desabilitado.
      const naUltima = c.status === "finalizada";
      return '<article class="cartao">' +
        "<h3>" + H.escaparHtml(c.titulo) + "</h3>" +
        '<p class="cartao__empresa">' + H.escaparHtml(c.empresa) + " - " + H.escaparHtml(c.localizacao) + "</p>" +
        // A classe status--<id> define a cor de cada etapa no CSS.
        '<p class="cartao__meta">Enviada em ' + H.formatarData(c.data) +
          ' | Status: <span class="status status--' + c.status + '">' + etapa.rotulo + "</span></p>" +
        htmlEtapas(c.status) +
        '<div class="grupo-botoes">' +
          // data-acao diz o que fazer e data-id guarda o id da vaga;
          // o clique é tratado por um único listener abaixo (delegação de eventos).
          '<button type="button" class="botao botao--secundario" data-acao="avancar" data-id="' + c.vagaId + '"' +
            (naUltima ? " disabled" : "") + ">Simular próxima etapa</button>" +
          '<button type="button" class="botao botao--secundario" data-acao="remover" data-id="' + c.vagaId + '">Retirar candidatura</button>' +
        "</div></article>";
    }).join("");
  }

  // "Delegação de eventos": um único listener na lista trata todos os botões,
  // inclusive os que forem criados depois por desenharCandidaturas().
  lista.addEventListener("click", function (evento) {
    // closest() sobe do elemento clicado até o botão com data-acao.
    // Se o clique não foi em um botão desses, não faz nada.
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    if (botao.dataset.acao === "avancar") {
      App.CandidaturaServico.avancarStatus(botao.dataset.id);
      H.mostrarAviso("Status atualizado (simulação).");
    } else if (botao.dataset.acao === "remover") {
      App.CandidaturaServico.remover(botao.dataset.id);
      H.mostrarAviso("Candidatura retirada.");
    }
    // Redesenha para refletir a mudança no localStorage.
    desenharCandidaturas();
  });

  /* ==========================================================
     PARTE 2: VISÃO DA EMPRESA (criar, editar, encerrar, excluir)
     ========================================================== */
  const formVaga = document.getElementById("form-vaga");
  const listaVagas = document.getElementById("vagas-da-empresa");
  const avisoSemEmpresa = document.getElementById("aviso-sem-empresa");
  const botaoSalvar = document.getElementById("botao-salvar-vaga");
  const botaoCancelar = document.getElementById("cancelar-edicao");
  const tituloFormVaga = document.getElementById("titulo-form-vaga");

  // Cria os checkboxes de especialidades do formulário de vaga (todos desmarcados).
  H.renderizarCheckboxesEspecialidades(document.getElementById("vaga-especialidades"), "especialidades", []);

  /**
   * Devolve a empresa cadastrada ou null.
   * @returns {object|null}
   */
  function empresaAtual() {
    return App.CadastroServico.lerEmpresa();
  }

  /**
   * Volta o formulário ao modo "publicar" (sem vaga em edição).
   */
  function limparFormulario() {
    formVaga.reset();                       // limpa todos os campos, inclusive o id escondido
    tituloFormVaga.textContent = "Publicar vaga de intérprete";
    botaoSalvar.textContent = "Publicar vaga";
    botaoCancelar.hidden = true;
  }

  /**
   * Coloca uma vaga existente no formulário para ser editada.
   * @param {object} vaga
   */
  function editarVaga(vaga) {
    formVaga.elements.id.value = vaga.id;
    ["titulo", "localizacao", "cliente", "modalidade", "contrato", "descricao"].forEach(function (campo) {
      formVaga.elements[campo].value = vaga[campo] || "";
    });
    // Recria os checkboxes com as especialidades da vaga já marcadas.
    H.renderizarCheckboxesEspecialidades(document.getElementById("vaga-especialidades"), "especialidades", vaga.especialidades);

    tituloFormVaga.textContent = "Editar vaga";
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.hidden = false;

    // Leva o foco ao formulário e rola até ele, para o usuário ver a edição.
    formVaga.scrollIntoView({ behavior: "smooth", block: "start" });
    formVaga.elements.titulo.focus();
  }

  /**
   * Redesenha a lista de vagas da empresa, com as ações de cada vaga.
   */
  function desenharVagas() {
    const empresa = empresaAtual();
    // "!!empresa" converte o objeto em boolean: hidden = true quando NÃO há empresa.
    avisoSemEmpresa.hidden = !!empresa;
    listaVagas.innerHTML = "";

    if (!empresa) return;   // sem empresa, não há vagas próprias para listar

    const vagas = App.VagasServico.listarPorEmpresa(empresa.nome);
    if (vagas.length === 0) {
      listaVagas.innerHTML = '<p class="vazio">Nenhuma vaga publicada ainda. Use o formulário acima.</p>';
      return;
    }

    vagas.forEach(function (vaga) {
      // O cartão mostra o selo de status (Aberta/Encerrada) e abre os detalhes.
      const cartao = App.CartaoVaga.criarCartao(vaga, function (v) {
        App.CartaoVaga.abrirDetalhes(v, function () {
          H.mostrarAviso("Candidaturas são feitas pelos intérpretes.", true);
          return false;
        });
      }, { textoBotao: "Ver detalhes" });

      // Quantas candidaturas esta vaga recebeu (informação para a empresa).
      const total = App.CandidaturaServico.listarPorVaga(vaga.id).length;
      const info = document.createElement("p");
      info.className = "cartao__meta";
      info.textContent = total === 1 ? "1 candidatura recebida" : total + " candidaturas recebidas";

      // Botões de gerenciamento. data-id guarda o id da vaga.
      const acoes = document.createElement("div");
      acoes.className = "grupo-botoes";
      acoes.innerHTML =
        '<button type="button" class="botao botao--secundario" data-acao="editar" data-id="' + vaga.id + '">Editar</button>' +
        '<button type="button" class="botao botao--secundario" data-acao="status" data-id="' + vaga.id + '">' +
          (vaga.status === "encerrada" ? "Reabrir" : "Encerrar") + "</button>" +
        '<button type="button" class="botao botao--perigo" data-acao="excluir" data-id="' + vaga.id + '">Excluir</button>';

      cartao.appendChild(info);
      cartao.appendChild(acoes);
      listaVagas.appendChild(cartao);
    });
  }

  // Delegação de eventos na lista de vagas da empresa.
  listaVagas.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;
    const id = botao.dataset.id;
    const vaga = App.VagasServico.buscarPorId(id);
    if (!vaga) return;

    if (botao.dataset.acao === "editar") {
      editarVaga(vaga);
    } else if (botao.dataset.acao === "status") {
      // Alterna entre "aberta" e "encerrada".
      const novo = vaga.status === "encerrada" ? "aberta" : "encerrada";
      App.VagasServico.definirStatus(id, novo);
      H.mostrarAviso(novo === "aberta" ? "Vaga reaberta." : "Vaga encerrada: não recebe novas candidaturas.");
      desenharVagas();
    } else if (botao.dataset.acao === "excluir") {
      // confirm() evita exclusão acidental; Cancelar mantém a vaga.
      if (!window.confirm('Excluir a vaga "' + vaga.titulo + '"? Esta ação não pode ser desfeita.')) return;
      App.VagasServico.excluir(id);
      // Se a vaga excluída estava em edição, o formulário volta ao modo "publicar".
      if (formVaga.elements.id.value === id) limparFormulario();
      H.mostrarAviso("Vaga excluída.");
      desenharVagas();
    }
  });

  // Envio do formulário: cria uma vaga nova ou salva a edição.
  formVaga.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const empresa = empresaAtual();
    // Regra de negócio: só publica quem tem cadastro.
    if (!empresa) {
      H.mostrarAviso("Cadastre a empresa antes de publicar vagas.", true);
      return;
    }

    // O nome da empresa vem do cadastro (e não do formulário de vaga),
    // garantindo que a vaga apareça em "Minhas vagas publicadas".
    const dados = {
      titulo: formVaga.elements.titulo.value.trim(),
      empresa: empresa.nome,
      cliente: formVaga.elements.cliente.value.trim(),
      localizacao: formVaga.elements.localizacao.value.trim(),
      modalidade: formVaga.elements.modalidade.value,
      contrato: formVaga.elements.contrato.value,
      descricao: formVaga.elements.descricao.value.trim(),
      especialidades: H.lerCheckboxes(formVaga, "especialidades")
    };

    const idEmEdicao = formVaga.elements.id.value;
    if (idEmEdicao) {
      // Modo edição: altera a vaga existente (o status atual é preservado).
      App.VagasServico.atualizar(idEmEdicao, dados);
      H.mostrarAviso("Vaga atualizada!");
    } else {
      // Modo criação: gera um id novo e coloca a vaga no topo da lista.
      App.VagasServico.publicar(dados);
      H.mostrarAviso("Vaga publicada! Ela já aparece na página de vagas.");
    }
    limparFormulario();
    desenharVagas();
  });

  // "Cancelar edição": descarta as alterações e volta ao modo "publicar".
  botaoCancelar.addEventListener("click", limparFormulario);

  /* ==========================================================
     PARTE 3: ESCOLHA DA VISÃO CONFORME A SESSÃO
     ========================================================== */
  const visaoInterprete = document.getElementById("visao-interprete");
  const visaoEmpresa = document.getElementById("visao-empresa");
  const tituloPagina = document.getElementById("titulo-candidaturas");
  const subtituloPagina = document.getElementById("subtitulo-candidaturas");

  if (App.SessaoServico.ehEmpresa()) {
    visaoEmpresa.hidden = false;
    tituloPagina.textContent = "Candidaturas e vagas";
    subtituloPagina.textContent = "Publique, edite, encerre ou exclua as vagas de intérprete da sua empresa.";
    desenharVagas();
  } else {
    visaoInterprete.hidden = false;
    desenharCandidaturas();
  }
});
