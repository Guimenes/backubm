import { Request, Response } from 'express';
import Local, { ILocal } from '../models/Local';
import Evento from '../models/Evento';
import { validationResult } from 'express-validator';

export class LocalController {
  // Função para gerar código automaticamente baseado no tipo de local
  static gerarCodigo(tipoLocal: string): string {
    const prefixos: { [key: string]: string } = {
      'Sala de Aula': 'SA',
      'Biblioteca': 'BIB',
      'Laboratório': 'LAB',
      'Auditório': 'AUD',
      'Anfiteatro': 'ANF',
      'Pátio': 'PAT',
      'Quadra': 'QUA',
      'Espaço': 'ESP'
    };
    
    const prefixo = prefixos[tipoLocal] || 'LOC';
    const numeroAleatorio = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefixo}${numeroAleatorio}`;
  }

  // Gerar código único para um tipo específico
  static async gerarCodigoUnico(req: Request, res: Response): Promise<void> {
    try {
      const { tipoLocal } = req.params;
      
      if (!tipoLocal) {
        res.status(400).json({
          success: false,
          message: 'Tipo de local é obrigatório'
        });
        return;
      }
      
      let codigo: string;
      let tentativas = 0;
      const maxTentativas = 100;
      
      do {
        codigo = LocalController.gerarCodigo(tipoLocal);
        tentativas++;
        
        if (tentativas > maxTentativas) {
          res.status(500).json({
            success: false,
            message: 'Não foi possível gerar um código único'
          });
          return;
        }
      } while (await Local.findOne({ cod: codigo }));
      
      res.status(200).json({
        success: true,
        data: { codigo }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar código',
        error: error.message
      });
    }
  }

  // Listar locais que possuem eventos
  static async listarLocaisComEventos(req: Request, res: Response): Promise<void> {
    try {
      // Usar MongoDB nativo para garantir que estamos acessando a coleção correta
      const mongoose = require('mongoose');
      const db = mongoose.connection.db;
      
      // Buscar todos os trabalhos/eventos na coleção
      const trabalhos = await db.collection('trabalhos').find({}).toArray();
      
      if (trabalhos.length === 0) {
        res.status(200).json({
          success: true,
          data: []
        });
        return;
      }
      
      // Extrair locais únicos do campo 'sala'
      const locaisUnicos = new Set<string>();
      
      trabalhos.forEach((trabalho: any) => {
        if (trabalho.sala && typeof trabalho.sala === 'string' && trabalho.sala.trim() !== '') {
          locaisUnicos.add(trabalho.sala.trim());
        }
      });
      
      // Converter Set para Array e ordenar
      const locaisArray = Array.from(locaisUnicos).sort();
      
      res.status(200).json({
        success: true,
        data: locaisArray
      });
      
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar locais com eventos:', error);
      }
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar todos os locais
  static async listarLocais(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, tipoLocal, capacidadeMin, search, comEventos } = req.query;
      
      // Se foi solicitado apenas locais com eventos
      if (comEventos === 'true') {
        // Usar MongoDB nativo para buscar na coleção trabalhos
        const mongoose = require('mongoose');
        const db = mongoose.connection.db;
        
        const trabalhos = await db.collection('trabalhos').find({}).toArray();
        
        if (trabalhos.length === 0) {
          res.status(200).json({
            success: true,
            data: []
          });
          return;
        }
        
        // Extrair locais únicos do campo 'sala'
        const locaisUnicos = new Set<string>();
        
        trabalhos.forEach((trabalho: any) => {
          if (trabalho.sala && typeof trabalho.sala === 'string' && trabalho.sala.trim() !== '') {
            locaisUnicos.add(trabalho.sala.trim());
          }
        });
        
        // Converter Set para Array e ordenar
        const locaisArray = Array.from(locaisUnicos).sort();
        
        res.status(200).json({
          success: true,
          data: locaisArray
        });
        return;
      }
      
      // Lógica original para listar locais
      const filtros: any = {};
      
      if (tipoLocal) {
        filtros.tipoLocal = tipoLocal;
      }
      
      if (capacidadeMin) {
        filtros.capacidade = { $gte: parseInt(capacidadeMin as string) };
      }
      
      if (search) {
        filtros.$or = [
          { cod: { $regex: search, $options: 'i' } },
          { nome: { $regex: search, $options: 'i' } }
        ];
      }
      
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const locais = await Local.find(filtros)
        .sort({ cod: 1 })
        .skip(skip)
        .limit(parseInt(limit as string));
      
      const total = await Local.countDocuments(filtros);
      
      res.status(200).json({
        success: true,
        data: locais,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
          totalItems: total,
          itemsPerPage: parseInt(limit as string)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar locais',
        error: error.message
      });
    }
  }

  // Buscar local por ID
  static async buscarLocalPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const local = await Local.findById(id);
      
      if (!local) {
        res.status(404).json({
          success: false,
          message: 'Local não encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: local
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar local',
        error: error.message
      });
    }
  }

  // Criar novo local
  static async criarLocal(req: Request, res: Response): Promise<void> {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
        return;
      }
      
      let { cod, nome, capacidade, tipoLocal, descricao } = req.body;
      
      // Se não foi fornecido código, gerar automaticamente
      if (!cod) {
        let tentativas = 0;
        const maxTentativas = 100;
        
        do {
          cod = LocalController.gerarCodigo(tipoLocal);
          tentativas++;
          
          if (tentativas > maxTentativas) {
            res.status(500).json({
              success: false,
              message: 'Não foi possível gerar um código único'
            });
            return;
          }
        } while (await Local.findOne({ cod }));
      } else {
        // Verificar se já existe um local com o mesmo código
        const localExistente = await Local.findOne({ cod });
        if (localExistente) {
          res.status(400).json({
            success: false,
            message: 'Já existe um local com este código'
          });
          return;
        }
      }
      
      const novoLocal = new Local({
        cod,
        nome,
        capacidade,
        tipoLocal,
        descricao
      });
      
      const localSalvo = await novoLocal.save();
      
      res.status(201).json({
        success: true,
        message: 'Local criado com sucesso',
        data: localSalvo
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar local',
        error: error.message
      });
    }
  }

  // Atualizar local
  static async atualizarLocal(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
        return;
      }
      
      const { id } = req.params;
      const { cod, nome, capacidade, tipoLocal, descricao } = req.body;
      
      // Verificar se existe outro local com o mesmo código
      if (cod) {
        const localExistente = await Local.findOne({ cod, _id: { $ne: id } });
        if (localExistente) {
          res.status(400).json({
            success: false,
            message: 'Já existe um local com este código'
          });
          return;
        }
      }
      
      const localAtualizado = await Local.findByIdAndUpdate(
        id,
        { cod, nome, capacidade, tipoLocal, descricao },
        { new: true, runValidators: true }
      );
      
      if (!localAtualizado) {
        res.status(404).json({
          success: false,
          message: 'Local não encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Local atualizado com sucesso',
        data: localAtualizado
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar local',
        error: error.message
      });
    }
  }

  // Deletar local
  static async deletarLocal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const local = await Local.findByIdAndDelete(id);
      
      if (!local) {
        res.status(404).json({
          success: false,
          message: 'Local não encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Local deletado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar local',
        error: error.message
      });
    }
  }

  // Estatísticas dos locais
  static async estatisticasLocais(req: Request, res: Response): Promise<void> {
    try {
      const totalLocais = await Local.countDocuments();
      
      const locaisPorTipo = await Local.aggregate([
        {
          $group: {
            _id: '$tipoLocal',
            quantidade: { $sum: 1 },
            capacidadeTotal: { $sum: '$capacidade' }
          }
        }
      ]);
      
      const capacidadeTotal = await Local.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$capacidade' }
          }
        }
      ]);
      
      res.status(200).json({
        success: true,
        data: {
          totalLocais,
          capacidadeTotal: capacidadeTotal[0]?.total || 0,
          locaisPorTipo
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error.message
      });
    }
  }
}
