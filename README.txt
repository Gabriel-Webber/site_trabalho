# Elo Libras - Marketplace de Intérpretes de Libras para Empresas

## 1. Contexto do projeto

Plataforma que conecta EMPRESAS e AGÊNCIAS DE RH a INTÉRPRETES DE LIBRAS (Língua Brasileira de Sinais) para vagas e demandas do setor.

Cenário que o site demonstra:

> Uma empresa de RH ("RH X") recebe de uma empresa cliente uma vaga para uma pessoa com deficiência auditiva (surda). Para que o processo seletivo e a rotina de trabalho sejam acessíveis, a equipe precisa de um intérprete de Libras. O RH X publica no site a demanda por intérprete, e os intérpretes interessados se candidatam e acompanham o processo.

Projeto acadêmico desenvolvido por quatro estudantes do curso Técnico em Desenvolvimento de Sistemas do Senac. Piloto regional: Serra Gaúcha / RS.

Contexto legal: Lei de Cotas (8.213/91), Lei Brasileira de Inclusão (13.146/15) e Lei da Libras (10.436/02).

## 2. Públicos

- EMPRESA / RH (contratante): cadastra a empresa, publica vagas de intérprete e acompanha os candidatos. Agências de RH podem informar a "empresa cliente" para a qual a vaga é destinada.
- INTÉRPRETE (candidato): cria perfil profissional, busca vagas, se candidata e acompanha o andamento.

## 3. Tecnologias obrigatórias

- HTML5, CSS3 e JavaScript puro. Sem frameworks ou bibliotecas.
- Sem back-end nem banco de dados: dados simulados em arrays JavaScript e armazenamento em localStorage.
- Protótipo funcional, não uma plataforma comercial. Sem autenticação real nem envio de e-mails.

## 4. Páginas

| Arquivo | Função |
|---|---|
| pages/cadastro.html | Passo 1 da entrada: pergunta se o usuário quer criar um perfil para a empresa ou entrar como intérprete. A escolha é levada para a página de criação do perfil |
| pages/criar-perfil.html | Passo 2 da entrada: formulário de criação do perfil do intérprete ou da empresa/RH. Ao salvar, grava a sessão e abre o sistema |
| index.html | Página inicial. Intérprete: busca, vagas em destaque e candidatura. Empresa/RH: atalho para publicar e lista das vagas publicadas. Sem sessão: apresentação com os dois botões de entrada |
| pages/vagas.html | (Intérprete) Lista de vagas de intérprete. Busca por cargo ou empresa. Filtros por localização, modalidade (presencial, remoto, híbrido) e especialidade. Detalhes e candidatura |
| pages/candidaturas.html | Intérprete: candidaturas com status demonstrativo (enviada, em análise, entrevista, finalizada). Empresa/RH: criação, edição, encerramento e exclusão de vagas, com o número de candidaturas recebidas |
| pages/perfil.html | Intérprete: dados, formação e certificações (ex.: Prolibras), experiência, idiomas, especialidades, vídeo de apresentação, resumo das candidaturas e exclusão do perfil. Empresa/RH: dados da empresa, exclusão do cadastro e resumo das vagas |

### Menus por perfil
- Intérprete: Início, Vagas, Candidaturas, Meu perfil.
- Empresa/RH: Início, Vagas, Perfil da empresa.
- Sem sessão: Início e Entrar.

As páginas protegidas usam `data-exigir` no `<body>` (`interprete`, `empresa` ou `sessao`) e redirecionam para o cadastro quando o perfil não confere. O botão "Sair" do cabeçalho apaga apenas o tipo de acesso; os dados continuam salvos.

### Dados de uma vaga
Título, empresa contratante (ou RH), empresa cliente (opcional), localização, modalidade, tipo de contrato (CLT, PJ, temporário), descrição e especialidades exigidas.

### Especialidades de interpretação
Corporativo e reuniões, educacional, saúde, jurídico, eventos e palestras, treinamento técnico.

## 5. Fluxos de demonstração

Entrada em três passos: abrir o site -> "Entrar" -> escolher "Sou intérprete" ou "Quero criar um perfil para a empresa" (passo 1) -> preencher o cadastro daquele perfil (passo 2) -> o sistema abre com o menu daquele perfil. A sessão só é gravada depois que o perfil é salvo.

Empresa / RH: cadastrar a empresa em "Perfil da empresa" -> em "Vagas", publicar vaga de intérprete (informando a empresa cliente) -> editar, encerrar ou excluir a vaga -> acompanhar o número de candidaturas recebidas.

Intérprete: buscar vagas -> ver detalhes -> cadastrar perfil em "Meu perfil" -> candidatar-se -> acompanhar candidatura em "Candidaturas".

## 6. Funcionalidades em JavaScript

1. Escolha do perfil (intérprete ou empresa) e criação do cadastro antes de entrar no sistema, com menu e páginas por perfil.
2. Pesquisa e filtros de vagas.
3. Cadastro demonstrativo de intérpretes.
4. Cadastro demonstrativo de empresas/RH.
5. Publicação, edição, encerramento e exclusão de vagas.
6. Candidatura às vagas.
7. Acompanhamento das candidaturas.
8. Armazenamento local (localStorage).

## 7. Design e acessibilidade

- Layout responsivo, bom contraste, fontes legíveis, estrutura semântica e navegação por teclado.
- Foco visível, link "pular para o conteúdo", textos alternativos.
- Espaços reservados para vídeos explicativos em Libras, com legenda/transcrição em texto.
- Textos objetivos e de fácil compreensão.

## 8. Organização do código

```
index.html
pages/                  cadastro, criar-perfil, vagas, candidaturas, perfil
assets/css/             variaveis, base, layout, componentes, responsivo
assets/js/dados/        dados fictícios
assets/js/utils/        armazenamento (localStorage) e funções de apoio
assets/js/servicos/     regras de negócio (sessão, vagas, candidaturas, cadastros)
assets/js/componentes/  cabeçalho/rodapé e cartão de vaga
assets/js/paginas/      um script por página
```

Código comentado em português, com nomes claros, para facilitar alterações por estudantes de nível técnico.

## 9. Fora do escopo do protótipo

Login real, pagamento, verificação oficial de certificações (Prolibras), chat em tempo real, envio de e-mails e agenda de intérpretes. Exigiriam back-end e ficam para uma fase posterior.
