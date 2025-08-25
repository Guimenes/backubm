import express from 'express';
import {
  listarPermissoes,
  obterPermissao,
  criarPermissao,
  atualizarPermissao,
  excluirPermissao,
  listarPermissoesPorModulo
} from '../controllers/permissaoController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar todas as permissões (requer permissão de visualizar permissões)
router.get('/', requirePermission('PERMISSOES_LISTAR'), listarPermissoes);

// Listar permissões por módulo
router.get('/modulos', requirePermission('PERMISSOES_LISTAR'), listarPermissoesPorModulo);

// Obter uma permissão específica
router.get('/:id', requirePermission('PERMISSOES_VISUALIZAR'), obterPermissao);

// Criar nova permissão (requer permissão de criar)
router.post('/', requirePermission('PERMISSOES_CRIAR'), criarPermissao);

// Atualizar permissão (requer permissão de editar)
router.put('/:id', requirePermission('PERMISSOES_EDITAR'), atualizarPermissao);

// Desativar permissão (requer permissão de excluir)
router.delete('/:id', requirePermission('PERMISSOES_EXCLUIR'), excluirPermissao);

export default router;
