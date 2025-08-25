import express from 'express';
import { body, param, query } from 'express-validator';
import { CursoController } from '../controllers/cursoController';

const router = express.Router();

// Listar cursos com paginação e busca
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page deve ser inteiro >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit deve estar entre 1 e 100'),
    query('search').optional().isString().trim()
  ],
  CursoController.listarCursos
);

// Buscar por ID
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID inválido')],
  CursoController.buscarCursoPorId
);

// Criar curso
router.post(
  '/',
  [
    body('cod')
      .optional()
      .isString().withMessage('cod deve ser string')
      .trim()
      .isLength({ min: 2, max: 20 }).withMessage('cod deve ter entre 2 e 20 caracteres')
      .toUpperCase(),
    body('nome')
      .isString().withMessage('nome deve ser string')
      .trim()
      .notEmpty().withMessage('nome é obrigatório')
      .isLength({ min: 2, max: 100 }).withMessage('nome deve ter entre 2 e 100 caracteres')
  ],
  CursoController.criarCurso
);

// Atualizar curso
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID inválido'),
    body('cod').optional().isString().trim().isLength({ min: 2, max: 20 }).withMessage('cod deve ter entre 2 e 20 caracteres').toUpperCase(),
    body('nome').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('nome deve ter entre 2 e 100 caracteres')
  ],
  CursoController.atualizarCurso
);

// Deletar curso
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('ID inválido')],
  CursoController.deletarCurso
);

export default router;
