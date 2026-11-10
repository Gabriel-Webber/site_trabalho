/* ==========================================================
   paginas/cadastro.js
   Lógica da tela de entrada (cadastro.html), que é o PASSO 1 do
   fluxo:

   1) cadastro.html     -> escolha do tipo (intérprete ou empresa);
   2) criar-perfil.html -> preenchimento e gravação do perfil;
   3) index.html        -> sistema, já com o menu daquele perfil.

   Aqui a sessão NÃO é gravada: apenas redirecionamos para a página
   de criação do perfil, levando o tipo escolhido na URL. A sessão só
   é definida em criar-perfil.js, depois que o perfil é salvo.

   Depende de: App.SessaoServico.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-acesso");
  const erro = document.getElementById("erro-acesso");
  const avisoSessao = document.getElementById("sessao-atual");

  // Se já há sessão, avisa qual perfil está ativo e oferece continuar.
  const tipoAtual = App.SessaoServico.obterTipo();
  if (tipoAtual) {
    const nome = tipoAtual === "empresa" ? "empresa / RH" : "intérprete";
    avisoSessao.hidden = false;
    avisoSessao.innerHTML = "Você já está usando o site como <strong>" + nome +
      '</strong>. <a href="../index.html">Continuar</a> ou escolha outro perfil abaixo.';
  }

  // Ao enviar: valida a escolha e vai para a criação do perfil daquele tipo.
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    // "input[name=tipo]:checked" devolve o rádio marcado (ou null).
    const escolhido = form.querySelector('input[name="tipo"]:checked');
    if (!escolhido) {
      // O "required" do HTML já bloqueia o envio, mas o aviso deixa a
      // mensagem clara também para quem usa leitor de tela.
      erro.hidden = false;
      return;
    }
    erro.hidden = true;
    // O tipo vai na URL; criar-perfil.js mostra o formulário correspondente.
    window.location.href = "criar-perfil.html?tipo=" + encodeURIComponent(escolhido.value);
  });

  // Esconde o erro assim que o usuário escolhe uma opção.
  form.addEventListener("change", function () { erro.hidden = true; });
});
