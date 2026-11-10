/* ==========================================================
   paginas/home.js
   Lógica da página inicial (index.html), que muda conforme o
   tipo de acesso escolhido na tela de cadastro:

   - Intérprete: busca de vagas + vagas em destaque (com candidatura);
   - Empresa/RH: atalho para publicar vagas + suas vagas publicadas;
   - Sem sessão: apresentação com os dois botões de entrada.

   O código roda dentro de DOMContentLoaded para garantir que os
   elementos do HTML (#lista-destaques, #form-busca) já existam.

   Depende de: App.SessaoServico, App.VagasServico, App.CadastroServico,
   App.CartaoVaga e App.Helpers.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // Elementos da página, buscados uma única vez.
  const listaDestaques = document.getElementById("lista-destaques");
  const formBusca = document.getElementById("form-busca");
  const atalhos = document.getElementById("atalhos-heroi");
  const tituloDestaques = document.getElementById("titulo-destaques");
  const linkDestaques = document.getElementById("link-destaques");
  const textoHeroi = document.getElementById("texto-heroi");

  /**
   * Adiciona um cartão de vaga que abre o modal de detalhes.
   * @param {object} vaga
   * @param {Function} aoCandidatar regra usada pelo botão "Candidatar-se"
   */
  function adicionarCartao(vaga, aoCandidatar) {
    listaDestaques.appendChild(App.CartaoVaga.criarCartao(vaga, function (v) {
      App.CartaoVaga.abrirDetalhes(v, aoCandidatar);
    }));
  }

  /* --- 1) Conteúdo conforme o tipo de acesso --- */
  if (App.SessaoServico.ehEmpresa()) {
    // A empresa não busca vagas: esconde a busca e os atalhos de entrada.
    formBusca.hidden = true;
    atalhos.hidden = true;
    textoHeroi.textContent = "Publique vagas de intérprete de Libras, acompanhe as candidaturas e mantenha os dados da sua empresa atualizados.";

    tituloDestaques.textContent = "Minhas vagas publicadas";
    linkDestaques.href = "pages/candidaturas.html";
    linkDestaques.textContent = "Gerenciar vagas";

    // Só as vagas publicadas por esta empresa (abertas e encerradas).
    const empresa = App.CadastroServico.lerEmpresa();
    const vagas = empresa ? App.VagasServico.listarPorEmpresa(empresa.nome) : [];
    if (vagas.length === 0) {
      listaDestaques.innerHTML = '<p class="vazio">Nenhuma vaga publicada ainda. <a href="pages/candidaturas.html">Publicar a primeira vaga</a></p>';
    } else {
      vagas.forEach(function (vaga) {
        // A empresa não se candidata: o modal só informa isso.
        adicionarCartao(vaga, function () {
          App.Helpers.mostrarAviso("Candidaturas são feitas pelos intérpretes.", true);
          return false;
        });
      });
    }
  } else {
    // Intérprete (ou visitante): vagas em destaque.
    // App.VAGAS_DESTAQUE guarda apenas os ids; buscarPorId() devolve a vaga completa.
    App.VAGAS_DESTAQUE.forEach(function (id) {
      const vaga = App.VagasServico.buscarPorId(id);
      // Se o id não existir mais (vaga removida dos dados), ignora em vez de quebrar.
      if (!vaga) return;
      // Cada cartão abre o modal; o botão "Candidatar-se" usa a regra compartilhada,
      // que já verifica perfil cadastrado, vaga encerrada e candidatura duplicada.
      adicionarCartao(vaga, App.CartaoVaga.candidatarComAviso);
    });
  }

  /* --- 2) Pesquisa (só existe para o intérprete) --- */
  // Não há servidor: em vez de enviar o formulário, redirecionamos para
  // vagas.html?busca=texto. A página de vagas lê esse parâmetro e já
  // preenche o campo de busca (ver paginas/vagas.js).
  formBusca.addEventListener("submit", function (evento) {
    evento.preventDefault();   // impede o envio padrão do formulário (recarregar a página)
    const texto = document.getElementById("campo-busca").value.trim();
    // encodeURIComponent protege caracteres como "&" e "?" dentro do texto buscado.
    // Sem texto, vai para a página de vagas sem parâmetro.
    window.location.href = "pages/vagas.html" + (texto ? "?busca=" + encodeURIComponent(texto) : "");
  });
});
