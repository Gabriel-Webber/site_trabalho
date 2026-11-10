/* ==========================================================
   paginas/perfil.js
   Lógica da página de perfil (perfil.html), que tem DUAS visões
   escolhidas pelo tipo de acesso:

   - Intérprete: formulário do perfil, exclusão do perfil e resumo
     das candidaturas;
   - Empresa/RH: cadastro da empresa, exclusão do cadastro e resumo
     das vagas publicadas.

   As duas visões ficam no HTML e só uma é exibida (hidden).

   Depende de: App.SessaoServico, App.CadastroServico,
   App.CandidaturaServico, App.VagasServico e App.Helpers.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const H = App.Helpers;
  const visaoInterprete = document.getElementById("visao-interprete");
  const visaoEmpresa = document.getElementById("visao-empresa");
  const tituloPagina = document.getElementById("titulo-perfil");
  const subtituloPagina = document.getElementById("subtitulo-perfil");

  /* ==========================================================
     PARTE 1: VISÃO DO INTÉRPRETE
     ========================================================== */
  const formPerfil = document.getElementById("form-perfil");
  const caixaEspecialidades = document.getElementById("perfil-especialidades");
  const resumo = document.getElementById("resumo-candidaturas");
  const botaoExcluirPerfil = document.getElementById("excluir-perfil");

  // Lê o perfil já salvo (null se for o primeiro acesso).
  const perfilSalvo = App.CadastroServico.lerPerfil();

  // Cria os checkboxes de especialidades, marcando as que já estavam salvas.
  H.renderizarCheckboxesEspecialidades(caixaEspecialidades, "especialidades", perfilSalvo ? perfilSalvo.especialidades : []);

  // Se já existe perfil, copia cada valor salvo para o campo de mesmo "name".
  // "formPerfil.elements[campo]" acessa o input pelo atributo name.
  if (perfilSalvo) {
    ["nome", "email", "cidade", "formacao", "experiencia", "habilidades", "videoLibras"].forEach(function (campo) {
      formPerfil.elements[campo].value = perfilSalvo[campo] || "";
    });
    // O botão de excluir só faz sentido quando há algo para excluir.
    botaoExcluirPerfil.hidden = false;
  }

  // Ao enviar o formulário: monta o objeto e salva.
  formPerfil.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // A validação básica (required, type="email", type="url") já é feita
    // pelo navegador antes de chegar aqui; por isso só montamos o objeto.
    // trim() remove espaços sobrando no começo e no fim de cada texto.
    const perfil = {
      nome: formPerfil.elements.nome.value.trim(),
      email: formPerfil.elements.email.value.trim(),
      cidade: formPerfil.elements.cidade.value.trim(),
      formacao: formPerfil.elements.formacao.value.trim(),
      experiencia: formPerfil.elements.experiencia.value.trim(),
      habilidades: formPerfil.elements.habilidades.value.trim(),
      videoLibras: formPerfil.elements.videoLibras.value.trim(),
      especialidades: H.lerCheckboxes(formPerfil, "especialidades")
    };

    // salvarPerfil() devolve false se o localStorage estiver cheio ou bloqueado.
    if (App.CadastroServico.salvarPerfil(perfil)) {
      H.mostrarAviso("Perfil salvo com sucesso!");
      botaoExcluirPerfil.hidden = false;
    } else {
      H.mostrarAviso("Não foi possível salvar o perfil.", true);
    }
  });

  // Excluir perfil: confirm() evita exclusão acidental.
  botaoExcluirPerfil.addEventListener("click", function () {
    if (!window.confirm("Excluir seu perfil? As candidaturas já enviadas continuam salvas.")) return;
    App.CadastroServico.excluirPerfil();
    formPerfil.reset();   // limpa os campos na tela
    botaoExcluirPerfil.hidden = true;
    H.mostrarAviso("Perfil excluído.");
  });

  // Mostra as candidaturas feitas (resumo com link para a página completa).
  const candidaturas = App.CandidaturaServico.listar();
  if (candidaturas.length === 0) {
    resumo.innerHTML = '<p>Você ainda não se candidatou. <a href="vagas.html">Procurar vagas</a></p>';
  } else {
    resumo.innerHTML = "<ul>" + candidaturas.map(function (c) {
      // Título e empresa vêm do usuário/dados, então passam por escaparHtml.
      return "<li>" + H.escaparHtml(c.titulo) + " - " + H.escaparHtml(c.empresa) + "</li>";
    }).join("") + '</ul><p><a href="candidaturas.html">Acompanhar candidaturas</a></p>';
  }

  /* ==========================================================
     PARTE 2: VISÃO DA EMPRESA / RH
     ========================================================== */
  const formEmpresa = document.getElementById("form-empresa");
  const resumoVagas = document.getElementById("resumo-vagas");
  const botaoExcluirEmpresa = document.getElementById("excluir-empresa");

  // Lê a empresa já cadastrada (null se ainda não houver).
  const empresaSalva = App.CadastroServico.lerEmpresa();

  // Cria os checkboxes de especialidades marcando as áreas já salvas.
  H.renderizarCheckboxesEspecialidades(document.getElementById("empresa-especialidades"), "especialidades", empresaSalva ? empresaSalva.especialidades : []);

  // Preenche o formulário com os dados salvos, campo a campo.
  if (empresaSalva) {
    ["nome", "cnpj", "cidade", "descricao"].forEach(function (campo) {
      formEmpresa.elements[campo].value = empresaSalva[campo] || "";
    });
    botaoExcluirEmpresa.hidden = false;
  }

  /**
   * Redesenha o resumo das vagas publicadas pela empresa.
   */
  function desenharResumoVagas() {
    const empresa = App.CadastroServico.lerEmpresa();
    if (!empresa) {
      resumoVagas.innerHTML = '<p>Cadastre a empresa para começar a publicar vagas.</p>';
      return;
    }
    const vagas = App.VagasServico.listarPorEmpresa(empresa.nome);
    if (vagas.length === 0) {
      resumoVagas.innerHTML = '<p>Nenhuma vaga publicada ainda.</p>';
    } else {
      resumoVagas.innerHTML = "<ul>" + vagas.map(function (v) {
        const situacao = v.status === "encerrada" ? " (encerrada)" : "";
        return "<li>" + H.escaparHtml(v.titulo) + situacao + "</li>";
      }).join("") + "</ul>";
    }
    resumoVagas.innerHTML += '<p><a class="botao botao--empresa" href="candidaturas.html">Gerenciar vagas</a></p>';
  }

  // Salvar cadastro da empresa (cria ou substitui o cadastro existente).
  formEmpresa.addEventListener("submit", function (evento) {
    evento.preventDefault();   // a validação de "required" já foi feita pelo navegador
    const empresa = {
      nome: formEmpresa.elements.nome.value.trim(),
      cnpj: formEmpresa.elements.cnpj.value.trim(),
      cidade: formEmpresa.elements.cidade.value.trim(),
      descricao: formEmpresa.elements.descricao.value.trim(),
      especialidades: H.lerCheckboxes(formEmpresa, "especialidades"),
      verificada: false      // verificação apenas demonstrativa (sem certificação real)
    };
    App.CadastroServico.salvarEmpresa(empresa);
    H.mostrarAviso("Empresa cadastrada! (verificação demonstrativa)");
    botaoExcluirEmpresa.hidden = false;
    desenharResumoVagas();   // o nome pode ter mudado, então a lista é refeita
  });

  // Excluir cadastro da empresa. As vagas publicadas continuam na página de vagas.
  botaoExcluirEmpresa.addEventListener("click", function () {
    if (!window.confirm("Excluir o cadastro da empresa? As vagas já publicadas continuam no site.")) return;
    App.CadastroServico.excluirEmpresa();
    formEmpresa.reset();
    botaoExcluirEmpresa.hidden = true;
    H.mostrarAviso("Cadastro da empresa excluído.");
    desenharResumoVagas();
  });

  /* ==========================================================
     PARTE 3: ESCOLHA DA VISÃO CONFORME A SESSÃO
     ========================================================== */
  if (App.SessaoServico.ehEmpresa()) {
    visaoEmpresa.hidden = false;
    tituloPagina.textContent = "Perfil da empresa";
    subtituloPagina.textContent = "Mantenha os dados da empresa atualizados. Eles aparecem nas vagas que você publica.";
    desenharResumoVagas();
  } else {
    visaoInterprete.hidden = false;
    tituloPagina.textContent = "Meu perfil";
  }
});
