// Script de inicialização do MongoDB para Docker
// Este arquivo será executado quando o container MongoDB for criado pela primeira vez

// Conectar ao banco de dados
db = db.getSiblingDB('seminario_ubm');

print('🚀 Iniciando configuração do banco de dados...');

// Criar usuário específico para a aplicação
db.createUser({
  user: 'seminario_user',
  pwd: 'seminario_pass',
  roles: [
    {
      role: 'readWrite',
      db: 'seminario_ubm'
    }
  ]
});

// Criar coleções principais
print('📁 Criando coleções...');
db.createCollection('usuarios');
db.createCollection('perfis');
db.createCollection('permissoes');
db.createCollection('locais');
db.createCollection('cursos');
db.createCollection('eventos');

// Inserir permissões padrão
print('🔐 Criando permissões padrão...');
db.permissoes.insertMany([
  // Módulo Locais
  { nome: 'Listar Locais', codigo: 'LOCAIS_LISTAR', modulo: 'locais', descricao: 'Permite visualizar a lista de locais', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Visualizar Local', codigo: 'LOCAIS_VISUALIZAR', modulo: 'locais', descricao: 'Permite ver detalhes de um local específico', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Criar Local', codigo: 'LOCAIS_CRIAR', modulo: 'locais', descricao: 'Permite criar novos locais', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Editar Local', codigo: 'LOCAIS_EDITAR', modulo: 'locais', descricao: 'Permite editar locais existentes', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Excluir Local', codigo: 'LOCAIS_EXCLUIR', modulo: 'locais', descricao: 'Permite excluir locais', ativo: true, createdAt: new Date(), updatedAt: new Date() },

  // Módulo Eventos
  { nome: 'Listar Eventos', codigo: 'EVENTOS_LISTAR', modulo: 'eventos', descricao: 'Permite visualizar a lista de eventos', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Visualizar Evento', codigo: 'EVENTOS_VISUALIZAR', modulo: 'eventos', descricao: 'Permite ver detalhes de um evento específico', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Criar Evento', codigo: 'EVENTOS_CRIAR', modulo: 'eventos', descricao: 'Permite criar novos eventos', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Editar Evento', codigo: 'EVENTOS_EDITAR', modulo: 'eventos', descricao: 'Permite editar eventos existentes', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Excluir Evento', codigo: 'EVENTOS_EXCLUIR', modulo: 'eventos', descricao: 'Permite excluir eventos', ativo: true, createdAt: new Date(), updatedAt: new Date() },

  // Módulo Cursos
  { nome: 'Listar Cursos', codigo: 'CURSOS_LISTAR', modulo: 'cursos', descricao: 'Permite visualizar a lista de cursos', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Visualizar Curso', codigo: 'CURSOS_VISUALIZAR', modulo: 'cursos', descricao: 'Permite ver detalhes de um curso específico', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Criar Curso', codigo: 'CURSOS_CRIAR', modulo: 'cursos', descricao: 'Permite criar novos cursos', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Editar Curso', codigo: 'CURSOS_EDITAR', modulo: 'cursos', descricao: 'Permite editar cursos existentes', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Excluir Curso', codigo: 'CURSOS_EXCLUIR', modulo: 'cursos', descricao: 'Permite excluir cursos', ativo: true, createdAt: new Date(), updatedAt: new Date() },

  // Módulo Usuários
  { nome: 'Listar Usuários', codigo: 'USUARIOS_LISTAR', modulo: 'usuarios', descricao: 'Permite visualizar a lista de usuários', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Visualizar Usuário', codigo: 'USUARIOS_VISUALIZAR', modulo: 'usuarios', descricao: 'Permite ver detalhes de um usuário específico', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Criar Usuário', codigo: 'USUARIOS_CRIAR', modulo: 'usuarios', descricao: 'Permite criar novos usuários', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Editar Usuário', codigo: 'USUARIOS_EDITAR', modulo: 'usuarios', descricao: 'Permite editar usuários existentes', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Excluir Usuário', codigo: 'USUARIOS_EXCLUIR', modulo: 'usuarios', descricao: 'Permite excluir usuários', ativo: true, createdAt: new Date(), updatedAt: new Date() },

  // Módulo Permissões
  { nome: 'Listar Permissões', codigo: 'PERMISSOES_LISTAR', modulo: 'permissoes', descricao: 'Permite visualizar a lista de permissões', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Visualizar Permissão', codigo: 'PERMISSOES_VISUALIZAR', modulo: 'permissoes', descricao: 'Permite ver detalhes de uma permissão específica', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Criar Permissão', codigo: 'PERMISSOES_CRIAR', modulo: 'permissoes', descricao: 'Permite criar novas permissões', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Editar Permissão', codigo: 'PERMISSOES_EDITAR', modulo: 'permissoes', descricao: 'Permite editar permissões existentes', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Excluir Permissão', codigo: 'PERMISSOES_EXCLUIR', modulo: 'permissoes', descricao: 'Permite excluir permissões', ativo: true, createdAt: new Date(), updatedAt: new Date() },

  // Módulo Perfis
  { nome: 'Listar Perfis', codigo: 'PERFIS_LISTAR', modulo: 'permissoes', descricao: 'Permite visualizar a lista de perfis', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Visualizar Perfil', codigo: 'PERFIS_VISUALIZAR', modulo: 'permissoes', descricao: 'Permite ver detalhes de um perfil específico', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Criar Perfil', codigo: 'PERFIS_CRIAR', modulo: 'permissoes', descricao: 'Permite criar novos perfis', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Editar Perfil', codigo: 'PERFIS_EDITAR', modulo: 'permissoes', descricao: 'Permite editar perfis existentes', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Excluir Perfil', codigo: 'PERFIS_EXCLUIR', modulo: 'permissoes', descricao: 'Permite excluir perfis', ativo: true, createdAt: new Date(), updatedAt: new Date() },

  // Módulo Relatórios
  { nome: 'Visualizar Relatórios', codigo: 'RELATORIOS_VISUALIZAR', modulo: 'relatorios', descricao: 'Permite visualizar relatórios do sistema', ativo: true, createdAt: new Date(), updatedAt: new Date() },
  { nome: 'Gerar Relatórios', codigo: 'RELATORIOS_GERAR', modulo: 'relatorios', descricao: 'Permite gerar relatórios personalizados', ativo: true, createdAt: new Date(), updatedAt: new Date() }
]);

// Buscar todas as permissões criadas
const todasPermissoes = db.permissoes.find({ ativo: true }).toArray();
const permissoesIds = todasPermissoes.map(p => p._id);

print('👥 Criando perfis padrão...');

// Criar perfil Administrador com todas as permissões
const perfilAdmin = {
  nome: 'Administrador',
  descricao: 'Acesso total ao sistema',
  permissoes: permissoesIds,
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date()
};
db.perfis.insertOne(perfilAdmin);

// Criar perfil Organizador (sem permissões de usuários e permissões)
const permissoesOrganizador = todasPermissoes
  .filter(p => !p.codigo.startsWith('USUARIOS_') && !p.codigo.startsWith('PERMISSOES_') && !p.codigo.startsWith('PERFIS_'))
  .map(p => p._id);

const perfilOrganizador = {
  nome: 'Organizador',
  descricao: 'Acesso para organização de eventos',
  permissoes: permissoesOrganizador,
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date()
};
db.perfis.insertOne(perfilOrganizador);

// Criar perfil Participante (apenas visualização)
const permissoesParticipante = todasPermissoes
  .filter(p => p.codigo.includes('_LISTAR') || p.codigo.includes('_VISUALIZAR'))
  .filter(p => !p.codigo.startsWith('USUARIOS_') && !p.codigo.startsWith('PERMISSOES_') && !p.codigo.startsWith('PERFIS_'))
  .map(p => p._id);

const perfilParticipante = {
  nome: 'Participante',
  descricao: 'Acesso apenas para visualização',
  permissoes: permissoesParticipante,
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date()
};
db.perfis.insertOne(perfilParticipante);

// Buscar o perfil administrador criado
const adminPerfil = db.perfis.findOne({ nome: 'Administrador' });

print('👤 Criando usuário administrador...');

// Criar usuário administrador padrão
// Senha: 123456 (será hasheada pela aplicação, não pelo script)
db.usuarios.insertOne({
  nome: 'Administrador do Sistema',
  email: 'admin@ubm.br',
  senha: '123456', // Senha em texto plano para ser hasheada pela aplicação
  perfil: adminPerfil._id,
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Inserir dados de exemplo
print('📊 Inserindo dados de exemplo...');

// Locais de exemplo
db.locais.insertMany([
  {
    codigo: 'AUD001',
    nome: 'Auditório Principal',
    descricao: 'Auditório principal com capacidade para 200 pessoas',
    capacidade: 200,
    tipo: 'Auditório',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    codigo: 'LAB001',
    nome: 'Laboratório de Informática 1',
    descricao: 'Laboratório equipado com 30 computadores',
    capacidade: 30,
    tipo: 'Laboratório',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    codigo: 'SAL101',
    nome: 'Sala de Aula 101',
    descricao: 'Sala de aula padrão para 40 alunos',
    capacidade: 40,
    tipo: 'Sala de Aula',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Cursos de exemplo
db.cursos.insertMany([
  {
    codigo: 'ENG001',
    nome: 'Engenharia Civil',
    descricao: 'Curso de Engenharia Civil',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    codigo: 'ADM001',
    nome: 'Administração',
    descricao: 'Curso de Administração',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    codigo: 'DIR001',
    nome: 'Direito',
    descricao: 'Curso de Direito',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Eventos de exemplo
const auditorio = db.locais.findOne({ codigo: 'AUD001' });
const curso1 = db.cursos.findOne({ codigo: 'ENG001' });

db.eventos.insertMany([
  {
    titulo: 'Palestra: Inovações na Engenharia Civil',
    descricao: 'Palestra sobre as mais recentes inovações tecnológicas na área de engenharia civil',
    dataInicio: new Date('2025-05-15T09:00:00Z'),
    dataFim: new Date('2025-05-15T11:00:00Z'),
    local: auditorio._id,
    curso: curso1._id,
    palestrante: 'Dr. João Silva',
    tipo: 'Palestra',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ Banco de dados inicializado com sucesso!');
print('');
print('📋 Resumo da inicialização:');
print('   🔐 Permissões: ' + db.permissoes.countDocuments() + ' criadas');
print('   👥 Perfis: ' + db.perfis.countDocuments() + ' criados');
print('   👤 Usuários: ' + db.usuarios.countDocuments() + ' criados');
print('   📍 Locais: ' + db.locais.countDocuments() + ' criados');
print('   📚 Cursos: ' + db.cursos.countDocuments() + ' criados');
print('   📅 Eventos: ' + db.eventos.countDocuments() + ' criados');
print('');
print('👤 Login do Administrador:');
print('   📧 Email: admin@ubm.br');
print('   🔒 Senha: 123456');
print('');
print('🚀 Sistema pronto para uso!');
