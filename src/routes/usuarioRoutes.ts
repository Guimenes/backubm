import express from 'express';
import {
  listarUsuarios,
  obterUsuario,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
  alterarSenha
} from '../controllers/usuarioController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar todos os usuários (requer permissão de visualizar usuários)
router.get('/', requirePermission('USUARIOS_LISTAR'), listarUsuarios);

// Obter um usuário específico
router.get('/:id', requirePermission('USUARIOS_VISUALIZAR'), obterUsuario);

// Criar novo usuário (requer permissão de criar)
router.post('/', requirePermission('USUARIOS_CRIAR'), criarUsuario);

// Atualizar usuário (requer permissão de editar)
router.put('/:id', requirePermission('USUARIOS_EDITAR'), atualizarUsuario);

// Desativar usuário (requer permissão de excluir)
router.delete('/:id', requirePermission('USUARIOS_EXCLUIR'), excluirUsuario);

// Alterar senha do usuário
router.put('/:id/senha', requirePermission('USUARIOS_EDITAR'), alterarSenha);

export default router;
