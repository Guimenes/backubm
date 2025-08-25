import { Request, Response } from 'express';
import Usuario from '../models/Usuario';
import Perfil from '../models/Perfil';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateToken, getTokenExpiration } from '../middleware/auth';

export const listarUsuarios = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usuarios = await Usuario.find({ ativo: true })
      .populate('perfil', 'nome descricao')
      .select('-senha')
      .sort({ nome: 1 });

    res.json({
      success: true,
      message: 'Usuários listados com sucesso',
      data: usuarios
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const obterUsuario = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id)
      .populate({
        path: 'perfil',
        populate: {
          path: 'permissoes',
          model: 'Permissao'
        }
      })
      .select('-senha');

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Usuário encontrado',
      data: usuario
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const criarUsuario = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, perfil, curso } = req.body;

    // Verificar se já existe um usuário com o mesmo email
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      res.status(400).json({
        success: false,
        message: 'Já existe um usuário com este email'
      });
      return;
    }

    // Verificar se o perfil existe
    const perfilExistente = await Perfil.findById(perfil);
    if (!perfilExistente) {
      res.status(400).json({
        success: false,
        message: 'Perfil não encontrado'
      });
      return;
    }

    const novoUsuario = new Usuario({
      nome,
      email,
      senha,
      perfil,
      curso,
      ativo: true
    });

    await novoUsuario.save();

    const usuarioPopulado = await Usuario.findById(novoUsuario._id)
      .populate('perfil', 'nome descricao')
      .select('-senha');

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: usuarioPopulado
    });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    
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

export const atualizarUsuario = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, perfil, curso, ativo } = req.body;

    // Verificar se o usuário está tentando desativar a si mesmo
    if (req.user?.id === id && ativo === false) {
      res.status(400).json({
        success: false,
        message: 'Você não pode desativar seu próprio usuário'
      });
      return;
    }

    // Verificar se existe outro usuário com o mesmo email
    if (email) {
      const usuarioExistente = await Usuario.findOne({ 
        email,
        _id: { $ne: id }
      });
      if (usuarioExistente) {
        res.status(400).json({
          success: false,
          message: 'Já existe um usuário com este email'
        });
        return;
      }
    }

    // Verificar se o perfil existe
    if (perfil) {
      const perfilExistente = await Perfil.findById(perfil);
      if (!perfilExistente) {
        res.status(400).json({
          success: false,
          message: 'Perfil não encontrado'
        });
        return;
      }
    }

    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      id,
      {
        nome,
        email,
        perfil,
        curso,
        ativo
      },
      { new: true, runValidators: true }
    ).populate('perfil', 'nome descricao').select('-senha');

    if (!usuarioAtualizado) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado
    });
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    
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

export const excluirUsuario = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar se o usuário está tentando excluir/desativar a si mesmo
    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: 'Você não pode desativar seu próprio usuário'
      });
      return;
    }

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { ativo: false },
      { new: true }
    ).select('-senha');

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso',
      data: usuario
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const alterarSenha = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;

    const usuario = await Usuario.findById(id).select('+senha');
    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    // Se não forneceu senha atual, assumir que é um admin alterando a senha
    if (senhaAtual) {
      // Verificar senha atual apenas se foi fornecida
      const senhaValida = await usuario.comparePassword(senhaAtual);
      if (!senhaValida) {
        res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
        return;
      }
    }

    usuario.senha = novaSenha;
    await usuario.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário com senha
    const usuario = await Usuario.findOne({ email, ativo: true })
      .populate({
        path: 'perfil',
        populate: {
          path: 'permissoes',
          model: 'Permissao'
        }
      })
      .select('+senha');

    if (!usuario) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Verificar senha
    const senhaValida = await usuario.comparePassword(senha);
    if (!senhaValida) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Gerar token
    const token = generateToken(usuario._id.toString(), usuario.email);
    const tokenExpiracao = getTokenExpiration();

    // Atualizar último login e expiração do token
    usuario.ultimoLogin = new Date();
    usuario.tokenExpiracao = tokenExpiracao;
    await usuario.save();

    // Extrair permissões
    const perfilPopulado = usuario.perfil as any;
    const permissoes = perfilPopulado.permissoes?.map((perm: any) => perm.codigo) || [];

    // Remover senha da resposta
    const usuarioResposta = {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: perfilPopulado,
      permissoes,
      curso: usuario.curso
    };

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: usuarioResposta,
        token,
        expiresAt: tokenExpiracao
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const verificarToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Invalidar o token definindo uma data de expiração passada
      await Usuario.findByIdAndUpdate(userId, {
        tokenExpiracao: new Date(Date.now() - 1000) // 1 segundo atrás
      });
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
