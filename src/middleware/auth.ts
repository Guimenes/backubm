import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario';

interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    nome: string;
    email: string;
    perfil: any;
    permissoes: string[];
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
const TOKEN_EXPIRATION = '2h'; // Token expira em 2 horas

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
      return;
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Buscar o usuário no banco de dados
    const usuario = await Usuario.findById(decoded.userId)
      .populate({
        path: 'perfil',
        populate: {
          path: 'permissoes',
          model: 'Permissao'
        }
      })
      .select('-senha');

    if (!usuario) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    if (!usuario.ativo) {
      res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
      return;
    }

    // Verificar se o token ainda é válido (verificação adicional)
    if (!usuario.isTokenValid()) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    // Extrair permissões
    const perfilPopulado = usuario.perfil as any;
    const permissoes = perfilPopulado.permissoes?.map((perm: any) => perm.codigo) || [];

    // Adicionar informações do usuário à requisição
    req.user = {
      id: usuario._id.toString(),
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      permissoes
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    console.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const requirePermission = (permissaoNecessaria: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    if (!req.user.permissoes.includes(permissaoNecessaria)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado: permissão insuficiente'
      });
      return;
    }

    next();
  };
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );
};

export const getTokenExpiration = (): Date => {
  const now = new Date();
  now.setHours(now.getHours() + 2); // 2 horas a partir de agora
  return now;
};
