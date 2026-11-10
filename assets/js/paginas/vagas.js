/* ==========================================================
   paginas/vagas.js
   Lógica da página de vagas (vagas.html):
   - monta os filtros dinâmicos (modalidade e especialidades);
   - lê os filtros e mostra as vagas correspondentes;
   - abre os detalhes e permite candidatar-se.

   Depende de: App.VagasServico, App.Helpers e App.CartaoVaga.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // Referências aos elementos da página (buscados uma única vez,
  // em vez de consultar o DOM a cada tecla digitada).
  const formFiltros = document.getElementById("form-filtros");
  const listaVagas = document.getElementById("lista-vagas");
  const contador = document.getElementById("contador-resultados");
  const selectModalidade = document.getElementById("filtro-modalidade");
  const caixaEspecialidades = document.getElementById("filtro-especialidades");

  /* --- Preenche os filtros dinâmicos --- */
  // A opção "Todas" já está no HTML; aqui acrescentamos as modalidades de App.MODALIDADES.
  App.MODALIDADES.forEach(function (modalidade) {
    const opcao = document.createElement("option");
    opcao.value = modalidade;
    opcao.textContent = modalidade;
    selectModalidade.appendChild(opcao);
  });
  // Nenhuma especialidade marcada no início (lista vazia).
  App.Helpers.renderizarCheckboxesEspecialidades(caixaEspecialidades, "especialidades", []);

  // Se o usuário veio da página inicial com ?busca=texto, preenche o campo
  // de busca para que o filtro já apareça aplicado.
  const parametros = new URLSearchParams(window.location.search);
  document.getElementById("filtro-texto").value = parametros.get("busca") || "";

  /**
   * Lê os valores atuais do formulário e devolve um objeto de filtros
   * no formato esperado por App.VagasServico.filtrar().
   * @returns {{texto: string, localizacao: string, modalidade: string, especialidades: string[]}}
   */
  function lerFiltros() {
    return {
      texto: document.getElementById("filtro-texto").value,
      localizacao: document.getElementById("filtro-local").value,
      modalidade: selectModalidade.value,   // "" = "Todas"
      especialidades: App.Helpers.lerCheckboxes(formFiltros, "especialidades")
    };
  }

  /**
   * Redesenha na tela as vagas que passam pelos filtros atuais.
   * É chamada a cada alteração no formulário e na primeira exibição.
   */
  function atualizarLista() {
    const vagas = App.VagasServico.filtrar(App.VagasServico.listar(), lerFiltros());
    listaVagas.innerHTML = "";   // limpa os cartões anteriores

    // O contador tem aria-live="polite" no HTML: o leitor de tela anuncia
    // o novo total sempre que ele muda. O plural é ajustado para 1 vaga.
    contador.textContent = vagas.length + (vagas.length === 1 ? " vaga encontrada" : " vagas encontradas");

    if (vagas.length === 0) {
      listaVagas.innerHTML = '<p class="vazio">Nenhuma vaga encontrada. Tente remover alguns filtros.</p>';
      return;
    }
    vagas.forEach(function (vaga) {
      // Vagas encerradas pela empresa continuam listadas, mas com o selo
      // "Encerrada" e sem permitir nova candidatura (ver cartao-vaga.js).
      listaVagas.appendChild(App.CartaoVaga.criarCartao(vaga, function (v) {
        App.CartaoVaga.abrirDetalhes(v, App.CartaoVaga.candidatarComAviso);
      }));
    });
  }

  // Atualiza a lista a cada alteração: "input" cobre a digitação,
  // "change" cobre select e checkboxes, e "submit" (Enter) também.
  formFiltros.addEventListener("input", atualizarLista);
  formFiltros.addEventListener("change", atualizarLista);
  formFiltros.addEventListener("submit", function (evento) {
    evento.preventDefault();   // evita recarregar a página ao apertar Enter
    atualizarLista();
  });

  // Botão "Limpar filtros": reset() volta os campos ao estado inicial do HTML
  // (atenção: o texto vindo de ?busca= não é restaurado, é apagado).
  document.getElementById("limpar-filtros").addEventListener("click", function () {
    formFiltros.reset();
    atualizarLista();
  });

  atualizarLista();   // primeira exibição, já com o filtro de ?busca= aplicado
});
