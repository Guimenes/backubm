import { Router } from 'express';
import { body } from 'express-validator';
import { LocalController } from '../controllers/localController';
import { authenticateToken, requirePermission, requireAdminToken } from '../middleware/auth';

const router = Router();

// Validações
const validacaoLocal = [
  body('nome')
    .notEmpty()
    .withMessage('Nome do local é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('capacidade')
    .custom((value, { req }) => {
      // Para tipo "Espaço", capacidade é opcional
      if (req.body.tipoLocal === 'Espaço') {
        if (value !== undefined && value !== null && value !== '') {
          const capacidade = parseInt(value);
          if (isNaN(capacidade) || capacidade < 1) {
            throw new Error('Se informada, capacidade deve ser um número maior que 0');
          }
        }
        return true;
      } else {
        // Para outros tipos, capacidade é obrigatória
        if (!value) {
          throw new Error('Capacidade é obrigatória para este tipo de local');
        }
        const capacidade = parseInt(value);
        if (isNaN(capacidade) || capacidade < 1) {
          throw new Error('Capacidade deve ser um número maior que 0');
        }
        return true;
      }
    }),
  body('tipoLocal')
    .isIn(['Sala de Aula', 'Biblioteca', 'Laboratório', 'Auditório', 'Anfiteatro', 'Pátio', 'Quadra', 'Espaço'])
    .withMessage('Tipo de local inválido'),
  body('descricao')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição não pode ter mais de 500 caracteres')
];

const validacaoAtualizacao = [
  body('nome')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('capacidade')
    .optional()
    .custom((value, { req }) => {
      // Para tipo "Espaço", capacidade é opcional
      if (req.body.tipoLocal === 'Espaço') {
        if (value !== undefined && value !== null && value !== '') {
          const capacidade = parseInt(value);
          if (isNaN(capacidade) || capacidade < 1) {
            throw new Error('Se informada, capacidade deve ser um número maior que 0');
          }
        }
        return true;
      } else {
        // Para outros tipos, se informada, deve ser válida
        if (value !== undefined && value !== null && value !== '') {
          const capacidade = parseInt(value);
          if (isNaN(capacidade) || capacidade < 1) {
            throw new Error('Capacidade deve ser um número maior que 0');
          }
        }
        return true;
      }
    }),
  body('tipoLocal')
    .optional()
    .isIn(['Sala de Aula', 'Biblioteca', 'Laboratório', 'Auditório', 'Anfiteatro', 'Pátio', 'Quadra', 'Espaço'])
    .withMessage('Tipo de local inválido'),
  body('descricao')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição não pode ter mais de 500 caracteres')
];

// Rotas
router.get('/', LocalController.listarLocais);
router.get('/estatisticas', LocalController.estatisticasLocais);
router.get('/com-eventos', LocalController.listarLocaisComEventos);
router.get('/gerar-codigo/:tipoLocal', authenticateToken, requirePermission('LOCAIS_CRIAR'), LocalController.gerarCodigoUnico);
router.get('/:id', LocalController.buscarLocalPorId);
router.post('/', authenticateToken, requirePermission('LOCAIS_CRIAR'), validacaoLocal, LocalController.criarLocal);
router.put('/:id', authenticateToken, requirePermission('LOCAIS_EDITAR'), validacaoAtualizacao, LocalController.atualizarLocal);
router.delete('/:id', authenticateToken, requireAdminToken, requirePermission('LOCAIS_EXCLUIR'), LocalController.deletarLocal);

export default router;
