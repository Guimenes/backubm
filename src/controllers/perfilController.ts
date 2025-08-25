import { Request, Response } from 'express';
import Perfil from '../models/Perfil';
import { AuthenticatedRequest } from '../middleware/auth';

export const listarPerfis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const perfis = await Perfil.find({ ativo: true })
      .populate('permissoes', 'nome codigo modulo descricao')
      .select('nome descricao ativo')
      .sort({ nome: 1 });

    res.json({
      success: true,
      message: 'Perfis listados com sucesso',
      data: perfis
    });
  } catch (error) {
    console.error('Erro ao listar perfis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const obterPerfil = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const perfil = await Perfil.findById(id)
      .populate('permissoes', 'nome codigo modulo descricao');

    if (!perfil) {
      res.status(404).json({
        success: false,
        message: 'Perfil não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Perfil encontrado',
      data: perfil
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const criarPerfil = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nome, descricao, permissoes } = req.body;

    // Verificar se já existe um perfil com o mesmo nome
    const perfilExistente = await Perfil.findOne({ nome });
    if (perfilExistente) {
      res.status(400).json({
        success: false,
        message: 'Já existe um perfil com este nome'
      });
      return;
    }

    const novoPerfil = new Perfil({
      nome,
      descricao,
      permissoes: permissoes || [],
      ativo: true
    });

    await novoPerfil.save();

    const perfilPopulado = await Perfil.findById(novoPerfil._id)
      .populate('permissoes', 'nome codigo modulo descricao');

    res.status(201).json({
      success: true,
      message: 'Perfil criado com sucesso',
      data: perfilPopulado
    });
  } catch (error: any) {
    console.error('Erro ao criar perfil:', error);
    
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const atualizarPerfil = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, descricao, permissoes, ativo } = req.body;

    // Verificar se existe outro perfil com o mesmo nome
    if (nome) {
      const perfilExistente = await Perfil.findOne({ 
        nome,
        _id: { $ne: id }
      });
      if (perfilExistente) {
        res.status(400).json({
          success: false,
          message: 'Já existe um perfil com este nome'
        });
        return;
      }
    }

    const perfilAtualizado = await Perfil.findByIdAndUpdate(
      id,
      {
        nome,
        descricao,
        permissoes,
        ativo
      },
      { new: true, runValidators: true }
    ).populate('permissoes', 'nome codigo modulo descricao');

    if (!perfilAtualizado) {
      res.status(404).json({
        success: false,
        message: 'Perfil não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: perfilAtualizado
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const excluirPerfil = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const perfil = await Perfil.findByIdAndUpdate(
      id,
      { ativo: false },
      { new: true }
    );

    if (!perfil) {
      res.status(404).json({
        success: false,
        message: 'Perfil não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Perfil desativado com sucesso',
      data: perfil
    });
  } catch (error) {
    console.error('Erro ao excluir perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const adicionarPermissoes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { permissoes } = req.body;

    const perfil = await Perfil.findById(id);
    if (!perfil) {
      res.status(404).json({
        success: false,
        message: 'Perfil não encontrado'
      });
      return;
    }

    // Adicionar novas permissões sem duplicar
    const permissoesExistentes = perfil.permissoes.map(p => p.toString());
    const novasPermissoes = permissoes.filter((p: string) => !permissoesExistentes.includes(p));
    
    perfil.permissoes.push(...novasPermissoes);
    await perfil.save();

    const perfilAtualizado = await Perfil.findById(id)
      .populate('permissoes', 'nome codigo modulo descricao');

    res.json({
      success: true,
      message: 'Permissões adicionadas com sucesso',
      data: perfilAtualizado
    });
  } catch (error) {
    console.error('Erro ao adicionar permissões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const removerPermissoes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { permissoes } = req.body;

    const perfil = await Perfil.findById(id);
    if (!perfil) {
      res.status(404).json({
        success: false,
        message: 'Perfil não encontrado'
      });
      return;
    }

    // Remover permissões
    perfil.permissoes = perfil.permissoes.filter(
      p => !permissoes.includes(p.toString())
    );
    await perfil.save();

    const perfilAtualizado = await Perfil.findById(id)
      .populate('permissoes', 'nome codigo modulo descricao');

    res.json({
      success: true,
      message: 'Permissões removidas com sucesso',
      data: perfilAtualizado
    });
  } catch (error) {
    console.error('Erro ao remover permissões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
