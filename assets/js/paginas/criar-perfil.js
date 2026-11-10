/* ==========================================================
   paginas/criar-perfil.js
   Lógica da página de criação de perfil (criar-perfil.html),
   que é o PASSO 2 do fluxo de entrada:

   1) cadastro.html  -> escolha do tipo (intérprete ou empresa);
   2) criar-perfil.html -> preenchimento e gravação do perfil;
   3) index.html     -> sistema, já com o menu daquele perfil.

   O tipo chega pela URL (?tipo=interprete ou ?tipo=empresa), então
   esta página não depende de sessão: a sessão só é gravada depois
   que o perfil é salvo, no fim do formulário.

   Depende de: App.SessaoServico, App.CadastroServico e App.Helpers.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const H = App.Helpers;

  // Lê o tipo escolhido na tela anterior. Sem tipo válido, volta ao passo 1.
  const parametros = new URLSearchParams(window.location.search);
  const tipo = parametros.get("tipo");
  if (tipo !== "interprete" && tipo !== "empresa") {
    window.location.replace("cadastro.html");
    return;
  }

  const visaoInterprete = document.getElementById("visao-interprete");
  const visaoEmpresa = document.getElementById("visao-empresa");
  const titulo = document.getElementById("titulo-cadastro");
  const subtitulo = document.getElementById("subtitulo-cadastro");

  /**
   * Finaliza o cadastro: grava a sessão e abre o sistema.
   * A sessão é gravada só aqui, para que o sistema não fique acessível
   * antes de o perfil existir.
   */
  function entrarNoSistema() {
    App.SessaoServico.definirTipo(tipo);
    window.location.href = "../index.html";
  }

  /* ==========================================================
     VISÃO DO INTÉRPRETE
     ========================================================== */
  if (tipo === "interprete") {
    visaoInterprete.hidden = false;
    titulo.textContent = "Criar perfil de intérprete";
    subtitulo.textContent = "Passo 2 de 2: preencha seus dados para entrar no sistema.";

    const form = document.getElementById("form-cadastro-interprete");
    // Se já existe perfil salvo neste navegador, os campos vêm preenchidos
    // (útil para quem saiu e está entrando de novo).
    const salvo = App.CadastroServico.lerPerfil();

    H.renderizarCheckboxesEspecialidades(
      document.getElementById("cad-especialidades"),
      "especialidades",
      salvo ? salvo.especialidades : []
    );

    if (salvo) {
      ["nome", "email", "cidade", "formacao", "experiencia", "habilidades", "videoLibras"].forEach(function (campo) {
        form.elements[campo].value = salvo[campo] || "";
      });
    }

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const perfil = {
        nome: form.elements.nome.value.trim(),
        email: form.elements.email.value.trim(),
        cidade: form.elements.cidade.value.trim(),
        formacao: form.elements.formacao.value.trim(),
        experiencia: form.elements.experiencia.value.trim(),
        habilidades: form.elements.habilidades.value.trim(),
        videoLibras: form.elements.videoLibras.value.trim(),
        especialidades: H.lerCheckboxes(form, "especialidades")
      };
      // Só entra no sistema se o perfil foi realmente gravado.
      if (!App.CadastroServico.salvarPerfil(perfil)) {
        H.mostrarAviso("Não foi possível salvar o perfil. Verifique o armazenamento do navegador.", true);
        return;
      }
      entrarNoSistema();
    });
    return;
  }

  /* ==========================================================
     VISÃO DA EMPRESA / RH
     ========================================================== */
  visaoEmpresa.hidden = false;
  titulo.textContent = "Criar perfil da empresa";
  subtitulo.textContent = "Passo 2 de 2: preencha os dados da empresa para entrar no sistema.";

  const formEmpresa = document.getElementById("form-cadastro-empresa");
  const empresaSalva = App.CadastroServico.lerEmpresa();

  H.renderizarCheckboxesEspecialidades(
    document.getElementById("cad-emp-especialidades"),
    "especialidades",
    empresaSalva ? empresaSalva.especialidades : []
  );

  if (empresaSalva) {
    ["nome", "cnpj", "cidade", "descricao"].forEach(function (campo) {
      formEmpresa.elements[campo].value = empresaSalva[campo] || "";
    });
  }

  formEmpresa.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const empresa = {
      nome: formEmpresa.elements.nome.value.trim(),
      cnpj: formEmpresa.elements.cnpj.value.trim(),
      cidade: formEmpresa.elements.cidade.value.trim(),
      descricao: formEmpresa.elements.descricao.value.trim(),
      especialidades: H.lerCheckboxes(formEmpresa, "especialidades"),
      verificada: false      // verificação apenas demonstrativa (sem certificação real)
    };
    if (!App.CadastroServico.salvarEmpresa(empresa)) {
      H.mostrarAviso("Não foi possível salvar a empresa. Verifique o armazenamento do navegador.", true);
      return;
    }
    entrarNoSistema();
  });
});
