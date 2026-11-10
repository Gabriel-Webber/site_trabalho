/* ==========================================================
   componentes/layout.js
   Monta o CABEÇALHO (com menu) e o RODAPÉ em todas as páginas e
   protege as páginas que exigem um tipo de acesso.

   Como funciona:
   - Cada página tem <header id="cabecalho-site"> e <footer id="rodape-site">
     vazios; este script preenche os dois quando o HTML termina de carregar.
   - Cada <body> tem o atributo data-raiz: "" (index.html) ou "../" (pages/).
     Ele corrige os caminhos dos links conforme a pasta da página.
   - O menu depende de quem está usando o site (App.SessaoServico):
       intérprete -> Início, Vagas, Candidaturas, Meu perfil
       empresa    -> Início, Vagas, Perfil da empresa
     Sem sessão, o menu mostra só "Início" e "Entrar".
   - Páginas com data-exigir="interprete" ou "empresa" redirecionam
     para o cadastro quando o tipo de acesso não confere;
     data-exigir="sessao" aceita qualquer um dos dois perfis.
   - O item do menu correspondente à página atual recebe aria-current="page",
     que o leitor de tela anuncia e o CSS usa para destacar o item.

   Depende de: App.SessaoServico (carregado antes deste arquivo).
   ========================================================== */

App.Layout = (function () {

  // Menus por tipo de acesso. A ORDEM desta lista é a ordem exibida.
  // Os destinos são sempre relativos à RAIZ do projeto; o "raiz"
  // recebido em montarCabecalho() é colocado na frente de cada um.
  // Para adicionar uma página ao menu, basta incluir uma linha aqui.
  const MENUS = {
    interprete: [
      { texto: "Início",        destino: "index.html" },
      { texto: "Vagas",         destino: "pages/vagas.html" },
      { texto: "Candidaturas",  destino: "pages/candidaturas.html" },
      { texto: "Meu perfil",    destino: "pages/perfil.html" }
    ],
    empresa: [
      { texto: "Início",            destino: "index.html" },
      { texto: "Vagas",             destino: "pages/candidaturas.html" },
      { texto: "Perfil da empresa", destino: "pages/perfil.html" }
    ],
    // Visitante sem sessão: só a apresentação e o botão de entrar.
    visitante: [
      { texto: "Início", destino: "index.html" },
      { texto: "Entrar", destino: "pages/cadastro.html" }
    ]
  };

  /**
   * Descobre o nome do arquivo da página atual (ex.: "vagas.html").
   * Se a URL terminar em "/" (ex.: abrir a pasta), assume index.html.
   * @returns {string}
   */
  function paginaAtual() {
    const partes = window.location.pathname.split("/");
    return partes[partes.length - 1] || "index.html";
  }

  /**
   * Devolve a lista de itens do menu para o tipo de acesso atual.
   * @returns {object[]}
   */
  function itensDoMenu() {
    const tipo = App.SessaoServico.obterTipo();
    return MENUS[tipo] || MENUS.visitante;
  }

  /**
   * Cria o cabeçalho com logo, menu e botão "Sair" (quando há sessão).
   * @param {string} raiz prefixo dos caminhos ("" ou "../")
   */
  function montarCabecalho(raiz) {
    const atual = paginaAtual();
    const tipo = App.SessaoServico.obterTipo();

    const links = itensDoMenu().map(function (item) {
      // Compara só o nome do arquivo, então "pages/vagas.html" casa
      // com a página atual "vagas.html" independentemente da pasta.
      const ehAtual = item.destino.split("/").pop() === atual;
      // aria-current="page" indica ao leitor de tela (e ao CSS) a página atual.
      return '<li><a href="' + raiz + item.destino + '"' + (ehAtual ? ' aria-current="page"' : "") + ">" +
             item.texto + "</a></li>";
    }).join("");

    // O botão "Sair" só aparece para quem escolheu um perfil.
    // data-acao="sair" é tratado pelo listener abaixo.
    const botaoSair = tipo
      ? '<button type="button" class="botao botao--secundario botao--sair" data-acao="sair">Sair</button>'
      : "";

    document.getElementById("cabecalho-site").innerHTML =
      '<div class="container cabecalho__interno">' +
        '<a class="logo" href="' + raiz + 'index.html">Elo Libras</a>' +
        '<nav aria-label="Menu principal"><ul class="menu">' + links + "</ul></nav>" +
        botaoSair +
      "</div>";

    // Delegação de eventos: um único listener no cabeçalho trata o "Sair".
    document.getElementById("cabecalho-site").addEventListener("click", function (evento) {
      const botao = evento.target.closest('[data-acao="sair"]');
      if (!botao) return;
      App.SessaoServico.sair();
      // Volta para o cadastro, onde o usuário escolhe o perfil novamente.
      window.location.href = raiz + "pages/cadastro.html";
    });
  }

  /**
   * Cria o rodapé com a identificação do projeto e links úteis.
   * @param {string} raiz prefixo dos caminhos ("" ou "../")
   */
  function montarRodape(raiz) {
    document.getElementById("rodape-site").innerHTML =
      '<div class="container">' +
        "<p><strong>Elo Libras</strong> - projeto acadêmico do curso Técnico em Desenvolvimento de Sistemas (Senac).</p>" +
        "<p>Plataforma que conecta empresas e intérpretes de Libras. Protótipo com dados fictícios. Nenhuma informação é enviada a servidores: tudo fica salvo no seu navegador.</p>" +
        '<p><a href="' + raiz + 'pages/cadastro.html">Trocar de perfil</a></p>' +
      "</div>";
  }

  /**
   * Protege a página: se o <body> tem data-exigir="interprete" (ou "empresa")
   * e o tipo de acesso atual é outro, redireciona para o cadastro.
   * data-exigir="sessao" aceita qualquer um dos dois perfis.
   * @param {string} raiz prefixo dos caminhos ("" ou "../")
   * @returns {boolean} true se a página pode continuar carregando
   */
  function exigirTipo(raiz) {
    const exigido = document.body.getAttribute("data-exigir");
    if (!exigido) return true;                       // página pública
    const tipo = App.SessaoServico.obterTipo();
    if (exigido === "sessao" ? tipo !== null : tipo === exigido) return true;
    // replace() troca a página no histórico, para o "Voltar" não voltar aqui.
    window.location.replace(raiz + "pages/cadastro.html");
    return false;
  }

  /**
   * Ponto de entrada: chamado automaticamente quando o HTML termina
   * de carregar (DOMContentLoaded), garantindo que os elementos
   * #cabecalho-site e #rodape-site já existam.
   */
  function iniciar() {
    // data-raiz ausente = "" (raiz do projeto), para nunca gerar link quebrado.
    const raiz = document.body.getAttribute("data-raiz") || "";
    // A checagem vem antes de montar o layout: se falhar, a página já está saindo.
    if (!exigirTipo(raiz)) return;
    montarCabecalho(raiz);
    montarRodape(raiz);
  }

  document.addEventListener("DOMContentLoaded", iniciar);

  // Exposto também como função, caso alguma página queira remontar o layout.
  return { iniciar: iniciar, exigirTipo: exigirTipo };
})();
