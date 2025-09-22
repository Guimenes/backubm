import { Request, Response } from 'express';
import Evento, { IEvento } from '../models/Evento';
import { validationResult } from 'express-validator';

export class EventoController {
  // Listar todos os eventos
  static async listarEventos(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, tipoEvento, data, search, local, curso } = req.query;
      
      // Construir filtros
      const filtros: any = {};
      
      if (tipoEvento) {
        filtros.tipoEvento = tipoEvento;
      }
      
      if (data) {
        const dataFiltro = new Date(data as string);
        filtros.data = {
          $gte: new Date(dataFiltro.setHours(0, 0, 0, 0)),
          $lt: new Date(dataFiltro.setHours(23, 59, 59, 999))
        };
      }

      if (local) {
        // Escape de caracteres especiais de regex ou usar comparação exata
        const localEscapado = (local as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filtros.sala = { $regex: localEscapado, $options: 'i' };
      }

      if (curso) {
        // Suporta tanto o campo legado `curso` quanto o novo `cursos` (array)
        const filtroCurso = { $or: [{ curso }, { cursos: curso }] };
        if (filtros.$or) {
          // Já existe um $or (provavelmente de busca). Combinar com AND.
          filtros.$and = [
            { $or: filtros.$or },
            filtroCurso
          ];
          delete filtros.$or;
        } else {
          Object.assign(filtros, filtroCurso);
        }
      }
      
      if (search) {
        const searchFilter = {
          $or: [
            { cod: { $regex: search, $options: 'i' } },
            { tema: { $regex: search, $options: 'i' } },
            { autores: { $in: [{ $regex: search, $options: 'i' }] } },
            { palestrante: { $regex: search, $options: 'i' } },
            { orientador: { $regex: search, $options: 'i' } }
          ]
        };
        
        if (filtros.$or) {
          // Se já existe um $or (do curso), combina com AND
          filtros.$and = [
            { $or: filtros.$or },
            searchFilter
          ];
          delete filtros.$or;
        } else {
          Object.assign(filtros, searchFilter);
        }
      }
      
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const eventos = await Evento.find(filtros)
        .populate('curso', 'nome cod')
        .populate('cursos', 'nome cod')
        .sort({ data: 1, hora: 1 })
        .skip(skip)
        .limit(parseInt(limit as string));
      
      const total = await Evento.countDocuments(filtros);
      
      res.status(200).json({
        success: true,
        data: eventos,
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
        message: 'Erro ao listar eventos',
        error: error.message
      });
    }
  }

  // Buscar evento por ID
  static async buscarEventoPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const evento = await Evento.findById(id)
        .populate('curso', 'nome cod')
        .populate('cursos', 'nome cod');
      
      if (!evento) {
        res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: evento
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar evento',
        error: error.message
      });
    }
  }

  // Criar novo evento
  static async criarEvento(req: Request, res: Response): Promise<void> {
    try {
      console.log('Dados recebidos no backend:', req.body);
      
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Erros de validação:', errors.array());
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
        return;
      }

      const { data, hora, duracao, tema, autores, palestrante, orientador, sala, tipoEvento, resumo, curso, cursos } = req.body;
      
      // Validação personalizada: autores obrigatórios para tipos diferentes de "Palestra Principal"
      if (tipoEvento !== 'Palestra Principal') {
        if (!autores || !Array.isArray(autores) || autores.filter(a => a && a.trim()).length === 0) {
          res.status(400).json({
            success: false,
            message: 'Pelo menos um autor é obrigatório para este tipo de evento',
            errors: [{ msg: 'Pelo menos um autor é obrigatório', param: 'autores' }]
          });
          return;
        }
      }
      
      // Validação personalizada: palestrante obrigatório para "Palestra Principal"
      if (tipoEvento === 'Palestra Principal') {
        if (!palestrante || !palestrante.trim()) {
          res.status(400).json({
            success: false,
            message: 'Palestrante é obrigatório para Palestra Principal',
            errors: [{ msg: 'Palestrante é obrigatório para Palestra Principal', param: 'palestrante' }]
          });
          return;
        }
      }

      // Converter strings para Date
      const dataEvento = new Date(data);
      const horaEvento = new Date(hora);
      
      // Gerar código automaticamente baseado no tipo de evento
      let prefixo = '';
      switch (tipoEvento) {
        case 'Palestra Principal':
          prefixo = 'PAL';
          break;
        case 'Apresentação de Trabalhos':
          prefixo = 'APT';
          break;
        case 'Oficina':
          prefixo = 'OFC';
          break;
        case 'Banner':
          prefixo = 'BAN';
          break;
        default:
          prefixo = 'EVT';
      }
      
      // Buscar o último número usado para este tipo
      const ultimoEvento = await Evento.findOne({ 
        cod: { $regex: `^${prefixo}` } 
      }).sort({ cod: -1 });
      
      let numeroSequencial = 1;
      if (ultimoEvento && ultimoEvento.cod) {
        const ultimoNumero = parseInt(ultimoEvento.cod.replace(prefixo, ''));
        numeroSequencial = ultimoNumero + 1;
      }
      
      const cod = `${prefixo}${numeroSequencial.toString().padStart(3, '0')}`;
      
      // Verificar conflito de horário na mesma sala
      const dataInicio = new Date(dataEvento);
      const horaInicio = new Date(horaEvento);
      
      // Configurar data e hora combinadas
      const dataHoraInicio = new Date(dataInicio);
      dataHoraInicio.setHours(horaInicio.getHours(), horaInicio.getMinutes(), 0, 0);
      
      // Verificar conflito apenas no mesmo local e horário
      const conflito = await Evento.findOne({
        sala,
        data: {
          $gte: new Date(dataInicio.setHours(0, 0, 0, 0)),
          $lt: new Date(dataInicio.setHours(23, 59, 59, 999))
        },
        hora: horaInicio
      });
      
      if (conflito) {
        res.status(400).json({
          success: false,
          message: 'Já existe um evento agendado para esta sala no mesmo horário'
        });
        return;
      }
      
      // Preparar campos de cursos com compatibilidade (cursos múltiplos e curso legado)
      const cursosArray = Array.isArray(cursos) ? cursos : (curso ? [curso] : undefined);
      const cursoLegado = curso ?? (Array.isArray(cursos) && cursos.length > 0 ? cursos[0] : undefined);

      const novoEvento = new Evento({
        cod,
        data: dataEvento,
        hora: horaEvento,
        duracao,
        tema,
        autores,
        palestrante,
        orientador,
        sala,
        tipoEvento,
        resumo,
        // Preenche o novo campo `cursos` se enviado; se não, mapeia do campo legado `curso` quando houver
        cursos: cursosArray,
        // Mantém o campo legado para compatibilidade; quando não enviado, usa o primeiro de `cursos`
        curso: cursoLegado
      });
      
      const eventoSalvo = await novoEvento.save();
      
      // Fazer populate do curso antes de retornar
      const eventoComCurso = await Evento.findById(eventoSalvo._id)
        .populate('curso', 'nome cod')
        .populate('cursos', 'nome cod');
      
      res.status(201).json({
        success: true,
        message: 'Evento criado com sucesso',
        data: eventoComCurso
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar evento',
        error: error.message
      });
    }
  }

  // Atualizar evento
  static async atualizarEvento(req: Request, res: Response): Promise<void> {
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
      const { data, hora, duracao, tema, autores, palestrante, orientador, sala, tipoEvento, resumo, curso, cursos } = req.body;
      
      // Buscar o evento atual para manter o código
      const eventoAtual = await Evento.findById(id);
      if (!eventoAtual) {
        res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
        return;
      }
      
      // Verificar conflito de horário na mesma sala (excluindo o evento atual)
      if (data && hora && sala) {
        const dataInicio = new Date(data);
        const horaInicio = new Date(hora);
        
        // Verificar conflito apenas no mesmo local e horário
        const conflito = await Evento.findOne({
          _id: { $ne: id },
          sala: sala, // Garantir que é o mesmo local
          data: {
            $gte: new Date(dataInicio.setHours(0, 0, 0, 0)),
            $lt: new Date(dataInicio.setHours(23, 59, 59, 999))
          },
          hora: horaInicio
        });
        
        if (conflito) {
          res.status(400).json({
            success: false,
            message: 'Já existe um evento agendado para esta sala no mesmo horário'
          });
          return;
        }
      }
      
      const cursosAtualizados = Array.isArray(cursos) ? cursos : (curso ? [curso] : undefined);
      const cursoLegadoAtualizado = curso ?? (Array.isArray(cursos) && cursos.length > 0 ? cursos[0] : undefined);

      const eventoAtualizado = await Evento.findByIdAndUpdate(
        id,
        { 
          // Mantém o código original
          cod: eventoAtual.cod,
          data, 
          hora,
          duracao,
          tema, 
          autores, 
          palestrante, 
          orientador,
          sala, 
          tipoEvento, 
          resumo,
          // Atualiza ambos campos por compatibilidade
          curso: cursoLegadoAtualizado,
          cursos: cursosAtualizados
        },
        { new: true, runValidators: true }
      ).populate('curso', 'nome cod').populate('cursos', 'nome cod');
      
      res.status(200).json({
        success: true,
        message: 'Evento atualizado com sucesso',
        data: eventoAtualizado
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar evento',
        error: error.message
      });
    }
  }

  // Deletar evento
  static async deletarEvento(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const evento = await Evento.findByIdAndDelete(id);
      
      if (!evento) {
        res.status(404).json({
          success: false,
          message: 'Evento não encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Evento deletado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar evento',
        error: error.message
      });
    }
  }

  // Estatísticas dos eventos
  static async estatisticasEventos(req: Request, res: Response): Promise<void> {
    try {
      const totalEventos = await Evento.countDocuments();
      
      const eventosPorTipo = await Evento.aggregate([
        {
          $group: {
            _id: '$tipoEvento',
            quantidade: { $sum: 1 }
          }
        }
      ]);
      
      const eventosPorData = await Evento.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$data" } },
            quantidade: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      res.status(200).json({
        success: true,
        data: {
          totalEventos,
          eventosPorTipo,
          eventosPorData
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

  // Buscar eventos por cronograma (data específica)
  static async cronograma(req: Request, res: Response): Promise<void> {
    try {
      const { data } = req.query;
      
      if (!data) {
        res.status(400).json({
          success: false,
          message: 'Data é obrigatória'
        });
        return;
      }
      
      const dataFiltro = new Date(data as string);
      const eventos = await Evento.find({
        data: {
          $gte: new Date(dataFiltro.setHours(0, 0, 0, 0)),
          $lt: new Date(dataFiltro.setHours(23, 59, 59, 999))
        }
      })
      .populate('curso', 'nome cod')
      .populate('cursos', 'nome cod')
      .sort({ hora: 1 });
      
      res.status(200).json({
        success: true,
        data: eventos
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar cronograma',
        error: error.message
      });
    }
  }
}