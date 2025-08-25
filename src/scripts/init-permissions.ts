import mongoose from 'mongoose';
import Permissao from '../models/Permissao';
import Perfil from '../models/Perfil';
import Usuario from '../models/Usuario';

// Permissões por módulo
const permissoesPadrao = [
  // Módulo Locais
  { nome: 'Listar Locais', codigo: 'LOCAIS_LISTAR', modulo: 'locais', descricao: 'Permite visualizar a lista de locais' },
  { nome: 'Visualizar Local', codigo: 'LOCAIS_VISUALIZAR', modulo: 'locais', descricao: 'Permite ver detalhes de um local específico' },
  { nome: 'Criar Local', codigo: 'LOCAIS_CRIAR', modulo: 'locais', descricao: 'Permite criar novos locais' },
  { nome: 'Editar Local', codigo: 'LOCAIS_EDITAR', modulo: 'locais', descricao: 'Permite editar locais existentes' },
  { nome: 'Excluir Local', codigo: 'LOCAIS_EXCLUIR', modulo: 'locais', descricao: 'Permite excluir locais' },

  // Módulo Eventos
  { nome: 'Listar Eventos', codigo: 'EVENTOS_LISTAR', modulo: 'eventos', descricao: 'Permite visualizar a lista de eventos' },
  { nome: 'Visualizar Evento', codigo: 'EVENTOS_VISUALIZAR', modulo: 'eventos', descricao: 'Permite ver detalhes de um evento específico' },
  { nome: 'Criar Evento', codigo: 'EVENTOS_CRIAR', modulo: 'eventos', descricao: 'Permite criar novos eventos' },
  { nome: 'Editar Evento', codigo: 'EVENTOS_EDITAR', modulo: 'eventos', descricao: 'Permite editar eventos existentes' },
  { nome: 'Excluir Evento', codigo: 'EVENTOS_EXCLUIR', modulo: 'eventos', descricao: 'Permite excluir eventos' },

  // Módulo Cursos
  { nome: 'Listar Cursos', codigo: 'CURSOS_LISTAR', modulo: 'cursos', descricao: 'Permite visualizar a lista de cursos' },
  { nome: 'Visualizar Curso', codigo: 'CURSOS_VISUALIZAR', modulo: 'cursos', descricao: 'Permite ver detalhes de um curso específico' },
  { nome: 'Criar Curso', codigo: 'CURSOS_CRIAR', modulo: 'cursos', descricao: 'Permite criar novos cursos' },
  { nome: 'Editar Curso', codigo: 'CURSOS_EDITAR', modulo: 'cursos', descricao: 'Permite editar cursos existentes' },
  { nome: 'Excluir Curso', codigo: 'CURSOS_EXCLUIR', modulo: 'cursos', descricao: 'Permite excluir cursos' },

  // Módulo Usuários
  { nome: 'Listar Usuários', codigo: 'USUARIOS_LISTAR', modulo: 'usuarios', descricao: 'Permite visualizar a lista de usuários' },
  { nome: 'Visualizar Usuário', codigo: 'USUARIOS_VISUALIZAR', modulo: 'usuarios', descricao: 'Permite ver detalhes de um usuário específico' },
  { nome: 'Criar Usuário', codigo: 'USUARIOS_CRIAR', modulo: 'usuarios', descricao: 'Permite criar novos usuários' },
  { nome: 'Editar Usuário', codigo: 'USUARIOS_EDITAR', modulo: 'usuarios', descricao: 'Permite editar usuários existentes' },
  { nome: 'Excluir Usuário', codigo: 'USUARIOS_EXCLUIR', modulo: 'usuarios', descricao: 'Permite excluir usuários' },

  // Módulo Permissões
  { nome: 'Listar Permissões', codigo: 'PERMISSOES_LISTAR', modulo: 'permissoes', descricao: 'Permite visualizar a lista de permissões' },
  { nome: 'Visualizar Permissão', codigo: 'PERMISSOES_VISUALIZAR', modulo: 'permissoes', descricao: 'Permite ver detalhes de uma permissão específica' },
  { nome: 'Criar Permissão', codigo: 'PERMISSOES_CRIAR', modulo: 'permissoes', descricao: 'Permite criar novas permissões' },
  { nome: 'Editar Permissão', codigo: 'PERMISSOES_EDITAR', modulo: 'permissoes', descricao: 'Permite editar permissões existentes' },
  { nome: 'Excluir Permissão', codigo: 'PERMISSOES_EXCLUIR', modulo: 'permissoes', descricao: 'Permite excluir permissões' },

  // Módulo Perfis
  { nome: 'Listar Perfis', codigo: 'PERFIS_LISTAR', modulo: 'permissoes', descricao: 'Permite visualizar a lista de perfis' },
  { nome: 'Visualizar Perfil', codigo: 'PERFIS_VISUALIZAR', modulo: 'permissoes', descricao: 'Permite ver detalhes de um perfil específico' },
  { nome: 'Criar Perfil', codigo: 'PERFIS_CRIAR', modulo: 'permissoes', descricao: 'Permite criar novos perfis' },
  { nome: 'Editar Perfil', codigo: 'PERFIS_EDITAR', modulo: 'permissoes', descricao: 'Permite editar perfis existentes' },
  { nome: 'Excluir Perfil', codigo: 'PERFIS_EXCLUIR', modulo: 'permissoes', descricao: 'Permite excluir perfis' },

  // Módulo Relatórios
  { nome: 'Visualizar Relatórios', codigo: 'RELATORIOS_VISUALIZAR', modulo: 'relatorios', descricao: 'Permite visualizar relatórios do sistema' },
  { nome: 'Gerar Relatórios', codigo: 'RELATORIOS_GERAR', modulo: 'relatorios', descricao: 'Permite gerar relatórios personalizados' },
];

export const criarPermissoesPadrao = async () => {
  try {
    console.log('Criando permissões padrão...');
    
    for (const permissaoData of permissoesPadrao) {
      const permissaoExistente = await Permissao.findOne({ codigo: permissaoData.codigo });
      
      if (!permissaoExistente) {
        const permissao = new Permissao(permissaoData);
        await permissao.save();
        console.log(`Permissão criada: ${permissaoData.nome}`);
      } else {
        console.log(`Permissão já existe: ${permissaoData.nome}`);
      }
    }
    
    console.log('Permissões padrão criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar permissões padrão:', error);
  }
};

export const criarPerfisPadrao = async () => {
  try {
    console.log('Criando perfis padrão...');
    
    // Buscar todas as permissões
    const todasPermissoes = await Permissao.find({ ativo: true });
    const permissoesIds = todasPermissoes.map(p => p._id);
    
    // Perfil Administrador (todas as permissões)
    let perfilAdmin = await Perfil.findOne({ nome: 'Administrador' });
    if (!perfilAdmin) {
      perfilAdmin = new Perfil({
        nome: 'Administrador',
        descricao: 'Acesso total ao sistema',
        permissoes: permissoesIds,
        ativo: true
      });
      await perfilAdmin.save();
      console.log('Perfil Administrador criado');
    } else {
      console.log('Perfil Administrador já existe');
    }

    // Perfil Organizador (sem permissões de usuários e permissões)
    const permissoesOrganizador = todasPermissoes
      .filter(p => !p.codigo.startsWith('USUARIOS_') && !p.codigo.startsWith('PERMISSOES_') && !p.codigo.startsWith('PERFIS_'))
      .map(p => p._id);

    let perfilOrganizador = await Perfil.findOne({ nome: 'Organizador' });
    if (!perfilOrganizador) {
      perfilOrganizador = new Perfil({
        nome: 'Organizador',
        descricao: 'Acesso para organização de eventos',
        permissoes: permissoesOrganizador,
        ativo: true
      });
      await perfilOrganizador.save();
      console.log('Perfil Organizador criado');
    } else {
      console.log('Perfil Organizador já existe');
    }

    // Perfil Participante (apenas visualização)
    const permissoesParticipante = todasPermissoes
      .filter(p => p.codigo.includes('_LISTAR') || p.codigo.includes('_VISUALIZAR'))
      .filter(p => !p.codigo.startsWith('USUARIOS_') && !p.codigo.startsWith('PERMISSOES_') && !p.codigo.startsWith('PERFIS_'))
      .map(p => p._id);

    let perfilParticipante = await Perfil.findOne({ nome: 'Participante' });
    if (!perfilParticipante) {
      perfilParticipante = new Perfil({
        nome: 'Participante',
        descricao: 'Acesso apenas para visualização',
        permissoes: permissoesParticipante,
        ativo: true
      });
      await perfilParticipante.save();
      console.log('Perfil Participante criado');
    } else {
      console.log('Perfil Participante já existe');
    }

    console.log('Perfis padrão criados com sucesso!');
    return { perfilAdmin, perfilOrganizador, perfilParticipante };
  } catch (error) {
    console.error('Erro ao criar perfis padrão:', error);
    throw error;
  }
};

export const criarUsuarioAdmin = async () => {
  try {
    console.log('Criando usuário administrador padrão...');
    
    const perfilAdmin = await Perfil.findOne({ nome: 'Administrador' });
    if (!perfilAdmin) {
      throw new Error('Perfil Administrador não encontrado');
    }

    const usuarioExistente = await Usuario.findOne({ email: 'admin@ubm.br' });
    if (!usuarioExistente) {
      const usuarioAdmin = new Usuario({
        nome: 'Administrador do Sistema',
        email: 'admin@ubm.br',
        senha: '123456', // Será hasheada automaticamente pelo pre-save hook
        perfil: perfilAdmin._id,
        ativo: true
      });
      
      await usuarioAdmin.save();
      console.log('Usuário administrador criado com sucesso!');
      console.log('Email: admin@ubm.br');
      console.log('Senha: 123456');
    } else {
      console.log('Usuário administrador já existe');
    }
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  }
};

export const inicializarSistemaPermissoes = async () => {
  try {
    console.log('Inicializando sistema de permissões...');
    
    await criarPermissoesPadrao();
    await criarPerfisPadrao();
    await criarUsuarioAdmin();
    
    console.log('Sistema de permissões inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar sistema de permissões:', error);
    throw error;
  }
};
