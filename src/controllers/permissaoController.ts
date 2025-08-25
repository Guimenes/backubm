import { Request, Response } from 'express';
import Permissao from '../models/Permissao';
import { AuthenticatedRequest } from '../middleware/auth';

export const listarPermissoes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const permissoes = await Permissao.find({ ativo: true })
      .select('nome codigo modulo descricao ativo')
      .sort({ modulo: 1, nome: 1 });

    res.json({
      success: true,
      message: 'Permissões listadas com sucesso',
      data: permissoes
    });
  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const obterPermissao = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const permissao = await Permissao.findById(id);

    if (!permissao) {
      res.status(404).json({
        success: false,
        message: 'Permissão não encontrada'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Permissão encontrada',
      data: permissao
    });
  } catch (error) {
    console.error('Erro ao obter permissão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const criarPermissao = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nome, codigo, modulo, descricao } = req.body;

    // Verificar se já existe uma permissão com o mesmo código
    const permissaoExistente = await Permissao.findOne({ codigo });
    if (permissaoExistente) {
      res.status(400).json({
        success: false,
        message: 'Já existe uma permissão com este código'
      });
      return;
    }

    const novaPermissao = new Permissao({
      nome,
      codigo: codigo.toUpperCase(),
      modulo,
      descricao,
      ativo: true
    });

    await novaPermissao.save();

    res.status(201).json({
      success: true,
      message: 'Permissão criada com sucesso',
      data: novaPermissao
    });
  } catch (error: any) {
    console.error('Erro ao criar permissão:', error);
    
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

export const atualizarPermissao = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, codigo, modulo, descricao, ativo } = req.body;

    // Verificar se existe outra permissão com o mesmo código
    if (codigo) {
      const permissaoExistente = await Permissao.findOne({ 
        codigo: codigo.toUpperCase(),
        _id: { $ne: id }
      });
      if (permissaoExistente) {
        res.status(400).json({
          success: false,
          message: 'Já existe uma permissão com este código'
        });
        return;
      }
    }

    const permissaoAtualizada = await Permissao.findByIdAndUpdate(
      id,
      {
        nome,
        codigo: codigo?.toUpperCase(),
        modulo,
        descricao,
        ativo
      },
      { new: true, runValidators: true }
    );

    if (!permissaoAtualizada) {
      res.status(404).json({
        success: false,
        message: 'Permissão não encontrada'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Permissão atualizada com sucesso',
      data: permissaoAtualizada
    });
  } catch (error: any) {
    console.error('Erro ao atualizar permissão:', error);
    
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

export const excluirPermissao = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const permissao = await Permissao.findByIdAndUpdate(
      id,
      { ativo: false },
      { new: true }
    );

    if (!permissao) {
      res.status(404).json({
        success: false,
        message: 'Permissão não encontrada'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Permissão desativada com sucesso',
      data: permissao
    });
  } catch (error) {
    console.error('Erro ao excluir permissão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const listarPermissoesPorModulo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const permissoes = await Permissao.aggregate([
      { $match: { ativo: true } },
      {
        $group: {
          _id: '$modulo',
          permissoes: {
            $push: {
              _id: '$_id',
              nome: '$nome',
              codigo: '$codigo',
              descricao: '$descricao'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      message: 'Permissões agrupadas por módulo',
      data: permissoes
    });
  } catch (error) {
    console.error('Erro ao listar permissões por módulo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
