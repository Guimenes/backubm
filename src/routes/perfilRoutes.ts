import express from 'express';
import {
  listarPerfis,
  obterPerfil,
  criarPerfil,
  atualizarPerfil,
  excluirPerfil,
  adicionarPermissoes,
  removerPermissoes
} from '../controllers/perfilController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Listar todos os perfis (requer permissão de visualizar perfis)
router.get('/', requirePermission('PERFIS_LISTAR'), listarPerfis);

// Obter um perfil específico
router.get('/:id', requirePermission('PERFIS_VISUALIZAR'), obterPerfil);

// Criar novo perfil (requer permissão de criar)
router.post('/', requirePermission('PERFIS_CRIAR'), criarPerfil);

// Atualizar perfil (requer permissão de editar)
router.put('/:id', requirePermission('PERFIS_EDITAR'), atualizarPerfil);

// Desativar perfil (requer permissão de excluir)
router.delete('/:id', requirePermission('PERFIS_EXCLUIR'), excluirPerfil);

// Adicionar permissões ao perfil
router.post('/:id/permissoes', requirePermission('PERFIS_EDITAR'), adicionarPermissoes);

// Remover permissões do perfil
router.delete('/:id/permissoes', requirePermission('PERFIS_EDITAR'), removerPermissoes);

export default router;
