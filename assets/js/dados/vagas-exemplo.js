/* ==========================================================
   dados/vagas-exemplo.js
   DADOS FICTÍCIOS do protótipo (não existe back-end nem banco).

   Por que este arquivo vem primeiro?
   - Todos os scripts do projeto compartilham um único objeto
     global chamado "App". Ele é criado aqui e cada arquivo
     seguinte "pendura" nele as suas peças
     (App.Armazenamento, App.VagasServico, App.CartaoVaga...).
   - Se este <script> fosse carregado depois dos outros, eles
     tentariam usar App.ESPECIALIDADES antes de ela existir.
     Por isso a ORDEM dos <script> nos HTMLs importa.

   O que é uma "vaga" aqui?
   É uma demanda por um INTÉRPRETE DE LIBRAS, publicada por uma
   empresa ou por uma agência de RH. O intérprete é quem se
   candidata; a empresa é quem contrata.
   ========================================================== */

// Cria o namespace global "App".
// "window.App || {}" significa: se já existir, reaproveita; se não, cria {}.
// Assim o arquivo pode ser carregado mais de uma vez sem apagar dados.
window.App = window.App || {};

/* ----------------------------------------------------------
   ESPECIALIDADES (áreas de atuação do intérprete)
   - "id":    valor curto gravado nos dados (não tem acento nem espaço,
              então é seguro em URLs, atributos HTML e comparações).
   - "rotulo": texto em português exibido na tela.
   Usadas em três lugares: nas vagas (o que a vaga exige), no perfil
   do intérprete (o que ele domina) e nos filtros da página de vagas.
   Para adicionar uma especialidade nova, basta incluir uma linha aqui.
   ---------------------------------------------------------- */
App.ESPECIALIDADES = [
  { id: "corporativo", rotulo: "Corporativo e reuniões" },
  { id: "educacional", rotulo: "Educacional" },
  { id: "saude",       rotulo: "Saúde" },
  { id: "juridico",    rotulo: "Jurídico" },
  { id: "eventos",     rotulo: "Eventos e palestras" },
  { id: "tecnico",     rotulo: "Treinamento técnico" }
];

// Modalidades de trabalho aceitas.
// O select da página de vagas é preenchido a partir desta lista,
// e o filtro compara o valor escolhido com o campo "modalidade" da vaga.
App.MODALIDADES = ["Presencial", "Remoto", "Híbrido"];

// Tipos de contratação aceitos (mesma ideia: alimentam selects e filtros).
App.CONTRATOS = ["CLT", "PJ", "Temporário"];

/* ----------------------------------------------------------
   VAGAS DE EXEMPLO (cidades da Serra Gaúcha / RS)
   Campos de cada vaga:
   - id:            identificador fixo, usado para achar a vaga e
                    para saber se o candidato já se candidatou a ela;
   - titulo:        nome da vaga;
   - empresa:       quem publica (empresa contratante ou agência de RH);
   - cliente:       empresa cliente, preenchida quando uma agência de RH
                    publica a vaga em nome de outra empresa
                    (cenário "RH X + empresa cliente"). Vazio = não se aplica;
   - localizacao:   cidade e estado;
   - modalidade:    um dos valores de App.MODALIDADES;
   - contrato:      um dos valores de App.CONTRATOS;
   - descricao:     texto livre mostrado no modal de detalhes;
   - especialidades: lista de ids de App.ESPECIALIDADES.
   ---------------------------------------------------------- */
App.VAGAS_EXEMPLO = [
  {
    id: "v1",
    titulo: "Intérprete de Libras - Integração de novo colaborador",
    empresa: "RH Conecta Serra",
    cliente: "Metalúrgica Serra Forte",
    localizacao: "Caxias do Sul - RS",
    modalidade: "Presencial",
    contrato: "CLT",
    descricao: "A Metalúrgica Serra Forte contratou um colaborador surdo para a produção. Buscamos intérprete para acompanhar a integração, treinamentos de segurança e reuniões de equipe.",
    especialidades: ["corporativo", "tecnico"]
  },
  {
    id: "v2",
    titulo: "Intérprete de Libras - Reuniões remotas",
    empresa: "TechVale Soluções",
    cliente: "",
    localizacao: "Bento Gonçalves - RS",
    modalidade: "Remoto",
    contrato: "PJ",
    descricao: "Equipe de tecnologia com desenvolvedora surda. Interpretação de reuniões diárias e semanais por videochamada, cerca de 10 horas por semana.",
    especialidades: ["corporativo"]
  },
  {
    id: "v3",
    titulo: "Intérprete para processo seletivo (entrevistas)",
    empresa: "RH Conecta Serra",
    cliente: "Distribuidora Serrana",
    localizacao: "Flores da Cunha - RS",
    modalidade: "Presencial",
    contrato: "Temporário",
    descricao: "Vaga para colaborador surdo na Distribuidora Serrana. Precisamos de intérprete para as entrevistas e dinâmicas de grupo, em 3 dias de agenda.",
    especialidades: ["corporativo"]
  },
  {
    id: "v4",
    titulo: "Intérprete de Libras - Treinamento técnico",
    empresa: "Vinícola Encosta Verde",
    cliente: "",
    localizacao: "Farroupilha - RS",
    modalidade: "Presencial",
    contrato: "Temporário",
    descricao: "Treinamento de equipe de envase com funcionários surdos. Vocabulário técnico de produção; material de apoio será enviado antes.",
    especialidades: ["tecnico"]
  },
  {
    id: "v5",
    titulo: "Intérprete de Libras - Equipe de saúde ocupacional",
    empresa: "Clínica Vida Plena",
    cliente: "",
    localizacao: "Caxias do Sul - RS",
    modalidade: "Híbrido",
    contrato: "CLT",
    descricao: "Acompanhamento de atendimentos de saúde ocupacional e exames admissionais de pessoas surdas, com sigilo profissional.",
    especialidades: ["saude"]
  },
  {
    id: "v6",
    titulo: "Intérprete para eventos corporativos",
    empresa: "Agência Pixel Sul",
    cliente: "",
    localizacao: "Garibaldi - RS",
    modalidade: "Presencial",
    contrato: "PJ",
    descricao: "Interpretação em palestras e convenções de clientes da agência. Trabalho em dupla, por evento.",
    especialidades: ["eventos", "corporativo"]
  }
];

// IDs das vagas exibidas como "em destaque" na página inicial.
// A home.js percorre esta lista e busca cada vaga com buscarPorId().
// Se um id não existir mais, a home simplesmente ignora (não quebra).
App.VAGAS_DESTAQUE = ["v1", "v2", "v3"];

/* ----------------------------------------------------------
   ETAPAS DE UMA CANDIDATURA
   A ORDEM desta lista é o próprio fluxo: "enviada" -> "analise"
   -> "entrevista" -> "finalizada". O avanço de etapa usa a
   posição do status atual nesta lista (ver candidatura-servico.js).
   Para incluir uma etapa nova, coloque-a na posição correta aqui.
   ---------------------------------------------------------- */
App.ETAPAS_CANDIDATURA = [
  { id: "enviada",    rotulo: "Enviada" },
  { id: "analise",    rotulo: "Em análise" },
  { id: "entrevista", rotulo: "Entrevista" },
  { id: "finalizada", rotulo: "Finalizada" }
];
