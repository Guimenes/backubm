import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Curso, { ICurso } from '../models/Curso';
import { ErrorHandler } from '../utils/errorHandler';

export class CursoController {
  // Listar cursos com paginação e busca
  static async listarCursos(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search, status, modalidade } = req.query;

      const filtros: any = {};
      
      if (search) {
        filtros.$or = [
          { cod: { $regex: search, $options: 'i' } },
          { nome: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        filtros.status = status;
      }

      if (modalidade) {
        filtros.modalidade = modalidade;
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const cursos = await Curso.find(filtros)
        .sort({ nome: 1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const total = await Curso.countDocuments(filtros);

      res.status(200).json({
        success: true,
        data: cursos,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
          totalItems: total,
          itemsPerPage: parseInt(limit as string)
        }
      });
    } catch (error: any) {
      ErrorHandler.handleInternalError(res, error);
    }
  }

  // Buscar por ID
  static async buscarCursoPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const curso = await Curso.findById(id);
      if (!curso) {
        ErrorHandler.handleNotFoundError(res, 'Curso não encontrado');
        return;
      }
      res.status(200).json({ success: true, data: curso });
    } catch (error: any) {
      ErrorHandler.handleInternalError(res, error);
    }
  }

  // Criar
  static async criarCurso(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ErrorHandler.handleValidationError(res, 'Dados fornecidos são inválidos');
        return;
      }

      let { cod, nome } = req.body as Pick<ICurso, 'cod' | 'nome'>;

      // Se não tiver código, gerar automaticamente
      if (!cod) {
        cod = await CursoController.gerarCodigo(nome);
      }

      const existente = await Curso.findOne({ cod });
      if (existente) {
        ErrorHandler.handleConflictError(res, 'Dados já existem no sistema');
        return;
      }

      const novo = new Curso({ cod, nome });
      const salvo = await novo.save();
      res.status(201).json({ success: true, message: 'Curso criado com sucesso', data: salvo });
    } catch (error: any) {
      ErrorHandler.handleInternalError(res, error);
    }
  }

  // Método para gerar código automaticamente
  private static async gerarCodigo(nome: string): Promise<string> {
    if (!nome || nome.length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres para gerar código');
    }
    
    // Pega as 3 primeiras letras do nome (removendo espaços e caracteres especiais)
    const palavras = nome.trim().split(' ').filter(p => p.length > 0);
    let codigo = '';
    
    if (palavras.length === 1 && palavras[0]) {
      // Se for uma palavra só, pega as 3 primeiras letras
      codigo = palavras[0].substring(0, 3);
    } else if (palavras.length > 1) {
      // Se for múltiplas palavras, pega a primeira letra de cada uma até ter 3
      for (let i = 0; i < Math.min(palavras.length, 3); i++) {
        const palavra = palavras[i];
        if (palavra && palavra.length > 0) {
          codigo += palavra.charAt(0);
        }
      }
      // Se ainda não tiver 3 letras, completa com letras da primeira palavra
      const primeiraPalavra = palavras[0];
      if (codigo.length < 3 && primeiraPalavra && primeiraPalavra.length > 1) {
        codigo += primeiraPalavra.substring(1, 3 - codigo.length + 1);
      }
    }
    
    if (codigo.length < 3) {
      throw new Error('Não foi possível gerar código suficiente a partir do nome');
    }
    
    const codigoBase = codigo.toUpperCase();
    let numeroSequencial = 1;
    let codigoFinal = '';
    
    // Procura um código disponível
    do {
      codigoFinal = codigoBase + numeroSequencial.toString().padStart(3, '0');
      const existente = await Curso.findOne({ cod: codigoFinal });
      if (!existente) break;
      numeroSequencial++;
    } while (numeroSequencial <= 999);
    
    if (numeroSequencial > 999) {
      throw new Error('Não foi possível gerar um código único para este curso');
    }
    
    return codigoFinal;
  }

  // Atualizar
  static async atualizarCurso(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        ErrorHandler.handleValidationError(res, 'Dados fornecidos são inválidos');
        return;
      }

      const { id } = req.params;
      const { cod, nome } = req.body as Partial<ICurso>;

      // Checar conflito de código
      if (cod) {
        const conflito = await Curso.findOne({ cod, _id: { $ne: id } });
        if (conflito) {
          ErrorHandler.handleConflictError(res, 'Dados já existem no sistema');
          return;
        }
      }

      const atualizado = await Curso.findByIdAndUpdate(
        id,
        { $set: { ...(cod && { cod }), ...(nome && { nome }) } },
        { new: true }
      );

      if (!atualizado) {
        ErrorHandler.handleNotFoundError(res, 'Curso não encontrado');
        return;
      }

      res.status(200).json({ success: true, message: 'Curso atualizado com sucesso', data: atualizado });
    } catch (error: any) {
      ErrorHandler.handleInternalError(res, error);
    }
  }

  // Deletar
  static async deletarCurso(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletado = await Curso.findByIdAndDelete(id);
      if (!deletado) {
        ErrorHandler.handleNotFoundError(res, 'Curso não encontrado');
        return;
      }
      res.status(200).json({ success: true, message: 'Curso deletado com sucesso' });
    } catch (error: any) {
      ErrorHandler.handleInternalError(res, error);
    }
  }
}
