import express from 'express';
import { body } from 'express-validator';
import { EventoController } from '../controllers/eventoController';

const router = express.Router();

// Validações para criar/atualizar evento
const eventoValidation = [
  body('data')
    .notEmpty()
    .withMessage('Data é obrigatória'),
  
  body('hora')
    .notEmpty()
    .withMessage('Hora é obrigatória'),
  
  body('tema')
    .notEmpty()
    .withMessage('Tema é obrigatório')
    .isLength({ min: 5, max: 200 })
    .withMessage('Tema deve ter entre 5 e 200 caracteres'),
  
  body('autores')
    .optional()
    .isArray()
    .withMessage('Autores deve ser um array'),
  
  body('autores.*')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do autor deve ter entre 2 e 100 caracteres'),
  
  body('palestrante')
    .optional({ values: 'falsy' })
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do palestrante deve ter entre 2 e 100 caracteres'),
  
  body('orientador')
    .optional({ values: 'falsy' })
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do orientador deve ter entre 2 e 100 caracteres'),
  
  body('sala')
    .notEmpty()
    .withMessage('Sala é obrigatória'),
  
  body('tipoEvento')
    .isIn(['Palestra Principal', 'Apresentação de Trabalhos', 'Oficina', 'Banner'])
    .withMessage('Tipo de evento deve ser: Palestra Principal, Apresentação de Trabalhos, Oficina ou Banner'),
  
  body('curso')
    .optional({ values: 'falsy' })
    .isMongoId()
    .withMessage('ID do curso deve ser válido'),
  
  body('resumo')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Resumo não pode exceder 1000 caracteres')
];

// Rotas
router.get('/', EventoController.listarEventos);
router.get('/estatisticas', EventoController.estatisticasEventos);
router.get('/cronograma', EventoController.cronograma);
router.get('/:id', EventoController.buscarEventoPorId);
router.post('/', eventoValidation, EventoController.criarEvento);
router.put('/:id', eventoValidation, EventoController.atualizarEvento);
router.delete('/:id', EventoController.deletarEvento);

export default router;
